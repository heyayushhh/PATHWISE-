import pytest
from app.services.scoring_engine import score_candidates
from app.services.recommendation_engine import generate_recommendations

def test_scoring_engine_class_10():
    state = {
        "academic_stage": "Class 10",
        "extracted_interests": ["coding", "mathematics"],
        "inferred_strengths": ["analytical thinking"],
        "career_values": ["innovation"],
        "work_preferences": ["independent"],
    }
    
    candidates = score_candidates(state)
    assert len(candidates) > 0
    assert candidates[0]["career_name"] == "Science — PCM"
    assert candidates[0]["match_score"] >= 90

def test_scoring_engine_class_12_commerce():
    state = {
        "academic_stage": "Class 12",
        "current_stream": "Commerce",
        "extracted_interests": ["finance", "business"],
    }
    
    candidates = score_candidates(state)
    assert len(candidates) > 0
    # Must only recommend Commerce-related degrees
    for candidate in candidates:
        assert "MBBS" not in candidate["career_name"]
        assert "B.Tech" not in candidate["career_name"]

def test_recommendation_engine_fallback(monkeypatch):
    state = {
        "academic_stage": "Class 10",
        "extracted_interests": ["biology"],
    }
    
    # Mock call_gemini to simulate API failure
    def mock_call_gemini(prompt):
        raise Exception("API Key Error")
        
    monkeypatch.setattr("app.services.recommendation_engine.call_gemini", mock_call_gemini)
    
    recs = generate_recommendations(state)
    assert len(recs) > 0
    assert recs[0]["career_name"] == "Science — PCB"
    assert "algorithm" in recs[0]["why_suitable"]
