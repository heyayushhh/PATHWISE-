import pytest
from app.services.scoring_engine import score_candidates_stateless

def test_scoring_engine_class_10():
    profile = {
        "academic_stage": "Class 10",
        "extracted_interests": ["coding", "mathematics"],
        "inferred_strengths": ["analytical thinking"],
        "career_values": ["innovation"],
        "work_preferences": ["independent"],
    }
    
    candidates = [
        {"id": "1", "slug": "science-pcm", "title": "Science — PCM", "type": "ACADEMIC_DIRECTION", "careerFamily": "Technology"},
        {"id": "2", "slug": "commerce", "title": "Commerce", "type": "ACADEMIC_DIRECTION", "careerFamily": "Business"}
    ]
    
    scored = score_candidates_stateless(profile, candidates)
    assert len(scored) == 2
    assert scored[0]["slug"] == "science-pcm"
    assert scored[0]["match_score"] > scored[1]["match_score"]

def test_scoring_engine_class_10_answers():
    profile = {
        "academic_stage": "Class 10",
        "extracted_interests": ["treating patients"],
        "answers": [
            {"category": "subjects", "selectedOption": "biology"},
            {"category": "subjects", "selectedOption": "chemistry"},
            {"category": "math_comfort", "selectedOption": "somewhat comfortable"}
        ]
    }
    
    candidates = [
        {"id": "1", "slug": "science-pcm", "title": "Science — PCM", "type": "ACADEMIC_DIRECTION", "careerFamily": "Technology"},
        {"id": "2", "slug": "science-pcb", "title": "Science — PCB", "type": "ACADEMIC_DIRECTION", "careerFamily": "Healthcare"}
    ]
    
    scored = score_candidates_stateless(profile, candidates)
    assert len(scored) == 2
    # Should favor PCB because of biology, but PCM also gets a boost from math comfort/chemistry
    
    pcb = next(c for c in scored if c["slug"] == "science-pcb")
    pcm = next(c for c in scored if c["slug"] == "science-pcm")
    assert pcb["match_score"] >= pcm["match_score"]

def test_scoring_engine_class_12_commerce():
    profile = {
        "academic_stage": "Class 12",
        "current_stream": "Commerce",
        "extracted_interests": ["finance", "business"],
    }
    
    candidates = [
        {"id": "3", "slug": "chartered-accountant", "title": "Chartered Accountant", "type": "CAREER", "careerFamily": "Finance"},
        {"id": "4", "slug": "doctor", "title": "Doctor", "type": "CAREER", "careerFamily": "Healthcare"}
    ]
    
    scored = score_candidates_stateless(profile, candidates)
    assert len(scored) == 2
    assert scored[0]["slug"] == "chartered-accountant"
    assert scored[0]["match_score"] > scored[1]["match_score"]
