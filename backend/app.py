from flask import Flask, request, jsonify
from flask_cors import CORS
from concurrent.futures import ThreadPoolExecutor
import os
import tempfile
import json
import logging
from typing import List, Dict
import google.generativeai as genai
from llama_parse import LlamaParse


from resp import evaluate_content
from prompt import gen_ai_prompt
from ai_agents.blog1 import blog1
from ai_agents.blog2 import blog2
from ai_agents.blog3 import blog3
from ai_agents.blog4 import blog4
from ai_agents.linkedin1 import linkedin_post1
from ai_agents.linkedin2 import linkedin_post2
from ai_agents.linkedin3 import linkedin_post3
from ai_agents.linkedin4 import linkedin_post4
from ai_agents.travel1 import itinerary1
from ai_agents.travel2 import itinerary2
from ai_agents.travel3 import itinerary3
from ai_agents.travel4 import itinerary4
from ai_agents.youtube1 import youtube_summarizer1
from ai_agents.youtube2 import youtube_summarizer2
from ai_agents.youtube3 import youtube_summarizer3
from ai_agents.youtube4 import youtube_summarizer4


# Flask app setup

app = Flask(__name__)
CORS(
    app,
    resources={
        r"/*": {
            "origins": ["http://localhost:3000", os.environ.get("FRONTEND_URL1"), os.environ.get("FRONTEND_URL2")],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type"],
        }
    },
)

# Mapping AI agent functions
AI_FUNCTIONS = {
    "blog": {
        "1": blog1,
        "2": blog2,
        "3": blog3,
        "4": blog4,
    },
    "linkedin": {
        "1": linkedin_post1,
        "2": linkedin_post2,
        "3": linkedin_post3,
        "4": linkedin_post4,
    },
    "travel": {
        "1": itinerary1,
        "2": itinerary2,
        "3": itinerary3,
        "4": itinerary4,
    },
    "youtube": {
        "1": youtube_summarizer1,
        "2": youtube_summarizer2,
        "3": youtube_summarizer3,
        "4": youtube_summarizer4,
    },
}


class GeminiResponse:
    def __init__(
        self,
        content_type: str,
        recommended_agent: str,
        available_agents: List[str],
        confidence_score: float,
        is_relevant: bool,
    ):
        self.content_type = content_type
        self.recommended_agent = recommended_agent
        self.available_agents = available_agents
        self.confidence_score = confidence_score
        self.is_relevant = is_relevant

    def to_dict(self):
        return {
            "content_type": self.content_type,
            "recommended_agent": self.recommended_agent,
            "available_agents": self.available_agents,
            "confidence_score": self.confidence_score,
            "is_relevant": self.is_relevant,
        }


class GeminiService:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-2.5-flash")

    def generate_response(self, prompt: str) -> Dict:
        try:
            result = self.model.generate_content(f"{gen_ai_prompt}{prompt}")
            response_text = result.text

            # Clean up the response text by removing unwanted formatting
            cleaned_text = (
                response_text.replace("```json", "").replace("```", "").strip()
            )

            try:
                response_data = json.loads(cleaned_text)
                return GeminiResponse(
                    content_type=response_data.get("content_type", "unrelated"),
                    recommended_agent=response_data.get(
                        "recommended_agent", "unrelated"
                    ),
                    available_agents=response_data.get("available_agents", []),
                    confidence_score=response_data.get("confidence_score", 0),
                    is_relevant=response_data.get("is_relevant", False),
                ).to_dict()
            except json.JSONDecodeError as parse_error:
                logging.error("JSON parsing error: %s", parse_error)
                raise parse_error

        except Exception as error:
            logging.error("Gemini AI error: %s", error)
            return GeminiResponse(
                content_type="unrelated",
                recommended_agent="unrelated",
                available_agents=[
                    "blogging",
                    "content_writing",
                    "technical_writing",
                    "data_analysis",
                    "general",
                ],
                confidence_score=0,
                is_relevant=False,
            ).to_dict()


# API Endpoints


# Home route
@app.route("/", methods=["GET"])
def index():
    return "Welcome to the AI Content Generation API!"


# Favicon route
@app.route("/favicon.ico")
def favicon():
    return "", 204


