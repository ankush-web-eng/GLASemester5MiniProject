from textwrap import dedent
from phi.assistant import Assistant
from phi.tools.serpapi_tools import SerpApiTools
from phi.llm.openai import OpenAIChat
import os
import time
from dotenv import load_dotenv
load_dotenv()

def itinerary1(destination: str) -> dict:
    """
    Generates a travel itinerary based on the given destination.

    Args:
        destination (str): The travel destination.

    Returns:
        dict: Contains the generated itinerary and response time.
    """
    # Get API keys
    openai_api_key = os.getenv("OPENAI_API_KEY")
    serp_api_key = os.getenv("SERPER_API_KEY")

    if not openai_api_key or not serp_api_key:
        return "Error: API keys are not set. Please ensure the environment variables are configured."

    # Set up assistants
    researcher = Assistant(
        name="Researcher",
        role="Searches for travel information and activities",
        llm=OpenAIChat(model="gpt-4o", api_key=openai_api_key),
        description=dedent(
            """\
            You are a world-class travel researcher. Given a travel destination, generate search terms,
            research the location, and return 10 high-quality recommendations and insights.
            """
        ),
        instructions=[
            "Generate 3 search terms for the given destination.",
            "Use `search_google` to gather data about attractions, accommodations, and activities.",
            "Analyze the results and return the 10 most relevant insights or recommendations.",
        ],
        tools=[SerpApiTools(api_key=serp_api_key)],
        markdown=True
    )

    planner = Assistant(
        name="Planner",
        role="Creates detailed travel itineraries",
        llm=OpenAIChat(model="gpt-4o", api_key=openai_api_key),
        description=dedent(
            """\
            You are a professional travel planner. Use the research data to create a comprehensive
            itinerary that includes activities, accommodations, and practical travel tips.
            """
        ),
        instructions=[
            "Create a detailed itinerary using the research insights provided.",
            "Include daily activities, recommended accommodations, and local transportation options.",
            "Add practical tips about local customs, weather considerations, and best times to visit.",
            "Organize the itinerary by day with clear sections for morning, afternoon, and evening activities.",
        ],
        markdown=True
    )

    try:
        # Research phase
        start_time = time.time()
        research_results = researcher.run(f"Search for travel destinations, activities, and accommodations in '{destination}", stream=False)

        # Planning phase
        itinerary = planner.run(
            f"Plan a trip for {destination}, using the following research:\n\n{research_results}", stream=False
        )
        end_time = time.time()
        response_time = end_time - start_time
        
        return {
            "itinerary": itinerary,
            "response_time": response_time,
        }

    except Exception as e:
        return f"An error occurred: {str(e)}"