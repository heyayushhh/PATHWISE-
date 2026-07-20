from typing import Any, Optional

from fastapi import APIRouter, HTTPException, BackgroundTasks

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
    AssessmentResultResponse,
    AssessmentStartRequest,
    AssessmentStartResponse,
    AssessmentStatusResponse,
    AssessmentTurnResponse,
    RestoreSessionRequest,
    ScoreRequest,
)
from app.schemas.career import AssessmentAnswer, AssessmentPayload
from app.services.career_service import generate_assessment_recommendation
from app.services.assessment_persistence import load_state, save_state
from app.services.question_generator import (
    generate_next_question,
    get_total_questions,
    validate_assessment_completion,
)
from app.services.recommendation_engine import generate_recommendations
from app.services.scoring_engine import score_candidates_stateless

router = APIRouter(prefix="/assessment", tags=["Assessment"])


@router.post("/score")
async def score_candidates_route(request: ScoreRequest):
    """Stateless scoring endpoint for MS1 orchestration."""
    try:
        scored = score_candidates_stateless(request.profile, request.candidates)
        return {"recommendations": scored}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _build_state_payload(user_id: str, assessment_type: str, session_id: str, academic_stage: str) -> AdaptiveAssessmentState:
    return {
        "user_id": user_id,
        "session_id": session_id,
        "assessment_type": assessment_type,
        "academic_stage": academic_stage,
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
        "recommendation_status": "NOT_STARTED",
    }


def _build_dynamic_answer_payload(state: AdaptiveAssessmentState) -> AssessmentPayload:
    answers = [
        AssessmentAnswer(
            question=entry.get("question", "Unknown question"),
            selectedOption=entry.get("answer", ""),
            score=3,
        )
        for entry in state.get("answers", [])
    ]

    return AssessmentPayload(
        userId=state.get("user_id", ""),
        assessmentType=state.get("assessment_type", "career_interest"),
        answers=answers,
    )


def _extract_profile(state: dict[str, Any]) -> dict[str, Any]:
    return {
        "extracted_interests": state.get("extracted_interests", []),
        "inferred_strengths": state.get("inferred_strengths", []),
        "career_values": state.get("career_values", []),
        "work_preferences": state.get("work_preferences", []),
        "inferred_traits": state.get("inferred_traits", []),
        "current_stream": state.get("current_stream"),
        "confidence_score": state.get("confidence_score", 0.0),
        "answers": state.get("answers", []),
    }



@router.post("/start", response_model=AssessmentStartResponse)
async def start_assessment(request: AssessmentStartRequest) -> AssessmentStartResponse:
    session_id = request.session_id or f"{request.user_id}-{request.assessment_type}-{abs(hash(request.user_id + request.assessment_type))}"
    state = _build_state_payload(request.user_id, request.assessment_type, session_id, request.academic_stage or "Class 10")

    initialize_assessment_node(state)
    question_generator_node(state)
    question_selector_node(state)

    state["recommendation_status"] = "NOT_STARTED"
    save_state(session_id, state)

    question = state.get("current_question") or {}
    total_qs = get_total_questions(state)
    q_num = state.get("iteration_count", 0)
    progress_val = int(((q_num - 1) / total_qs) * 100)
    
    return AssessmentStartResponse(
        session_id=session_id,
        question=question.get("question"),
        question_id=question.get("id") or question.get("question_id"),
        options=question.get("options"),
        category=question.get("category"),
        status="continue",
        confidence_score=state.get("confidence_score"),
        progress=progress_val,
        question_number=q_num,
        total_questions=total_qs,
    )


@router.post("/restore")
async def restore_session_state(request: RestoreSessionRequest):
    """Restore state from database if disk cache is missing in MS2."""
    session_id = request.session_id
    state = request.state
    
    if not session_id or not isinstance(state, dict):
        raise HTTPException(status_code=400, detail="Invalid restore payload")
        
    save_state(session_id, state)
    print(f"Session '{session_id}' state restored successfully.")
    return {"status": "restored"}


