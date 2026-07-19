"""Deterministic and adaptive question generation for PathWise assessments."""

from __future__ import annotations
import json
import os
from typing import Any
from app.utils.gemini import call_gemini

# MCQ Question Banks for Class 10
CLASS_10_QUESTIONS = {
    "start": {
        "question": "What kind of activities naturally interest you the most?",
        "options": [
            "Science & Technology",
            "Business, Finance & Entrepreneurship",
            "Arts, Humanities & Social Sciences",
            "Creative Design & Media",
            "Sports & Physical Fitness",
            "Helping People & Social Service",
            "I am still exploring everything"
        ],
        "category": "interests",
        "next": "subjects"
    },
    "subjects": {
        "question": "Which school subjects do you enjoy studying the most?",
        "options": [
            "Mathematics",
            "Science (Physics, Chemistry)",
            "Biology / Life Sciences",
            "Social Sciences (History, Civics, Geography)",
            "Languages & Literature",
            "Computer Applications / Coding",
            "Art, Music or Craft"
        ],
        "category": "subjects",
        "next": "math_comfort"
    },
    "math_comfort": {
        "question": "How comfortable are you with Mathematics?",
        "options": [
            "Very comfortable — I love solving complex math problems",
            "Comfortable — I can do it, but prefer not to make it my main focus",
            "Not comfortable — I prefer to avoid math as much as possible"
        ],
        "category": "math_comfort",
        "next": "science_interest"
    },
    "science_interest": {
        "question": "How interested are you in studying Science in higher classes?",
        "options": [
            "Highly interested (both physical sciences and biology)",
            "Interested in Physics/Chemistry, but not Biology",
            "Interested in Biology/Life Sciences, but not Physics/Chemistry",
            "Not interested in Science subjects"
        ],
        "category": "science_interest",
        "next": "commerce_interest"
    },
    "commerce_interest": {
        "question": "Are you interested in business, economics, or starting your own company?",
        "options": [
            "Yes, highly interested in finance and business",
            "Somewhat interested in economics and management",
            "No, I have no interest in business"
        ],
        "category": "commerce_interest",
        "next": "creative_interest"
    },
    "creative_interest": {
        "question": "How do you feel about creative fields like design, writing, or arts?",
        "options": [
            "I love creative work and want to make it my career",
            "I enjoy creative hobbies but prefer a traditional career",
            "I am not very interested in creative fields"
        ],
        "category": "creative_interest",
        "next": "strengths"
    },
    "strengths": {
        "question": "Which of these do you consider your greatest strength?",
        "options": [
            "Logical reasoning & analytical problem solving",
            "Creative writing, debate & communication",
            "Visual design, artistic creation & spatial thinking",
            "Practical building, fixing things & hands-on work"
        ],
        "category": "strengths",
        "next": "work_style"
    },
    "work_style": {
        "question": "How do you prefer to work on tasks?",
        "options": [
            "Solving complex problems individually",
            "Collaborating with a team on creative ideas",
            "Leading and organizing people to achieve a goal",
            "Helping, teaching or mentoring others"
        ],
        "category": "work_style",
        "next": "career_values"
    },
    "career_values": {
        "question": "What do you value most in your future career?",
        "options": [
            "High earning potential & financial success",
            "Job security, stability & work-life balance",
            "Making a positive impact on society & helping others",
            "Constant learning, innovation & intellectual challenge"
        ],
        "category": "career_values",
        "next": "certainty"
    },
    "certainty": {
        "question": "How clear is your dream career path or stream choice?",
        "options": [
            "Very clear — I have a specific career and stream in mind",
            "Somewhat clear — I have a few options but need guidance",
            "Not clear at all — I am completely open to exploration"
        ],
        "category": "certainty",
        "next": "END"
    },
    "predefined_clarification": {
        "question": "Which of these is your biggest challenge in choosing a career stream?",
        "options": [
            "Deciding between Science and Commerce",
            "Not knowing what careers exist for Humanities",
            "Fear of choosing a stream that is too difficult",
            "Balancing parent expectations with my own interests"
        ],
        "category": "clarification",
        "next": "END"
    }
}

