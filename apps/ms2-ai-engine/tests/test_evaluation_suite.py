import pytest
from app.services.scoring_engine import score_candidates_stateless

# Mock candidate list representing key careers from the 75-career canonical knowledge base
MOCK_CANDIDATES = [
    {
        "id": "1",
        "slug": "ai-ml-engineer",
        "title": "AI/ML Engineer",
        "type": "CAREER",
        "careerFamily": "Technology",
        "industry": "IT & Software",
        "skills": [{"name": "Programming", "weight": 5}, {"name": "Machine Learning", "weight": 5}],
        "compatibleDirections": ["science-pcm", "science-pcmb"]
    },
    {
        "id": "2",
        "slug": "doctor",
        "title": "Doctor",
        "type": "CAREER",
        "careerFamily": "Healthcare",
        "industry": "Medical",
        "skills": [{"name": "Biology", "weight": 5}, {"name": "Empathy", "weight": 5}],
        "compatibleDirections": ["science-pcb", "science-pcmb"]
    },
    {
        "id": "3",
        "slug": "chartered-accountant",
        "title": "Chartered Accountant",
        "type": "CAREER",
        "careerFamily": "Finance",
        "industry": "Financial Services",
        "skills": [{"name": "Accounting", "weight": 5}, {"name": "Taxation", "weight": 5}],
        "compatibleDirections": ["commerce", "commerce-math"]
    },
    {
        "id": "4",
        "slug": "ux-ui-designer",
        "title": "UX/UI Designer",
        "type": "CAREER",
        "careerFamily": "Design",
        "industry": "Creative & Tech",
        "skills": [{"name": "Creativity", "weight": 5}, {"name": "Visual Design", "weight": 5}],
        "compatibleDirections": ["design-creative", "vocational"]
    },
    {
        "id": "5",
        "slug": "sports-analyst",
        "title": "Sports Analyst",
        "type": "CAREER",
        "careerFamily": "Technology",
        "industry": "Sports & Media",
        "skills": [{"name": "Data Analysis", "weight": 5}, {"name": "Sports", "weight": 5}],
        "compatibleDirections": ["science-pcm", "commerce-math", "commerce"]
    },
    {
        "id": "6",
        "slug": "aerospace-engineer",
        "title": "Aerospace Engineer",
        "type": "CAREER",
        "careerFamily": "Engineering",
        "industry": "Aviation",
        "skills": [{"name": "Physics", "weight": 5}, {"name": "Aerodynamics", "weight": 5}],
        "compatibleDirections": ["science-pcm"]
    },
    {
        "id": "7",
        "slug": "corporate-lawyer",
        "title": "Corporate Lawyer",
        "type": "CAREER",
        "careerFamily": "Humanities",
        "industry": "Legal",
        "skills": [{"name": "Critical Thinking", "weight": 5}, {"name": "Communication", "weight": 5}],
        "compatibleDirections": ["humanities", "commerce"]
    },
    {
        "id": "8",
        "slug": "clinical-psychologist",
        "title": "Clinical Psychologist",
        "type": "CAREER",
        "careerFamily": "Humanities",
        "industry": "Healthcare",
        "skills": [{"name": "Psychology", "weight": 5}, {"name": "Empathy", "weight": 5}],
        "compatibleDirections": ["humanities", "science-pcb"]
    },
    {
        "id": "9",
        "slug": "sports-manager",
        "title": "Sports Manager",
        "type": "CAREER",
        "careerFamily": "Sports",
        "industry": "Sports Industry",
        "skills": [{"name": "Management", "weight": 5}, {"name": "Leadership", "weight": 5}],
        "compatibleDirections": ["commerce", "vocational"]
    }
]

