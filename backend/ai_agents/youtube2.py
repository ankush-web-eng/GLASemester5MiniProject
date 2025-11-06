from textwrap import dedent
from phi.assistant import Assistant
from phi.llm.groq import Groq
from phi.tools.youtube_tools import YouTubeTools
from phi.tools.duckduckgo import DuckDuckGo
import os
import time
from dotenv import load_dotenv

load_dotenv()


def youtube_summarizer2(video_url: str) -> dict:
    """
    Summarizes a YouTube video based on its captions using Groq's LLaMA model.

    Args:
        video_url (str): The URL of the YouTube video to summarize.

    Returns:
        dict: Contains the generated summary and response time.
    """
    # Get API key
    groq_api_key = os.getenv("GROQ_API_KEY")

    if not groq_api_key:
        return "Error: API key is not set. Please ensure the environment variables are configured."

    # Set up assistants
    caption_fetcher = Assistant(
        name="CaptionFetcher",
        role="Fetches captions from YouTube videos",
        llm=Groq(model="llama-3.3-70b-versatile"),
        description=dedent(
            """\
            You are a Youtube Agent that fetches captions from YouTube videos. Given a YouTube video URL, 
            fetch its captions for further analysis. The captions can be in any language. 
            Don't ask for any confirmation, just give me the captions.
            """
        ),
        instructions=[
            "No matter what is the captions language, Fetch the captions from the given YouTube video URL.",
        ],
        tools=[YouTubeTools(), DuckDuckGo()],
        add_datetime_to_instructions=True,
        show_tool_calls=True,
        get_video_captions=True,
    )

    summarizer = Assistant(
        name="Summarizer",
        role="Summarizes YouTube video captions in detail",
        llm=Groq(model="llama-3.3-70b-versatile"),
        description=dedent(
            """\
            You are an AI that summarizes YouTube video captions in a detailed and insightful way. 
            Given the captions from a YouTube video, provide a detailed summary that includes the 
            main ideas, key points, and insights from the video. Structure the summary to make it 
            informative, covering all key elements and giving a clear overview of the video's content. 
            Focus on making the summary easy to understand while providing enough depth to convey 
            the value of the video.
            """
        ),
        instructions=[
            "Analyze the captions from the YouTube video and summarize the main ideas and key points in a detailed manner.",
            "Ensure that the summary includes any important insights, examples, or lessons from the video.",
            "Provide a structured summary that highlights the main themes and conclusions.",
            "Focus on clarity, coherence, and detail in your summary.",
        ],
        tools=[YouTubeTools(), DuckDuckGo()],
        add_datetime_to_instructions=True,
        show_tool_calls=True,
        get_video_captions=True,
    )

    try:
        # Timing start
        start_time = time.time()

        # Fetch captions
        caption_results = caption_fetcher.run(
            f"Youtube Video Link : {video_url}", stream=False
        )

        # Generate summary
        summary = summarizer.run(
            f"Summarize the youtube video : {video_url} using the following caption data of the video : \n\n{caption_results}",
            stream=False,
        )

        # Timing end
        end_time = time.time()
        response_time = end_time - start_time

        return {
            "summary": summary,
            "response_time": response_time,
        }

    except Exception as e:
        return {"content": f"An error occurred: {e}", "response_time": None}
