import pytest
from app.services.roadmap_engine import generate_roadmap_flow
from unittest.mock import patch

def test_roadmap_flow_sanitizes_hallucinations():
    # Setup context
    context = {
        "assessmentProfile": {"academicStage": "Class 12"},
        "selectedTarget": {"recommendationType": "CAREER", "entityId": "123"},
        "canonicalTarget": {
            "slug": "data-scientist",
            "title": "Data Scientist",
            "relatedCourses": [{"slug": "bsc-computer-science"}],
            "relatedCareers": []
        }
    }
    
    # Mock Gemini to return a hallucinated course
    hallucinated_response = {
        "title": "Path to Data Scientist",
        "summary": "...",
        "academicStage": "Class 12",
        "targetType": "CAREER",
        "targetSlug": "data-scientist",
        "targetTitle": "Data Scientist",
        "milestones": [
            {
                "id": 1,
                "order": 1,
                "title": "College",
                "stage": "Graduation",
                "timeframe": "3 years",
                "description": "...",
                "objectives": [],
                "actions": [],
                "skills": [],
                "canonicalResources": [
                    {"type": "course", "canonicalSlug": "bsc-computer-science", "title": "BSc CS", "reason": "Good"},
                    {"type": "course", "canonicalSlug": "hallucinated-course-123", "title": "Fake Course", "reason": "Bad"}
                ],
                "completionCriteria": []
            }
        ],
        "immediateNextSteps": [],
        "considerations": [],
        "longTermOutlook": "..."
    }
    
    import json
    
    with patch("app.services.roadmap_engine.gemini_client.generate_structured_content") as mock_gen:
        mock_gen.return_value = json.dumps(hallucinated_response)
        
        result = generate_roadmap_flow(context)
        
        # Verify the hallucinated course was stripped out
        resources = result["milestones"][0]["canonicalResources"]
        assert len(resources) == 1
        assert resources[0]["canonicalSlug"] == "bsc-computer-science"