# MCQ Question Banks for Class 12
CLASS_12_QUESTIONS = {
    "start": {
        "question": "Which academic stream are you currently studying in Class 12?",
        "options": [
            "Science — PCM (Physics, Chemistry, Mathematics)",
            "Science — PCB (Physics, Chemistry, Biology)",
            "Science — PCMB (Physics, Chemistry, Math, Bio)",
            "Commerce",
            "Arts / Humanities",
            "Vocational / Other"
        ],
        "category": "stream",
        "branches": {
            "Science — PCM (Physics, Chemistry, Mathematics)": "pcm_interest",
            "Science — PCB (Physics, Chemistry, Biology)": "pcb_interest",
            "Science — PCMB (Physics, Chemistry, Math, Bio)": "pcmb_interest",
            "Commerce": "commerce_interest",
            "Arts / Humanities": "arts_interest",
            "Vocational / Other": "vocational_interest"
        }
    },
    # PCM Branch
    "pcm_interest": {
        "question": "Within PCM, which area excites you the most?",
        "options": [
            "Engineering & Technology",
            "Pure Mathematics & Scientific Research",
            "Architecture & Design",
            "Data Science & AI",
            "Defense Services",
            "I'm exploring other options"
        ],
        "category": "pcm_area",
        "next": "pcm_programming"
    },
    "pcm_programming": {
        "question": "How interested are you in computer programming and software development?",
        "options": [
            "Highly interested (I code or want to learn)",
            "Moderately interested (tech but not pure coding)",
            "Not interested"
        ],
        "category": "pcm_programming",
        "next": "pcm_style"
    },
    "pcm_style": {
        "question": "What is your preferred problem-solving style?",
        "options": [
            "Analytical and abstract (math/algorithms)",
            "Practical and physical (building/fixing hardware)",
            "Creative and spatial (design/architecture)"
        ],
        "category": "pcm_style",
        "next": "subjects"
    },
    # PCB Branch
    "pcb_interest": {
        "question": "Within PCB, which career path interests you?",
        "options": [
            "Medicine (MBBS/BDS)",
            "Biotechnology & Research",
            "Psychology & Mental Health",
            "Healthcare Management",
            "Environmental Sciences",
            "Other allied health interests"
        ],
        "category": "pcb_area",
        "next": "pcb_patient"
    },
    "pcb_patient": {
        "question": "How do you feel about working directly with patients in a clinical setting?",
        "options": [
            "I would love to treat and help patients directly",
            "I prefer research/lab work behind the scenes",
            "I prefer the administrative or tech side of healthcare"
        ],
        "category": "pcb_patient",
        "next": "pcb_environment"
    },
    "pcb_environment": {
        "question": "Which biological field interests you most?",
        "options": [
            "Human Anatomy and Physiology",
            "Genetics and Molecular Biology",
            "Ecology and Plant Sciences",
            "Pharmacology and Medicine development"
        ],
        "category": "pcb_environment",
        "next": "subjects"
    },
    # PCMB Branch
    "pcmb_interest": {
        "question": "With both Math and Biology, which direction do you prefer?",
        "options": [
            "Engineering & Technology",
            "Medicine & Biotechnology",
            "Pure Sciences & Research",
            "Interdisciplinary fields (e.g., Bioinformatics)",
            "I'm exploring other options"
        ],
        "category": "pcmb_area",
        "next": "pcmb_pref"
    },
    "pcmb_pref": {
        "question": "Do you prefer fields that lean more towards Mathematics/Tech or Biology/Medicine?",
        "options": [
            "Leaning towards Mathematics & Technology",
            "Leaning towards Biology & Medical sciences",
            "Equal interest in both (interdisciplinary fields)"
        ],
        "category": "pcmb_pref",
        "next": "pcmb_environment"
    },
    "pcmb_environment": {
        "question": "What type of work environment excites you most?",
        "options": [
            "High-tech research lab",
            "Modern corporate office",
            "Medical facility/Hospital",
            "Outdoor field work"
        ],
        "category": "pcmb_environment",
        "next": "subjects"
    },
    # Commerce Branch
    "commerce_interest": {
        "question": "Which area of Commerce sounds most appealing?",
        "options": [
            "Finance & Investment Banking",
            "Chartered Accountancy (CA/CS)",
            "Business Management (BBA/MBA)",
            "Economics & Policy",
            "Marketing & Advertising",
            "Entrepreneurship"
        ],
        "category": "commerce_area",
        "next": "commerce_math"
    },
    "commerce_math": {
        "question": "How comfortable are you with quantitative analysis and financial calculations?",
        "options": [
            "Very comfortable (I enjoy working with numbers/budgets)",
            "Moderately comfortable",
            "I prefer management and human resources over numbers"
        ],
        "category": "commerce_math",
        "next": "commerce_style"
    },
    "commerce_style": {
        "question": "Which commerce topic excites you most?",
        "options": [
            "Stock markets and investments",
            "Starting and scaling a business",
            "Economic theories and public policy",
            "Branding and consumer behavior"
        ],
        "category": "commerce_style",
        "next": "subjects"
    },
    # Arts / Humanities Branch
    "arts_interest": {
        "question": "Which field in Arts/Humanities do you want to pursue?",
        "options": [
            "Law & Legal Studies",
            "Psychology",
            "Design & Fine Arts",
            "Journalism & Mass Communication",
            "Civil Services (UPSC)",
            "Languages & Education"
        ],
        "category": "arts_area",
        "next": "arts_deep_dive"
    },
    "arts_deep_dive": {
        "question": "What kind of tasks do you enjoy most in Humanities?",
        "options": [
            "Reading and writing essays",
            "Analyzing human behavior and society",
            "Public speaking and debate",
            "Creating visual arts or designs"
        ],
        "category": "arts_deep_dive",
        "next": "arts_style"
    },
    "arts_style": {
        "question": "Which Humanities domain do you feel most aligned with?",
        "options": [
            "History & Culture",
            "Politics & Governance",
            "Human Mind & Behavior",
            "Media & Mass Communication"
        ],
        "category": "arts_style",
        "next": "subjects"
    },
    # Vocational / Other Branch
    "vocational_interest": {
        "question": "Which vocational or alternative field interests you most?",
        "options": [
            "Hospitality & Hotel Management",
            "Digital Marketing & Content Creation",
            "Performing Arts & Animation",
            "Travel & Tourism",
            "Culinary Arts",
            "I am still exploring"
        ],
        "category": "vocational_area",
        "next": "vocational_deep_dive"
    },
    "vocational_deep_dive": {
        "question": "What is your preferred method of learning a new skill?",
        "options": [
            "Hands-on practical work & apprenticeships",
            "Structured classes and certification",
            "Self-paced learning and online courses"
        ],
        "category": "vocational_deep_dive",
        "next": "vocational_style"
    },
    "vocational_style": {
        "question": "What is your primary goal in pursuing a vocational path?",
        "options": [
            "Entering the workforce quickly",
            "Starting a freelance practice/business",
            "Building a specialized niche skill over time"
        ],
        "category": "vocational_style",
        "next": "subjects"
    },
    # Common Core from Q5 to Q10
    "subjects": {
        "question": "Which subjects do you excel at or enjoy studying most?",
        "options": [
            "Physics / Chemistry",
            "Mathematics / Statistics",
            "Biology / Biotechnology",
            "Accountancy / Business Studies",
            "Economics / Social Sciences",
            "Computer Science / Information Practice",
            "English / Fine Arts"
        ],
        "category": "subjects",
        "next": "strengths"
    },
    "strengths": {
        "question": "Which of these do you consider your greatest skill strength?",
        "options": [
            "Logical & Analytical reasoning",
            "Verbal & Written communication",
            "Creative & Visual design",
            "Practical & Technical skills"
        ],
        "category": "strengths",
        "next": "activities"
    },
    "activities": {
        "question": "Which activities do you spend your free time on most?",
        "options": [
            "Reading & learning new topics",
            "Writing/creating digital content",
            "Programming/building projects",
            "Playing sports/fitness",
            "Socializing/helping community"
        ],
        "category": "activities",
        "next": "work_style"
    },
    "work_style": {
        "question": "What is your preferred work environment?",
        "options": [
            "A fast-paced corporate office",
            "A creative studio or agency",
            "A research lab or academic setting",
            "Working outdoors/on-field",
            "Remote/flexible work"
        ],
        "category": "work_style",
        "next": "career_values"
    },
    "career_values": {
        "question": "What do you value most in a career?",
        "options": [
            "High income potential",
            "Job stability and security",
            "Creative freedom",
            "Direct social impact"
        ],
        "category": "career_values",
        "next": "certainty"
    },
    "certainty": {
        "question": "How certain are you about your career direction?",
        "options": [
            "Very certain",
            "Somewhat certain",
            "Uncertain / Exploring"
        ],
        "category": "certainty",
        "next": "END"
    },
    "predefined_clarification": {
        "question": "What is your primary concern about your career path after Class 12?",
        "options": [
            "Getting admission to a top college",
            "Whether my chosen field has high future job demand",
            "Choosing between pursuing a job vs higher studies/research",
            "I am interested in too many different fields"
        ],
        "category": "clarification",
        "next": "END"
    }
}


