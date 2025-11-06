from textwrap import dedent
from gemini_patch import GeminiChat as Gemini
from phi.assistant import Assistant
from phi.tools.youtube_tools import YouTubeTools
from phi.tools.duckduckgo import DuckDuckGo
import os
import time
from dotenv import load_dotenv
load_dotenv()

def youtube_summarizer3(video_url: str) -> dict:
    """
    Summarizes a YouTube video based on its captions using Google's Gemini 2.5-flash model.

    Args:
        video_url (str): The URL of the YouTube video to summarize.

    Returns:
        dict: Contains the generated summary and response time.
    """
    # Get API key
    gemini_api_key = os.getenv("GEMINI_API_KEY")

    if not gemini_api_key:
        return "Error: API key is not set. Please ensure the environment variables are configured."

    # Set up assistants
    caption_fetcher = Assistant(
        name="CaptionFetcher",
        role="Fetches captions from YouTube videos",
        llm=Gemini(model="gemini-2.5-flash"),
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
        llm=Gemini(model="gemini-2.5-flash"),
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
        caption_results = caption_fetcher.llm.run(f"Fetch captions for the youtube video : {video_url}")

        # Generate summary
        summary = summarizer.llm.run(f"Summarize the youtube video : {video_url} using the following caption data of the video : \n\n{caption_results}")

        # Timing end
        end_time = time.time()
        response_time = end_time - start_time

        return {
            "summary": summary,
            "response_time": response_time,
        }

    except Exception as e:
        return {"error": f"An error occurred: {str(e)}", "response_time": None}

