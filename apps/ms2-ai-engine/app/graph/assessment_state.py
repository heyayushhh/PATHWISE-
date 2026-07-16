"""
Graph state for the adaptive assessment LangGraph.
"""

from typing import TypedDict


class AdaptiveAssessmentState(TypedDict):
    """
    State that flows through the adaptive assessment graph.

    The client holds this state between turns and sends
    it back with each answer submission.
    """

    # User context
    user_profile: dict
    session_id: str

    # Assessment progress
    previous_answers: list[dict]
    all_generated_questions: list[dict]
    current_questions: list[dict]

    # Decision metrics
    confidence_score: float
    domains_explored: list[str]
    unanswered_topics: list[str]

    # Iteration tracking
    iteration_count: int
    max_questions: int
    confidence_threshold: float

    # Completion
    is_complete: bool
    recommended_careers: list[dict]
    explanation: str
