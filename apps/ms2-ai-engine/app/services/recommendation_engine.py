"""Hybrid recommendation generation: Deterministic scoring + LLM reasoning."""

import json
from typing import Any
from app.utils.gemini import call_gemini
from app.services.scoring_engine import score_candidates

def generate_recommendations(state: dict[str, Any]) -> list[dict[str, Any]]:
    """Generate recommendations using deterministic scoring and LLM personalization."""

    # 1. Deterministic Scoring & Filtering
    candidates = score_candidates(state)
    
    if not candidates:
        return []

    # 2. LLM Reasoning Layer
    academic_stage = state.get("academic_stage", "Class 10")
    current_stream = state.get("current_stream", "None")
    
    profile_data = {
        "interests": state.get("extracted_interests", []),
        "strengths": state.get("inferred_strengths", []),
        "values": state.get("career_values", []),
        "work_style": state.get("work_preferences", []),
    }

    prompt = f"""
    You are an expert career counselor. 
    The student is in {academic_stage}.
    Current Stream: {current_stream}.
    
    Student Profile:
    {json.dumps(profile_data, indent=2)}
    
    Based on our deterministic algorithm, these are the eligible candidates and their match scores:
    {json.dumps(candidates, indent=2)}
    
    Task:
    Provide personalized reasoning for WHY these specific candidates are a good match based on the student's profile.
    DO NOT change the `match_score` or `career_name`. Just add `why_suitable` and `next_steps`.
    
    Output JSON exactly in this format (Array of Objects):
    [
      {{
        "career_name": "Name from candidates",
        "match_score": 90,
        "required_skills": ["Skill 1", "Skill 2"],
        "why_suitable": "Detailed 2-3 sentence personalized explanation of why this fits their specific interests and strengths.",
        "next_steps": "Actionable next step",
        "confidence": 0.90
      }}
    ]
    
    Only output valid JSON, no markdown formatting like ```json.
    """

    try:
        response_text = call_gemini(prompt)
        # Strip potential markdown formatting
        clean_text = response_text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        
        parsed_recommendations = json.loads(clean_text.strip())
        
        # Ensure it's a list
        if isinstance(parsed_recommendations, list) and len(parsed_recommendations) > 0:
            # Map back to our standard format and guarantee no missing keys
            final_recs = []
            for rec in parsed_recommendations:
                final_recs.append({
                    "career_name": rec.get("career_name", "Career Option"),
                    "match_score": rec.get("match_score", 70),
                    "required_skills": rec.get("required_skills", []),
                    "why_suitable": rec.get("why_suitable", "This option aligns well with your profile."),
                    "next_steps": rec.get("next_steps", "Explore this path further."),
                    "confidence": rec.get("confidence", 0.70)
                })
            return final_recs

    except Exception as e:
        print(f"LLM Recommendation failed: {e}. Falling back to deterministic.")

    # 3. Fallback (if Gemini fails or JSON is invalid)
    fallback_recs = []
    for c in candidates:
        fallback_recs.append({
            "career_name": c["career_name"],
            "match_score": c["match_score"],
            "required_skills": c.get("required_skills", []),
            "why_suitable": f"Based on our algorithm, {c['career_name']} is a strong match for your profile.",
            "next_steps": "Explore this path further and research detailed requirements.",
            "confidence": c["match_score"] / 100.0
        })

    return fallback_recs
