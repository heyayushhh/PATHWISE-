from app.schemas.career import CareerRequest
from app.agents.career_agent import generate_career_response


async def generate_career_recommendation(request: CareerRequest):

    response = await generate_career_response(request)

    return response