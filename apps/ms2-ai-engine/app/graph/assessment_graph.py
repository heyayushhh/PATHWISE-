"""
LangGraph definitions for the adaptive assessment workflow.

Two separate compiled graphs:

1. assessment_start_graph:
   start_node → question_generator_node → END
   Used when the user begins a new assessment.

2. assessment_next_graph:
   decision_node → (conditional) →
     if complete: recommendation_node → end_node → END
     if not:      dynamic_question_selector_node → END
   Used for each subsequent answer submission.
"""

from langgraph.graph import StateGraph, END

from app.graph.assessment_state import (
    AdaptiveAssessmentState,
)
from app.graph.assessment_nodes import (
    start_node,
    question_generator_node,
    decision_node,
    dynamic_question_selector_node,
    recommendation_node,
    end_node,
)


# ==========================================================
# Graph 1: Start Assessment
# ==========================================================


start_workflow = StateGraph(AdaptiveAssessmentState)

start_workflow.add_node(
    "start", start_node
)

start_workflow.add_node(
    "generate_questions",
    question_generator_node
)

start_workflow.set_entry_point("start")

start_workflow.add_edge(
    "start", "generate_questions"
)

start_workflow.add_edge(
    "generate_questions", END
)


assessment_start_graph = start_workflow.compile()


# ==========================================================
# Graph 2: Process Next Answers
# ==========================================================


def _should_complete(
    state: AdaptiveAssessmentState
) -> str:
    """
    Conditional edge: route to recommendation or
    more questions based on decision node output.
    """

    if state.get("is_complete", False):
        return "recommendation"

    return "more_questions"


next_workflow = StateGraph(AdaptiveAssessmentState)

next_workflow.add_node(
    "decision", decision_node
)

next_workflow.add_node(
    "more_questions",
    dynamic_question_selector_node
)

next_workflow.add_node(
    "recommendation",
    recommendation_node
)

next_workflow.add_node(
    "end", end_node
)

next_workflow.set_entry_point("decision")

next_workflow.add_conditional_edges(
    "decision",
    _should_complete,
    {
        "recommendation": "recommendation",
        "more_questions": "more_questions"
    }
)

next_workflow.add_edge(
    "more_questions", END
)

next_workflow.add_edge(
    "recommendation", "end"
)

next_workflow.add_edge(
    "end", END
)


assessment_next_graph = next_workflow.compile()
