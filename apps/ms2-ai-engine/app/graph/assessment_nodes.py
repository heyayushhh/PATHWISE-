"""
LangGraph nodes for the adaptive assessment workflow.

The adaptive assessment is multi-turn:
  1. start_node → question_generator_node → (return to client)
  2. (receive answers) → decision_node → dynamic_question_selector_node → (return)
  3. ...repeat until confident...
  4. (receive answers) → decision_node → recommendation_node → end_node
"""

import json

from app.graph.assessment_state import AdaptiveAssessmentState
from app.utils.gemini import call_gemini

from app.prompts.assessment_prompt import (
    build_initial_questions_prompt,
    build_decision_prompt,
    build_dynamic_questions_prompt,
    build_assessment_recommendation_prompt,
)


def _safe_parse_json(text: str) -> dict:
    """Strip markdown fences and parse JSON safely."""

    cleaned = text.strip()

    if cleaned.startswith("```json"):
        cleaned = cleaned.replace(
            "```json", ""
        ).replace("```", "").strip()

    elif cleaned.startswith("```"):
        cleaned = cleaned.replace(
            "```", ""
        ).strip()

    return json.loads(cleaned)


# ---------- Node 1: Start Node ----------


def start_node(state: AdaptiveAssessmentState):
    """
    Initializes the adaptive assessment state
    with default values.
    """

    print("\n========== START NODE ==========")

    state["confidence_score"] = 0.0
    state["domains_explored"] = []
    state["unanswered_topics"] = []
    state["previous_answers"] = []
    state["all_generated_questions"] = []
    state["current_questions"] = []
    state["iteration_count"] = 0
    state["max_questions"] = 20
    state["confidence_threshold"] = 0.85
    state["is_complete"] = False
    state["recommended_careers"] = []
    state["explanation"] = ""

    print("  State initialized")

    return state


# ---------- Node 2: Question Generator Node ----------


def question_generator_node(state: AdaptiveAssessmentState):
    """
    Generates the initial 5 broad career-interest questions
    using Gemini.
    """

    print("\n========== QUESTION GENERATOR NODE ==========")

    prompt = build_initial_questions_prompt()

    raw = call_gemini(prompt)

    try:
        parsed = _safe_parse_json(raw)
        questions = parsed.get("questions", [])

        state["current_questions"] = questions
        state["all_generated_questions"] = questions
        state["iteration_count"] = 1

        # Track domains
        domains = [
            q.get("domain", "General")
            for q in questions
        ]
        state["domains_explored"] = list(
            set(domains)
        )

    except Exception as e:
        print(f"  Parse error: {e}")
        # Fallback to hardcoded broad questions
        state["current_questions"] = _fallback_questions()
        state["all_generated_questions"] = (
            state["current_questions"]
        )
        state["iteration_count"] = 1

    print(
        f"  Generated {len(state['current_questions'])} questions"
    )

    return state


# ---------- Node 3: Decision Node ----------


def decision_node(state: AdaptiveAssessmentState):
    """
    Analyzes answers, computes confidence, and decides
    whether to continue or terminate.
    """

    print("\n========== DECISION NODE ==========")

    question_count = len(state["previous_answers"])

    # Hard stop at max questions
    if question_count >= state["max_questions"]:
        print("  Max questions reached — completing")
        state["is_complete"] = True
        return state

    prompt = build_decision_prompt(
        state["previous_answers"],
        state["domains_explored"],
        question_count,
        state["max_questions"]
    )

    raw = call_gemini(prompt)

    try:
        parsed = _safe_parse_json(raw)

        state["confidence_score"] = float(
            parsed.get("confidenceScore", 0.0)
        )

        state["domains_explored"] = parsed.get(
            "domainsExplored",
            state["domains_explored"]
        )

        state["unanswered_topics"] = parsed.get(
            "unansweredTopics", []
        )

        need_more = parsed.get(
            "needMoreQuestions", True
        )

        # Check confidence threshold
        if state["confidence_score"] >= state["confidence_threshold"]:
            print(
                f"  Confidence {state['confidence_score']} >= "
                f"{state['confidence_threshold']} — completing"
            )
            state["is_complete"] = True
        elif not need_more:
            print("  AI decided no more questions needed")
            state["is_complete"] = True
        else:
            print(
                f"  Confidence {state['confidence_score']} — "
                f"need more questions"
            )
            state["is_complete"] = False

    except Exception as e:
        print(f"  Parse error: {e}")
        # If we have enough answers, complete
        if question_count >= 10:
            state["is_complete"] = True
        else:
            state["is_complete"] = False

    return state


