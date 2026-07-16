from app.schemas.career import CareerRequest
from app.graph.graph import career_graph


async def generate_career_response(request: CareerRequest):

    state = {
        "education": request.education,
        "interests": request.interests,
        "skills": request.skills,
        "goal": request.goal,

        # These will be filled by the graph
        "prompt": "",
        "raw_response": "",
        "result": {}
    }

    final_state = career_graph.invoke(state)

    return final_state["result"]