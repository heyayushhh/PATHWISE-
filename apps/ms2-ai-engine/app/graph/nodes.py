import json
from app.graph.state import CareerState
from app.schemas.career import CareerRequest
from app.prompts.career_prompt import build_career_prompt
from app.utils.gemini import get_gemini_model


def build_prompt_node(state: CareerState):

    print("\n========== PROMPT NODE ==========")

    request = CareerRequest(
        education=state["education"],
        interests=state["interests"],
        skills=state["skills"],
        goal=state["goal"]
    )

    state["prompt"] = build_career_prompt(request)

    print(state["prompt"])

    return state


def _build_fallback_response(state: CareerState) -> str:
    goal = state.get("goal") or "career growth"
    interests = ", ".join(state.get("interests", [])) or "your interests"
    skills = ", ".join(state.get("skills", [])) or "your current strengths"

    return json.dumps(
        {
            "recommendations": [
                {
                    "career": "AI Product Analyst",
                    "reason": f"Suggested as a safe placeholder while Gemini is not configured. It aligns with {interests} and supports {goal}.",
                    "required_skills": ["Problem solving", "Communication", "Data literacy"],
                },
                {
                    "career": "Technology Consultant",
                    "reason": f"Suggested from the current profile context around {skills}.",
                    "required_skills": ["Research", "Presentation", "Domain understanding"],
                },
            ],
            "meta": {
                "mode": "fallback",
                "message": "Gemini SDK or API key is not configured yet, so a deterministic placeholder response was returned.",
            },
        }
    )


def gemini_node(state: CareerState):

    print("\n========== GEMINI NODE ==========")

    model = get_gemini_model()
    if model is None:
        state["raw_response"] = _build_fallback_response(state)
        print(state["raw_response"])
        return state
    response = model.generate_content(state["prompt"])

    state["raw_response"] = response.text

    print(state["raw_response"])

    return state


# ---------- Parser Node ----------

def parser_node(state: CareerState):

    print("\n========== PARSER NODE ==========")

    text = state["raw_response"].strip()

    if text.startswith("```json"):

        text = text.replace("```json", "").replace("```", "").strip()

    elif text.startswith("```"):

        text = text.replace("```", "").strip()

    try:

        state["result"] = json.loads(text)

    except Exception:

        state["result"] = {

            "recommendations": [

                {

                    "career": "Unable to Parse",

                    "reason": text,

                    "required_skills": []

                }

            ]

        }

    return state