@router.post("/{session_id}/answer", response_model=AssessmentTurnResponse)
async def submit_answer(session_id: str, request: AssessmentAnswerRequest, background_tasks: BackgroundTasks) -> AssessmentTurnResponse:
    state = load_state(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Assessment session not found")

    q_id = request.question_id
    ans_text = request.answer.strip()
    if not ans_text:
        raise HTTPException(status_code=400, detail="Answer cannot be empty")

    # 1. Idempotency Check: If already answered, do not advance
    answered_ids = [ans.get("question_id") for ans in state.get("answers", [])]
    if q_id in answered_ids:
        print(f"Idempotency hit: Question '{q_id}' already answered.")
        is_complete = state.get("is_complete", False)
        
        if is_complete:
            return AssessmentTurnResponse(
                status="completed",
                session_id=session_id,
                recommendations=state.get("recommendations", []),
                confidence_score=state.get("confidence_score"),
                progress=100,
                explanation=state.get("explanation"),
                profile=_extract_profile(state),
            )
        
        cur_q = state.get("current_question") or {}
        total_qs = get_total_questions(state)
        q_num = state.get("iteration_count", 0)
        progress_val = int(((q_num - 1) / total_qs) * 100)
        
        return AssessmentTurnResponse(
            status="continue",
            session_id=session_id,
            question=cur_q.get("question"),
            question_id=cur_q.get("id"),
            options=cur_q.get("options"),
            category=cur_q.get("category"),
            confidence_score=state.get("confidence_score"),
            progress=progress_val,
            question_number=q_num,
            total_questions=total_qs,
        )

    # 2. Check Question ID Mismatch
    current_q = state.get("current_question") or {}
    if current_q.get("id") != q_id:
        raise HTTPException(
            status_code=400,
            detail=f"Question ID mismatch. Expected '{current_q.get('id')}', got '{q_id}'"
        )

    # 3. Process Answer
    state["pending_answer"] = {"answer": ans_text}
    answer_analysis_node(state)
    decision_node(state)

    if state.get("is_complete", False):
        state["recommendation_status"] = "GENERATING"
        save_state(session_id, state)
        
        try:
            validate_assessment_completion(state)
        except ValueError as e:
            state["is_complete"] = False
            state["recommendation_status"] = "FAILED"
            save_state(session_id, state)
            raise HTTPException(status_code=400, detail=f"Assessment validation failed: {str(e)}")

        recommendation_node(state)
        save_state(session_id, state)

        return AssessmentTurnResponse(
            status="completed",
            session_id=session_id,
            recommendations=[],
            confidence_score=state.get("confidence_score"),
            progress=100,
            explanation=state.get("explanation"),
            profile=_extract_profile(state),
        )

    # 4. Generate Next Question
    question_generator_node(state)
    
    # Check if generator marked assessment complete (dangling branches/sequential end)
    if state.get("is_complete", False):
        state["recommendation_status"] = "GENERATING"
        save_state(session_id, state)
        
        try:
            validate_assessment_completion(state)
        except ValueError as e:
            state["is_complete"] = False
            state["recommendation_status"] = "FAILED"
            save_state(session_id, state)
            raise HTTPException(status_code=400, detail=f"Assessment validation failed: {str(e)}")

        recommendation_node(state)
        save_state(session_id, state)

        return AssessmentTurnResponse(
            status="completed",
            session_id=session_id,
            recommendations=[],
            confidence_score=state.get("confidence_score"),
            progress=100,
            explanation=state.get("explanation"),
            profile=_extract_profile(state),
        )

    question_selector_node(state)
    save_state(session_id, state)

    question = state.get("current_question") or {}
    total_qs = get_total_questions(state)
    q_num = state.get("iteration_count", 0)
    progress_val = int(((q_num - 1) / total_qs) * 100)
    
    return AssessmentTurnResponse(
        status="continue",
        session_id=session_id,
        question=question.get("question"),
        question_id=question.get("id"),
        options=question.get("options"),
        category=question.get("category"),
        confidence_score=state.get("confidence_score"),
        progress=progress_val,
        question_number=q_num,
        total_questions=total_qs,
    )


@router.get("/{session_id}")
async def get_status(session_id: str):
    state = load_state(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Assessment session not found")

    question = state.get("current_question") or {}
    total_qs = get_total_questions(state)
    q_num = state.get("iteration_count", 0)
    progress_val = 100 if state.get("is_complete") else int(((q_num - 1) / total_qs) * 100)
    
    return {
        "session_id": session_id,
        "status": "completed" if state.get("is_complete") else "continue",
        "question": question.get("question"),
        "question_id": question.get("id"),
        "options": question.get("options"),
        "category": question.get("category"),
        "confidence_score": state.get("confidence_score"),
        "progress": progress_val,
        "question_number": q_num,
        "total_questions": total_qs,
        "is_complete": bool(state.get("is_complete", False)),
        "recommendation_status": state.get("recommendation_status", "NOT_STARTED")
    }


@router.get("/{session_id}/result", response_model=AssessmentResultResponse)
async def get_result(session_id: str) -> AssessmentResultResponse:
    state = load_state(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Assessment session not found")

    if not state.get("is_complete", False):
        raise HTTPException(status_code=409, detail="Assessment result is not available yet")

    # If recommendation failed or is missing, try self-healing regeneration
    if state.get("recommendation_status") != "READY" or not state.get("recommendations"):
        state["recommendation_status"] = "GENERATING"
        save_state(session_id, state)
        
        try:
            validate_assessment_completion(state)
            careers = generate_recommendations(state)
            explanation = "Based on your assessment, we've personalized these recommendations for you."
            
            if not careers:
                raise ValueError("No career recommendations generated by AI")
                
            state["recommendations"] = careers
            state["explanation"] = explanation
            state["recommendation_status"] = "READY"
            save_state(session_id, state)
        except Exception as e:
            print(f"[Results Page Retry] Recommendation generation failed: {e}")
            state["recommendation_status"] = "FAILED"
            save_state(session_id, state)

    return AssessmentResultResponse(
        session_id=session_id,
        status="completed",
        recommendations=state.get("recommendations", []),
        confidence_score=state.get("confidence_score"),
        progress=100,
        explanation=state.get("explanation"),
        answers=state.get("answers", []),
        profile=_extract_profile(state),
    )