def build_adaptive_clarification_prompt(answers: list[dict], stage: str) -> str:
    """Build prompt to generate custom adaptive question 11."""
    answers_text = "\n".join(
        f"- Q: {a.get('question')} | A: {a.get('answer')}"
        for a in answers
    )
    return f"""You are PathWise AI, an expert career counselor for {stage} students.
We are conducting a career assessment. The student is uncertain about their career path.
Here are their answers so far:
{answers_text}

Generate exactly ONE adaptive follow-up question to clarify their interests and narrow down their options.
The question must have 3 to 5 options.

Return ONLY valid JSON in this exact format:
{{
    "questionId": "adaptive_1",
    "question": "A personalized follow-up question based on their profile.",
    "options": ["Option A", "Option B", "Option C"],
    "category": "adaptive_clarification",
    "reasonForQuestion": "Why this question helps narrow down their career choices."
}}

Rules:
- Do not repeat topics already covered.
- Do not use markdown formatting or fences.
- Return ONLY the JSON object.
"""


def generate_next_question(state: dict[str, Any]) -> dict[str, Any]:
    """Generate next question based on current stage and previous answers."""
    stage = state.get("academic_stage", "Class 10")
    history = state.get("answers", [])
    bank = CLASS_12_QUESTIONS if stage == "Class 12" else CLASS_10_QUESTIONS

    # 1. Start question
    if not history:
        q_data = bank["start"]
        return {
            "question": q_data["question"],
            "options": q_data["options"],
            "category": q_data["category"],
            "id": "start"
        }

    # 2. Get last answered question
    last_answer_data = history[-1]
    last_q_id = last_answer_data.get("question_id", "start")
    last_answer = last_answer_data.get("answer", "")

    # 3. Handle Adaptive Clarification Question (adaptive_1) completion
    if last_q_id == "adaptive_1" or last_q_id == "predefined_clarification":
        state["is_complete"] = True
        return {}

    # 4. Normal Branching logic
    last_q_data = bank.get(last_q_id)
    if not last_q_data:
        # Fallback to start
        q_data = bank["start"]
        return {
            "question": q_data["question"],
            "options": q_data["options"],
            "category": q_data["category"],
            "id": "start"
        }

    next_q_id = None
    if "branches" in last_q_data:
        next_q_id = last_q_data["branches"].get(last_answer)

    if not next_q_id:
        next_q_id = last_q_data.get("next")

    # 5. Handle certainty endpoint (reached end of 10-question bank)
    if next_q_id == "END":
        # Check if they are uncertain
        uncertain_options = [
            "Somewhat clear — I have a few options but need guidance",
            "Not clear at all — I am completely open to exploration",
            "Somewhat clear",
            "Uncertain / Exploring",
            "Somewhat certain",
            "Completely lost"
        ]
        
        is_uncertain = last_answer in uncertain_options
        
        if is_uncertain:
            # We try to use Gemini if configured
            gemini_key = os.getenv("GEMINI_API_KEY")
            if gemini_key:
                try:
                    prompt = build_adaptive_clarification_prompt(history, stage)
                    raw_res = call_gemini(prompt)
                    if raw_res:
                        # Clean markdown formatting if returned
                        cleaned = raw_res.strip()
                        if cleaned.startswith("```json"):
                            cleaned = cleaned.replace("```json", "").replace("```", "").strip()
                        elif cleaned.startswith("```"):
                            cleaned = cleaned.replace("```", "").strip()
                        
                        parsed = json.loads(cleaned)
                        if (
                            isinstance(parsed.get("question"), str) and
                            isinstance(parsed.get("options"), list) and
                            len(parsed["options"]) >= 2
                        ):
                            return {
                                "question": parsed["question"],
                                "options": parsed["options"],
                                "category": parsed.get("category", "adaptive_clarification"),
                                "id": "adaptive_1"
                            }
                except Exception as e:
                    print(f"[Adaptive Clarification] Gemini generation failed: {e}")
            
            # Fallback to predefined clarification question
            fallback_q = bank["predefined_clarification"]
            return {
                "question": fallback_q["question"],
                "options": fallback_q["options"],
                "category": fallback_q["category"],
                "id": "predefined_clarification"
            }
        
        # Certain user -> complete assessment
        state["is_complete"] = True
        return {}

    # 6. Safety check for valid branch target
    if not next_q_id or next_q_id not in bank:
        print(f"[Question Generator] ERROR: Invalid branch/next target '{next_q_id}' from '{last_q_id}'")
        raise ValueError(f"Dangling graph branch detected: '{next_q_id}' is not in the question bank.")

    q_data = bank[next_q_id]
    return {
        "question": q_data["question"],
        "options": q_data["options"],
        "category": q_data["category"],
        "id": next_q_id
    }


