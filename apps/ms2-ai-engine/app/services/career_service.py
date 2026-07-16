from app.schemas.career import (
    CareerRequest,
    AssessmentPayload,
)

from app.agents.career_agent import (
    generate_career_response,
)

from app.graph.recommendation_graph import (
    recommendation_graph,
)

from app.graph.assessment_graph import (
    assessment_start_graph,
    assessment_next_graph,
)


async def generate_career_recommendation(
    request: CareerRequest
):
    """
    Original career recommendation flow.
    Uses the existing career_graph (build_prompt → gemini → parser).
    """

    response = await generate_career_response(request)

    return response


async def generate_assessment_recommendation(
    payload: AssessmentPayload
):
    """
    New assessment-based recommendation flow.
    Uses the recommendation LangGraph pipeline:
      parse → extract interests → infer traits
      → match careers → generate recommendations
      → generate explanation
    """

    state = {
        "user_id": payload.userId,
        "assessment_type": payload.assessmentType,
        "answers": [
            a.model_dump() for a in payload.answers
        ],
        "extracted_interests": [],
        "personality_traits": [],
        "inferred_strengths": [],
        "matched_careers": [],
        "recommendations": [],
        "explanation": "",
        "raw_response": ""
    }

    final_state = recommendation_graph.invoke(state)

    return {
        "careers": final_state["recommendations"],
        "explanation": final_state["explanation"]
    }


async def start_adaptive_assessment(
    user_id: str,
    assessment_type: str = "career_interest"
):
    """
    Start an adaptive assessment.
    Runs the start graph and returns the first questions + state.
    """

    state = {
        "user_profile": {
            "userId": user_id
        },
        "session_id": "",
        "previous_answers": [],
        "all_generated_questions": [],
        "current_questions": [],
        "confidence_score": 0.0,
        "domains_explored": [],
        "unanswered_topics": [],
        "iteration_count": 0,
        "max_questions": 20,
        "confidence_threshold": 0.85,
        "is_complete": False,
        "recommended_careers": [],
        "explanation": ""
    }

    final_state = assessment_start_graph.invoke(state)

    return {
        "questions": final_state["current_questions"],
        "state": _serialize_state(final_state),
        "isComplete": False
    }


async def process_adaptive_next(
    user_id: str,
    answers: list[dict],
    client_state: dict
):
    """
    Process the next round of the adaptive assessment.
    Merges new answers into state, runs decision graph,
    returns either more questions or final recommendations.
    """

    # Restore state from client
    state = _deserialize_state(client_state)

    # Merge new answers
    state["previous_answers"].extend(answers)

    # Run the next graph (decision → conditional)
    final_state = assessment_next_graph.invoke(state)

    if final_state.get("is_complete", False):
        return {
            "questions": [],
            "state": {},
            "isComplete": True,
            "careers": final_state.get(
                "recommended_careers", []
            ),
            "explanation": final_state.get(
                "explanation", ""
            )
        }

    return {
        "questions": final_state.get(
            "current_questions", []
        ),
        "state": _serialize_state(final_state),
        "isComplete": False,
        "careers": [],
        "explanation": ""
    }


def _serialize_state(state: dict) -> dict:
    """
    Prepare graph state for sending to client.
    Strips internal fields not needed by the client.
    """

    return {
        "previous_answers": state.get(
            "previous_answers", []
        ),
        "all_generated_questions": state.get(
            "all_generated_questions", []
        ),
        "confidence_score": state.get(
            "confidence_score", 0.0
        ),
        "domains_explored": state.get(
            "domains_explored", []
        ),
        "unanswered_topics": state.get(
            "unanswered_topics", []
        ),
        "iteration_count": state.get(
            "iteration_count", 0
        ),
        "max_questions": state.get(
            "max_questions", 20
        ),
        "confidence_threshold": state.get(
            "confidence_threshold", 0.85
        ),
        "user_profile": state.get(
            "user_profile", {}
        ),
    }


def _deserialize_state(client_state: dict) -> dict:
    """
    Reconstruct full graph state from client-held state.
    """

    return {
        "user_profile": client_state.get(
            "user_profile", {}
        ),
        "session_id": "",
        "previous_answers": client_state.get(
            "previous_answers", []
        ),
        "all_generated_questions": client_state.get(
            "all_generated_questions", []
        ),
        "current_questions": [],
        "confidence_score": client_state.get(
            "confidence_score", 0.0
        ),
        "domains_explored": client_state.get(
            "domains_explored", []
        ),
        "unanswered_topics": client_state.get(
            "unanswered_topics", []
        ),
        "iteration_count": client_state.get(
            "iteration_count", 0
        ),
        "max_questions": client_state.get(
            "max_questions", 20
        ),
        "confidence_threshold": client_state.get(
            "confidence_threshold", 0.85
        ),
        "is_complete": False,
        "recommended_careers": [],
        "explanation": ""
    }