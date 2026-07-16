from fastapi import APIRouter

from app.schemas.career import (
    CareerRequest,
    AssessmentPayload,
)

from app.schemas.assessment import (
    AdaptiveStartRequest,
    AdaptiveNextRequest,
)

from app.services.career_service import (
    generate_career_recommendation,
    generate_assessment_recommendation,
    start_adaptive_assessment,
    process_adaptive_next,
)

router = APIRouter(
    prefix="/career",
    tags=["Career"]
)


# ---------- Original Endpoint ----------


@router.post("/recommend")

async def recommend_career(request: dict):
#remove
    print("========== RECOMMEND ENDPOINT HIT ==========")
    
    """
    Unified recommendation endpoint.

    Accepts either:
    - Old format: {education, interests, skills, goal}
    - New format: {userId, assessmentType, answers: [...]}

    Routes to the appropriate service based on payload shape.
    """

    # Detect payload format
    if "answers" in request:

        payload = AssessmentPayload(**request)

        response = await generate_assessment_recommendation(
            payload
        )

        return response

    else:

        payload = CareerRequest(**request)

        response = await generate_career_recommendation(
            payload
        )

        return response


# ---------- Adaptive Assessment Endpoints ----------


@router.post("/assessment/start")
async def start_assessment(
    request: AdaptiveStartRequest
):
    """
    Start an adaptive assessment.
    Returns the first 5 broad questions + state.
    """

    response = await start_adaptive_assessment(
        user_id=request.userId,
        assessment_type=request.assessmentType
    )

    return response


@router.post("/assessment/next")
async def next_questions(
    request: AdaptiveNextRequest
):
    """
    Process answers and return next questions
    or final recommendations.
    """

    answers = [
        a.model_dump() for a in request.answers
    ]

    response = await process_adaptive_next(
        user_id=request.userId,
        answers=answers,
        client_state=request.state
    )

    return response