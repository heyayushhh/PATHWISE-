import sys
import uuid
from pathlib import Path

from fastapi.testclient import TestClient

APP_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(APP_ROOT))

from app.main import app


client = TestClient(app)


def _state_path(session_id: str) -> Path:
    return Path(__file__).resolve().parent.parent / "app" / "data" / "assessments" / f"{session_id}.json"


def test_dynamic_assessment_flow_uses_ms1_session_id():
    session_id = f"test-session-{uuid.uuid4()}"
    state_file = _state_path(session_id)
    if state_file.exists():
        state_file.unlink()

    start_response = client.post(
        "/assessment/start",
        json={
            "user_id": "demo-user",
            "assessment_type": "career_interest",
            "session_id": session_id,
        },
    )

    assert start_response.status_code == 200, start_response.text
    payload = start_response.json()
    assert payload["session_id"] == session_id
    assert payload["question"]

    q1_id = payload.get("question_id", "start")
    first_answer_response = client.post(
        f"/assessment/{session_id}/answer",
        json={
            "question_id": q1_id,
            "answer": "I enjoy coding, algorithms and mathematics"
        },
    )

    assert first_answer_response.status_code == 200, first_answer_response.text
    first_turn = first_answer_response.json()
    assert first_turn["session_id"] == session_id
    assert first_turn["question"]
    assert first_turn["question"] != payload["question"]

    q2_id = first_turn.get("question_id", "next_q")
    second_answer_response = client.post(
        f"/assessment/{session_id}/answer",
        json={
            "question_id": q2_id,
            "answer": "I am interested in biology, medicine and helping people"
        },
    )

    assert second_answer_response.status_code == 200, second_answer_response.text
    second_turn = second_answer_response.json()
    assert second_turn["session_id"] == session_id
    assert second_turn["question"]

    if state_file.exists():
        state_file.unlink()
