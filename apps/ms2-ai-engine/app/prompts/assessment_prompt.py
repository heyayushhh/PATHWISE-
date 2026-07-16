"""
Prompt templates for the adaptive assessment LangGraph nodes.

Each function returns a structured prompt that enforces
JSON-only output from Gemini.
"""


def build_initial_questions_prompt() -> str:
    """
    Prompt to generate the first 5 broad career-interest questions.
    """

    return """You are PathWise AI, an expert career assessment designer.

Generate exactly 5 broad career interest assessment questions.

These questions should cover diverse domains:
- Analytical & Logical thinking
- Creative & Design skills
- Social & Leadership abilities
- Technical & Engineering interests
- Business & Entrepreneurship

Each question must be answerable on a 5-point Likert scale:
Strongly Disagree, Disagree, Neutral, Agree, Strongly Agree

Return ONLY valid JSON in this exact format:

{
    "questions": [
        {
            "id": "q_1",
            "questionText": "I enjoy solving complex logical puzzles and analytical problems.",
            "options": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
            "domain": "Analytical"
        }
    ]
}

Rules:
- Generate exactly 5 questions
- Each question must explore a different domain
- Questions should be engaging and clear
- Use q_1 through q_5 as IDs
- Do not return markdown
- Do not explain anything outside JSON
"""


def build_decision_prompt(
    previous_answers: list[dict],
    domains_explored: list[str],
    question_count: int,
    max_questions: int
) -> str:
    """
    Prompt for the decision node to analyze answers and compute confidence.
    """

    answers_text = "\n".join(
        f"- Q: {a['questionText']} | A: {a['selectedOption']} "
        f"(score: {a['score']}) | Domain: {a.get('domain', 'unknown')}"
        for a in previous_answers
    )

    domains_text = ", ".join(
        domains_explored
    ) if domains_explored else "None yet"

    return f"""You are PathWise AI, an expert assessment analyst.

Analyze the user's answers so far and determine:
1. How confident are we about their career profile?
2. What domains still need exploration?
3. Are there any conflicting responses?

Answers so far ({question_count} of {max_questions} max):
{answers_text}

Domains already explored: {domains_text}

Return ONLY valid JSON in this exact format:

{{
    "confidenceScore": 0.65,
    "domainsExplored": ["Analytical", "Creative"],
    "unansweredTopics": ["Leadership", "Communication", "Entrepreneurship"],
    "conflictingResponses": [],
    "analysis": "Brief summary of what we know so far",
    "needMoreQuestions": true
}}

Rules:
- confidenceScore must be between 0.0 and 1.0
- If {question_count} >= {max_questions}, set needMoreQuestions to false
- If confidenceScore >= 0.85, set needMoreQuestions to false
- Be honest about confidence — don't inflate it
- Identify genuine gaps in understanding
- Do not return markdown
- Do not explain anything outside JSON
"""


def build_dynamic_questions_prompt(
    previous_answers: list[dict],
    unanswered_topics: list[str],
    conflicting_responses: list[str],
    domains_explored: list[str],
    asked_questions: list[str]
) -> str:
    """
    Prompt to generate the next batch of targeted questions.
    """

    answers_text = "\n".join(
        f"- {a['questionText']} → {a['selectedOption']} ({a['score']})"
        for a in previous_answers
    )

    unanswered_text = ", ".join(
        unanswered_topics
    ) if unanswered_topics else "None identified"

    conflicts_text = ", ".join(
        conflicting_responses
    ) if conflicting_responses else "None"

    asked_text = "\n".join(
        f"- {q}" for q in asked_questions
    ) if asked_questions else "None"

    return f"""You are PathWise AI, an expert adaptive assessment designer.

Generate the next batch of targeted questions based on the user's
previous answers and identified gaps.

Previous Answers:
{answers_text}

Unexplored Topics: {unanswered_text}
Conflicting Areas: {conflicts_text}
Already Explored Domains: {", ".join(domains_explored)}

ALREADY ASKED QUESTIONS (DO NOT REPEAT):
{asked_text}

Return ONLY valid JSON in this exact format:

{{
    "questions": [
        {{
            "id": "q_6",
            "questionText": "A targeted question based on gaps.",
            "options": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
            "domain": "Leadership"
        }}
    ]
}}

Rules:
- Generate 3 to 5 questions
- Focus on unexplored topics and areas of uncertainty
- If there are conflicting responses, ask clarifying questions
- NEVER repeat or rephrase already-asked questions
- Each question must target a specific gap
- Continue ID numbering from where we left off
- Do not return markdown
- Do not explain anything outside JSON
"""


def build_assessment_recommendation_prompt(
    all_answers: list[dict],
    domains_explored: list[str]
) -> str:
    """
    Prompt to generate final career recommendations from
    adaptive assessment results.
    """

    answers_text = "\n".join(
        f"- Q: {a['questionText']} | A: {a['selectedOption']} "
        f"(score: {a['score']}) | Domain: {a.get('domain', 'unknown')}"
        for a in all_answers
    )

    return f"""You are PathWise AI, an expert career advisor.

Based on the complete adaptive assessment, generate the top 5
career recommendations.

Complete Assessment Results:
{answers_text}

Domains Explored: {", ".join(domains_explored)}

Return ONLY valid JSON in this exact format:

{{
    "careers": [
        {{
            "title": "Career Title",
            "matchScore": 92.5,
            "whyRecommended": "Detailed explanation based on assessment answers",
            "requiredSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
            "futureDemand": "High - Growing field with projected growth",
            "salaryRange": "$80,000 - $150,000 per year",
            "learningRoadmapId": null
        }}
    ],
    "explanation": "A 3-5 sentence summary of how these recommendations were derived"
}}

Rules:
- Return exactly 5 careers
- Reference specific assessment answers in whyRecommended
- matchScore between 0 and 100
- requiredSkills: 4 to 6 per career
- Order by matchScore descending
- learningRoadmapId should be null
- Do not return markdown
- Do not explain anything outside JSON
"""
