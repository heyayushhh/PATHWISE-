"""
Graph state for the adaptive assessment workflow.

This state is intentionally structured for future adaptive questioning
while remaining compile-safe and modular.
"""

from typing import TypedDict


class AdaptiveAssessmentState(TypedDict):
    """State container for the adaptive assessment workflow."""

    user_id: str
    session_id: str
    assessment_type: str
    user_profile: dict

    answers: list[dict]
    current_question: dict | None
    question_history: list[dict]
    pending_answer: dict | None

    candidate_careers: list[dict]
    extracted_interests: list[str]
    inferred_traits: list[dict]
    inferred_strengths: list[str]

    confidence_score: float
    uncertainty_score: float
    asked_categories: list[str]
    remaining_categories: list[str]

    iteration_count: int
    max_questions: int
    confidence_threshold: float

    is_complete: bool
    recommendations: list[dict]
    explanation: str


def validate_assessment_state(state: AdaptiveAssessmentState) -> bool:
    """Validate basic adaptive assessment state invariants."""

    if not state.get("session_id"):
        raise ValueError("session_id is required")

    if "answers" not in state or not isinstance(state.get("answers"), list):
        raise ValueError("answers must be a list")

    if "question_history" not in state or not isinstance(state.get("question_history"), list):
        raise ValueError("question_history must be a list")

    if "asked_categories" not in state or not isinstance(state.get("asked_categories"), list):
        raise ValueError("asked_categories must be a list")

    if "remaining_categories" not in state or not isinstance(state.get("remaining_categories"), list):
        raise ValueError("remaining_categories must be a list")

    if state.get("current_question") is not None and not isinstance(state.get("current_question"), dict):
        raise ValueError("current_question must be a dict or None")

    iteration_count = int(state.get("iteration_count", 0))
    max_questions = int(state.get("max_questions", 12))

    if iteration_count > max_questions:
        raise ValueError("maximum question limit reached")

    return True
