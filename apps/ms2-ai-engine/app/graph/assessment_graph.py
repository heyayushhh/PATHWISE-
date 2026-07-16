"""
LangGraph definition for the adaptive assessment workflow.

The graph now supports a real adaptive loop with deterministic
question generation, answer analysis, and recommendation generation.
"""

from langgraph.graph import StateGraph, END

from app.graph.assessment_state import AdaptiveAssessmentState
from app.graph.assessment_nodes import (
    initialize_assessment_node,
    decision_node,
    question_generator_node,
    question_selector_node,
    answer_analysis_node,
    recommendation_node,
    finalize_assessment_node,
)


def _route_from_decision(state: AdaptiveAssessmentState) -> str:
    """
    Route the workflow based on the decision node output.

    The decision node is responsible for determining the next action.
    The router only handles graph navigation.
    """

    next_action = state.get("next_action")

    if next_action:
        return next_action

    # Fallback safety handling
    if state.get("is_complete", False):
        return "recommendation"

    if state.get("pending_answer") is not None:
        return "answer_analysis"

    return "question_generator"


workflow = StateGraph(AdaptiveAssessmentState)

workflow.add_node("initialize", initialize_assessment_node)
workflow.add_node("decision", decision_node)
workflow.add_node("question_generator", question_generator_node)
workflow.add_node("question_selector", question_selector_node)
workflow.add_node("answer_analysis", answer_analysis_node)
workflow.add_node("recommendation", recommendation_node)
workflow.add_node("finalize", finalize_assessment_node)


workflow.set_entry_point("initialize")


workflow.add_edge("initialize", "decision")

workflow.add_conditional_edges(
    "decision",
    _route_from_decision,
    {
        "question_generator": "question_generator",
        "answer_analysis": "answer_analysis",
        "recommendation": "recommendation",
    },
)


workflow.add_edge("question_generator", "question_selector")

# The graph intentionally pauses after generating a question.
# The checkpointed state is resumed when the user submits an answer.
workflow.add_edge("question_selector", END)


workflow.add_edge("answer_analysis", "decision")

workflow.add_edge("recommendation", "finalize")

workflow.add_edge("finalize", END)


adaptive_assessment_graph = workflow.compile()


# Compatibility aliases used by the existing career service layer.
# These point to the same adaptive graph to avoid breaking existing flows.
assessment_start_graph = adaptive_assessment_graph
assessment_next_graph = adaptive_assessment_graph