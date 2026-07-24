"""Deterministic filtering and scoring engine for career recommendations."""

import re
from typing import Any, Dict, List
from app.services.career_retrieval import CareerKnowledgeRepository, LexicalCareerRetriever, CareerReranker

def score_candidates(state: dict[str, Any]) -> list[dict[str, Any]]:
    """Generate and score eligible candidate careers or streams based on profile."""
    academic_stage = state.get("academic_stage", "Class 10")
    current_stream = state.get("current_stream", "")
    
    extracted_interests = [i.lower() for i in state.get("extracted_interests", [])]
    inferred_strengths = [s.lower() for s in state.get("inferred_strengths", [])]
    career_values = [v.lower() for v in state.get("career_values", [])]
    work_preferences = [w.lower() for w in state.get("work_preferences", [])]
    
    all_evidence = set(extracted_interests + inferred_strengths + career_values + work_preferences)

    candidates = []

    if academic_stage == "Class 10":
        # Recommend Streams for Class 10
        if any(kw in all_evidence for kw in ["computers & technology", "science & technology", "engineering & technology", "coding", "programming", "mathematics"]):
            candidates.append({
                "career_name": "Science — PCM",
                "match_score": 90 if "mathematics" in all_evidence else 80,
                "required_skills": ["Analytical Thinking", "Mathematics", "Problem Solving"]
            })
        
        if any(kw in all_evidence for kw in ["biology & healthcare", "medicine", "treating patients", "healthcare", "biology"]):
            candidates.append({
                "career_name": "Science — PCB",
                "match_score": 90 if "biology" in all_evidence else 80,
                "required_skills": ["Scientific Curiosity", "Memory", "Empathy"]
            })

        if any(kw in all_evidence for kw in ["business & money", "entrepreneurship", "finance", "management", "marketing"]):
            candidates.append({
                "career_name": "Commerce",
                "match_score": 85,
                "required_skills": ["Leadership", "Business Acumen", "Communication"]
            })

        if any(kw in all_evidence for kw in ["arts & humanities", "helping people", "creative work & design", "writing"]):
            candidates.append({
                "career_name": "Arts / Humanities",
                "match_score": 85,
                "required_skills": ["Creativity", "Critical Thinking", "Social Awareness"]
            })
            
        if not candidates:
             candidates.append({
                "career_name": "General Science / Exploration",
                "match_score": 70,
                "required_skills": ["Curiosity", "Versatility"]
            })

    else:
        # Class 12: Recommend Degrees / Jobs based on STREAM constraints
        if current_stream == "PCM" or current_stream == "PCMB":
            if any(kw in all_evidence for kw in ["coding", "programming", "software", "ai", "data"]):
                candidates.append({"career_name": "B.Tech Computer Science / AI Engineer", "match_score": 95, "required_skills": ["Coding", "Logic"]})
            candidates.append({"career_name": "B.Tech Mechanical / Robotics", "match_score": 85, "required_skills": ["Physics", "Design"]})
            candidates.append({"career_name": "B.Sc Data Science / Analyst", "match_score": 80, "required_skills": ["Mathematics", "Statistics"]})
            candidates.append({"career_name": "B.Arch / Architecture", "match_score": 75, "required_skills": ["Creativity", "Spatial Thinking"]})

        if current_stream == "PCB" or current_stream == "PCMB":
            if any(kw in all_evidence for kw in ["medicine", "treating patients", "healthcare"]):
                candidates.append({"career_name": "MBBS / Doctor", "match_score": 95, "required_skills": ["Biology", "Empathy", "Resilience"]})
            candidates.append({"career_name": "B.Sc Biotechnology", "match_score": 85, "required_skills": ["Research", "Biology"]})
            candidates.append({"career_name": "B.Sc Psychology", "match_score": 80, "required_skills": ["Empathy", "Observation"]})

        if current_stream == "Commerce":
            candidates.append({"career_name": "B.Com / Chartered Accountant", "match_score": 90, "required_skills": ["Accounting", "Attention to Detail"]})
            candidates.append({"career_name": "BBA / Management", "match_score": 85, "required_skills": ["Leadership", "Communication"]})
            candidates.append({"career_name": "B.A. Economics", "match_score": 80, "required_skills": ["Analysis", "Economics"]})
            
        if current_stream == "Humanities" or current_stream == "Arts":
            candidates.append({"career_name": "B.A. Psychology", "match_score": 90, "required_skills": ["Empathy", "Communication"]})
            candidates.append({"career_name": "B.A. Political Science / Law", "match_score": 85, "required_skills": ["Critical Thinking", "Debate"]})
            candidates.append({"career_name": "B.A. Journalism / Media", "match_score": 80, "required_skills": ["Writing", "Creativity"]})

        if not candidates:
            candidates.append({"career_name": "Career Explorer / General Degree", "match_score": 70, "required_skills": ["Versatility"]})

    candidates.sort(key=lambda x: x["match_score"], reverse=True)
    return candidates[:4]


