"""
Prompt templates for the career recommendation LangGraph nodes.

Each function returns a structured prompt that enforces
JSON-only output from Gemini.
"""


def build_extract_interests_prompt(answers: list[dict]) -> str:
    """
    Prompt to extract top interests from assessment answers.
    """

    answers_text = "\n".join(
        f"- Q: {a['question']} | A: {a['selectedOption']} (score: {a['score']})"
        for a in answers
    )

    return f"""You are PathWise AI, an expert career counsellor.

Analyze the following assessment answers and extract the user's
top interests and areas of passion.

Assessment Answers:
{answers_text}

Return ONLY valid JSON in this exact format:

{{
    "interests": [
        "Interest 1",
        "Interest 2",
        "Interest 3"
    ]
}}

Rules:
- Extract 3 to 8 interests
- Base interests on high-scoring answers (4-5)
- Be specific (e.g. "Backend Development" not just "Technology")
- Do not return markdown
- Do not explain anything outside JSON
"""


def build_infer_traits_prompt(
    answers: list[dict],
    interests: list[str]
) -> str:
    """
    Prompt to infer personality traits and strengths.
    """

    answers_text = "\n".join(
        f"- Q: {a['question']} | A: {a['selectedOption']} (score: {a['score']})"
        for a in answers
    )

    interests_text = ", ".join(interests)

    return f"""You are PathWise AI, an expert career psychologist.

Based on the assessment answers and identified interests,
infer the user's personality traits and key strengths.

Assessment Answers:
{answers_text}

Identified Interests:
{interests_text}

Return ONLY valid JSON in this exact format:

{{
    "personalityTraits": [
        {{
            "trait": "Analytical Thinking",
            "score": "high"
        }}
    ],
    "strengths": [
        "Problem Solving",
        "Leadership"
    ]
}}

Rules:
- Include 3 to 6 personality traits with score (high/medium/low)
- Include 3 to 6 strengths
- Map to practical career-relevant traits
- Do not return markdown
- Do not explain anything outside JSON
"""


def build_match_careers_prompt(
    interests: list[str],
    traits: list[dict],
    strengths: list[str]
) -> str:
    """
    Prompt to match careers based on profile analysis.
    """

    interests_text = ", ".join(interests)

    traits_text = "\n".join(
        f"- {t['trait']}: {t['score']}"
        for t in traits
    )

    strengths_text = ", ".join(strengths)

    return f"""You are PathWise AI, an expert career matcher.

Based on the user's profile, identify the top 5 best-fit careers.

User Profile:

Interests: {interests_text}

Personality Traits:
{traits_text}

Strengths: {strengths_text}

Return ONLY valid JSON in this exact format:

{{
    "careers": [
        {{
            "title": "Career Title",
            "matchScore": 92.5,
            "relevantInterests": ["Interest 1"],
            "relevantTraits": ["Trait 1"],
            "relevantStrengths": ["Strength 1"]
        }}
    ]
}}

Rules:
- Return exactly 5 careers
- matchScore must be between 0 and 100
- Order by matchScore descending
- Be specific with career titles
- Do not return markdown
- Do not explain anything outside JSON
"""


def build_generate_recommendations_prompt(
    matched_careers: list[dict],
    interests: list[str],
    traits: list[dict],
    strengths: list[str]
) -> str:
    """
    Prompt to generate the final detailed recommendations.
    """

    careers_text = "\n".join(
        f"- {c['title']} (score: {c['matchScore']})"
        for c in matched_careers
    )

    interests_text = ", ".join(interests)
    strengths_text = ", ".join(strengths)

    return f"""You are PathWise AI, an expert career advisor.

Generate detailed career recommendations for the user.

Matched Careers:
{careers_text}

User Interests: {interests_text}
User Strengths: {strengths_text}

Return ONLY valid JSON in this exact format:

{{
    "careers": [
        {{
            "title": "Career Title",
            "matchScore": 92.5,
            "whyRecommended": "Detailed explanation of why this career suits the user",
            "requiredSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
            "futureDemand": "High - Growing field with 25% projected growth",
            "salaryRange": "$80,000 - $150,000 per year",
            "learningRoadmapId": null
        }}
    ]
}}

Rules:
- Return exactly 5 careers
- whyRecommended should be 2-3 sentences minimum
- requiredSkills should list 4 to 6 skills
- futureDemand should mention growth trends
- salaryRange should reflect realistic market data
- learningRoadmapId should be null (populated later)
- Order by matchScore descending
- Do not return markdown
- Do not explain anything outside JSON
"""


def build_explanation_prompt(
    recommendations: list[dict],
    interests: list[str],
    strengths: list[str]
) -> str:
    """
    Prompt to generate a human-readable explanation.
    """

    careers_text = "\n".join(
        f"- {r['title']} ({r['matchScore']}% match)"
        for r in recommendations
    )

    return f"""You are PathWise AI.

Write a brief, encouraging summary explaining how these career
recommendations were derived for the user.

Recommended Careers:
{careers_text}

User Interests: {", ".join(interests)}
User Strengths: {", ".join(strengths)}

Return ONLY valid JSON:

{{
    "explanation": "Your personalized career analysis shows..."
}}

Rules:
- Keep it to 3-5 sentences
- Be encouraging and professional
- Reference specific interests and strengths
- Do not return markdown
- Do not explain anything outside JSON
"""
