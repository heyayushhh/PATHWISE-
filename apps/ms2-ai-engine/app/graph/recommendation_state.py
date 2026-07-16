"""
Graph state for the career recommendation LangGraph.
"""

from typing import TypedDict


class RecommendationState(TypedDict):
    """
    State that flows through the recommendation graph.

    Populated progressively by each node.
    """

    # Input from MS1
    user_id: str
    assessment_type: str
    answers: list[dict]

    # Populated by extract_interests_node
    extracted_interests: list[str]

    # Populated by infer_traits_node
    personality_traits: list[dict]
    inferred_strengths: list[str]

    # Populated by match_careers_node
    matched_careers: list[dict]

    # Populated by generate_recommendations_node
    recommendations: list[dict]

    # Populated by generate_explanation_node
    explanation: str

    # Internal
    raw_response: str