def _score_legacy_candidate(profile: dict, candidate: dict, answers_map: dict) -> dict:
    """Legacy scoring logic preserved for ACADEMIC_DIRECTION and COURSE recommendations."""
    slug = candidate.get("slug", "") or ""
    title = candidate.get("title", "") or ""
    family = (candidate.get("careerFamily") or "").lower()
    is_academic = candidate.get("type") == "ACADEMIC_DIRECTION"
    
    extracted_interests = [i.lower() for i in profile.get("extracted_interests", [])]
    inferred_strengths = [s.lower() for s in profile.get("inferred_strengths", [])]
    career_values_list = [v.lower() for v in profile.get("career_values", [])]
    work_preferences = [w.lower() for w in profile.get("work_preferences", [])]

    def any_interest_match(keywords: list[str], fallback_str: str) -> bool:
        if any(any(kw in i for kw in keywords) for i in extracted_interests):
            return True
        return any(kw in fallback_str for kw in keywords)

    def any_subject_match(keywords: list[str], fallback_str: str) -> bool:
        if any(any(kw in s for kw in keywords) for s in extracted_interests):
            return True
        return any(kw in fallback_str for kw in keywords)

    def any_strength_match(keywords: list[str], fallback_str: str) -> bool:
        if any(any(kw in s for kw in keywords) for s in inferred_strengths):
            return True
        return any(kw in fallback_str for kw in keywords)

    def any_style_match(keywords: list[str], fallback_str: str) -> bool:
        if any(any(kw in w for kw in keywords) for w in work_preferences):
            return True
        return any(kw in fallback_str for kw in keywords)

    def any_value_match(keywords: list[str], fallback_str: str) -> bool:
        if any(any(kw in v for kw in keywords) for v in career_values_list):
            return True
        return any(kw in fallback_str for kw in keywords)

    # 1. Primary Interest/Branch Alignment (Weight: 40%)
    primary_score = 10
    start_ans = answers_map.get("start", "").lower()
    science_tech_ans = answers_map.get("science_tech", "").lower()
    
    is_pcmb = ("pcmb" in slug.lower()) or ("pcmb" in title.lower())
    is_pcm = ("pcm" in slug.lower() or "pcm" in title.lower()) and not is_pcmb
    is_pcb = ("pcb" in slug.lower() or "pcb" in title.lower()) and not is_pcmb
    
    if is_academic:
        if is_pcm:
            if any_interest_match(["science"], start_ans):
                if any_interest_match(["math", "computer", "engineering", "coding", "technology", "research"], science_tech_ans):
                    primary_score = 40
                elif any_interest_match(["biology"], science_tech_ans):
                    primary_score = 20
                else:
                    primary_score = 30
            elif any_interest_match(["exploring"], start_ans):
                primary_score = 20
        elif is_pcb:
            if any_interest_match(["science"], start_ans):
                if any_interest_match(["biology", "healthcare", "medicine"], science_tech_ans):
                    primary_score = 40
                elif any_interest_match(["research"], science_tech_ans):
                    primary_score = 25
                else:
                    primary_score = 15
            elif any_interest_match(["helping"], start_ans):
                helping_ans = answers_map.get("helping_people", "").lower()
                if any_interest_match(["health", "medicine"], helping_ans):
                    primary_score = 35
            elif any_interest_match(["exploring"], start_ans):
                primary_score = 20
        elif is_pcmb:
            if any_interest_match(["science"], start_ans):
                if any_interest_match(["biology", "math", "research"], science_tech_ans):
                    primary_score = 40
                else:
                    primary_score = 30
            elif any_interest_match(["exploring"], start_ans):
                primary_score = 25
        elif "commerce" in slug.lower() or "commerce" in title.lower():
            if any_interest_match(["business", "finance", "entrepreneurship", "management", "commerce"], start_ans):
                primary_score = 40
            elif any_interest_match(["exploring"], start_ans):
                primary_score = 20
        elif any(x in slug.lower() for x in ["arts", "humanities"]) or any(x in title.lower() for x in ["arts", "humanities"]):
            if any_interest_match(["arts", "humanities"], start_ans):
                primary_score = 40
            elif any_interest_match(["exploring", "helping"], start_ans):
                primary_score = 30
        elif any(x in slug.lower() for x in ["design", "creative"]) or any(x in title.lower() for x in ["design", "creative"]):
            if any_interest_match(["creative", "design", "media"], start_ans):
                primary_score = 40
            elif any_interest_match(["arts", "exploring"], start_ans):
                primary_score = 35
    else:
        stream = profile.get("current_stream", "").upper()
        if stream == "PCM":
            if family in ["technology", "engineering", "it"]:
                primary_score = 40
            elif family in ["business", "finance", "management", "design"]:
                primary_score = 20
        elif stream == "PCB":
            if family in ["healthcare", "life sciences", "medical"]:
                primary_score = 40
            elif family in ["business", "management", "design"]:
                primary_score = 20
        elif stream == "PCMB":
            if family in ["technology", "engineering", "it", "healthcare", "life sciences", "medical"]:
                primary_score = 40
            else:
                primary_score = 20
        elif stream == "COMMERCE":
            if family in ["business", "finance", "marketing", "management"]:
                primary_score = 40
            elif family in ["design", "creative", "media"]:
                primary_score = 20
        elif stream in ["ARTS", "HUMANITIES"]:
            if family in ["design", "media", "creative", "healthcare", "mental health"]:
                primary_score = 40
            else:
                primary_score = 20

    # 2. Subject Alignment (Weight: 20%)
    subject_score = 5
    subj_ans = answers_map.get("subjects", "").lower()
    if is_pcm or family in ["technology", "engineering", "it"]:
        if any_subject_match(["math", "physics", "chemistry", "coding", "computer"], subj_ans):
            subject_score = 20
    elif is_pcb or family in ["healthcare", "life sciences", "medical"]:
        if any_subject_match(["biology", "physics", "chemistry", "life sciences"], subj_ans):
            subject_score = 20
    elif is_pcmb:
        if any_subject_match(["biology", "math", "physics", "chemistry"], subj_ans):
            subject_score = 20
    elif "commerce" in slug.lower() or "commerce" in title.lower() or family in ["business", "finance", "marketing"]:
        if any_subject_match(["accountancy", "business", "economics", "math", "social"], subj_ans):
            subject_score = 20
    elif any(x in slug.lower() for x in ["arts", "humanities", "design", "creative"]) or any(x in title.lower() for x in ["arts", "humanities", "design", "creative"]) or family in ["design", "media", "creative"]:
        if any_subject_match(["social", "languages", "art", "music", "fine arts"], subj_ans):
            subject_score = 20

    # 3. Strength Alignment (Weight: 15%)
    strength_score = 5
    str_ans = answers_map.get("strengths", "").lower()
    if is_pcm or family in ["technology", "engineering", "it"]:
        if any_strength_match(["logical", "analytical", "practical", "technical", "building"], str_ans):
            strength_score = 15
    elif is_pcb or family in ["healthcare", "life sciences", "medical"]:
        if any_strength_match(["logical", "analytical", "empathy", "communication", "verbal"], str_ans):
            strength_score = 15
    elif is_pcmb:
        if any_strength_match(["logical", "analytical", "practical", "technical", "empathy"], str_ans):
            strength_score = 15
    elif "commerce" in slug.lower() or "commerce" in title.lower() or family in ["business", "finance", "marketing"]:
        if any_strength_match(["logical", "analytical", "communication", "verbal", "leadership"], str_ans):
            strength_score = 15
    elif any(x in slug.lower() for x in ["arts", "humanities", "design", "creative"]) or any(x in title.lower() for x in ["arts", "humanities", "design", "creative"]) or family in ["design", "media", "creative"]:
        if any_strength_match(["creative", "visual", "artistic", "communication", "verbal"], str_ans):
            strength_score = 15

    # 4. Work-Style Alignment (Weight: 10%)
    work_style_score = 5
    style_ans = answers_map.get("work_style", "").lower()
    if is_pcm or family in ["technology", "engineering", "it"]:
        if any_style_match(["individual", "complex", "research", "lab", "office", "structured"], style_ans):
            work_style_score = 10
    elif is_pcb or family in ["healthcare", "life sciences", "medical"]:
        if any_style_match(["helping", "teaching", "mentoring", "clinical", "hospital", "outdoors", "field"], style_ans):
            work_style_score = 10
    elif is_pcmb:
        if any_style_match(["individual", "complex", "research", "lab", "helping", "teaching", "mentoring"], style_ans):
            work_style_score = 10
    elif "commerce" in slug.lower() or "commerce" in title.lower() or family in ["business", "finance", "marketing"]:
        if any_style_match(["leading", "organizing", "team", "office", "corporate", "structured"], style_ans):
            work_style_score = 10
    elif any(x in slug.lower() for x in ["arts", "humanities", "design", "creative"]) or any(x in title.lower() for x in ["arts", "humanities", "design", "creative"]) or family in ["design", "media", "creative"]:
        if any_style_match(["team", "creative", "studio", "collaborating", "individual"], style_ans):
            work_style_score = 10

    # 5. Career-Value Alignment (Weight: 15%)
    career_value_score = 5
    val_ans = answers_map.get("career_values", "").lower()
    if is_pcm or family in ["technology", "engineering", "it"]:
        if any_value_match(["learning", "innovation", "intellectual", "earning", "income"], val_ans):
            career_value_score = 15
    elif is_pcb or family in ["healthcare", "life sciences", "medical"]:
        if any_value_match(["impact", "helping", "learning", "innovation", "stability", "security"], val_ans):
            career_value_score = 15
    elif is_pcmb:
        if any_value_match(["learning", "innovation", "impact", "helping", "earning", "income"], val_ans):
            career_value_score = 15
    elif "commerce" in slug.lower() or "commerce" in title.lower() or family in ["business", "finance", "marketing"]:
        if any_value_match(["earning", "income", "stability", "security"], val_ans):
            career_value_score = 15
    elif any(x in slug.lower() for x in ["arts", "humanities", "design", "creative"]) or any(x in title.lower() for x in ["arts", "humanities", "design", "creative"]) or family in ["design", "media", "creative"]:
        if any_value_match(["creative", "freedom", "impact", "helping"], val_ans):
            career_value_score = 15

    final_score = primary_score + subject_score + strength_score + work_style_score + career_value_score
    final_score = min(98, max(50, final_score))

    if is_academic:
        if is_pcm:
            personalized_reason = "Strong alignment with engineering and physical science paths."
        elif is_pcb:
            personalized_reason = "Aligned with healthcare, life sciences, and medicine."
        elif is_pcmb:
            personalized_reason = "Dual-focus path keeping both technology and medical options open."
        elif "commerce" in slug.lower() or "commerce" in title.lower():
            personalized_reason = "Well-suited for finance, business studies, and entrepreneurial pursuits."
        elif any(x in slug.lower() for x in ["arts", "humanities"]) or any(x in title.lower() for x in ["arts", "humanities"]):
            personalized_reason = "Strong fit for social sciences, law, humanities, and communication fields."
        else:
            personalized_reason = "Aligned with visual design, creative thinking, and artistic paths."
    else:
        personalized_reason = f"Fits your profile strengths and values in the {family} family."

    return {
        "candidate_id": candidate.get("id"),
        "slug": slug,
        "title": title,
        "recommendation_type": candidate.get("type", "COURSE"),
        "match_score": final_score,
        "personalized_reason": personalized_reason,
        "score_breakdown": {
            "primary_interest": primary_score,
            "subject_alignment": subject_score,
            "strength_alignment": strength_score,
            "work_style": work_style_score,
            "career_values": career_value_score
        }
    }


