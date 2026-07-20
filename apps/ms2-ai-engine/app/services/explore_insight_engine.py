import json
import logging
from typing import TypedDict, Optional
from langgraph.graph import StateGraph, START, END
from app.schemas.explore_schema import ExplorePersonalizeRequest, PersonalizedInsightResponse
from app.services.gemini_client import gemini_client

logger = logging.getLogger(__name__)

class ExploreInsightState(TypedDict):
    request: ExplorePersonalizeRequest
    prompt: Optional[str]
    raw_insight: Optional[str]
    insight_dict: Optional[dict]
    error: Optional[str]

def load_context(state: ExploreInsightState):
    """Format the context into a prompt."""
    req = state["request"]
    
    prompt = f"""
    You are an expert career and academic counselor.
    Provide a highly personalized explanation of why this specific {req.entityType} is a good fit for the student.
    
    Entity Type: {req.entityType}
    Entity Summary: {req.entitySummary}
    Recommendation Match Score: {req.matchScore}/100
    
    Student Profile Context:
    {json.dumps(req.studentProfile, indent=2)}
    
    Allowed Slugs for Opportunities (You MUST ONLY use these exact slugs if you recommend opportunities):
    {req.allowedSlugs}
    
    Generate the response strictly according to the requested JSON schema. Do not invent any canonical slugs. If no allowed slugs fit, leave personalizedOpportunities empty.
    """
    
    return {"prompt": prompt}

def generate_insight(state: ExploreInsightState):
    """Call Gemini to generate the insight."""
    if state.get("error"):
        return state
        
    try:
        raw_output = gemini_client.generate_structured_content(
            prompt=state["prompt"], 
            schema=PersonalizedInsightResponse
        )
        return {"raw_insight": raw_output}
    except Exception as e:
        logger.error(f"Gemini generation failed: {e}")
        return {"error": str(e)}

def validate_insight(state: ExploreInsightState):
    """Parse and validate the JSON output."""
    if state.get("error"):
        return state
        
    try:
        data = json.loads(state["raw_insight"])
        # Validate through Pydantic
        validated = PersonalizedInsightResponse(**data)
        return {"insight_dict": validated.model_dump()}
    except Exception as e:
        logger.error(f"Validation failed: {e}")
        return {"error": str(e)}

def sanitize_canonical_references(state: ExploreInsightState):
    """Ensure no unauthorized slugs slipped through."""
    if state.get("error") or not state.get("insight_dict"):
        return state
        
    insight = state["insight_dict"]
    allowed = set(state["request"].allowedSlugs)
    
    valid_opps = []
    for opp in insight.get("personalizedOpportunities", []):
        if opp.get("canonicalSlug") in allowed:
            valid_opps.append(opp)
        else:
            logger.warning(f"Discarding unauthorized slug from Gemini: {opp.get('canonicalSlug')}")
            
    insight["personalizedOpportunities"] = valid_opps
    return {"insight_dict": insight}

# Build LangGraph flow
workflow = StateGraph(ExploreInsightState)

workflow.add_node("load_context", load_context)
workflow.add_node("generate_insight", generate_insight)
workflow.add_node("validate_insight", validate_insight)
workflow.add_node("sanitize_canonical_references", sanitize_canonical_references)

workflow.add_edge(START, "load_context")
workflow.add_edge("load_context", "generate_insight")
workflow.add_edge("generate_insight", "validate_insight")
workflow.add_edge("validate_insight", "sanitize_canonical_references")
workflow.add_edge("sanitize_canonical_references", END)

explore_app = workflow.compile()

def run_explore_insight_engine(request: ExplorePersonalizeRequest):
    initial_state = ExploreInsightState(request=request)
    result = explore_app.invoke(initial_state)
    
    if result.get("error"):
        return {"error": result["error"]}
        
    return {"insight": result["insight_dict"]}
