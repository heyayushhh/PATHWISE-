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
        assert payload["total_questions"] == 7

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


# =====================================================================
# REGRESSION AND DYNAMIC VALIDATION TESTS
# =====================================================================

def run_end_to_end_assessment(stage: str, answers: list[tuple[str, str]], expect_clarification: bool = False, clarification_answer: str = None):
    session_id = f"test-e2e-{uuid.uuid4()}"
    try:
        # Start
        res = client.post("/assessment/start", json={
            "user_id": "test-user",
            "session_id": session_id,
            "academic_stage": stage
        })
        assert res.status_code == 200, res.text
        
        # Answer all base path questions
        for q_id, ans in answers:
            # Verify continue response contains valid question/options
            res = client.post(f"/assessment/{session_id}/answer", json={
                "question_id": q_id,
                "answer": ans
            })
            assert res.status_code == 200, res.text
            payload = res.json()
            assert payload["status"] in ["continue", "completed"]
            if payload["status"] == "continue":
                assert payload["question"] is not None
                assert isinstance(payload["options"], list) and len(payload["options"]) >= 2
            
        if expect_clarification:
            assert payload["status"] == "continue"
            assert payload["question_id"] in ["adaptive_1", "predefined_clarification"]
            
            # Answer clarification - first submission should complete successfully
            res = client.post(f"/assessment/{session_id}/answer", json={
                "question_id": payload["question_id"],
                "answer": clarification_answer or "Some clarification answer"
            })
            assert res.status_code == 200, res.text
            payload = res.json()
            
        assert payload["status"] == "completed"
        assert payload["question"] is None
        assert payload["options"] is None
        
        # Verify status endpoint returns the complete answers array
        status_res = client.get(f"/assessment/{session_id}")
        assert status_res.status_code == 200, status_res.text
        status_payload = status_res.json()
        assert status_payload["status"] == "completed"
        assert len(status_payload["answers"]) == len(answers) + (1 if expect_clarification else 0)
        
        # Verify retry of final question returns same completed payload
        final_q_id = payload["question_id"] or answers[-1][0] if not expect_clarification else "predefined_clarification"
        final_ans = answers[-1][1] if not expect_clarification else (clarification_answer or "Some clarification answer")
        retry_res = client.post(f"/assessment/{session_id}/answer", json={
            "question_id": final_q_id,
            "answer": final_ans
        })
        assert retry_res.status_code == 200, retry_res.text
        retry_payload = retry_res.json()
        assert retry_payload["status"] == "completed"
        
    finally:
        clean_state(session_id)


def test_class_10_science_certain():
    answers = [
        ("start", "Science & Technology"),
        ("science_tech", "Mathematics & Problem Solving"),
        ("subjects", "Mathematics"),
        ("strengths", "Logical reasoning & analytical problem solving"),
        ("work_style", "Solving complex problems individually"),
        ("career_values", "Constant learning, innovation & intellectual challenge"),
        ("certainty", "Very certain")
    ]
    run_end_to_end_assessment("Class 10", answers, expect_clarification=False)


def test_class_10_business_uncertain():
    answers = [
        ("start", "Business, Finance & Entrepreneurship"),
        ("business_finance", "Starting my own company (Entrepreneurship)"),
        ("subjects", "Languages & Literature"),
        ("strengths", "Creative writing, debate & communication"),
        ("work_style", "Leading and organizing people to achieve a goal"),
        ("career_values", "High earning potential & financial success"),
        ("certainty", "Not clear at all — I am completely open to exploration")
    ]
    run_end_to_end_assessment(
        "Class 10", 
        answers, 
        expect_clarification=True, 
        clarification_answer="Deciding between Science and Commerce"
    )


def test_class_10_creative_certain():
    answers = [
        ("start", "Creative Design & Media"),
        ("creative_media", "Graphic Design or UI/UX Design"),
        ("subjects", "Art, Music or Craft"),
        ("strengths", "Visual design, artistic creation & spatial thinking"),
        ("work_style", "Collaborating with a team on creative ideas"),
        ("career_values", "Constant learning, innovation & intellectual challenge"),
        ("certainty", "Very certain")
    ]
    run_end_to_end_assessment("Class 10", answers, expect_clarification=False)


