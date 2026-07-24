import re
from typing import Any, Dict, List, Set

class CareerKnowledgeRepository:
    """
    Repository for career metadata passed dynamically from MS1.
    Avoids duplicating or hardcoding the 75 careers in MS2.
    """
    def __init__(self, candidates: List[Dict[str, Any]]):
        self.careers = [c for c in candidates if c.get("type") == "CAREER"]
        self.courses = [c for c in candidates if c.get("type") == "COURSE"]
        self.academic_directions = [c for c in candidates if c.get("type") == "ACADEMIC_DIRECTION"]
        
    def get_career_by_slug(self, slug: str) -> Dict[str, Any]:
        for c in self.careers:
            if c.get("slug") == slug:
                return c
        return {}

    def get_all_careers(self) -> List[Dict[str, Any]]:
        return self.careers


class CareerRetriever:
    """
    Abstract retriever class that lexical token/tag matching implements.
    Can be subclassed in the future for semantic/vector embedding retrieval.
    """
    def retrieve(self, profile: Dict[str, Any], repository: CareerKnowledgeRepository) -> List[Dict[str, Any]]:
        raise NotImplementedError("Subclasses must implement retrieve()")


class LexicalCareerRetriever(CareerRetriever):
    """
    Retrieves career candidates using weighted tag similarity and token overlaps.
    """
    def retrieve(self, profile: Dict[str, Any], repository: CareerKnowledgeRepository) -> List[Dict[str, Any]]:
        # Extract features from profile
        user_interests = [i.lower() for i in profile.get("extracted_interests", [])]
        user_strengths = [s.lower() for s in profile.get("inferred_strengths", [])]
        user_values = [v.lower() for v in profile.get("career_values", [])]
        user_preferences = [w.lower() for w in profile.get("work_preferences", [])]
        
        # Parse answers
        answers_map = {}
        for ans in profile.get("answers", []):
            q_id = ans.get("question_id") or ans.get("category")
            ans_text = ans.get("answer") or ans.get("selectedOption") or ""
            if q_id and ans_text:
                answers_map[q_id] = ans_text.lower().strip()

        # Combine all profile tokens for matching
        profile_tokens = set()
        for lst in [user_interests, user_strengths, user_values, user_preferences]:
            for item in lst:
                # Tokenize
                words = re.findall(r'\w+', item)
                profile_tokens.update(words)
        
        # Add answer values
        for val in answers_map.values():
            words = re.findall(r'\w+', val)
            profile_tokens.update(words)

        all_careers = repository.get_all_careers()
        scored_candidates = []

        for career in all_careers:
            # Tokenize career fields to check for matches
            title = career.get("title", "").lower()
            family = career.get("careerFamily", "").lower()
            industry = career.get("industry", "").lower()
            short_desc = career.get("shortDescription", "").lower()
            full_desc = career.get("fullDescription", "").lower()
            
            career_text = f"{title} {family} {industry} {short_desc} {full_desc}"
            # Add skills
            for sk in career.get("skills", []):
                career_text += f" {sk.get('name', '').lower()}"
                
            career_tokens = set(re.findall(r'\w+', career_text))
            
            # Calculate Jaccard similarity/overlap score
            if not career_tokens:
                overlap = 0.0
            else:
                intersection = profile_tokens.intersection(career_tokens)
                overlap = len(intersection) / len(career_tokens)

            # Boost if family matches primary domain interest keywords
            domain_boost = 0.0
            if family in ["technology", "engineering", "it"] and any(k in profile_tokens for k in ["coding", "programming", "software", "computer", "math", "technology"]):
                domain_boost = 0.3
            elif family in ["healthcare", "medical"] and any(k in profile_tokens for k in ["biology", "medicine", "treating", "patients", "healthcare"]):
                domain_boost = 0.3
            elif family in ["finance", "business"] and any(k in profile_tokens for k in ["finance", "business", "accounting", "management", "corporate", "investment"]):
                domain_boost = 0.3
            elif family in ["humanities", "social science"] and any(k in profile_tokens for k in ["law", "psychology", "journalism", "educator", "policy", "sociology"]):
                domain_boost = 0.3
            elif family in ["design", "creative"] and any(k in profile_tokens for k in ["design", "creative", "ui", "ux", "visual", "art", "graphic"]):
                domain_boost = 0.3
            elif family in ["sports"] and any(k in profile_tokens for k in ["sports", "athlete", "coach", "fitness", "trainer"]):
                domain_boost = 0.3

            score = overlap + domain_boost
            scored_candidates.append((career, score))

        # Sort by score descending and return the careers
        scored_candidates.sort(key=lambda x: x[1], reverse=True)
        # Return Top 20 candidate pool
        return [item[0] for item in scored_candidates[:20]]


