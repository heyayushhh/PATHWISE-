import json
from typing import Any, Dict, List
from langgraph.graph import StateGraph, START, END

from app.schemas.roadmap_schema import PersonalizedRoadmapResponse
from app.services.gemini_client import gemini_client

def get_roadmap_system_prompt() -> str:
    return """You are a master career and academic counselor. Your task is to generate a structured, personalized roadmap for a student.

You MUST follow the constraints:
1. ONLY reference canonical entities (courses, careers, skills) provided in the ALLOWLIST.
2. If you want to include a resource, ensure its canonicalSlug exactly matches an item from the allowlist.
3. Tailor the tone, priority, and next steps to the student's specific profile (interests, strengths, work styles).
4. Do NOT invent or hallucinate new courses, careers, or academic directions.
5. Create a logical milestone progression (e.g., High School -> Entrance Exams -> College -> Entry Role).

Return ONLY valid JSON matching the exact schema requested."""

# LangGraph State
class RoadmapState(Dict[str, Any]):
    context: Dict[str, Any]
    roadmap_type: str
    allowlist: List[Dict[str, str]]
    generated_roadmap: Dict[str, Any]
    final_output: Dict[str, Any]
    error: str

def load_context(state: RoadmapState) -> RoadmapState:
    print("\n========== LOAD CONTEXT ==========")
    return state

def determine_roadmap_type(state: RoadmapState) -> RoadmapState:
    print("\n========== DETERMINE ROADMAP TYPE ==========")
    target = state["context"].get("selectedTarget", {})
    state["roadmap_type"] = target.get("recommendationType", "UNKNOWN")
    return state

def build_canonical_allowlist(state: RoadmapState) -> RoadmapState:
    print("\n========== BUILD CANONICAL ALLOWLIST ==========")
    allowlist = []
    canonical = state["context"].get("canonicalTarget", {})
    
    # Target itself
    slug = canonical.get("slug")
    if slug:
        allowlist.append({"type": "target", "slug": slug})
    
    # Related courses
    for course in canonical.get("relatedCourses", []):
        if course.get("slug"):
            allowlist.append({"type": "course", "slug": course["slug"]})
            
    # Related careers
    for career in canonical.get("relatedCareers", []):
        if career.get("slug"):
            allowlist.append({"type": "career", "slug": career["slug"]})
            
    # Related skills
    for skill in canonical.get("relatedSkills", []):
        if skill.get("name"): # Skills might not have slugs, but names
            allowlist.append({"type": "skill", "slug": skill["name"].lower().replace(' ', '-')})
            
    state["allowlist"] = allowlist
    return state

def generate_roadmap(state: RoadmapState) -> RoadmapState:
    print("\n========== GENERATE ROADMAP ==========")
    
    prompt = f"""
Student Profile:
{json.dumps(state['context'].get('assessmentProfile', {}), indent=2)}

Selected Target: {state['context'].get('canonicalTarget', {}).get('title', 'Unknown')}
Target Type: {state['roadmap_type']}
Match Score: {state['context'].get('matchScore', 0)}%

Canonical Allowlist (ONLY use these slugs if referencing resources):
{json.dumps(state['allowlist'], indent=2)}

Personalized Insight for Context:
{json.dumps(state['context'].get('personalizedInsight', {}), indent=2)}

Generate the personalized roadmap.
"""
    try:
        response_model = PersonalizedRoadmapResponse
        full_prompt = get_roadmap_system_prompt() + "\n\n" + prompt
        
        response_text = gemini_client.generate_structured_content(
            prompt=full_prompt,
            schema=response_model
        )
        if response_text:
            state["generated_roadmap"] = json.loads(response_text)
        else:
            state["error"] = "Gemini generation failed: empty response"
    except Exception as e:
        state["error"] = str(e)
        
    return state

def validate_and_sanitize(state: RoadmapState) -> RoadmapState:
    print("\n========== VALIDATE & SANITIZE ==========")
    if state.get("error") or not state.get("generated_roadmap"):
        return state
        
    roadmap = state["generated_roadmap"]
    allowed_slugs = {item["slug"] for item in state.get("allowlist", [])}
    
    # Sanitize milestones
    for i, milestone in enumerate(roadmap.get("milestones", [])):
        milestone["order"] = i + 1
        valid_resources = []
        for res in milestone.get("canonicalResources", []):
            if res.get("canonicalSlug") in allowed_slugs:
                valid_resources.append(res)
        milestone["canonicalResources"] = valid_resources
        
    state["final_output"] = roadmap
    return state


def build_roadmap_graph():
    workflow = StateGraph(RoadmapState)
    
    workflow.add_node("load_context", load_context)
    workflow.add_node("determine_roadmap_type", determine_roadmap_type)
    workflow.add_node("build_canonical_allowlist", build_canonical_allowlist)
    workflow.add_node("generate_roadmap", generate_roadmap)
    workflow.add_node("validate_and_sanitize", validate_and_sanitize)
    
    workflow.add_edge(START, "load_context")
    workflow.add_edge("load_context", "determine_roadmap_type")
    workflow.add_edge("determine_roadmap_type", "build_canonical_allowlist")
    workflow.add_edge("build_canonical_allowlist", "generate_roadmap")
    workflow.add_edge("generate_roadmap", "validate_and_sanitize")
    workflow.add_edge("validate_and_sanitize", END)
    
    return workflow.compile()

roadmap_graph = build_roadmap_graph()

def generate_roadmap_flow(context: Dict[str, Any]) -> Dict[str, Any]:
    initial_state = RoadmapState(
        context=context,
        roadmap_type="",
        allowlist=[],
        generated_roadmap={},
        final_output={},
        error=""
    )
    
    result = roadmap_graph.invoke(initial_state)
    
    if result.get("error") or not result.get("final_output"):
        raise ValueError(result.get("error", "Failed to generate valid roadmap structure"))
        
    return result["final_output"]
