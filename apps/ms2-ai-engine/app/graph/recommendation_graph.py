"""
LangGraph definition for the career recommendation workflow.

Flow:
  parse_assessment → extract_interests → infer_traits
  → match_careers → generate_recommendations
  → generate_explanation → END
"""

from langgraph.graph import StateGraph, END

from app.graph.recommendation_state import RecommendationState
from app.graph.recommendation_nodes import (
    parse_assessment_node,
    extract_interests_node,
    infer_traits_node,
    match_careers_node,
    generate_recommendations_node,
    generate_explanation_node,
)


workflow = StateGraph(RecommendationState)


# Add nodes

workflow.add_node(
    "parse_assessment",
    parse_assessment_node
)

workflow.add_node(
    "extract_interests",
    extract_interests_node
)

workflow.add_node(
    "infer_traits",
    infer_traits_node
)

workflow.add_node(
    "match_careers",
    match_careers_node
)

workflow.add_node(
    "generate_recommendations",
    generate_recommendations_node
)

workflow.add_node(
    "generate_explanation",
    generate_explanation_node
)


# Set entry point

workflow.set_entry_point("parse_assessment")


# Define edges

workflow.add_edge(
    "parse_assessment",
    "extract_interests"
)

workflow.add_edge(
    "extract_interests",
    "infer_traits"
)

workflow.add_edge(
    "infer_traits",
    "match_careers"
)

workflow.add_edge(
    "match_careers",
    "generate_recommendations"
)

workflow.add_edge(
    "generate_recommendations",
    "generate_explanation"
)

workflow.add_edge(
    "generate_explanation",
    END
)


# Compile

recommendation_graph = workflow.compile()