class CareerReranker:
    """
    Reranks candidate careers using a strict eligibility filter (stage-aware)
    and a profile-aware weighted formula.
    """
    def rerank(self, candidates: List[Dict[str, Any]], profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        academic_stage = profile.get("academic_stage", "Class 10")
        current_stream = profile.get("current_stream", "").upper()
        
        # Parse answers
        answers_map = {}
        for ans in profile.get("answers", []):
            q_id = ans.get("question_id") or ans.get("category")
            ans_text = ans.get("answer") or ans.get("selectedOption") or ""
            if q_id and ans_text:
                answers_map[q_id] = ans_text.lower().strip()

        extracted_interests = [i.lower() for i in profile.get("extracted_interests", [])]
        inferred_strengths = [s.lower() for s in profile.get("inferred_strengths", [])]
        career_values_list = [v.lower() for v in profile.get("career_values", [])]
        work_preferences = [w.lower() for w in profile.get("work_preferences", [])]

        # Standard helpers for tag matching
        def interest_match(keywords: list[str]) -> bool:
            return any(any(kw in i for kw in keywords) for i in extracted_interests)

        def strength_match(keywords: list[str]) -> bool:
            return any(any(kw in s for kw in keywords) for s in inferred_strengths)

        def style_match(keywords: list[str]) -> bool:
            return any(any(kw in w for kw in keywords) for w in work_preferences)

        def value_match(keywords: list[str]) -> bool:
            return any(any(kw in v for kw in keywords) for v in career_values_list)

        # Primary Domain Interest Identification
        # This will carry the highest weight and prevents unrelated values (e.g. earning) from overpowering domain
        is_tech = interest_match(["coding", "programming", "software", "computer", "technology", "math", "engineering"]) or any("tech" in i for i in extracted_interests)
        is_health = interest_match(["biology", "medicine", "treating", "patients", "healthcare", "clinical"])
        is_finance = interest_match(["finance", "accounting", "banking", "investment", "chartered", "actuary"])
        is_business = interest_match(["business", "management", "entrepreneurship", "marketing", "hr", "operations"])
        is_humanities = interest_match(["law", "psychology", "journalism", "educator", "teaching", "sociology", "policy", "political"])
        is_creative = interest_match(["design", "creative", "ui", "ux", "visual", "art", "graphic", "animation", "fashion"])
        is_sports = interest_match(["sports", "athlete", "coach", "fitness", "trainer", "athletics"])

        # Also support branch/starting questions
        start_ans = answers_map.get("start", "")
        science_tech_ans = answers_map.get("science_tech", "")
        
        if "science" in start_ans:
            if "biology" in science_tech_ans or "healthcare" in science_tech_ans:
                is_health = True
            elif "math" in science_tech_ans or "computer" in science_tech_ans or "coding" in science_tech_ans:
                is_tech = True
        elif "business" in start_ans or "finance" in start_ans or "entrepreneurship" in start_ans:
            is_business = True
            is_finance = True
        elif "creative" in start_ans or "design" in start_ans:
            is_creative = True
        elif "helping" in start_ans:
            is_humanities = True
            helping_ans = answers_map.get("helping_people", "")
            if "health" in helping_ans or "medicine" in helping_ans:
                is_health = True
            elif "teaching" in helping_ans or "counseling" in helping_ans:
                is_humanities = True

        reranked_results = []

        for career in candidates:
            slug = career.get("slug", "")
            title = career.get("title", "")
            family = (career.get("careerFamily") or "").lower()
            industry = (career.get("industry") or "").lower()
            comp_directions = career.get("compatibleDirections", [])

            # Eligibility Filtering Rule 3:
            # - For Class 12: Stream eligibility acts as a hard filter (or very heavy penalty)
            # - For Class 10: Academic compatibility is a soft boost, NOT a hard filter
            
            eligible = True
            if academic_stage == "Class 12":
                if current_stream == "PCM":
                    # PCM can't enter core medical roles (e.g. Doctor, Dentist, Veterinarian)
                    if slug in ["doctor", "dentist", "veterinarian"]:
                        eligible = False
                elif current_stream == "PCB":
                    # PCB can't enter core engineering/tech roles requiring advanced math (e.g. Aerospace, Computer Hardware, Robotics, Quantitative Analyst)
                    if slug in ["aerospace-engineer", "computer-hardware-engineer", "robotics-engineer", "quantitative-analyst"]:
                        eligible = False
                elif current_stream == "COMMERCE":
                    # Commerce can't enter medicine or engineering
                    if family in ["healthcare", "medical"] or family in ["engineering"] or slug in ["doctor", "dentist", "veterinarian", "aerospace-engineer", "robotics-engineer", "biomedical-engineer"]:
                        eligible = False
                elif current_stream in ["ARTS", "HUMANITIES"]:
                    # Humanities can't enter medicine or engineering
                    if family in ["healthcare", "medical"] or family in ["engineering"] or slug in ["doctor", "dentist", "veterinarian", "aerospace-engineer", "robotics-engineer", "biomedical-engineer"]:
                        eligible = False

            # Reranking Weights:
            # 1. Primary Domain/Interest Alignment (Weight: 40%)
            domain_score = 10
            if family in ["technology", "engineering", "it"] and is_tech:
                domain_score = 40
            elif family in ["healthcare", "medical"] and is_health:
                domain_score = 40
            elif family in ["finance"] and is_finance:
                domain_score = 40
            elif family in ["business"] and is_business:
                domain_score = 40
            elif family in ["humanities", "social science"] and is_humanities:
                domain_score = 40
            elif family in ["design", "creative"] and is_creative:
                domain_score = 40
            elif family in ["sports"] and is_sports:
                domain_score = 40
            else:
                # Sub-alignments and cross-interests
                if family in ["technology", "engineering"] and is_sports and slug == "sports-analyst":
                    domain_score = 40
                elif family in ["sports"] and is_health and slug == "sports-physiotherapist":
                    domain_score = 40
                elif family in ["sports"] and is_humanities and slug == "sports-psychologist":
                    domain_score = 40
                elif family in ["sports"] and is_creative and slug == "sports-journalist":
                    domain_score = 35
                elif family in ["finance"] and is_tech and slug == "fintech-analyst":
                    domain_score = 40
                elif family in ["engineering"] and is_health and slug == "biomedical-engineer":
                    domain_score = 40
                elif family in ["technology"] and (is_health or is_tech) and slug in ["bioinformatics-specialist", "computational-biologist", "health-data-scientist"]:
                    domain_score = 40

            # 2. Strength Alignment (Weight: 20%)
            strength_score = 5
            if family in ["technology", "engineering", "it"]:
                if strength_match(["logical", "analytical", "practical", "technical", "problem solving"]):
                    strength_score = 20
            elif family in ["healthcare", "medical"]:
                if strength_match(["empathy", "communication", "verbal", "memory", "attention to detail"]):
                    strength_score = 20
            elif family in ["finance", "business"]:
                if strength_match(["logical", "analytical", "communication", "leadership", "organization"]):
                    strength_score = 20
            elif family in ["humanities"]:
                if strength_match(["critical thinking", "communication", "verbal", "reading", "writing"]):
                    strength_score = 20
            elif family in ["design", "creative"]:
                if strength_match(["creativity", "visual", "artistic", "observation"]):
                    strength_score = 20
            elif family in ["sports"]:
                if strength_match(["practical", "hard work", "leadership", "communication", "time management"]):
                    strength_score = 20

            # 3. Subject Interests (Weight: 15%)
            subject_score = 5
            subj_ans = answers_map.get("subjects", "")
            if family in ["technology", "engineering", "it"]:
                if any(k in subj_ans for k in ["math", "physics", "computer", "coding", "programming"]) or interest_match(["math"]):
                    subject_score = 15
            elif family in ["healthcare", "medical"]:
                if any(k in subj_ans for k in ["biology", "chemistry", "science"]) or interest_match(["biology"]):
                    subject_score = 15
            elif family in ["finance", "business"]:
                if any(k in subj_ans for k in ["accountancy", "business", "economics", "math"]) or interest_match(["economics", "finance"]):
                    subject_score = 15
            elif family in ["humanities"]:
                if any(k in subj_ans for k in ["social", "history", "political", "psychology", "english"]):
                    subject_score = 15
            elif family in ["design", "creative"]:
                if any(k in subj_ans for k in ["art", "fine arts", "media", "craft"]):
                    subject_score = 15
            elif family in ["sports"]:
                if any(k in subj_ans for k in ["sports", "physical", "activity"]):
                    subject_score = 15

            # 4. Work Style (Weight: 10%)
            work_style_score = 5
            style_ans = answers_map.get("work_style", "")
            if family in ["technology", "finance"]:
                if any(k in style_ans for k in ["office", "individual", "complex", "structured"]):
                    work_style_score = 10
            elif family in ["healthcare", "humanities"]:
                if any(k in style_ans for k in ["helping", "clinical", "hospital", "teaching", "mentoring", "field"]):
                    work_style_score = 10
            elif family in ["business", "sports"]:
                if any(k in style_ans for k in ["leading", "organizing", "team", "corporate", "outdoors"]):
                    work_style_score = 10
            elif family in ["design", "creative"]:
                if any(k in style_ans for k in ["creative", "studio", "collaborating", "individual"]):
                    work_style_score = 10

            # 5. Career Values (Weight: 15%)
            career_value_score = 5
            val_ans = answers_map.get("career_values", "")
            if family in ["technology", "finance", "engineering"]:
                if any(k in val_ans for k in ["learning", "innovation", "intellectual", "earning", "income"]):
                    career_value_score = 15
            elif family in ["healthcare", "humanities", "sports"]:
                if any(k in val_ans for k in ["impact", "helping", "stability", "security", "teamwork"]):
                    career_value_score = 15
            elif family in ["design", "creative", "business"]:
                if any(k in val_ans for k in ["creative", "freedom", "influence", "recognition"]):
                    career_value_score = 15

            # Academic compatibility boost for Class 10 (Soft constraint)
            compat_boost = 0
            if academic_stage == "Class 10":
                # Check if the career is compatible with the best matched streams
                # Let's see: if science-pcm is highly matched, boost pcm careers
                pass

            if not eligible:
                final_score = 30
            else:
                final_score = domain_score + strength_score + subject_score + work_style_score + career_value_score
                # Clamping score with meaningful differentiation (scores between 50 and 97)
                final_score = min(97, max(50, final_score))
            
            # Select customized reason
            skills_names = [s.get("name") for s in career.get("skills", [])]
            reranked_results.append({
                "candidate_id": career.get("id"),
                "slug": slug,
                "title": title,
                "recommendation_type": "CAREER",
                "match_score": final_score,
                "personalized_reason": f"Aligns with your interests in {family.capitalize()} and strengths in {', '.join(skills_names[:2])}.",
                "score_breakdown": {
                    "domain_alignment": domain_score,
                    "strength_alignment": strength_score,
                    "subject_alignment": subject_score,
                    "work_style": work_style_score,
                    "career_values": career_value_score
                }
            })

        # Sort descending by match_score
        reranked_results.sort(key=lambda x: x["match_score"], reverse=True)
        return reranked_results