def test_persona_1_class_10_tech():
    """Persona 1: Class 10 student with tech/coding interests."""
    profile = {
        "academic_stage": "Class 10",
        "extracted_interests": ["coding", "programming", "mathematics"],
        "inferred_strengths": ["logical reasoning", "problem solving"],
        "career_values": ["innovation", "learning"],
        "work_preferences": ["structured", "office"],
        "answers": [
            {"category": "start", "selectedOption": "science_tech"},
            {"category": "science_tech", "selectedOption": "math_programming"},
            {"category": "subjects", "selectedOption": "math, computer science"},
            {"category": "work_style", "selectedOption": "solving complex problems individually"}
        ]
    }
    scored = score_candidates_stateless(profile, MOCK_CANDIDATES)
    careers = [s for s in scored if s["recommendation_type"] == "CAREER"]
    assert len(careers) > 0
    # AI/ML Engineer should be top ranked career for tech persona
    assert careers[0]["slug"] == "ai-ml-engineer"
    assert careers[0]["match_score"] >= 80

def test_persona_2_class_10_medicine():
    """Persona 2: Class 10 student with medical/biology interests."""
    profile = {
        "academic_stage": "Class 10",
        "extracted_interests": ["biology", "healthcare", "treating patients"],
        "inferred_strengths": ["empathy", "attention to detail"],
        "career_values": ["impact", "helping people"],
        "work_preferences": ["clinical", "hospital"],
        "answers": [
            {"category": "start", "selectedOption": "science_tech"},
            {"category": "science_tech", "selectedOption": "biology_healthcare"},
            {"category": "subjects", "selectedOption": "biology, chemistry"},
            {"category": "work_style", "selectedOption": "helping people in clinical setup"}
        ]
    }
    scored = score_candidates_stateless(profile, MOCK_CANDIDATES)
    careers = [s for s in scored if s["recommendation_type"] == "CAREER"]
    assert len(careers) > 0
    assert careers[0]["slug"] == "doctor"
    assert careers[0]["match_score"] >= 80

def test_persona_3_class_10_creative():
    """Persona 3: Class 10 student with creative/design interests."""
    profile = {
        "academic_stage": "Class 10",
        "extracted_interests": ["design", "creative art", "visuals"],
        "inferred_strengths": ["creativity", "visual imagination"],
        "career_values": ["freedom", "creative expression"],
        "work_preferences": ["studio", "collaborative"],
        "answers": [
            {"category": "start", "selectedOption": "creative_design"},
            {"category": "subjects", "selectedOption": "fine arts, english"},
            {"category": "work_style", "selectedOption": "creating visuals and styling"}
        ]
    }
    scored = score_candidates_stateless(profile, MOCK_CANDIDATES)
    careers = [s for s in scored if s["recommendation_type"] == "CAREER"]
    assert len(careers) > 0
    assert careers[0]["slug"] == "ux-ui-designer"
    assert careers[0]["match_score"] >= 80

def test_persona_4_class_10_commerce():
    """Persona 4: Class 10 student with finance/business interests."""
    profile = {
        "academic_stage": "Class 10",
        "extracted_interests": ["finance", "business", "accounting"],
        "inferred_strengths": ["analytical thinking", "organization"],
        "career_values": ["earning", "stability"],
        "work_preferences": ["corporate", "office"],
        "answers": [
            {"category": "start", "selectedOption": "business_finance"},
            {"category": "subjects", "selectedOption": "accounting, math"},
            {"category": "work_style", "selectedOption": "managing finances or audits"}
        ]
    }
    scored = score_candidates_stateless(profile, MOCK_CANDIDATES)
    careers = [s for s in scored if s["recommendation_type"] == "CAREER"]
    assert len(careers) > 0
    assert careers[0]["slug"] == "chartered-accountant"
    assert careers[0]["match_score"] >= 80

def test_persona_5_class_12_pcm_tech():
    """Persona 5: Class 12 PCM student, tech-focused."""
    profile = {
        "academic_stage": "Class 12",
        "current_stream": "PCM",
        "extracted_interests": ["coding", "math"],
        "inferred_strengths": ["problem solving"],
        "career_values": ["innovation"],
        "work_preferences": ["office"],
        "answers": []
    }
    scored = score_candidates_stateless(profile, MOCK_CANDIDATES)
    
    # Doctor must be penalized since PCM cannot study MBBS/Doctor
    doctor_card = next((c for c in scored if c["slug"] == "doctor"), None)
    if doctor_card:
        assert doctor_card["match_score"] == 30
    
    # AI/ML Engineer must be highly rated and ranked above Doctor (if Doctor is in list)
    ai_card = next(c for c in scored if c["slug"] == "ai-ml-engineer")
    assert ai_card["match_score"] > 80
    if doctor_card:
        assert scored.index(ai_card) < scored.index(doctor_card)

