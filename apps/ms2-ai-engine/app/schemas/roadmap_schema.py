from pydantic import BaseModel, Field
from typing import List, Optional

class RoadmapAction(BaseModel):
    title: str = Field(..., max_length=150, description="The title of the action")
    description: str = Field(..., max_length=500, description="Detailed description of the action")
    priority: str = Field(..., description="High, Medium, or Low")
    timeframe: str = Field(..., max_length=100, description="Suggested timeframe (e.g. 'Month 1-3')")

class RoadmapResource(BaseModel):
    type: str = Field(..., description="The entity type: 'course', 'career', or 'skill'")
    canonicalSlug: str = Field(..., description="The exact slug of the canonical entity from Pathwise")
    title: str = Field(..., max_length=150, description="The title of the canonical resource")
    reason: str = Field(..., max_length=300, description="Why this resource is relevant")

class RoadmapMilestone(BaseModel):
    id: int = Field(..., description="Sequential ID or order of the milestone")
    order: int = Field(..., description="Sequential order starting from 1")
    title: str = Field(..., max_length=150, description="Title of the milestone")
    stage: str = Field(..., max_length=100, description="e.g. 'Class 11', 'Graduation', 'Entry Level'")
    timeframe: str = Field(..., max_length=100, description="Timeframe for the milestone")
    description: str = Field(..., max_length=1000, description="Detailed description")
    objectives: List[str] = Field(default_factory=list, description="Key objectives to achieve")
    actions: List[RoadmapAction] = Field(default_factory=list, description="Action items")
    skills: List[str] = Field(default_factory=list, description="Skills to acquire (free text)")
    canonicalResources: List[RoadmapResource] = Field(default_factory=list, description="Canonical linked resources")
    completionCriteria: List[str] = Field(default_factory=list, description="Criteria for passing this milestone")

class PersonalizedRoadmapResponse(BaseModel):
    title: str = Field(..., max_length=200, description="Title of the roadmap")
    summary: str = Field(..., max_length=1000, description="Executive summary of the roadmap")
    academicStage: str = Field(..., description="The academic stage of the user")
    targetType: str = Field(..., description="The type of target (ACADEMIC_DIRECTION, COURSE, CAREER)")
    targetSlug: str = Field(..., description="The canonical slug of the target")
    targetTitle: str = Field(..., description="The title of the target")
    milestones: List[RoadmapMilestone] = Field(default_factory=list, description="The chronological milestones")
    immediateNextSteps: List[str] = Field(default_factory=list, description="3-5 immediate actionable steps")
    considerations: List[str] = Field(default_factory=list, description="Important considerations for the student")
    longTermOutlook: str = Field(..., description="Long term outlook and possibilities")