def score_candidates_stateless(profile: dict, candidates: list[dict]) -> list[dict]:
    """Score candidates using academic direction pipeline (legacy) or career V2 pipeline (RAG)."""
    academic_stage = profile.get("academic_stage", "Class 10")
    raw_answers = profile.get("answers", [])
    
    # Parse answers map
    answers_map = {}
    for ans in raw_answers:
        q_id = ans.get("question_id") or ans.get("category")
        ans_text = ans.get("answer") or ans.get("selectedOption") or ""
        if q_id and ans_text:
            answers_map[q_id] = ans_text.strip()

    # Split candidates into Academic/Course vs Career
    academic_course_candidates = [c for c in candidates if c.get("type") in ["ACADEMIC_DIRECTION", "COURSE"]]
    career_candidates = [c for c in candidates if c.get("type") == "CAREER"]

    # 1. Academic Recommendation Pipeline
    scored_academic_course = []
    for candidate in academic_course_candidates:
        scored_academic_course.append(_score_legacy_candidate(profile, candidate, answers_map))

    # 2. Career Recommendation V2 Pipeline
    scored_careers = []
    if career_candidates:
        repository = CareerKnowledgeRepository(candidates)
        # Run candidate retrieval
        retrieved_careers = LexicalCareerRetriever().retrieve(profile, repository)
        # Run eligibility filtering and reranking
        scored_careers = CareerReranker().rerank(retrieved_careers, profile)

    # Sort each separately
    scored_academic_course.sort(key=lambda x: x["match_score"], reverse=True)
    scored_careers.sort(key=lambda x: x["match_score"], reverse=True)

    print(f"\n[MS2 Scoring V2] Evaluated {len(academic_course_candidates)} academic/course candidates, {len(career_candidates)} career candidates.")
    
    # Merge and mark is_primary
    # For Class 10: We return the academic directions (e.g. top 4) AND the careers (e.g. top 5).
    # For Class 12: We return a combined list of careers and courses (e.g. top 5).
    merged_results = []
    if academic_stage == "Class 10":
        # First add top academic directions
        top_academic = scored_academic_course[:4]
        merged_results.extend(top_academic)
        # Then add top career recommendations
        top_careers = scored_careers[:5]
        merged_results.extend(top_careers)
    else:
        # Class 12: combine scored_careers and scored_academic_course (which are COURSES)
        combined = scored_careers + scored_academic_course
        combined.sort(key=lambda x: x["match_score"], reverse=True)
        merged_results = combined[:5]

    # Mark top 1 as primary
    if merged_results:
        merged_results[0]["is_primary"] = True
        
    return merged_results
