import os
import logging
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

class GeminiClient:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY is missing. Personalization will fail.")
            self.client = None
        else:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Failed to initialize Gemini Client: {e}")
                self.client = None

    def generate_structured_content(self, prompt: str, schema: type) -> str:
        """
        Generate structured content matching the provided Pydantic schema.
        """
        if not self.client:
            raise ValueError("Gemini API key is not configured.")

        try:
            # We use structured output format by passing the response_schema
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=schema,
                    temperature=0.4,
                ),
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini API failure: {e}")
            raise e

# Singleton instance
gemini_client = GeminiClient()
