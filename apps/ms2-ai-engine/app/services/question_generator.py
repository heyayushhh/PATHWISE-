"""Deterministic question generation for adaptive assessment."""

from typing import Any


QUESTION_BANK = {
    "interests": {
        "question": "What topics or activities do you enjoy the most?",
        "reason": "Need to discover interests first.",
    },
    "strengths": {
        "question": "What skills do you feel strongest at?",
        "reason": "Need to discover strengths next.",
    },
    "personality": {
        "question": "How would you describe your work style or personality?",
        "reason": "Need to infer traits for better recommendations.",
    },
    "work_style": {
        "question": "How do you prefer to work when solving problems?",
        "reason": "Need more context for career matching.",
    },
}


def already_asked(state: dict[str, Any], question: str) -> bool:
    """Check whether this question was already asked."""

    history = state.get("question_history") or []

    return any(
        item.get("question") == question
        for item in history
    )


def generate_next_question(state: dict[str, Any]) -> dict[str, Any]:
    """Generate next question based on current evidence."""

    interests = state.get("extracted_interests") or []
    strengths = state.get("inferred_strengths") or []
    traits = state.get("inferred_traits") or []


    if not interests:
        candidate = QUESTION_BANK["interests"]

        if not already_asked(state, candidate["question"]):
            return {
                "question": candidate["question"],
                "category": "interests",
                "reason": candidate["reason"],
            }


    if not strengths:
        candidate = QUESTION_BANK["strengths"]

        if not already_asked(state, candidate["question"]):
            return {
                "question": candidate["question"],
                "category": "strengths",
                "reason": candidate["reason"],
            }


    if not traits:
        candidate = QUESTION_BANK["personality"]

        if not already_asked(state, candidate["question"]):
            return {
                "question": candidate["question"],
                "category": "personality",
                "reason": candidate["reason"],
            }


    candidate = QUESTION_BANK["work_style"]

    return {
        "question": candidate["question"],
        "category": "work_style",
        "reason": candidate["reason"],
    }