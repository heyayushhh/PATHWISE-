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

def score_candidates_stateless(profile: dict, candidates: list[dict]) -> list[dict]:
    """Score candidates provided by MS1 based on profile dimensions deterministically."""
    academic_stage = profile.get("academic_stage", "Class 10")
    
    extracted_interests = [i.lower() for i in profile.get("extracted_interests", [])]
    inferred_strengths = [s.lower() for s in profile.get("inferred_strengths", [])]
    career_values = [v.lower() for v in profile.get("career_values", [])]
    work_preferences = [w.lower() for w in profile.get("work_preferences", [])]
    
    # Bug 1 Fix: Parse answers for precise category-based signals
    raw_answers = profile.get("answers", [])
    
    selected_subjects = []
    math_comfort = ""
    for ans in raw_answers:
        cat = ans.get("category", "")
        opt = ans.get("answer", ans.get("selectedOption", "")).lower()
        if cat == "subjects":
            selected_subjects.append(opt)
        elif cat == "math_comfort":
            math_comfort = opt
            
    # Combine standard extracted arrays for general search
    all_evidence = set(extracted_interests + inferred_strengths + career_values + work_preferences)
    
    # Helper to check if any keyword is a substring of any evidence element
    def has_match(keywords: set[str], evidence: set[str]) -> bool:
        for kw in keywords:
            for ev in evidence:
                if kw in ev:
                    return True
        return False
        
    scored_results = []
    
    for candidate in candidates:
        slug = candidate.get("slug", "")
        title = candidate.get("title", "")
        base_score = 60 # Starting score for eligible candidate
        score_breakdown = {}
        personalized_reason = "Strong alignment based on assessment profile strengths and interests."
        
        # Keyword sets for fallback substring matching
        tech_keywords = {"coding", "programming", "software", "ai", "data", "computers & technology", "technology", "mathematics", "math", "science & technology", "engineering & technology"}
        bio_keywords = {"biology", "healthcare", "medicine", "treating patients", "life sciences", "scientific curiosity"}
        business_keywords = {"business & money", "entrepreneurship", "finance", "management", "marketing", "stock markets"}
        creative_keywords = {"arts & humanities", "creative work & design", "design", "writing", "creativity", "communication", "media"}
        
        # Determine candidate family alignment
        family = candidate.get("careerFamily", "")
        if family is None:
            family = ""
        family = family.lower()
        
        is_academic = candidate.get("type") == "ACADEMIC_DIRECTION"
        
        if is_academic:
            slug_lower = slug.lower()
            title_lower = title.lower()
            matched_signals = []
            
            if "pcm" in slug_lower or "pcm" in title_lower:
                if has_match(tech_keywords, all_evidence) or any("science" in s or "physics" in s or "chemistry" in s for s in selected_subjects):
                    base_score += 15
                    matched_signals.append("interest in science and technology")
                if "mathematics" in selected_subjects or math_comfort in ["very comfortable", "somewhat comfortable"] or has_match({"mathematics", "math", "logic"}, all_evidence):
                    base_score += 15
                    matched_signals.append("comfort with mathematics")
                if has_match({"logical reasoning", "problem solving", "analytical"}, all_evidence):
                    base_score += 8
                    matched_signals.append("logical problem-solving strengths")
                
                if matched_signals:
                    personalized_reason = f"Your {' and '.join(matched_signals)} make Science PCM a strong academic fit."
                else:
                    personalized_reason = "Science PCM aligns with your general interest in analytical streams."
                    
            elif "pcb" in slug_lower or "pcb" in title_lower:
                if has_match(bio_keywords, all_evidence) or "biology" in selected_subjects:
                    base_score += 15
                    matched_signals.append("interest in biology and life sciences")
                if has_match({"healthcare", "medicine", "treating patients"}, all_evidence):
                    base_score += 15
                    matched_signals.append("interest in healthcare and medical fields")
                if has_match({"scientific curiosity", "empathy", "resilience"}, all_evidence):
                    base_score += 8
                    matched_signals.append("scientific curiosity and empathy")
                
                if matched_signals:
                    personalized_reason = f"Your {' and '.join(matched_signals)} align well with Science PCB."
                else:
                    personalized_reason = "Science PCB is suitable for medical and life science paths."
                    
            elif "commerce" in slug_lower or "commerce" in title_lower:
                if has_match(business_keywords, all_evidence) or "commerce" in selected_subjects or "economics" in selected_subjects or "accountancy" in selected_subjects:
                    base_score += 15
                    matched_signals.append("interest in business and finance")
                if has_match({"economics", "entrepreneurship", "marketing"}, all_evidence):
                    base_score += 15
                    matched_signals.append("entrepreneurial inclinations")
                if has_match({"leadership", "numerical reasoning", "finance"}, all_evidence):
                    base_score += 8
                    matched_signals.append("strong business acumen")
                
                if matched_signals:
                    personalized_reason = f"Your {' and '.join(matched_signals)} make Commerce a highly viable path."
                else:
                    personalized_reason = "Commerce is suitable for business, finance, and management fields."
                    
            elif any(x in slug_lower for x in ["arts", "humanities"]) or any(x in title_lower for x in ["arts", "humanities"]):
                if has_match(creative_keywords, all_evidence) or has_match({"humanities", "history", "political science", "psychology", "literature"}, set(selected_subjects)):
                    base_score += 15
                    matched_signals.append("interest in humanities and social sciences")
                if has_match({"writing", "communication", "debate"}, all_evidence):
                    base_score += 15
                    matched_signals.append("strong communication preferences")
                if has_match({"creativity", "empathy", "social awareness"}, all_evidence):
                    base_score += 8
                    matched_signals.append("creative and social awareness strengths")
                
                if matched_signals:
                    personalized_reason = f"Your {' and '.join(matched_signals)} make Arts & Humanities a strong choice."
                else:
                    personalized_reason = "Arts & Humanities aligns with creative, communication, and social interests."
                    
            elif any(x in slug_lower for x in ["design", "creative"]) or any(x in title_lower for x in ["design", "creative"]):
                if has_match(creative_keywords, all_evidence) or "fine arts" in selected_subjects or "design" in selected_subjects:
                    base_score += 20
                    matched_signals.append("passion for design and visual arts")
                if has_match({"creativity", "visual thinking", "imagination"}, all_evidence):
                    base_score += 15
                    matched_signals.append("strong creative strengths")
                    
                if matched_signals:
                    personalized_reason = f"Your {' and '.join(matched_signals)} highlight Design/Creative as an ideal path."
                else:
                    personalized_reason = "Design/Creative stream aligns with artistic and visual interests."
        else:
            # Class 12 logic
            matched_signals = []
            if family in ["technology", "engineering", "it"]:
                if has_match(tech_keywords, all_evidence):
                    base_score += 20
                    matched_signals.append("interest in technology")
                if has_match({"mathematics", "math"}, all_evidence):
                    base_score += 10
                    matched_signals.append("comfort with mathematics")
                if matched_signals:
                    personalized_reason = f"Your {' and '.join(matched_signals)} align well with a career in tech/engineering."
            
            elif family in ["healthcare", "life sciences", "medical"]:
                if has_match(bio_keywords, all_evidence):
                    base_score += 25
                    matched_signals.append("interest in biological sciences")
                if has_match({"treating patients", "healthcare"}, all_evidence):
                    base_score += 10
                    matched_signals.append("preference for healthcare")
                if matched_signals:
                    personalized_reason = f"Your {' and '.join(matched_signals)} support a path in healthcare and biology."
                    
            elif family in ["business", "finance", "marketing"]:
                if has_match(business_keywords, all_evidence):
                    base_score += 20
                    matched_signals.append("interest in business or finance")
                if has_match({"economics", "management"}, all_evidence):
                    base_score += 10
                    matched_signals.append("management inclinations")
                if matched_signals:
                    personalized_reason = f"Your {' and '.join(matched_signals)} make business, finance, or marketing a strong choice."
                    
            elif family in ["design", "architecture", "media", "creative"]:
                if has_match(creative_keywords, all_evidence):
                    base_score += 25
                    matched_signals.append("creative interests")
                if has_match({"visual thinking", "creativity"}, all_evidence):
                    base_score += 10
                    matched_signals.append("creativity strength")
                if matched_signals:
                    personalized_reason = f"Your {' and '.join(matched_signals)} align with creative design fields."
        
        # Normalize score
        final_score = min(98, max(50, base_score))
        
        scored_results.append({
            "candidate_id": candidate.get("id"),
            "slug": slug,
            "title": title,
            "recommendation_type": candidate.get("type", "CAREER"),
            "match_score": final_score,
            "personalized_reason": personalized_reason,
            "score_breakdown": score_breakdown,
        })
        
    print(f"\n[MS2 Scoring] Evaluated {len(candidates)} candidates.")
    for res in scored_results:
        print(f"  -> {res['title']}: {res['match_score']}% ({res['personalized_reason']})")
    
    # Sort candidates by match_score descending
    scored_results.sort(key=lambda x: x["match_score"], reverse=True)
    
    # Mark top 1 as primary
    if scored_results:
        scored_results[0]["is_primary"] = True
        
    return scored_results[:5]

