from pydantic import BaseModel, Field
from typing import List

class ExplorePersonalizeRequest(BaseModel):
    entityType: str
    entitySummary: str
    matchScore: int
    studentProfile: dict
    allowedSlugs: List[str]

class PersonalizedOpportunity(BaseModel):
    canonicalSlug: str = Field(description="Must exactly match one of the allowedSlugs.")
    reason: str = Field(description="Why this specific opportunity fits the student.")

class PersonalizedInsightResponse(BaseModel):
    summary: str = Field(description="A concise personalized summary of why this path/course/career fits the student.")
    whyItFits: List[str] = Field(description="Bullet points explaining the alignment.", max_length=5)
    considerations: List[str] = Field(description="Important things the student should consider or watch out for.", max_length=3)
    personalizedOpportunities: List[PersonalizedOpportunity] = Field(
        description="Relevant opportunities strictly chosen from the allowed list."
    )
