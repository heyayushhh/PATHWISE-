from typing import Any

from fastapi import APIRouter, HTTPException

from app.graph.assessment_state import AdaptiveAssessmentState
from app.graph.assessment_nodes import (
    initialize_assessment_node,
    question_generator_node,
    question_selector_node,
    answer_analysis_node,
    recommendation_node,
    decision_node,
)
from app.schemas.assessment_schema import (
    AssessmentAnswerRequest,
    AssessmentStartRequest,
    AssessmentStartResponse,
    AssessmentStatusResponse,
    AssessmentTurnResponse,
)
from app.services.assessment_persistence import load_state, save_state
from app.services.question_generator import generate_next_question
from app.services.recommendation_engine import generate_recommendations

router = APIRouter(prefix="/assessment", tags=["Assessment"])


def _build_state_payload(user_id: str, assessment_type: str, session_id: str) -> AdaptiveAssessmentState:
    return {
        "user_id": user_id,
        "session_id": session_id,
        "assessment_type": assessment_type,
        "user_profile": {"user_id": user_id},
        "answers": [],
        "current_question": None,
        "question_history": [],
        "pending_answer": None,
        "candidate_careers": [],
        "extracted_interests": [],
        "inferred_traits": [],
        "inferred_strengths": [],
        "confidence_score": 0.0,
        "uncertainty_score": 1.0,
        "asked_categories": [],
        "remaining_categories": [],
        "iteration_count": 0,
        "max_questions": 12,
        "confidence_threshold": 0.85,
        "is_complete": False,
        "recommendations": [],
        "explanation": "",
    }


@router.post("/start", response_model=AssessmentStartResponse)
async def start_assessment(request: AssessmentStartRequest) -> AssessmentStartResponse:
    session_id = request.session_id or f"{request.user_id}-{request.assessment_type}-{abs(hash(request.user_id + request.assessment_type))}"
    state = _build_state_payload(request.user_id, request.assessment_type, session_id)

    initialize_assessment_node(state)
    question_generator_node(state)
    question_selector_node(state)

    save_state(session_id, state)

    question = state.get("current_question") or {}
    return AssessmentStartResponse(
        session_id=session_id,
        question=question.get("question"),
        category=question.get("category"),
        confidence_score=state.get("confidence_score"),
        progress=min(1, int(state.get("iteration_count", 0))),
    )


@router.post("/{session_id}/answer", response_model=AssessmentTurnResponse)
async def submit_answer(session_id: str, request: AssessmentAnswerRequest) -> AssessmentTurnResponse:
    state = load_state(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Assessment session not found")

    if not request.answer.strip():
        raise HTTPException(status_code=400, detail="Answer cannot be empty")

    state["pending_answer"] = {"answer": request.answer}
    answer_analysis_node(state)
    decision_node(state)

    if state.get("is_complete", False):
        recommendation_node(state)
        save_state(session_id, state)
        return AssessmentTurnResponse(
            status="completed",
            session_id=session_id,
            recommendations=state.get("recommendations", []),
            confidence_score=state.get("confidence_score"),
            progress=min(100, int(state.get("iteration_count", 0) * 10)),
            explanation=state.get("explanation"),
        )

    question_generator_node(state)
    question_selector_node(state)
    save_state(session_id, state)

    question = state.get("current_question") or {}
    return AssessmentTurnResponse(
        status="continue",
        session_id=session_id,
        question=question.get("question"),
        category=question.get("category"),
        confidence_score=state.get("confidence_score"),
        progress=min(100, int(state.get("iteration_count", 0) * 10)),
    )


@router.get("/{session_id}", response_model=AssessmentStatusResponse)
async def get_status(session_id: str) -> AssessmentStatusResponse:
    state = load_state(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Assessment session not found")

    question = state.get("current_question") or {}
    return AssessmentStatusResponse(
        session_id=session_id,
        status="completed" if state.get("is_complete") else "continue",
        current_question=question.get("question"),
        confidence_score=state.get("confidence_score"),
        progress=min(100, int(state.get("iteration_count", 0) * 10)),
        is_complete=bool(state.get("is_complete", False)),
    )
