"""Rule-based answer analysis for adaptive assessment."""

from typing import Any
import re

def _extract_keywords(text: str) -> list[str]:
    """Extract simple keywords from free-form text."""
    words = re.findall(r"[a-zA-Z]+", text.lower())
    return [word for word in words if len(word) > 2]

def analyze_answer(question: dict[str, Any], answer: str, state: dict[str, Any]) -> dict[str, Any]:
    """Use deterministic rules to update the assessment state."""

    category = question.get("category", "")
    
    # Extract current_stream if this is the stream question
    current_stream = state.get("current_stream")
    if category == "stream":
        if "pcm" in answer.lower() and "pcmb" not in answer.lower():
            current_stream = "PCM"
        elif "pcmb" in answer.lower():
            current_stream = "PCMB"
        elif "pcb" in answer.lower():
            current_stream = "PCB"
        elif "commerce" in answer.lower():
            current_stream = "Commerce"
        elif "arts" in answer.lower() or "humanities" in answer.lower():
            current_stream = "Humanities"
        else:
            current_stream = answer

    # Update structured profile fields
    existing_interests = state.get("extracted_interests") or []
    existing_strengths = state.get("inferred_strengths") or []
    existing_traits = state.get("inferred_traits") or []
    career_values = state.get("career_values") or []
    work_preferences = state.get("work_preferences") or []

    if ("interest" in category or 
        "area" in category or 
        "sub" in category or 
        category in ["general_exploration", "pcm_programming", "pcb_patient", "pcb_environment", "pcmb_pref", "pcmb_environment", "commerce_math", "commerce_style", "arts_deep_dive", "arts_style", "vocational_deep_dive", "vocational_style", "stream"]):
        if answer not in existing_interests:
            existing_interests.append(answer)
    elif "style" in category or category == "work_style":
        if answer not in work_preferences:
            work_preferences.append(answer)
    elif "value" in category or category == "career_values":
        if answer not in career_values:
            career_values.append(answer)
    elif "strength" in category or category == "subject_comfort" or category == "strengths":
        if answer not in existing_strengths:
            existing_strengths.append(answer)
    else:
        # Fallback keyword extraction for generic questions
        keywords = _extract_keywords(answer)
        if any(token in keywords for token in ["logic", "math", "solve", "coding"]):
            if "analytical" not in [t.get("trait") for t in existing_traits]:
                existing_traits.append({"trait": "analytical", "confidence": 0.8})

    confidence = min(0.95, 0.35 + (len(existing_interests) * 0.08) + (len(existing_strengths) * 0.07))
    uncertainty = max(0.05, 1.0 - confidence)

    return {
        "current_stream": current_stream,
        "extracted_interests": existing_interests,
        "inferred_strengths": existing_strengths,
        "inferred_traits": existing_traits,
        "career_values": career_values,
        "work_preferences": work_preferences,
        "confidence_score": round(confidence, 2),
        "uncertainty_score": round(uncertainty, 2),
    }
