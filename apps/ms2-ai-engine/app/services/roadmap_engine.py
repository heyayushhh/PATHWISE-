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
    print("\n========== GENERATE ROADMAP (V2) ==========")
    
    canonical_target = state['context'].get('canonicalTarget', {})
    profile = state['context'].get('assessmentProfile', {})
    
    # Extract details for career grounding
    title = canonical_target.get('title', 'Unknown')
    short_desc = canonical_target.get('shortDescription', '')
    full_desc = canonical_target.get('fullDescription', '')
    family = canonical_target.get('careerFamily', '')
    industry = canonical_target.get('industry', '')
    responsibilities = canonical_target.get('typicalResponsibilities', [])
    pathways = canonical_target.get('educationPathways', [])
    progression = canonical_target.get('progression', [])
    opportunities = canonical_target.get('futureOpportunities', [])
    skills = [s.get('name') for s in canonical_target.get('relatedSkills', [])]
    courses = [c.get('title') for c in canonical_target.get('relatedCourses', [])]
    
    student_stage = profile.get('academicStage', 'Class 10')
    stream = profile.get('currentStream', '')
    
    prompt = f"""
You are generating a highly personalized, structured career-specific roadmap for:
Target Career: {title}
Career Family: {family}
Industry: {industry}
Career Description: {short_desc} {full_desc}

Career Context (Grounding - Do NOT contradict these facts or invent unrelated requirements):
- Typical Responsibilities: {json.dumps(responsibilities)}
- Education Pathways: {json.dumps(pathways)}
- Career Progression: {json.dumps(progression)}
- Skills Required: {json.dumps(skills)}
- Recommended Courses: {json.dumps(courses)}

Student Profile:
- Current Academic Stage: {student_stage}
- Current Stream: {stream}
- Profile Details: {json.dumps(profile, indent=2)}

Task:
Generate a career-specific milestone roadmap starting from the student's CURRENT academic stage ({student_stage}) leading to the target career ({title}).

Prompt V2 Strict Instructions:
1. Ground the roadmap in the provided Career Context. Do not invent unrelated qualifications or pathways.
2. Start from the student's current stage ({student_stage}). If the student is in Class 10, milestones must guide them through Class 11/12 choice, college preparation, and college. If the student is in Class 12, it must start with post-12th exams/college options and focus on higher education.
3. Be highly specific to "{title}". Do not provide generic "launch career" milestones. Specify concrete milestones (e.g. for AI/ML: learning programming/math in high school -> pursuing B.Tech CSE or B.Sc Stats -> learning ML algorithms/Python -> doing projects -> internships -> entry role).
4. Do not assume engineering/JEE is required for every technology/science career unless it is a core pathway. Do not assume MBBS/NEET is required for every biology career (only doctors require MBBS/NEET; researchers, biotechnologists, microbiologists do not!). Suggest alternative pathways (e.g., B.Sc, B.Des, etc.) where appropriate.
5. Identify exams and certifications ONLY if they are actually relevant (e.g., CA Foundation/IPCC for Chartered Accountant, NEET for Doctor, NID/UCEED for Designer). Do NOT recommend JEE for a Commerce or Arts career!
6. Each milestone must contain:
   - title: specific to this stage (e.g. "Acquire Machine Learning & Statistics Depth")
   - stage: academic or career stage
   - timeframe: realistic timeframe (e.g. "Year 1-2 of College")
   - description: 2-3 sentences explaining what this milestone is about and why it matters.
   - objectives: list of 2-3 specific objectives
   - actions: list of 3-5 concrete action items with priority and timeframe
   - skills: list of 3-4 skills to develop
   - canonicalResources: list of resources from the allowlist
   - completionCriteria: 2-3 clear criteria of accomplishment

Allowlist:
{json.dumps(state['allowlist'], indent=2)}

Ensure the output matches the required JSON schema structure exactly.
"""
    try:
        response_model = PersonalizedRoadmapResponse
        full_prompt = get_roadmap_system_prompt() + "\n\n" + prompt
        
        response_text = gemini_client.generate_structured_content(
            prompt=full_prompt,
            schema=response_model
        )
        
        # 1. Print the RAW LLM response before any json.loads() call
        print("\n========== RAW LLM RESPONSE ==========")
        print(response_text)
        print("======================================\n")
        
        if response_text:
            # 3-5. Make the parser robust by safely extracting the first complete JSON object
            cleaned_text = response_text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            elif cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            cleaned_text = cleaned_text.strip()
            
            # Extract first complete JSON object
            first_brace = cleaned_text.find('{')
            last_brace = cleaned_text.rfind('}')
            if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
                cleaned_text = cleaned_text[first_brace:last_brace+1]
                
            state["generated_roadmap"] = json.loads(cleaned_text)
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
