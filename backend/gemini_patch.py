# backend/gemini_patch.py
import os
import requests
from phi.llm.base import LLM
from pydantic import BaseModel, Field

class GeminiChat(LLM, BaseModel):
    """
    Custom Gemini API wrapper that mimics phi.llm.openai.OpenAIChat style.
    Works with openai==0.28.0 (no Google SDK required).
    """

    model: str = Field(default="gemini-2.5-flash")
    api_key: str = Field(default_factory=lambda: os.getenv("GEMINI_API_KEY"))
    temperature: float = Field(default=0.7)

    class Config:
        arbitrary_types_allowed = True

    def run(self, prompt: str, stream: bool = False, **kwargs) -> str:
        """
        Calls the Google Gemini REST API to generate text.
        """
        try:
            url = (
                f"https://generativelanguage.googleapis.com/v1beta/models/"
                f"{self.model}:generateContent?key={self.api_key}"
            )

            payload = {
                "contents": [
                    {"parts": [{"text": prompt}]}
                ],
                "generationConfig": {"temperature": self.temperature}
            }

            response = requests.post(url, json=payload)
            response.raise_for_status()

            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]

        except requests.exceptions.RequestException as e:
            return f"An error occurred during Gemini API call: {e}"
        except Exception as e:
            return f"An error occurred: {str(e)}"
