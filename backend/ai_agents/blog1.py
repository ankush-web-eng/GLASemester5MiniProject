from textwrap import dedent
from azure_openai_patch import AzureOpenAIChat as OpenAIChat
from phi.assistant import Assistant
from phi.tools.serpapi_tools import SerpApiTools
import os
import time
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


# Blog generation function
def blog1(topic: str) -> str:
    """
    Generates a blog based on the given topic and target audience.

    Args:
        topic (str): The blog topic.

    Returns:
        str: The generated blog post.
        time: Response time
    """
    # Get SerpApi key
    serp_api_key = os.getenv("SERPER_API_KEY")

    if not serp_api_key:
        return "Error: SerpApi key is not set. Please ensure the environment variables are configured."

    # Set up assistants
    researcher = Assistant(
        name="Researcher",
        role="Conducts research for blog topics and gathers information",
        llm=OpenAIChat(),
        description=dedent(
            """\
            You are an expert researcher. Given a blog topic, generate a list of search terms, research the topic, 
            and return 10 high-quality references or insights for the blog.
            """
        ),
        instructions=[
            "Generate 3 search terms for the given blog topic.",
            "Use `search_google` to gather data for these terms.",
            "Analyze the results and return the 10 most relevant insights or references.",
        ],
        tools=[SerpApiTools(api_key=serp_api_key)],
    )

    writer = Assistant(
        name="Writer",
        role="Drafts a blog post based on research",
        llm=OpenAIChat(),
        description=dedent(
            """\
            You are a professional blog writer. Use the research data to draft a blog that is engaging and structured.
            """
        ),
        instructions=[
            "Draft a blog post using the research insights provided.",
            "Ensure the blog has an introduction, structured body, and conclusion.",
            "Include a CTA and naturally integrate relevant keywords for SEO.",
        ],
    )

    try:
        # Research phase
        start_time = time.time()
        research_prompt = f"Topic: {topic}"
        research_results = researcher.llm.run(research_prompt)

        # Writing phase
        blog_prompt = f"Write a blog on '{topic}' using: {research_results}"
        blog = writer.llm.run(blog_prompt)
        end_time = time.time()
        response_time = end_time - start_time

        return {
            "content": blog if isinstance(blog, str) else str(blog),
            "response_time": response_time,
        }

    except Exception as e:
        return {"content": f"An error occurred: {e}", "response_time": None}
