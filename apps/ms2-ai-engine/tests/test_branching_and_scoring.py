import sys
import uuid
from pathlib import Path
from fastapi.testclient import TestClient

APP_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(APP_ROOT))

from app.main import app
from app.services.assessment_persistence import load_state, save_state

client = TestClient(app)

def _state_path(session_id: str) -> Path:
    return Path(__file__).resolve().parent.parent / "app" / "data" / "assessments" / f"{session_id}.json"

def clean_state(session_id: str):
    state_file = _state_path(session_id)
    if state_file.exists():
        state_file.unlink()

# =====================================================================
# CLASS 10 BRANCH TESTS
# =====================================================================

def run_class_10_branch(interest_selection: str, expected_second_q_id: str, sub_interest_selection: str = None, expected_third_q_id: str = None):
    session_id = f"test-class10-{uuid.uuid4()}"
    try:
        # 1. Start Assessment
        res = client.post("/assessment/start", json={
            "user_id": "test-user",
            "assessment_type": "career_interest",
            "session_id": session_id,
            "academic_stage": "Class 10"
        })
        assert res.status_code == 200, res.text
        payload = res.json()
        assert payload["question_id"] == "start"
        assert payload["total_questions"] == 10

        # 2. Answer Q1 (start) -> Select the interest branch
        res = client.post(f"/assessment/{session_id}/answer", json={
            "question_id": "start",
            "answer": interest_selection
        })
        assert res.status_code == 200, res.text
        payload = res.json()
        assert payload["question_id"] == expected_second_q_id

        # 3. Answer Q2 (if sub-branch is tested)
        if sub_interest_selection and expected_third_q_id:
            res = client.post(f"/assessment/{session_id}/answer", json={
                "question_id": expected_second_q_id,
                "answer": sub_interest_selection
            })
            assert res.status_code == 200, res.text
            payload = res.json()
            assert payload["question_id"] == expected_third_q_id
            
    finally:
        clean_state(session_id)

def test_class_10_science_technology_branch():
    # Science & Technology -> science_tech (Q2) -> Computers & Coding -> computers_tech (Q3)
    run_class_10_branch(
        interest_selection="Science & Technology",
        expected_second_q_id="science_tech",
        sub_interest_selection="Computers & Coding",
        expected_third_q_id="computers_tech"
    )

def test_class_10_business_finance_branch():
    # Business, Finance & Entrepreneurship -> business_finance (Q2) -> subjects (Q3)
    run_class_10_branch(
        interest_selection="Business, Finance & Entrepreneurship",
        expected_second_q_id="business_finance",
        sub_interest_selection="Starting my own company (Entrepreneurship)",
        expected_third_q_id="subjects"
    )

def test_class_10_creative_design_branch():
    # Creative Design & Media -> creative_media (Q2) -> subjects (Q3)
    run_class_10_branch(
        interest_selection="Creative Design & Media",
        expected_second_q_id="creative_media",
        sub_interest_selection="Graphic Design or UI/UX Design",
        expected_third_q_id="subjects"
    )

# =====================================================================
# CLASS 12 STREAM TESTS
# =====================================================================

def run_class_12_stream(stream_selection: str, expected_second_q_id: str):
    session_id = f"test-class12-{uuid.uuid4()}"
    try:
        # 1. Start Assessment
        res = client.post("/assessment/start", json={
            "user_id": "test-user",
            "assessment_type": "career_interest",
            "session_id": session_id,
            "academic_stage": "Class 12"
        })
        assert res.status_code == 200, res.text
        payload = res.json()
        assert payload["question_id"] == "start"
        assert payload["total_questions"] == 9  # Base for Class 12 is 9!

        # 2. Answer Q1 (start) -> Select the stream
        res = client.post(f"/assessment/{session_id}/answer", json={
            "question_id": "start",
            "answer": stream_selection
        })
        assert res.status_code == 200, res.text
        payload = res.json()
        assert payload["question_id"] == expected_second_q_id
        
    finally:
        clean_state(session_id)

def test_class_12_pcm_stream():
    run_class_12_stream("Science — PCM (Physics, Chemistry, Mathematics)", "pcm_interest")

def test_class_12_pcb_stream():
    run_class_12_stream("Science — PCB (Physics, Chemistry, Biology)", "pcb_interest")

def test_class_12_commerce_stream():
    run_class_12_stream("Commerce", "commerce_interest")

def test_class_12_arts_stream():
    run_class_12_stream("Arts / Humanities", "arts_interest")

# =====================================================================
# RECOMMENDATION SCORE DIFFERENTIATION TESTS
# =====================================================================

def test_recommendation_score_differentiation_pcm():
    session_id = f"test-diff-pcm-{uuid.uuid4()}"
    try:
        # Run PCM stream to completion as a certain user
        # Flow: start -> pcm_interest -> pcm_programming -> pcm_style -> subjects -> strengths -> activities -> work_style -> career_values -> certainty
        answers = [
            ("start", "Science — PCM (Physics, Chemistry, Mathematics)"),
            ("pcm_interest", "Engineering & Technology"),
            ("pcm_programming", "Highly interested (I code or want to learn)"),
            ("pcm_style", "Analytical and abstract (math/algorithms)"),
            ("subjects", "Mathematics"),
            ("strengths", "Logical reasoning & analytical problem solving"),
            ("activities", "Programming/building projects"),
            ("work_style", "Solving complex problems individually"),
            ("career_values", "Constant learning, innovation & intellectual challenge"),
            ("certainty", "Very certain")
        ]
        
        # Start
        client.post("/assessment/start", json={
            "user_id": "test-user",
            "session_id": session_id,
            "academic_stage": "Class 12"
        })
        
        # Submit answers sequentially
        for q_id, ans in answers:
            res = client.post(f"/assessment/{session_id}/answer", json={
                "question_id": q_id,
                "answer": ans
            })
            assert res.status_code == 200, res.text
            payload = res.json()
            
        assert payload["status"] == "completed"
        
        # Get final state/profile to score against candidates
        state = load_state(session_id)
        from app.services.scoring_engine import score_candidates_stateless
        
        candidates = [
            {"id": "1", "slug": "software-engineer", "title": "Software Engineer", "type": "CAREER", "careerFamily": "Technology"},
            {"id": "2", "slug": "doctor", "title": "Doctor", "type": "CAREER", "careerFamily": "Healthcare"},
            {"id": "3", "slug": "graphic-designer", "title": "Graphic Designer", "type": "CAREER", "careerFamily": "Creative"}
        ]
        
        from app.api.assessment_routes import _extract_profile
        profile = _extract_profile(state)
        scored = score_candidates_stateless(profile, candidates)
        
        # Verify Software Engineer is top and has high differentiation
        assert scored[0]["slug"] == "software-engineer"
        assert scored[0]["match_score"] > 80
        # Doctor/Designer should be significantly lower (e.g. baseline or close to baseline)
        doctor = next(c for c in scored if c["slug"] == "doctor")
        assert doctor["match_score"] == 60 # No matching keywords in pcm trace
        
    finally:
        clean_state(session_id)