def test_persona_6_class_12_pcb_medical():
    """Persona 6: Class 12 PCB student, medical-focused."""
    profile = {
        "academic_stage": "Class 12",
        "current_stream": "PCB",
        "extracted_interests": ["biology", "treating patients"],
        "inferred_strengths": ["empathy"],
        "career_values": ["impact"],
        "work_preferences": ["hospital"],
        "answers": []
    }
    scored = score_candidates_stateless(profile, MOCK_CANDIDATES)
    
    # Aerospace Engineer must be penalized since PCB cannot study Aerospace
    aero_card = next((c for c in scored if c["slug"] == "aerospace-engineer"), None)
    if aero_card:
        assert aero_card["match_score"] == 30

    # Doctor must be highly rated
    doctor_card = next(c for c in scored if c["slug"] == "doctor")
    assert doctor_card["match_score"] > 80
    if aero_card:
        assert scored.index(doctor_card) < scored.index(aero_card)

def test_persona_7_class_12_commerce_finance():
    """Persona 7: Class 12 Commerce student, finance-focused."""
    profile = {
        "academic_stage": "Class 12",
        "current_stream": "COMMERCE",
        "extracted_interests": ["finance", "business"],
        "inferred_strengths": ["analytical thinking"],
        "career_values": ["earning"],
        "work_preferences": ["office"],
        "answers": []
    }
    scored = score_candidates_stateless(profile, MOCK_CANDIDATES)
    
    # Aerospace Engineer and Doctor must be penalized (score 30) if present
    aero_card = next((c for c in scored if c["slug"] == "aerospace-engineer"), None)
    doctor_card = next((c for c in scored if c["slug"] == "doctor"), None)
    if aero_card:
        assert aero_card["match_score"] == 30
    if doctor_card:
        assert doctor_card["match_score"] == 30

    # Chartered Accountant should be top
    ca_card = next(c for c in scored if c["slug"] == "chartered-accountant")
    assert ca_card["match_score"] > 80

def test_persona_8_class_12_humanities():
    """Persona 8: Class 12 Humanities student, social sciences focused."""
    profile = {
        "academic_stage": "Class 12",
        "current_stream": "HUMANITIES",
        "extracted_interests": ["law", "psychology", "writing"],
        "inferred_strengths": ["critical thinking", "communication"],
        "career_values": ["impact"],
        "work_preferences": ["office"],
        "answers": []
    }
    scored = score_candidates_stateless(profile, MOCK_CANDIDATES)
    
    # Doctor and Aerospace Engineer must be penalized if present
    aero_card = next((c for c in scored if c["slug"] == "aerospace-engineer"), None)
    doctor_card = next((c for c in scored if c["slug"] == "doctor"), None)
    if aero_card:
        assert aero_card["match_score"] == 30
    if doctor_card:
        assert doctor_card["match_score"] == 30

    # Corporate Lawyer should be top
    lawyer_card = next(c for c in scored if c["slug"] == "corporate-lawyer")
    assert lawyer_card["match_score"] >= 75

def test_persona_9_class_10_sports():
    """Persona 9: Class 10 student with sports interests."""
    profile = {
        "academic_stage": "Class 10",
        "extracted_interests": ["sports", "athlete", "fitness"],
        "inferred_strengths": ["hard work", "leadership"],
        "career_values": ["teamwork"],
        "work_preferences": ["outdoors"],
        "answers": [
            {"category": "start", "selectedOption": "sports"},
            {"category": "subjects", "selectedOption": "physical education"},
            {"category": "work_style", "selectedOption": "managing team or fitness"}
        ]
    }
    scored = score_candidates_stateless(profile, MOCK_CANDIDATES)
    careers = [s for s in scored if s["recommendation_type"] == "CAREER"]
    assert len(careers) > 0
    # Sports Manager or Sports Analyst should be top
    assert careers[0]["slug"] in ["sports-manager", "sports-analyst"]
    assert careers[0]["match_score"] >= 75
