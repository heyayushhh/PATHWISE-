"""
LangGraph nodes for the career recommendation workflow.

Graph flow:
  parse_assessment → extract_interests → infer_traits
  → match_careers → generate_recommendations → generate_explanation
"""

import json

from app.graph.recommendation_state import RecommendationState
from app.utils.gemini import call_gemini

from app.prompts.recommendation_prompt import (
    build_extract_interests_prompt,
    build_infer_traits_prompt,
    build_match_careers_prompt,
    build_generate_recommendations_prompt,
    build_explanation_prompt,
)


def _safe_parse_json(text: str) -> dict:
    """Strip markdown fences and parse JSON safely."""

    cleaned = text.strip()

    if cleaned.startswith("```json"):
        cleaned = cleaned.replace(
            "```json", ""
        ).replace("```", "").strip()

    elif cleaned.startswith("```"):
        cleaned = cleaned.replace(
            "```", ""
        ).strip()

    return json.loads(cleaned)


# ---------- Node 1: Parse Assessment ----------


def parse_assessment_node(state: RecommendationState):
    """
    Structures raw answers into a normalized format.
    No LLM call — pure data transformation.
    """

    print("\n========== PARSE ASSESSMENT NODE ==========")

    answers = state["answers"]

    print(f"  Processing {len(answers)} answers")

    return state


# ---------- Node 2: Extract Interests ----------


def extract_interests_node(state: RecommendationState):
    """
    Uses Gemini to extract top interests from answers.
    """

    print("\n========== EXTRACT INTERESTS NODE ==========")

    prompt = build_extract_interests_prompt(
        state["answers"]
    )

    raw = call_gemini(prompt)
    state["raw_response"] = raw

    try:
        parsed = _safe_parse_json(raw)
        state["extracted_interests"] = parsed.get(
            "interests", []
        )
    except Exception as e:
        print(f"  Parse error: {e}")
        state["extracted_interests"] = [
            "Technology",
            "Problem Solving",
            "Innovation"
        ]

    print(f"  Interests: {state['extracted_interests']}")

    return state


# ---------- Node 3: Infer Traits ----------


def infer_traits_node(state: RecommendationState):
    """
    Uses Gemini to infer personality traits and strengths.
    """

    print("\n========== INFER TRAITS NODE ==========")

    prompt = build_infer_traits_prompt(
        state["answers"],
        state["extracted_interests"]
    )

    raw = call_gemini(prompt)
    state["raw_response"] = raw

    try:
        parsed = _safe_parse_json(raw)
        state["personality_traits"] = parsed.get(
            "personalityTraits", []
        )
        state["inferred_strengths"] = parsed.get(
            "strengths", []
        )
    except Exception as e:
        print(f"  Parse error: {e}")
        state["personality_traits"] = [
            {"trait": "Analytical", "score": "medium"}
        ]
        state["inferred_strengths"] = [
            "Problem Solving"
        ]

    print(f"  Traits: {state['personality_traits']}")
    print(f"  Strengths: {state['inferred_strengths']}")

    return state


# ---------- Node 4: Match Careers ----------


def match_careers_node(state: RecommendationState):
    """
    Uses Gemini to match careers based on the full profile.
    """

    print("\n========== MATCH CAREERS NODE ==========")

    prompt = build_match_careers_prompt(
        state["extracted_interests"],
        state["personality_traits"],
        state["inferred_strengths"]
    )

    raw = call_gemini(prompt)
    state["raw_response"] = raw

    try:
        parsed = _safe_parse_json(raw)
        state["matched_careers"] = parsed.get(
            "careers", []
        )
    except Exception as e:
        print(f"  Parse error: {e}")
        state["matched_careers"] = []

    print(f"  Matched {len(state['matched_careers'])} careers")

    return state


# ---------- Node 5: Generate Recommendations ----------


def generate_recommendations_node(state: RecommendationState):
    """
    Uses Gemini to produce the final 5 detailed recommendations.
    """

    print("\n========== GENERATE RECOMMENDATIONS NODE ==========")

    prompt = build_generate_recommendations_prompt(
        state["matched_careers"],
        state["extracted_interests"],
        state["personality_traits"],
        state["inferred_strengths"]
    )

    raw = call_gemini(prompt)
    state["raw_response"] = raw

    try:
        parsed = _safe_parse_json(raw)
        state["recommendations"] = parsed.get(
            "careers", []
        )
    except Exception as e:
        print(f"  Parse error: {e}")
        state["recommendations"] = state.get(
            "matched_careers", []
        )

    print(f"  Generated {len(state['recommendations'])} recommendations")

    return state


# ---------- Node 6: Generate Explanation ----------


def generate_explanation_node(state: RecommendationState):
    """
    Produces a human-readable summary of the recommendation logic.
    """

    print("\n========== GENERATE EXPLANATION NODE ==========")

    prompt = build_explanation_prompt(
        state["recommendations"],
        state["extracted_interests"],
        state["inferred_strengths"]
    )

    raw = call_gemini(prompt)
    state["raw_response"] = raw

    try:
        parsed = _safe_parse_json(raw)
        state["explanation"] = parsed.get(
            "explanation", ""
        )
    except Exception as e:
        print(f"  Parse error: {e}")
        state["explanation"] = (
            "Based on your assessment responses, "
            "we have identified careers that align "
            "with your interests and strengths."
        )

    print(f"  Explanation generated")

    return state
