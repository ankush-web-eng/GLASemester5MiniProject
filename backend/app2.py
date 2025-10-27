from flask import Flask, request, jsonify
from concurrent.futures import ThreadPoolExecutor
import os

from ai_agents.blog1 import blog1
from ai_agents.blog2 import blog2
from ai_agents.blog3 import blog3
from ai_agents.blog4 import blog4
from ai_agents.linkdin1 import linkedin_post1
from ai_agents.linkdin2 import linkedin_post2
from ai_agents.linkdin3 import linkedin_post3
from ai_agents.linkdin4 import linkedin_post4
from ai_agents.travel1 import itinerary1
from ai_agents.travel2 import itinerary2
from ai_agents.travel3 import itinerary3
from ai_agents.travel4 import itinerary4
from ai_agents.youtube1 import youtube_summarizer1
from ai_agents.youtube2 import youtube_summarizer2
from ai_agents.youtube3 import youtube_summarizer3
from ai_agents.youtube4 import youtube_summarizer4

app = Flask(__name__)

AI_FUNCTIONS = {
    "blog": {
        "1": blog1,
        "2": blog2,
        "3": blog3,
        "4": blog4,
    },
    "linkdin": {
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

def execute_function(category, entry_id, input_data):
    """
    Executes the AI function based on the category and entry ID and returns the result.
    """
    function = AI_FUNCTIONS.get(category, {}).get(str(entry_id))
    if not function:
        return {"id": entry_id, "error": f"No function found for category '{category}' and ID {entry_id}"}
    try:
        result = function(input_data)
        return {
            "id": entry_id,
            "content": result.get("blog") or result.get("post") or result.get("itinerary") or result.get("summary"),
            "response_time": result.get("response_time"),
        }
    except Exception as e:
        return {"id": entry_id, "error": f"Error executing function: {str(e)}"}

@app.route('/generate_content', methods=['POST'])
def generate_content():
    """
    Generate content for a list of requests in parallel and return their results.
    """
    if not request.is_json:
        return jsonify({"status": "error", "error": "Content-Type must be application/json"}), 415

    try:
        data = request.json
        if not isinstance(data, list):
            return jsonify({"status": "error", "error": "Input must be a list of requests"}), 400

        results = []
        with ThreadPoolExecutor() as executor:
            # Submit all tasks to the thread pool
            futures = [
                executor.submit(
                    execute_function,
                    entry.get("category"),
                    entry.get("id"),
                    entry.get("input"),
                )
                for entry in data
            ]
            # Collect results as they complete
            for future in futures:
                results.append(future.result())

        return jsonify({"status": "success", "results": results}), 200

    except Exception as e:
        return jsonify({"status": "error", "error": f"An unexpected error occurred: {str(e)}"}), 500


@app.errorhandler(Exception)
def handle_exception(e):
    """Handle uncaught exceptions."""
    return jsonify({"status": "error", "error": f"Unexpected error: {str(e)}"}), 500
