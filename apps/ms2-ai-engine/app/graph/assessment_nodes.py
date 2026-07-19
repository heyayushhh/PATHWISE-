"""
Node implementations for the adaptive assessment workflow.

The nodes stay modular and deterministic while preparing the flow for
future Gemini or Neo4j integration.
"""

from app.graph.assessment_state import AdaptiveAssessmentState, validate_assessment_state
from app.services.question_generator import generate_next_question
from app.services.answer_analyzer import analyze_answer
from app.services.recommendation_engine import generate_recommendations


def initialize_assessment_node(state: AdaptiveAssessmentState):
    """Initialize the adaptive assessment state."""

    print("\n========== INITIALIZE ASSESSMENT NODE ==========")
    print("  Preparing adaptive assessment state")

    state["user_id"] = state.get("user_id", "")
    state["session_id"] = state.get("session_id", "")
    state["assessment_type"] = state.get("assessment_type", "adaptive")
    state["user_profile"] = state.get("user_profile", {})

    state["answers"] = state.get("answers") or []
    state["current_question"] = state.get("current_question")
    state["question_history"] = state.get("question_history") or []
    state["pending_answer"] = state.get("pending_answer")

    state["current_stream"] = state.get("current_stream")
    state["candidate_careers"] = state.get("candidate_careers") or []
    state["extracted_interests"] = state.get("extracted_interests") or []
    state["inferred_traits"] = state.get("inferred_traits") or []
    state["inferred_strengths"] = state.get("inferred_strengths") or []
    state["career_values"] = state.get("career_values") or []
    state["work_preferences"] = state.get("work_preferences") or []

    state["confidence_score"] = float(state.get("confidence_score", 0.0))
    state["uncertainty_score"] = float(state.get("uncertainty_score", 1.0))
    state["asked_categories"] = state.get("asked_categories") or []
    state["remaining_categories"] = state.get("remaining_categories") or []

    state["iteration_count"] = int(state.get("iteration_count", 0))
    state["max_questions"] = int(state.get("max_questions", 12))
    state["confidence_threshold"] = float(state.get("confidence_threshold", 0.85))

    state["is_complete"] = bool(state.get("is_complete", False))
    state["recommendations"] = state.get("recommendations") or []
    state["explanation"] = state.get("explanation", "")

    return state


def decision_node(state: AdaptiveAssessmentState):
    """Decide whether to ask another question or generate recommendations."""

    print("\n========== DECISION NODE ==========")
    validate_assessment_state(state)

    if state.get("is_complete", False):
        print("  Assessment already complete")
        return state

    if state.get("iteration_count", 0) >= 12:
        print("  Reached maximum question limit")
        state["is_complete"] = True
        state["explanation"] = "Maximum question limit reached"
        return state

    print("  Continuing with the adaptive assessment loop")
    return state


def question_generator_node(state: AdaptiveAssessmentState):
    """Generate the next deterministic question."""

    print("\n========== QUESTION GENERATOR NODE ==========")
    validate_assessment_state(state)

    question_data = generate_next_question(state)
    state["current_question"] = question_data
    
    if question_data:
        state["iteration_count"] = int(state.get("iteration_count", 0)) + 1

        state["question_history"] = state.get("question_history") or []
        state["question_history"].append(
            {
                "question": question_data.get("question"),
                "question_id": question_data.get("id"),
                "category": question_data.get("category"),
                "reason": question_data.get("reason"),
                "answer": None,
                "iteration": state["iteration_count"],
            }
        )

        state["asked_categories"] = list(
            dict.fromkeys(
                [*state.get("asked_categories", []), question_data.get("category")]
            )
        )
        state["remaining_categories"] = [
            category
            for category in [
                "interests",
                "strengths",
                "personality",
                "work_style",
                "leadership",
                "creativity",
                "communication",
                "problem_solving",
            ]
            if category not in state["asked_categories"]
        ]

        print(f"  Generated question for category: {question_data.get('category')}")
    else:
        print("  No more questions generated (is_complete is True)")

    return state


def question_selector_node(state: AdaptiveAssessmentState):
    """Select and expose the next question in a deterministic way."""

    print("\n========== QUESTION SELECTOR NODE ==========")
    validate_assessment_state(state)

    if not state.get("current_question"):
        state["current_question"] = {
            "question": "Tell us more about yourself.",
            "category": "general",
            "reason": "Fallback question",
        }

    print(f"  Selected question: {state['current_question'].get('question')}")
    return state


def answer_analysis_node(state: AdaptiveAssessmentState):
    """Analyze a submitted answer and update the assessment state."""

    print("\n========== ANSWER ANALYSIS NODE ==========")
    validate_assessment_state(state)

    pending_answer = state.get("pending_answer")
    if not pending_answer:
        print("  No answer provided for analysis")
        return state

    if not state.get("current_question"):
        state["current_question"] = {
            "question": "Tell us more about yourself.",
            "category": "general",
            "reason": "Fallback question",
        }

    analysis = analyze_answer(
        state["current_question"],
        pending_answer.get("answer", ""),
        state,
    )

    state["answers"] = state.get("answers") or []
    state["answers"].append(
        {
            "question": state["current_question"].get("question"),
            "question_id": state["current_question"].get("id"),
            "category": state["current_question"].get("category"),
            "answer": pending_answer.get("answer", ""),
        }
    )

    state["current_stream"] = analysis.get("current_stream")
    state["extracted_interests"] = analysis["extracted_interests"]
    state["inferred_strengths"] = analysis["inferred_strengths"]
    state["inferred_traits"] = analysis["inferred_traits"]
    state["career_values"] = analysis.get("career_values", [])
    state["work_preferences"] = analysis.get("work_preferences", [])
    state["confidence_score"] = analysis["confidence_score"]
    state["uncertainty_score"] = analysis["uncertainty_score"]

    if state["question_history"]:
        state["question_history"][-1]["answer"] = pending_answer.get("answer", "")

    state["pending_answer"] = None
    state["current_question"] = None

    print("  Answer processed and state updated")
    return state


def recommendation_node(state: AdaptiveAssessmentState):
    """Mark assessment as complete and ready for separate recommendation generation."""

    print("\n========== RECOMMENDATION NODE ==========")
    validate_assessment_state(state)

    state["is_complete"] = True
    state["explanation"] = "Assessment complete. Recommendations pending."
    state["recommendations"] = []

    print("  Assessment completed. Recommendations generation decoupled.")
    return state


def finalize_assessment_node(state: AdaptiveAssessmentState):
    """Finalize the assessment state without forcing completion."""

    print("\n========== FINALIZE ASSESSMENT NODE ==========")
    print("  Adaptive assessment workflow completed")
    return state
