"""Deterministic recommendation generation for adaptive assessment."""

from typing import Any


def generate_recommendations(state: dict[str, Any]) -> list[dict[str, Any]]:
    """Generate simple recommendations from extracted assessment evidence."""

    interests = [i.lower() for i in (state.get("extracted_interests") or [])]
    answers = [a.get("answer", "").lower() for a in (state.get("answers") or [])]
    all_evidence = set(interests + answers)

    recommendations = []

    # Technology & Engineering
    if any(term in all_evidence for term in ["computers & technology", "science & technology", "engineering & technology", "building apps or websites", "artificial intelligence", "coding", "programming"]):
        recommendations.append({
            "career_name": "Software Engineer / AI Developer",
            "why_suitable": "Your interest in technology and building things suggests a strong fit for software and AI development.",
            "match_level": "High Match",
            "match_score": 92,
            "strengths": ["Logical Reasoning", "Problem Solving", "Technology Interest"],
            "next_steps": "Learn a programming language like Python and explore basic AI concepts.",
            "confidence": 0.92
        })

    # Healthcare & Biology
    if any(term in all_evidence for term in ["biology & healthcare", "medicine (mbbs/bds)", "treating patients", "healthcare technology", "biotechnology"]):
        recommendations.append({
            "career_name": "Medical Professional / Biotechnologist",
            "why_suitable": "Your passion for biology and healthcare indicates you'd excel in medical or research fields.",
            "match_level": "Strong Match",
            "match_score": 88,
            "strengths": ["Scientific Curiosity", "Empathy", "Analytical Thinking"],
            "next_steps": "Focus on biology and chemistry, and explore different medical specializations.",
            "confidence": 0.88
        })

    # Business & Management
    if any(term in all_evidence for term in ["business & money", "entrepreneurship", "finance", "management", "marketing", "business strategy"]):
        recommendations.append({
            "career_name": "Business Strategist / Entrepreneur",
            "why_suitable": "Your interest in business, finance, and leadership shows potential for management and startup roles.",
            "match_level": "Strong Match",
            "match_score": 85,
            "strengths": ["Leadership", "Strategic Thinking", "Communication"],
            "next_steps": "Start learning about market trends and basic financial management.",
            "confidence": 0.85
        })

    # Creative & Design
    if any(term in all_evidence for term in ["creative work & design", "graphic design or ui/ux", "filmmaking", "animation", "architecture", "design"]):
        recommendations.append({
            "career_name": "Creative Director / Designer",
            "why_suitable": "Your creative flair and interest in design point towards a career in visual arts or architecture.",
            "match_level": "High Match",
            "match_score": 90,
            "strengths": ["Creativity", "Visual Thinking", "Aesthetic Sense"],
            "next_steps": "Build a portfolio of your creative work and explore design tools.",
            "confidence": 0.90
        })

    # Law & Public Service
    if any(term in all_evidence for term in ["law & legal studies", "civil services (upsc)", "helping people", "arts / humanities"]):
        recommendations.append({
            "career_name": "Legal Professional / Public Servant",
            "why_suitable": "Your inclination towards helping people and social sciences suggests a career in law or public administration.",
            "match_level": "Strong Match",
            "match_score": 82,
            "strengths": ["Critical Thinking", "Social Awareness", "Ethics"],
            "next_steps": "Read about current affairs and participate in debates or social work.",
            "confidence": 0.82
        })

    # Sports
    if any(term in all_evidence for term in ["sports & fitness", "professional athlete", "sports management"]):
        recommendations.append({
            "career_name": "Sports Professional / Manager",
            "why_suitable": "Your dedication to sports and fitness can be channeled into professional playing or sports management.",
            "match_level": "Strong Match",
            "match_score": 80,
            "strengths": ["Discipline", "Teamwork", "Physical Fitness"],
            "next_steps": "Pursue advanced training in your sport and explore sports administration courses.",
            "confidence": 0.80
        })

    # Fallback if no specific match
    if not recommendations:
        recommendations.append({
            "career_name": "Career Explorer",
            "why_suitable": "Your profile shows a broad range of interests. We recommend exploring multiple fields to find your true passion.",
            "match_level": "Broad Match",
            "match_score": 75,
            "strengths": ["Curiosity", "Versatility", "Open-mindedness"],
            "next_steps": "Take short introductory courses in different domains like coding, design, or business.",
            "confidence": 0.75
        })

    # Return top 3
    return recommendations[:3]
