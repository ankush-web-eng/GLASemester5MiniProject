from textwrap import dedent
from phi.assistant import Assistant
from phi.tools.serpapi_tools import SerpApiTools
from phi.llm.groq import Groq
import os
import time
from dotenv import load_dotenv

load_dotenv()


def blog2(topic: str) -> str:
    """
    Generates a blog based on the given topic and target audience using Groq and SerpAPI.

    Args:
        topic (str): The blog topic.

    Returns:
        str: The generated blog post.
    """
    # Get API keys
    groq_api_key = os.getenv("GROQ_API_KEY")
    serp_api_key = os.getenv("SERPER_API_KEY")

    if not groq_api_key or not serp_api_key:
        return "Error: API keys are not set. Please ensure the environment variables are configured."

    # Set up assistants
    researcher = Assistant(
        name="Researcher",
        role="Searches for blog topic-related information and generates relevant references",
        llm=Groq(model="llama-3.3-70b-versatile"),
        description=dedent(
            """\
            You are a world-class blog researcher. Given a blog topic , generate a list of search terms for finding relevant articles, research papers, and other resources.
            Then search the web for each term, analyze the results, and return the 10 most relevant insights.
            """
        ),
        instructions=[
            "Given a blog topic , first generate a list of 3 search terms related to that topic and the audience.",
            "For each search term, `search_google` and analyze the results.",
            "From the results of all searches, return the 10 most relevant insights or references to inform the blog post.",
            "Remember: the quality of the results is important.",
        ],
        tools=[SerpApiTools(api_key=serp_api_key)],
        add_datetime_to_instructions=True,
    )

    writer = Assistant(
        name="Writer",
        role="Generates a draft blog post based on the research results",
        llm=Groq(model="llama-3.3-70b-versatile"),
        description=dedent(
            """\
            You are a professional blog writer. Given a topic, and research results, generate a well-structured, engaging blog post.
            Ensure the blog post includes an introduction, body, conclusion, and a call-to-action (CTA).
            """
        ),
        instructions=[
            "Given a blog topic, and a list of research insights, draft a blog post.",
            "Ensure the blog post is well-structured, informative, and engaging.",
            "Include a clear introduction, body, and conclusion, and end with a call-to-action (CTA).",
            "Remember: the quality of the blog is paramount, with correct citations and integration of insights.",
        ],
        add_datetime_to_instructions=True,
        add_chat_history_to_prompt=True,
        num_history_messages=3,
    )

    try:
        # Research phase
        start_time = time.time()

        research_results = researcher.run(
            f"Research blog topic: {topic} ", stream=False
        )

        # Writing phase
        blog = writer.run(
            f"Write a blog on the topic '{topic}' using the following research:\n\n{research_results}",
            stream=False,
        )

        end_time = time.time()
        response_time = end_time - start_time

        return {
            "blog": blog,
            "response_time": response_time,
        }

    except Exception as e:
        return {"content": f"An error occurred: {e}", "response_time": None}