# ---------- Node 4: Dynamic Question Selector ----------


def dynamic_question_selector_node(
    state: AdaptiveAssessmentState
):
    """
    Selects next best questions based on previous answers,
    uncertainty, unexplored interests, and conflicts.
    """

    print("\n========== DYNAMIC QUESTION SELECTOR NODE ==========")

    # Collect all previously asked question texts
    asked_questions = [
        q.get("questionText", "")
        for q in state["all_generated_questions"]
    ]

    prompt = build_dynamic_questions_prompt(
        state["previous_answers"],
        state["unanswered_topics"],
        [],  # conflicting responses from decision node
        state["domains_explored"],
        asked_questions
    )

    raw = call_gemini(prompt)

    try:
        parsed = _safe_parse_json(raw)
        new_questions = parsed.get("questions", [])

        # De-duplicate against already asked
        existing_texts = set(
            q.get("questionText", "").lower()
            for q in state["all_generated_questions"]
        )

        filtered = [
            q for q in new_questions
            if q.get("questionText", "").lower()
            not in existing_texts
        ]

        state["current_questions"] = (
            filtered if filtered else new_questions
        )

        state["all_generated_questions"].extend(
            state["current_questions"]
        )

        state["iteration_count"] += 1

        # Update explored domains
        new_domains = [
            q.get("domain", "General")
            for q in state["current_questions"]
        ]
        state["domains_explored"] = list(
            set(state["domains_explored"] + new_domains)
        )

    except Exception as e:
        print(f"  Parse error: {e}")
        state["current_questions"] = []

    print(
        f"  Selected {len(state['current_questions'])} new questions"
    )

    return state


# ---------- Node 5: Recommendation Node ----------


def recommendation_node(state: AdaptiveAssessmentState):
    """
    When confident enough, generates career recommendations
    from all collected answers.
    """

    print("\n========== RECOMMENDATION NODE ==========")

    prompt = build_assessment_recommendation_prompt(
        state["previous_answers"],
        state["domains_explored"]
    )

    raw = call_gemini(prompt)

    try:
        parsed = _safe_parse_json(raw)

        state["recommended_careers"] = parsed.get(
            "careers", []
        )

        state["explanation"] = parsed.get(
            "explanation", ""
        )

    except Exception as e:
        print(f"  Parse error: {e}")
        state["recommended_careers"] = []
        state["explanation"] = (
            "We were unable to generate recommendations. "
            "Please try again."
        )

    print(
        f"  Generated {len(state['recommended_careers'])} "
        f"career recommendations"
    )

    return state


# ---------- Node 6: End Node ----------


def end_node(state: AdaptiveAssessmentState):
    """
    Final cleanup node.
    """

    print("\n========== END NODE ==========")

    state["is_complete"] = True

    print("  Assessment complete")

    return state


# ---------- Fallback Questions ----------


def _fallback_questions() -> list[dict]:
    """
    Hardcoded fallback if Gemini fails to generate
    initial questions.
    """

    return [
        {
            "id": "q_1",
            "questionText": (
                "I enjoy solving complex logical "
                "and analytical problems."
            ),
            "options": [
                "Strongly Disagree",
                "Disagree",
                "Neutral",
                "Agree",
                "Strongly Agree"
            ],
            "domain": "Analytical"
        },
        {
            "id": "q_2",
            "questionText": (
                "I like creating visual designs "
                "and artistic content."
            ),
            "options": [
                "Strongly Disagree",
                "Disagree",
                "Neutral",
                "Agree",
                "Strongly Agree"
            ],
            "domain": "Creative"
        },
        {
            "id": "q_3",
            "questionText": (
                "I enjoy leading teams and "
                "organizing group activities."
            ),
            "options": [
                "Strongly Disagree",
                "Disagree",
                "Neutral",
                "Agree",
                "Strongly Agree"
            ],
            "domain": "Leadership"
        },
        {
            "id": "q_4",
            "questionText": (
                "I am fascinated by how machines "
                "and technology work."
            ),
            "options": [
                "Strongly Disagree",
                "Disagree",
                "Neutral",
                "Agree",
                "Strongly Agree"
            ],
            "domain": "Technical"
        },
        {
            "id": "q_5",
            "questionText": (
                "I enjoy planning business strategies "
                "and making financial decisions."
            ),
            "options": [
                "Strongly Disagree",
                "Disagree",
                "Neutral",
                "Agree",
                "Strongly Agree"
            ],
            "domain": "Business"
        }
    ]
