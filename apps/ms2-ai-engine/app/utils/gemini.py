import os

import google.generativeai as genai


_model = None


def get_gemini_model():
    """
    Return a shared Gemini GenerativeModel instance.

    Configures the API key on first call and reuses
    the same model object afterwards.
    """

    global _model

    if _model is None:

        genai.configure(
            api_key=os.getenv("GEMINI_API_KEY")
        )

        _model = genai.GenerativeModel(
            "models/gemini-2.5-flash"
        )

    return _model


def call_gemini(prompt: str) -> str:
    """
    Convenience wrapper: send a prompt to Gemini
    and return the response text.
    """

    try:
        model = get_gemini_model()
        response = model.generate_content(prompt)
        return response.text or ""
    except Exception as exc:
        print(f"Gemini call failed: {exc}")
        return ""
