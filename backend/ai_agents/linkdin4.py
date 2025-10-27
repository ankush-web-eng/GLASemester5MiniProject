from textwrap import dedent
from phi.assistant import Assistant
from phi.tools.serpapi_tools import SerpApiTools
from phi.llm.groq import Groq
import os
import time
from dotenv import load_dotenv
load_dotenv()

def linkedin_post4(post_topic: str) -> dict:
    """
    Generates a LinkedIn post based on the given topic using Groq's Mixtral model.

    Args:
        post_topic (str): The topic for the LinkedIn post.

    Returns:
        dict: Contains the generated post content and response time.
    """
    # Get API keys
    groq_api_key = os.getenv("GROQ_API_KEY")
    serp_api_key = os.getenv("SERPER_API_KEY")

    if not groq_api_key or not serp_api_key:
        return "Error: API keys are not set. Please ensure the environment variables are configured."

    # Set up assistants
    researcher = Assistant(
        name="Researcher",
        role="Searches for relevant content ideas, trends, and best practices for LinkedIn posts",
        llm=Groq(id="mixtral-8x7b-32768"),
        description=dedent(
            """\
            You are a world-class content researcher. Given a LinkedIn post topic and style preferences,
            generate a list of relevant content ideas, industry trends, and best practices for creating
            effective LinkedIn posts. Then search the web for each content idea, analyze the results,
            and return the 10 most relevant insights for creating engaging LinkedIn posts.
            """
        ),
        instructions=[
            "Given a LinkedIn post topic and style preferences, first generate a list of 3 search terms related to that topic.",
            "For each search term, `search_google` and analyze the results.",
            "From the results of all searches, return the 10 most relevant insights, trends, and best practices for creating LinkedIn posts.",
            "Remember: the quality of the results is important.",
        ],
        tools=[SerpApiTools(api_key=serp_api_key)],
        add_datetime_to_instructions=True,
    )

    writer = Assistant(
        name="Writer",
        role="Generates a compelling LinkedIn post based on user preferences and research insights",
        llm=Groq(id="mixtral-8x7b-32768"),
        description=dedent(
            """\
            You are an expert LinkedIn content writer. Given a LinkedIn post topic, style preferences,
            and a list of research insights, your goal is to create a professional, engaging, and
            impactful LinkedIn post that resonates with the target audience.
            """
        ),
        instructions=[
            "Given a LinkedIn post topic, style preferences, and a list of relevant content research insights, generate a compelling LinkedIn post.",
            "Ensure the LinkedIn post is well-structured, professional, and attention-grabbing.",
            "The tone should match the user's preferred writing style (e.g., casual, professional, inspiring).",
            "Incorporate relevant industry trends, facts, and insights into the post.",
            "Focus on clarity, engagement, and overall quality.",
            "Never make up facts or plagiarize. Always provide proper attribution.",
        ],
        add_datetime_to_instructions=True,
        add_chat_history_to_prompt=True,
        num_history_messages=3,
    )

    try:
        # Research phase
        start_time = time.time()
        research_results = researcher.run(
            f"Topic: Linkdin Post: {post_topic}", stream=False
        )

        # Writing phase
        post_content = writer.run(
            f"Topic:Linkdin Post on {post_topic}\n Using Following Research: {research_results}",
            stream=False
        )
        end_time = time.time()
        response_time = end_time - start_time
        
        return {
            "response": post_content,
            "response_time": response_time,
        }

    except Exception as e:
        return f"An error occurred: {str(e)}"