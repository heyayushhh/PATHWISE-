import sys
from pathlib import Path

APP_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(APP_ROOT))

from app.services.question_generator import CLASS_10_QUESTIONS, CLASS_12_QUESTIONS

def test_class_10_graph_integrity():
    bank = CLASS_10_QUESTIONS
    for q_id, q_data in bank.items():
        assert "question" in q_data, f"Question {q_id} missing question text"
        assert "options" in q_data, f"Question {q_id} missing options"
        assert isinstance(q_data["options"], list), f"Question {q_id} options must be a list"
        assert len(q_data["options"]) >= 2, f"Question {q_id} options must have at least 2 elements"
        
        # Check branches
        if "branches" in q_data:
            for option, target in q_data["branches"].items():
                assert option in q_data["options"], f"Branch option '{option}' in {q_id} is not in options list"
                assert target in bank, f"Branch target '{target}' from {q_id} does not exist in CLASS_10_QUESTIONS"
                
        # Check next pointer
        if "next" in q_data:
            target = q_data["next"]
            assert target in ["end", "END"] or target in bank, f"Next pointer '{target}' in {q_id} does not exist in CLASS_10_QUESTIONS"

def test_class_12_graph_integrity():
    bank = CLASS_12_QUESTIONS
    for q_id, q_data in bank.items():
        assert "question" in q_data, f"Question {q_id} missing question text"
        assert "options" in q_data, f"Question {q_id} missing options"
        assert isinstance(q_data["options"], list), f"Question {q_id} options must be a list"
        assert len(q_data["options"]) >= 2, f"Question {q_id} options must have at least 2 elements"
        
        # Check branches
        if "branches" in q_data:
            for option, target in q_data["branches"].items():
                assert option in q_data["options"], f"Branch option '{option}' in {q_id} is not in options list"
                assert target in bank, f"Branch target '{target}' from {q_id} does not exist in CLASS_12_QUESTIONS"
                
        # Check next pointer
        if "next" in q_data:
            target = q_data["next"]
            assert target in ["end", "END"] or target in bank, f"Next pointer '{target}' in {q_id} does not exist in CLASS_12_QUESTIONS"


if __name__ == "__main__":
    print("Running Class 10 graph integrity checks...")
    test_class_10_graph_integrity()
    print("Class 10 check passed!")
    print("Running Class 12 graph integrity checks...")
    test_class_12_graph_integrity()
    print("Class 12 check passed!")
    print("Graph integrity validation successful!")
