from pydantic import BaseModel, Field
from typing import List, Optional


# ---------- Adaptive Assessment ----------


class AdaptiveStartRequest(BaseModel):
    """Payload from MS1 to start an adaptive assessment."""

    userId: str = Field(
        ..., description="User UUID from MS1"
    )

    assessmentType: str = Field(
        default="career_interest",
        description="Type of assessment"
    )


class GeneratedQuestion(BaseModel):
    """A single AI-generated question with options."""

    id: str = Field(
        ..., description="Unique question identifier"
    )

    questionText: str

    options: List[str]

    domain: str = Field(
        ...,
        description="Topic domain this question explores"
    )


class AdaptiveStartResponse(BaseModel):
    """Response with first batch of questions + state."""

    questions: List[GeneratedQuestion]

    state: dict = Field(
        ...,
        description="Opaque graph state to send back with answers"
    )

    isComplete: bool = False


class AnswerItem(BaseModel):
    """A single answer submitted by the user."""

    questionId: str

    questionText: str

    selectedOption: str

    score: int = Field(
        ..., ge=1, le=5
    )


class AdaptiveNextRequest(BaseModel):
    """Payload from MS1 with answers + current state."""

    userId: str

    answers: List[AnswerItem]

    state: dict = Field(
        ...,
        description="Graph state from previous response"
    )


class CareerDetail(BaseModel):
    """Detailed career recommendation."""

    title: str

    matchScore: float = Field(
        ..., ge=0, le=100
    )

    whyRecommended: str

    requiredSkills: List[str]

    futureDemand: str

    salaryRange: str

    learningRoadmapId: Optional[str] = None


class AdaptiveNextResponse(BaseModel):
    """Response with next questions OR final recommendations."""

    questions: List[GeneratedQuestion] = []

    state: dict = {}

    isComplete: bool = False

    careers: List[CareerDetail] = []

    explanation: str = ""
