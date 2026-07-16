import json

import google.generativeai as genai

import os
import json
from app.graph.state import CareerState
from app.schemas.career import CareerRequest
from app.prompts.career_prompt import build_career_prompt


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


# ---------- Gemini Node ----------
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("models/gemini-2.5-flash")


def gemini_node(state: CareerState):

    print("\n========== GEMINI NODE ==========")

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