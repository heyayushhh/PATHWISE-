"""Deterministic filtering and scoring engine for career recommendations."""

from typing import Any

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
        # 1. PCM Candidates
        if current_stream == "PCM" or current_stream == "PCMB":
            if any(kw in all_evidence for kw in ["coding", "programming", "software", "ai", "data"]):
                candidates.append({"career_name": "B.Tech Computer Science / AI Engineer", "match_score": 95, "required_skills": ["Coding", "Logic"]})
            candidates.append({"career_name": "B.Tech Mechanical / Robotics", "match_score": 85, "required_skills": ["Physics", "Design"]})
            candidates.append({"career_name": "B.Sc Data Science / Analyst", "match_score": 80, "required_skills": ["Mathematics", "Statistics"]})
            candidates.append({"career_name": "B.Arch / Architecture", "match_score": 75, "required_skills": ["Creativity", "Spatial Thinking"]})

        # 2. PCB Candidates
        if current_stream == "PCB" or current_stream == "PCMB":
            if any(kw in all_evidence for kw in ["medicine", "treating patients", "healthcare"]):
                candidates.append({"career_name": "MBBS / Doctor", "match_score": 95, "required_skills": ["Biology", "Empathy", "Resilience"]})
            candidates.append({"career_name": "B.Sc Biotechnology", "match_score": 85, "required_skills": ["Research", "Biology"]})
            candidates.append({"career_name": "B.Sc Psychology", "match_score": 80, "required_skills": ["Empathy", "Observation"]})

        # 3. Commerce Candidates
        if current_stream == "Commerce":
            candidates.append({"career_name": "B.Com / Chartered Accountant", "match_score": 90, "required_skills": ["Accounting", "Attention to Detail"]})
            candidates.append({"career_name": "BBA / Management", "match_score": 85, "required_skills": ["Leadership", "Communication"]})
            candidates.append({"career_name": "B.A. Economics", "match_score": 80, "required_skills": ["Analysis", "Economics"]})
            
        # 4. Humanities Candidates
        if current_stream == "Humanities" or current_stream == "Arts":
            candidates.append({"career_name": "B.A. Psychology", "match_score": 90, "required_skills": ["Empathy", "Communication"]})
            candidates.append({"career_name": "B.A. Political Science / Law", "match_score": 85, "required_skills": ["Critical Thinking", "Debate"]})
            candidates.append({"career_name": "B.A. Journalism / Media", "match_score": 80, "required_skills": ["Writing", "Creativity"]})

        # Fallback if somehow no stream matches or current_stream is missing
        if not candidates:
            candidates.append({"career_name": "Career Explorer / General Degree", "match_score": 70, "required_skills": ["Versatility"]})

    # Sort candidates by match_score descending
    candidates.sort(key=lambda x: x["match_score"], reverse=True)
    return candidates[:4]
