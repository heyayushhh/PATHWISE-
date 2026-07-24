import os
import json
from groq import Groq

class GeminiClient:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

        self.client = Groq(api_key=api_key)

    def generate_structured_content(self, prompt: str, schema: type):

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "Return ONLY valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.4,
        )

        return response.choices[0].message.content

gemini_client = GeminiClient()
