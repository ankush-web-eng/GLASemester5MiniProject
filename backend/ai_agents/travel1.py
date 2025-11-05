from textwrap import dedent
from phi.assistant import Assistant
from phi.tools.serpapi_tools import SerpApiTools
from azure_openai_patch import AzureOpenAIChat as OpenAIChat
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
    # Get SerpApi key
    serp_api_key = os.getenv("SERPER_API_KEY")

    if not serp_api_key:
        return "Error: SerpApi key is not set. Please ensure the environment variables are configured."

    # Set up assistants
    researcher = Assistant(
        name="Researcher",
        role="Searches for travel information and activities",
        llm=OpenAIChat(),
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
        markdown=True,
    )

    planner = Assistant(
        name="Planner",
        role="Creates detailed travel itineraries",
        llm=OpenAIChat(),
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
        markdown=True,
    )

    try:
        # Research phase
        start_time = time.time()
        research_prompt = f"Search for travel destinations, activities, and accommodations in '{destination}'"
        research_results = researcher.llm.run(research_prompt)

        # Planning phase
        planner_prompt = f"Plan a trip for {destination}, using the following research:\n\n{research_results}"
        itinerary = planner.llm.run(planner_prompt)
        end_time = time.time()
        response_time = end_time - start_time

        return {
            "itinerary": itinerary if isinstance(itinerary, str) else str(itinerary),
            "response_time": response_time,
        }

    except Exception as e:
        return {"content": f"An error occurred: {e}", "response_time": None}
