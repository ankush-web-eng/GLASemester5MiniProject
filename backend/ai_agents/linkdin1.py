from textwrap import dedent
from phi.assistant import Assistant
from phi.tools.serpapi_tools import SerpApiTools
from azure_openai_patch import AzureOpenAIChat as OpenAIChat
import os
import time
from dotenv import load_dotenv

load_dotenv()


def linkedin_post1(post_topic: str) -> dict:
    """
    Generates a LinkedIn post based on the given topic and style preferences using GPT-4o.

    Args:
        post_topic (str): The topic for the LinkedIn post.

    Returns:
        dict: Contains the generated post content and response time.
    """
    # Get SerpApi key
    serp_api_key = os.getenv("SERPER_API_KEY")

    if not serp_api_key:
        return "Error: SerpApi key is not set. Please ensure the environment variables are configured."

    # Set up assistants
    researcher = Assistant(
        name="Researcher",
        role="Searches for relevant content, trends, and ideas for LinkedIn posts",
        llm=OpenAIChat(),
        description=dedent(
            """\
            You are a world-class content researcher. Given a LinkedIn post topic and style preferences,
            generate a list of relevant content ideas, industry trends, and best practices for creating
            effective LinkedIn posts.
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
        llm=OpenAIChat(),
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
        research_prompt = f"Topic: {post_topic}"
        research_results = researcher.llm.run(research_prompt)

        # Writing phase
        post_prompt = f"Topic: {post_topic}\n\nResearch: {research_results}"
        post_content = writer.llm.run(post_prompt)
        end_time = time.time()
        response_time = end_time - start_time

        return {
            "response": (
                post_content if isinstance(post_content, str) else str(post_content)
            ),
            "response_time": response_time,
        }

    except Exception as e:
        return {"content": f"An error occurred: {e}", "response_time": None}
