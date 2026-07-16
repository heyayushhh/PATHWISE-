"""Deterministic recommendation generation for adaptive assessment."""

from typing import Any


def generate_recommendations(state: dict[str, Any]) -> list[dict[str, Any]]:
    """Generate simple recommendations from extracted assessment evidence."""

    interests = state.get("extracted_interests") or []
    strengths = state.get("inferred_strengths") or []
    traits = state.get("inferred_traits") or []

    recommendations = []

    if any(keyword in interests for keyword in ["coding", "programming", "software", "math", "problem"]):
        recommendations.append(
            {
                "career_name": "Software Engineer",
                "why_suitable": "Your interests and strengths suggest strong analytical and technical ability.",
                "required_skills": ["Programming", "Problem Solving", "Algorithms"],
                "skill_gap": ["System Design"],
                "confidence": 0.82,
            }
        )

    if any(keyword in interests for keyword in ["design", "creative", "ui", "ux"]):
        recommendations.append(
            {
                "career_name": "Product Designer",
                "why_suitable": "Your profile points to creativity and user-focused thinking.",
                "required_skills": ["Design Thinking", "Prototyping"],
                "skill_gap": ["Accessibility"],
                "confidence": 0.74,
            }
        )

    if not recommendations:
        recommendations.append(
            {
                "career_name": "General Analyst",
                "why_suitable": "Your profile shows curiosity and a willingness to learn.",
                "required_skills": ["Communication", "Research"],
                "skill_gap": ["Domain Expertise"],
                "confidence": 0.66,
            }
        )

    return recommendations
