from pydantic import BaseModel, Field
from typing import List, Optional


class CareerRequest(BaseModel):
    education: str = Field(..., example="B.Tech CSE")
    interests: List[str] = Field(
        ..., example=["Artificial Intelligence", "Programming"]
    )
    skills: List[str] = Field(
        ..., example=["Python", "Java", "SQL"]
    )
    goal: str = Field(
        ..., example="Software Engineer"
    )


class CareerRecommendation(BaseModel):
    career: str
    reason: str
    required_skills: List[str]


class CareerResponse(BaseModel):
    recommendations: List[CareerRecommendation]


# ---------- Assessment-Based Recommendation ----------


class AssessmentAnswer(BaseModel):
    """A single answer from the completed assessment."""

    question: str
    selectedOption: str
    score: int = Field(..., ge=1, le=5)


class AssessmentPayload(BaseModel):
    """
    Payload sent from MS1 after completing static assessment.
    Contains no database IDs — only human-readable data.
    """

    userId: str
    assessmentType: str
    answers: List[AssessmentAnswer]


class CareerDetailResponse(BaseModel):
    """Detailed career recommendation with full metadata."""

    title: str

    matchScore: float = Field(
        ..., ge=0, le=100
    )

    whyRecommended: str

    requiredSkills: List[str]

    futureDemand: str

    salaryRange: str

    learningRoadmapId: Optional[str] = None


class AssessmentRecommendationResponse(BaseModel):
    """Full response from the recommendation engine."""

    careers: List[CareerDetailResponse]

    explanation: str = ""