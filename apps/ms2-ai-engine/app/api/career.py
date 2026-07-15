from fastapi import APIRouter

from app.schemas.career import CareerRequest
from app.services.career_service import generate_career_recommendation

router = APIRouter(
    prefix="/career",
    tags=["Career"]
)


@router.post("/recommend")
async def recommend_career(request: CareerRequest):

    response = await generate_career_recommendation(request)

    return response