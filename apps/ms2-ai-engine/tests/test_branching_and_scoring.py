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
            res = client.post(f"/assessment/{session_id}/answer", json={
                "question_id": q_id,
                "answer": ans
            })
            assert res.status_code == 200, res.text
            payload = res.json()
            
        if expect_clarification:
            assert payload["status"] == "continue"
            assert payload["question_id"] in ["adaptive_1", "predefined_clarification"]
            
            # Answer clarification
            res = client.post(f"/assessment/{session_id}/answer", json={
                "question_id": payload["question_id"],
                "answer": clarification_answer or "Some clarification answer"
            })
            assert res.status_code == 200, res.text
            payload = res.json()
            
        assert payload["status"] == "completed"
        
    finally:
        clean_state(session_id)


# --- Class 10 Regression Tests (3 branches, certain & uncertain) ---

def test_class_10_science_certain():
    # 7 Qs base: start -> science_tech (not sub branch) -> subjects -> strengths -> work_style -> career_values -> certainty (certain)
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
    # 7 Qs base + 1 clarification: start -> business_finance -> subjects -> strengths -> work_style -> career_values -> certainty (uncertain) -> clarification
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
    # 7 Qs base: start -> creative_media -> subjects -> strengths -> work_style -> career_values -> certainty (certain)
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


# --- Class 12 Regression Tests (PCM, PCB, Commerce, Arts both certain & uncertain) ---

def test_class_12_pcm_certain():
    # 9 Qs base: start -> pcm_interest -> pcm_programming -> pcm_style -> subjects -> strengths -> activities -> work_style -> career_values -> certainty (certain)
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
    # 9 Qs base + 1 clarification: start -> pcb_interest -> pcb_patient -> pcb_environment -> subjects -> strengths -> activities -> work_style -> career_values -> certainty (uncertain) -> clarification
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
        clarification_answer="Whether my chosen field has high future job demand"
    )

def test_class_12_commerce_certain():
    # 9 Qs base: start -> commerce_interest -> commerce_math -> commerce_style -> subjects -> strengths -> activities -> work_style -> career_values -> certainty (certain)
    answers = [
        ("start", "Commerce"),
        ("commerce_interest", "Chartered Accountancy (CA/CS)"),
        ("commerce_math", "Very comfortable (I enjoy working with numbers/budgets)"),
        ("commerce_style", "Stock markets and investments"),
        ("subjects", "Accountancy / Business Studies"),
        ("strengths", "Logical & Analytical reasoning"),
        ("activities", "Reading & learning new topics"),
        ("work_style", "A fast-paced corporate office"),
        ("career_values", "Job stability and security"),
        ("certainty", "Very certain")
    ]
    run_end_to_end_assessment("Class 12", answers, expect_clarification=False)

def test_class_12_arts_uncertain():
    # 9 Qs base + 1 clarification: start -> arts_interest -> arts_deep_dive -> arts_style -> subjects -> strengths -> activities -> work_style -> career_values -> certainty (uncertain) -> clarification
    answers = [
        ("start", "Arts / Humanities"),
        ("arts_interest", "Law & Legal Studies"),
        ("arts_deep_dive", "Public speaking and debate"),
        ("arts_style", "Politics & Governance"),
        ("subjects", "Economics / Social Sciences"),
        ("strengths", "Verbal & Written communication"),
        ("activities", "Talking to people and debate"),
        ("work_style", "A creative studio or agency"),
        ("career_values", "Creative freedom"),
        ("certainty", "Uncertain / Exploring")
    ]
    run_end_to_end_assessment(
        "Class 12", 
        answers, 
        expect_clarification=True, 
        clarification_answer="I am interested in too many different fields"
    )
