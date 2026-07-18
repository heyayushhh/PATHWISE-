from typing import Any, Optional

from pydantic import BaseModel, Field


class AssessmentStartRequest(BaseModel):
    """Payload for starting a new adaptive assessment."""

    user_id: str = Field(..., min_length=1, description="User identifier from MS1")
    session_id: Optional[str] = Field(default=None, description="Session identifier created by MS1")
    assessment_type: str = Field(default="adaptive", description="Assessment type")
    academic_stage: Optional[str] = Field(default=None, description="Class 10 or Class 12")


class AssessmentAnswerRequest(BaseModel):
    """Payload for submitting an answer to an ongoing assessment."""

    answer: str = Field(..., min_length=1, description="User answer text")


class AssessmentStartResponse(BaseModel):
    """Response returned when starting an assessment."""

    session_id: str
    question: Optional[str] = None
    options: Optional[list[str]] = None
    category: Optional[str] = None
    status: str = "continue"
    confidence_score: Optional[float] = None
    progress: Optional[int] = None
    question_number: Optional[int] = None
    total_questions: Optional[int] = None


class AssessmentTurnResponse(BaseModel):
    """Response returned after an assessment turn."""

    status: str
    session_id: str
    question: Optional[str] = None
    options: Optional[list[str]] = None
    category: Optional[str] = None
    recommendations: Optional[list[dict[str, Any]]] = None
    confidence_score: Optional[float] = None
    progress: Optional[int] = None
    explanation: Optional[str] = None
    question_number: Optional[int] = None
    total_questions: Optional[int] = None


class AssessmentStatusResponse(BaseModel):
    """Response returned for assessment status lookup."""

    session_id: str
    status: str
    current_question: Optional[str] = None
    confidence_score: Optional[float] = None
    progress: Optional[int] = None
    is_complete: bool = False


class AssessmentResultResponse(BaseModel):
    """Response returned for a completed assessment result."""

    session_id: str
    status: str
    recommendations: list[dict[str, Any]] = []
    confidence_score: Optional[float] = None
    progress: Optional[int] = None
    explanation: Optional[str] = None
    answers: list[dict[str, Any]] = []