# Gemini AI route
@app.route("/gemini", methods=["POST"])
def gemini():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415

    data = request.json
    if "prompt" not in data or not data["prompt"]:
        return jsonify({"error": "Missing or empty 'prompt' in request body"}), 400

    try:
        service = GeminiService(os.environ.get("GEMINI_API_KEY"))
        response = service.generate_response(data["prompt"])
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def execute_function(category, entry_id, input_data):
    """Executes the AI function based on the category and entry ID."""
    function = AI_FUNCTIONS.get(category, {}).get(str(entry_id))
    if not function:
        return {
            "id": entry_id,
            "error": f"No function found for category '{category}' and ID {entry_id}",
        }
    try:
        result = function(input_data)

        # Fix: if the agent returned a string, wrap it in a dict
        if isinstance(result, str):
            result = {"content": result}

        content = (
            result.get("blog")
            or result.get("response")
            or result.get("itinerary")
            or result.get("summary")
            or result.get("content")
        )

        print(f"[DEBUG] Result returned: {result}")
        print(f"[DEBUG] Extracted content: {content}")

        return {
            "id": entry_id,
            "content": content,
            "response_time": result.get("response_time"),
        }
    except Exception as e:
        return {"id": entry_id, "error": f"Error executing function: {str(e)}"}


# Content Generation route
@app.route("/generate_content", methods=["POST"])
def generate_content():
    """Generate content for a list of requests in parallel."""
    if not request.is_json:
        return (
            jsonify(
                {"status": "error", "error": "Content-Type must be application/json"}
            ),
            415,
        )

    try:
        # Log the incoming request data
        logging.info(f"Received request data: {request.data.decode('utf-8')}")

        data = request.json
        if not isinstance(data, list):
            return (
                jsonify(
                    {
                        "status": "error",
                        "error": "Input must be a list of requests",
                        "received": data,
                    }
                ),
                400,
            )

        # Validate each request in the list
        for idx, entry in enumerate(data):
            required_fields = ["category", "id", "input"]
            missing_fields = [field for field in required_fields if field not in entry]
            if missing_fields:
                return (
                    jsonify(
                        {
                            "status": "error",
                            "error": f"Request {idx} is missing required fields: {missing_fields}",
                            "received": entry,
                        }
                    ),
                    400,
                )

        with ThreadPoolExecutor() as executor:
            futures = [
                executor.submit(
                    execute_function,
                    entry.get("category"),
                    entry.get("id"),
                    entry.get("input"),
                )
                for entry in data
            ]
            results = [future.result() for future in futures]

        # Evaluate the generated content
        evaluation_result = evaluate_content(results)

        # Combine results with evaluations
        return (
            jsonify(
                {
                    "status": "success",
                    "results": results,
                    "evaluations": evaluation_result.get("evaluations", []),
                }
            ),
            200,
        )

    except json.JSONDecodeError as e:
        logging.error(f"JSON decode error: {str(e)}")
        return (
            jsonify(
                {
                    "status": "error",
                    "error": f"Invalid JSON format: {str(e)}",
                    "received_data": request.data.decode("utf-8"),
                }
            ),
            400,
        )
    except Exception as e:
        logging.error(f"Unexpected error in generate_content: {str(e)}")
        return (
            jsonify(
                {"status": "error", "error": f"An unexpected error occurred: {str(e)}"}
            ),
            500,
        )


# LlamaParse route
@app.route("/parse-with-llama", methods=["POST"])
def parse_with_llama():
    # Get the file from the multipart form data
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    # Create temporary directory
    with tempfile.TemporaryDirectory(prefix="llama-") as temp_dir:
        temp_file_path = os.path.join(temp_dir, os.path.basename(file.filename))

        try:
            # Save uploaded file to temporary file
            file.save(temp_file_path)

            # Initialize LlamaParseReader
            reader = LlamaParse(
                result_type="markdown",
                api_key=os.environ.get("NEXT_PUBLIC_LLAMA_CLOUD_API_KEY"),
            )

            # Load and parse the document
            documents = reader.load_data(temp_file_path)

            # Extract content and metadata
            json_data = {
                "content": documents[0].text,
                "metadata": documents[0].metadata,
            }

            # Save to a JSON file (optional, can be removed if not needed)
            output_file = os.path.join(temp_dir, "parsed_resume.json")
            with open(output_file, "w") as f:
                json.dump(json_data, f, indent=2)

            return jsonify(json_data)

        except Exception as e:
            return jsonify({"error": str(e)}), 500


# Global error handler
@app.errorhandler(Exception)
def handle_exception(e):
    """Handle uncaught exceptions."""
    return jsonify({"status": "error", "error": f"Unexpected error: {str(e)}"}), 500
