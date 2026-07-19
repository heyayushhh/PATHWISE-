import os

try:
    import google.generativeai as genai
except ImportError:
    genai = None


_model = None


def get_gemini_model():
    """
    Return a shared Gemini GenerativeModel instance.

    Configures the API key on first call and reuses
    the same model object afterwards.
    """

    global _model

    if genai is None:
        return None

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    if _model is None:

        genai.configure(
            api_key=api_key
        )

        model_name = os.getenv("GEMINI_MODEL", "models/gemini-1.5-flash")
        
        _model = genai.GenerativeModel(
            model_name
        )

    return _model


def call_gemini(prompt: str) -> str:
    """
    Convenience wrapper: send a prompt to Gemini
    and return the response text.
    """

    try:
        model = get_gemini_model()
        if model is None:
            return ""
        response = model.generate_content(prompt)
        return response.text or ""
    except Exception as exc:
        print(f"Gemini call failed: {exc}")
        return ""
