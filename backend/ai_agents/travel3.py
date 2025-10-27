from textwrap import dedent
from phi.assistant import Assistant
from phi.tools.serpapi_tools import SerpApiTools
from phi.llm.groq import Groq
import os
import time
from dotenv import load_dotenv
load_dotenv()

def itinerary3(destination: str) -> dict:
    """
    Generates a travel itinerary based on the given destination using Groq LLM.

    Args:
        destination (str): The travel destination.

    Returns:
        dict: Contains the generated itinerary and response time.
    """
    # Get API keys
    groq_api_key = os.getenv("GROQ_API_KEY")
    serp_api_key = os.getenv("SERPER_API_KEY")

    if not groq_api_key or not serp_api_key:
        return "Error: API keys are not set. Please ensure the environment variables are configured."

    # Set up assistants
    researcher = Assistant(
        name="Researcher",
        role="Searches for travel destinations, activities, and accommodations",
        llm=Groq(id="llama-3.3-70b-versatile"),
        description=dedent(
            """\
            You are a world-class travel researcher. Given a travel destination,
            generate a list of search terms for finding relevant travel activities and accommodations.
            Then search the web for each term, analyze the results, and return the 10 most relevant insights.
            """
        ),
        instructions=[
            "Given a travel destination, first generate a list of 3 search terms related to that destination.",
            "For each search term, `search_google` and analyze the results.",
            "From the results of all searches, return the 10 most relevant insights or references.",
            "Remember: the quality of the results is important.",
        ],
        tools=[SerpApiTools(api_key=serp_api_key)],
        add_datetime_to_instructions=True,
    )

    planner = Assistant(
        name="Planner",
        role="Generates a draft itinerary based on the research results",
        llm=Groq(id="llama-3.3-70b-versatile"),
        description=dedent(
            """\
            You are a professional travel planner. Given a destination and research results, generate a well-structured, engaging itinerary.
            Ensure the itinerary includes accommodation suggestions, activities, and local insights.
            """
        ),
        instructions=[
            "Given a destination and research insights, draft a comprehensive travel itinerary.",
            "Ensure the itinerary is well-structured, informative, and engaging.",
            "Include accommodation suggestions, must-see attractions, and local experiences.",
            "Remember: the quality of the itinerary is paramount, with proper integration of research insights.",
        ],
        add_datetime_to_instructions=True,
        add_chat_history_to_prompt=True,
        num_history_messages=3,
    )

    try:
        # Research phase
        start_time = time.time()

        research_results = researcher.run(f"Research travel destination: {destination}", stream=False)

        # Planning phase
        itinerary = planner.run(
            f"Create a travel itinerary for {destination} using the following research:\n\n{research_results}",
            stream=False,
        )

        end_time = time.time()
        response_time = end_time - start_time
        
        return {
            "itinerary": itinerary,
            "response_time": response_time,
        }

    except Exception as e:
        return f"An error occurred: {str(e)}"
