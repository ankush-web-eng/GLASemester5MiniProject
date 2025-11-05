import os
import openai
from phi.llm.base import LLM
from pydantic import BaseModel, Field

# Azure OpenAI global config
openai.api_type = "azure"
openai.api_key = os.getenv("OPENAI_API_KEY")
openai.api_base = os.getenv("OPENAI_API_BASE")
openai.api_version = os.getenv("OPENAI_API_VERSION")
AZURE_DEPLOYMENT = os.getenv("OPENAI_DEPLOYMENT_NAME")


class AzureOpenAIChat(LLM, BaseModel):
    """
    A custom LLM wrapper that mimics phi.llm.openai.OpenAIChat
    but works correctly with Azure OpenAI deployments.
    """

    engine: str = Field(default=AZURE_DEPLOYMENT)
    model: str = Field(default=AZURE_DEPLOYMENT)
    temperature: float = Field(default=0.7)

    class Config:
        arbitrary_types_allowed = True  # Let non-pydantic objects (like openai) pass

    def run(self, prompt: str, stream: bool = False, **kwargs) -> str:
        try:
            response = openai.ChatCompletion.create(
                engine=self.engine,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.temperature,
            )
            return response["choices"][0]["message"]["content"]
        except Exception as e:
            return f"An error occurred: {str(e)}"
