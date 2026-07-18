"""Rule-based answer analysis for adaptive assessment."""

import re
from typing import Any


def _extract_keywords(text: str) -> list[str]:
    """Extract simple keywords from free-form text."""

    words = re.findall(r"[a-zA-Z]+", text.lower())
    return [word for word in words if len(word) > 2]


def _normalize_interest_terms(keywords: list[str]) -> list[str]:
    """Normalize raw words into a compact set of interest terms."""

    normalized: list[str] = []
    joined = " ".join(keywords)

    if any(token in joined for token in ["program", "programming", "coding", "software"]):
        normalized.append("programming")
    if any(token in joined for token in ["math", "mathematics", "algebra"]):
        normalized.append("mathematics")
    if any(token in joined for token in ["problem", "solve", "solving", "problems"]):
        normalized.append("problem solving")
    if any(token in joined for token in ["design", "ui", "ux", "creative"]):
        normalized.append("design")
    if any(token in joined for token in ["write", "writing", "content"]):
        normalized.append("writing")
    if any(token in joined for token in ["lead", "leadership"]):
        normalized.append("leadership")

    return normalized


def analyze_answer(question: dict[str, Any], answer: str, state: dict[str, Any]) -> dict[str, Any]:
    """Use deterministic rules to update the assessment state."""

    keywords = _extract_keywords(answer)
    existing_interests = state.get("extracted_interests") or []
    existing_strengths = state.get("inferred_strengths") or []
    existing_traits = state.get("inferred_traits") or []

    # Map MCQ answer to interest
    normalized_interests = _normalize_interest_terms(keywords)
    
    # Add the full answer as an interest if it's an MCQ option
    if answer:
        normalized_interests.append(answer.lower())

    interests = list(dict.fromkeys([*(existing_interests), *normalized_interests]))

    strengths = list(
        dict.fromkeys(
            [
                *existing_strengths,
                *[
                    keyword
                    for keyword in normalized_interests
                    if keyword in {"programming", "mathematics", "problem solving", "design", "writing", "leadership"}
                ],
            ]
        )
    )

    trait_name = "analytical" if any(keyword in keywords for keyword in ["logic", "math", "solve", "coding"]) else "curious"
    traits = [
        *existing_traits,
        {"trait": trait_name, "confidence": 0.7},
    ]

    confidence = min(0.95, 0.35 + (len(interests) * 0.08) + (len(strengths) * 0.07))
    uncertainty = max(0.05, 1.0 - confidence)

    return {
        "extracted_interests": interests,
        "inferred_strengths": strengths,
        "inferred_traits": traits,
        "confidence_score": round(confidence, 2),
        "uncertainty_score": round(uncertainty, 2),
    }
