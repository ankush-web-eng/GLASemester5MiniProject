from textwrap import dedent
from phi.assistant import Assistant
from phi.tools.serpapi_tools import SerpApiTools
from phi.llm.openai import OpenAIChat
import os
import time
from dotenv import load_dotenv
load_dotenv()

def blog1(topic: str) -> str:
    """
    Generates a blog based on the given topic and target audience.

    Args:
        topic (str): The blog topic.

    Returns:
        str: The generated blog post.
        time: Resposne time
    """
    # Get API keys
    openai_api_key = os.getenv("OPENAI_API_KEY")
    serp_api_key = os.getenv("SERPER_API_KEY")

    if not openai_api_key or not serp_api_key:
        return "Error: API keys are not set. Please ensure the environment variables are configured."

    # Set up assistants
    researcher = Assistant(
        name="Researcher",
        role="Conducts research for blog topics and gathers information",
        llm=OpenAIChat(model="gpt-4o", api_key=openai_api_key),
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
        llm=OpenAIChat(model="gpt-4o", api_key=openai_api_key),
        description=dedent(
            """\
            You are a professional blog writer. Use the research data to draft a blog that is engaginga and structured.
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
        research_results = researcher.run(f"Topic: {topic}", stream=False)

        # Writing phase
        blog = writer.run(
                f"Write a blog on the topic '{topic}' using the following research:\n\n{research_results}",
                stream=False,
            )
        end_time = time.time()
        response_time = end_time-start_time
        
        return {
            "blog": blog,
            "response_time": response_time,
        }

    except Exception as e:
        return f"An error occurred: {str(e)}"
