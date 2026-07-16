from pydantic import BaseModel, Field
from typing import List


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