def test_class_12_pcm_certain():
    answers = [
        ("start", "Science — PCM (Physics, Chemistry, Mathematics)"),
        ("pcm_interest", "Engineering & Technology"),
        ("pcm_programming", "Highly interested (I code or want to learn)"),
        ("pcm_style", "Analytical and abstract (math/algorithms)"),
        ("subjects", "Mathematics / Statistics"),
        ("strengths", "Logical & Analytical reasoning"),
        ("activities", "Programming/building projects"),
        ("work_style", "Remote/flexible work"),
        ("career_values", "High income potential"),
        ("certainty", "Very certain")
    ]
    run_end_to_end_assessment("Class 12", answers, expect_clarification=False)


def test_class_12_pcb_uncertain():
    answers = [
        ("start", "Science — PCB (Physics, Chemistry, Biology)"),
        ("pcb_interest", "Medicine (MBBS/BDS)"),
        ("pcb_patient", "I would love to treat and help patients directly"),
        ("pcb_environment", "Human Anatomy and Physiology"),
        ("subjects", "Biology / Biotechnology"),
        ("strengths", "Practical & Technical skills"),
        ("activities", "Socializing/helping community"),
        ("work_style", "Working outdoors/on-field"),
        ("career_values", "Direct social impact"),
        ("certainty", "Uncertain / Exploring")
    ]
    run_end_to_end_assessment(
        "Class 12", 
        answers, 
        expect_clarification=True, 
        clarification_answer="Whether my field has job demand"
    )


def test_postgres_sync_replicates_state_exactly():
    """Explicitly simulate P0 state loss and restore sequence to confirm sync works."""
    session_id = f"test-restore-{uuid.uuid4()}"
    try:
        # 1. Start Assessment
        res = client.post("/assessment/start", json={
            "user_id": "test-user",
            "session_id": session_id,
            "academic_stage": "Class 10"
        })
        assert res.status_code == 200, res.text
        
        # 2. Answer up to certainty (uncertain)
        answers = [
            ("start", "Science & Technology"),
            ("science_tech", "Mathematics & Problem Solving"),
            ("subjects", "Mathematics"),
            ("strengths", "Logical reasoning & analytical problem solving"),
            ("work_style", "Solving complex problems individually"),
            ("career_values", "Constant learning, innovation & intellectual challenge"),
            ("certainty", "Not clear at all — I am completely open to exploration")
        ]
        for q_id, ans in answers:
            res = client.post(f"/assessment/{session_id}/answer", json={
                "question_id": q_id,
                "answer": ans
            })
            assert res.status_code == 200, res.text
            payload = res.json()
            
        assert payload["status"] == "continue"
        assert payload["question_id"] == "predefined_clarification"
        
        # 3. Simulate MS2 404/State Loss: Load answers from status endpoint (MS1 fetches status)
        status_res = client.get(f"/assessment/{session_id}")
        assert status_res.status_code == 200, status_res.text
        status_payload = status_res.json()
        assert "answers" in status_payload
        assert len(status_payload["answers"]) == len(answers)
        
        # Simulate state loss by deleting MS2 file from disk
        clean_state(session_id)
        
        # Reconstruct the exact MS2 state structure in MS1 format
        question_history = [
            {
                "question": a.get("question"),
                "question_id": a.get("question_id"),
                "category": a.get("category"),
                "answer": a.get("answer"),
                "iteration": idx + 1
            }
            for idx, a in enumerate(status_payload["answers"])
        ]
        asked_categories = [a.get("category") for a in status_payload["answers"] if a.get("category")]
        
        restored_state = {
            "user_id": "test-user",
            "session_id": session_id,
            "academic_stage": "Class 10",
            "answers": status_payload["answers"],
            "current_question": {"id": "predefined_clarification"},
            "question_history": question_history,
            "asked_categories": asked_categories,
            "remaining_categories": [],
            "iteration_count": len(status_payload["answers"]),
            "max_questions": 12,
            "confidence_threshold": 0.85,
            "is_complete": False
        }
        
        # Call MS2 restore
        restore_res = client.post("/assessment/restore", json={
            "session_id": session_id,
            "state": restored_state
        })
        assert restore_res.status_code == 200, restore_res.text
        
        # 4. Answer predefined_clarification on the restored state - FIRST submission must succeed
        res = client.post(f"/assessment/{session_id}/answer", json={
            "question_id": "predefined_clarification",
            "answer": "Deciding between Science and Commerce"
        })
        assert res.status_code == 200, res.text
        payload = res.json()
        assert payload["status"] == "completed"
        
        # 5. Verify the restored session remains completed
        status_res = client.get(f"/assessment/{session_id}")
        assert status_res.status_code == 200, status_res.text
        status_payload = status_res.json()
        assert status_payload["status"] == "completed"
        assert status_payload["is_complete"] is True
        
    finally:
        clean_state(session_id)