def get_total_questions(state: dict[str, Any]) -> int:
    """Dynamically determine the total questions for the active path."""
    answers = state.get("answers", [])
    certainty_answer = None
    for ans in answers:
        if ans.get("question_id") == "certainty":
            certainty_answer = ans.get("answer")
            break

    if certainty_answer and certainty_answer in [
        "Somewhat clear — I have a few options but need guidance",
        "Not clear at all — I am completely open to exploration",
        "Somewhat clear",
        "Uncertain / Exploring",
        "Somewhat certain",
        "Completely lost"
    ]:
        return 11
    return 10


def validate_question_data(question_data: dict[str, Any]) -> bool:
    """Validate that the question payload is structurally valid for MCQs."""
    if not question_data:
        return False
    if not isinstance(question_data.get("question"), str) or not question_data["question"].strip():
        return False
    if not isinstance(question_data.get("options"), list):
        return False
    if len(question_data["options"]) < 2:
        return False
    
    seen = set()
    for opt in question_data["options"]:
        if not isinstance(opt, str) or not opt.strip():
            return False
        if opt in seen:
            return False  # Reject duplicate options
        seen.add(opt)
        
    return True


def validate_assessment_completion(state: dict[str, Any]) -> None:
    """
    Validate that the assessment state meets all completeness criteria.
    Throws a ValueError if validation fails.
    """
    if not state.get("user_id"):
        raise ValueError("Assessment session does not belong to a valid user")
    
    if not state.get("academic_stage"):
        raise ValueError("Academic stage is missing from the assessment state")
        
    answers = state.get("answers", [])
    if not answers:
        raise ValueError("No answers have been recorded for this assessment")
        
    # Check if the final question is answered
    last_ans = answers[-1]
    last_q_id = last_ans.get("question_id")
    
    expected_total = get_total_questions(state)
    if len(answers) < 10:
        raise ValueError(f"Assessment is incomplete. Answered {len(answers)} of minimum 10 questions.")

    if expected_total == 11 and len(answers) < 11:
        raise ValueError("Assessment is incomplete. Awaiting clarification question response.")
        
    # Final question ID must be certainty (for 10 qs) or adaptive_1 / predefined_clarification (for 11 qs)
    if expected_total == 10 and last_q_id != "certainty":
        raise ValueError("Assessment has not reached the terminal node.")
    elif expected_total == 11 and last_q_id not in ["adaptive_1", "predefined_clarification"]:
        raise ValueError("Assessment has not answered the clarification question.")

    # Validate all answers are non-empty
    for idx, ans in enumerate(answers):
        if not ans.get("answer") or not ans.get("answer").strip():
            raise ValueError(f"Empty answer found at question {idx + 1}")

