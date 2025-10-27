from textwrap import dedent
from phi.assistant import Assistant
from phi.tools.serpapi_tools import SerpApiTools
from phi.model.google import Gemini
import os
import time
from dotenv import load_dotenv

load_dotenv()

def blog3(topic: str) -> dict:
    """
    Generates a blog based on the given topic and target audience using Gemini and SerpAPI.

    Args:
        topic (str): The blog topic.

    Returns:
        dict: A dictionary containing the generated blog post and response time.
    """
    # Get API keys
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    serp_api_key = os.getenv("SERPER_API_KEY")

    if not gemini_api_key or not serp_api_key:
        return {
            "error": "API keys are not set. Please ensure the environment variables are configured.",
            "blog": None,
            "response_time": None
        }

    # Set up assistants
    researcher = Assistant(
        name="Researcher",
        role="Searches for blog topic-related information and generates relevant references",
        model=Gemini(id="gemini-1.5-flash"),
        description=dedent(
            """\
            You are a world-class blog researcher. Given a blog topic, generate a list of search terms for finding relevant articles, research papers, and other resources.
            Then search the web for each term, analyze the results, and return the 10 most relevant insights.
            """
        ),
        instructions=[
            "Generate a list of 3 search terms related to the topic.",
            "Search the web for each term using the SerpAPI tool.",
            "Analyze the results and return the 10 most relevant insights or references.",
        ],
        tools=[SerpApiTools(api_key=serp_api_key)],
        show_tool_calls=True,
        add_datetime_to_instructions=True,
        markdown=True,
    )

    writer = Assistant(
        name="Writer",
        role="Generates a draft blog post based on user preferences and research results",
        model=Gemini(id="gemini-1.5-flash"),
        description=dedent(
            """\
            You are an expert blog writer. Given a blog topic, style preferences, and a list of content research results,
            your goal is to generate a full and engaging blog post that aligns with the user's style and incorporates relevant research.
            """
        ),
        instructions=[
            "Given a blog topic, style preferences, and a list of content research results, generate a full blog post that includes relevant ideas, examples, and insights.",
            "Ensure the blog post is well-structured, engaging, and informative from introduction to conclusion.",
            "The tone should match the user's preferred writing style (e.g., casual, professional, informative).",
            "Avoid asking the user for additional details; the blog post should be created with the information already provided.",
            "Focus on creativity, clarity, and a compelling narrative.",
            "Provide relevant facts, examples, and research without making up details.",
        ],
        add_datetime_to_instructions=True,
        add_chat_history_to_prompt=True,
        show_tool_calls=True,
        num_history_messages=3,
        markdown=True,
    )

    try:
        # Research phase
        start_time = time.time()
        
        research_results = researcher.run(
            f"Research blog topic: {topic} ", 
            stream=False
        )

        # Writing phase
        blog = writer.run(
            f"Write a blog on the topic '{topic}'  using the following research:\n\n{research_results}",
            stream=False,
        )

        end_time = time.time()
        response_time = end_time - start_time

        return {
            "blog": blog,
            "response_time": response_time,
            "error": None
        }

    except Exception as e:
        return {
            "blog": None,
            "response_time": None,
            "error": f"An error occurred: {str(e)}"
        }
