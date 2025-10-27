from textwrap import dedent
from phi.assistant import Assistant
from phi.tools.serpapi_tools import SerpApiTools
from phi.llm.groq import Groq
import os
import time
from dotenv import load_dotenv
load_dotenv()

def blog4(topic: str) -> str:
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
        role="Searches for blog topics, ideas, and content inspiration based on user preferences",
        llm=Groq(id="mixtral-8x7b-32768"),
        description=dedent(
            """\
            You are a world-class content researcher. Given a blog topic , generate a list of search terms for finding relevant content ideas, trends, and research.
            Then search the web for each term, analyze the results, and return the 10 most relevant content ideas.
            """
        ),
        instructions=[ 
            "Given a blog topic first generate a list of 3 search terms related to the topic.",
            "For each search term, `search_google` and analyze the results.",
            "From the results of all searches, return the 10 most relevant content ideas to the user's audience.",
            "Remember: the quality of the content ideas is important.",
        ],
        tools=[SerpApiTools(api_key=serp_api_key)],
        add_datetime_to_instructions=True,
    )

    writer = Assistant(
        name="Writer",
        role="Generates a blog post based on user preferences and research results",
        llm=Groq(id="mixtral-8x7b-32768"),
        description=dedent(
            """\
            You are an expert blog writer. Given a blog topic, and a list of content research results,
            your goal is to generate a full blog post that aligns and incorporates relevant research.
            """
        ),
        instructions=[
            "Given a blog topic, and a list of content research results, generate a full blog post that includes relevant ideas, examples, and insights.",
            "Ensure the blog post is well-structured, engaging, and informative from introduction to conclusion.",
            "Avoid asking the user for additional details; the blog post should be created with the information already provided.",
            "Focus on creativity, clarity, and a compelling narrative.",
            "Provide relevant facts, examples, and research without making up details.",
        ],
        add_datetime_to_instructions=True,
        add_chat_history_to_prompt=True,
        num_history_messages=3,
    )

    try:
        start_time = time.time()

        # Research phase
        research_results = researcher.run(f"Research blog topic: {topic}", stream=False)

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
