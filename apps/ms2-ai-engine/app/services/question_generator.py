"""Deterministic and adaptive question generation for PathWise assessments."""

from __future__ import annotations
import json
import os
from typing import Any
from app.utils.gemini import call_gemini

# ---------------------------------------------------------------------------
# CLASS 10 ADAPTIVE QUESTION BANK
# Structure:
#   Q1 (start) — answer-dependent branching to 7 interest paths
#   Q2 — interest-specific sub-question (some paths have a Q3 sub-branch)
#   Shared tail: subjects → strengths → work_style → career_values → certainty
# Path lengths: 7 questions (shallow) to 8 questions (science sub-branch)
# Adaptive clarification (Q8 or Q9): optional, triggered only for uncertain users
# ---------------------------------------------------------------------------
CLASS_10_QUESTIONS = {
    # ── Q1: Opening interest gate ──────────────────────────────────────────
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
        # Each key MUST exactly match one of the strings in "options" above
        "branches": {
            "Science & Technology":                 "science_tech",
            "Business, Finance & Entrepreneurship": "business_finance",
            "Arts, Humanities & Social Sciences":   "arts_humanities",
            "Creative Design & Media":              "creative_media",
            "Sports & Physical Fitness":            "sports_fitness",
            "Helping People & Social Service":      "helping_people",
            "I am still exploring everything":      "exploring"
        }
    },

    # ── Science & Technology branch ────────────────────────────────────────
    "science_tech": {
        "question": "Which area of Science & Technology excites you the most?",
        "options": [
            "Mathematics & Problem Solving",
            "Biology & Healthcare",
            "Computers & Coding",
            "Engineering & Building Things",
            "Research & Scientific Discovery",
            "I am not sure yet"
        ],
        "category": "science_tech_area",
        "branches": {
            "Biology & Healthcare": "biology_health",
            "Computers & Coding":   "computers_tech",
            "Mathematics & Problem Solving": "math_problem_sub",
            "Engineering & Building Things": "engineering_sub",
            "Research & Scientific Discovery": "scientific_research_sub",
            "I am not sure yet": "science_general_sub"
        }
    },
    "computers_tech": {
        "question": "What would you enjoy doing most with computers?",
        "options": [
            "Building apps or websites",
            "Artificial Intelligence & Data Science",
            "Cybersecurity",
            "Game Development",
            "Understanding how hardware works",
            "I am not sure yet"
        ],
        "category": "computers_tech_sub",
        "next": "subjects"
    },
    "biology_health": {
        "question": "Which part of Biology & Healthcare interests you most?",
        "options": [
            "Treating patients — Medicine & Surgery",
            "Biological research & genetics",
            "Healthcare technology & medical devices",
            "Environmental & ecological sciences",
            "Pharmacy & drug development",
            "I am not sure yet"
        ],
        "category": "biology_health_sub",
        "next": "subjects"
    },
    "math_problem_sub": {
        "question": "What kind of mathematical problems do you enjoy solving most?",
        "options": [
            "Logic puzzles & brain teasers",
            "Algebra & equations",
            "Statistics & probability",
            "Geometry & spatial proofs",
            "I enjoy all types of math problems"
        ],
        "category": "science_tech_area",
        "next": "subjects"
    },
    "engineering_sub": {
        "question": "What would you enjoy building or designing most?",
        "options": [
            "Robots & automation systems",
            "Bridges, buildings & physical structures",
            "Electronic circuits & microchips",
            "Aerodynamic vehicles & aircraft",
            "I am interested in general engineering"
        ],
        "category": "science_tech_area",
        "next": "subjects"
    },
    "scientific_research_sub": {
        "question": "Which domain of scientific inquiry sounds most exciting to you?",
        "options": [
            "Space exploration & astronomy",
            "Quantum physics & atomic structures",
            "Chemical reactions & material science",
            "Climate science & renewable energy",
            "I am open to any scientific field"
        ],
        "category": "science_tech_area",
        "next": "subjects"
    },
    "science_general_sub": {
        "question": "How do you prefer to learn about science?",
        "options": [
            "Through hands-on laboratory experiments",
            "By reading articles and research reports",
            "By watching science documentaries & videos",
            "By discussing scientific concepts with others",
            "I am open to all learning methods"
        ],
        "category": "science_tech_area",
        "next": "subjects"
    },

    # ── Business, Finance & Entrepreneurship branch ────────────────────────
    "business_finance": {
        "question": "What aspect of Business & Finance interests you most?",
        "options": [
            "Starting my own company (Entrepreneurship)",
            "Investing & stock markets",
            "Chartered Accountancy / Financial Auditing",
            "Marketing & consumer behavior",
            "Economics & public policy",
            "I am not sure yet"
        ],
        "category": "business_area",
        "next": "business_skills"
    },
    "business_skills": {
        "question": "Which of these business-related skills would you like to develop most?",
        "options": [
            "Public speaking & persuasive pitching",
            "Data analysis & financial planning",
            "Negotiation & contract analysis",
            "Managing projects & leading teams",
            "Marketing strategy & creative branding"
        ],
        "category": "business_area",
        "next": "subjects"
    },

    # ── Arts, Humanities & Social Sciences branch ──────────────────────────
    "arts_humanities": {
        "question": "Which field in Arts & Humanities appeals to you?",
        "options": [
            "Law & Legal Studies",
            "History, Politics & Civics",
            "Sociology & Anthropology",
            "Languages & Literature",
            "Philosophy & Ethics",
            "I am not sure yet"
        ],
        "category": "arts_area",
        "next": "humanities_topics"
    },
    "humanities_topics": {
        "question": "Which of these humanities topics interests you most?",
        "options": [
            "Understanding human behavior & psychology",
            "Studying historical events & civilizations",
            "Analyzing political systems & international relations",
            "Reading literature & analyzing culture",
            "Studying legal systems & constitutional law"
        ],
        "category": "arts_area",
        "next": "subjects"
    },

    # ── Creative Design & Media branch ────────────────────────────────────
    "creative_media": {
        "question": "Which creative field would you like to pursue?",
        "options": [
            "Graphic Design or UI/UX Design",
            "Filmmaking & Video Production",
            "Music & Sound Production",
            "Creative Writing & Journalism",
            "Animation & Visual Effects",
            "Architecture & Interior Design",
            "I am not sure yet"
        ],
        "category": "creative_area",
        "next": "creative_tools"
    },
    "creative_tools": {
        "question": "Which creative medium or tool excites you the most?",
        "options": [
            "Digital design & photo editing software",
            "Cameras, video editing & film gear",
            "Musical instruments & audio recording software",
            "Pen, paper & creative writing tools",
            "3D animation & visual effects tools"
        ],
        "category": "creative_area",
        "next": "subjects"
    },

    # ── Sports & Physical Fitness branch ──────────────────────────────────
    "sports_fitness": {
        "question": "How do you see sports becoming part of your career?",
        "options": [
            "Professional athlete or player",
            "Coaching & sports training",
            "Sports management & administration",
            "Sports medicine & physiotherapy",
            "Sports journalism & media",
            "I am not sure yet"
        ],
        "category": "sports_area",
        "next": "sports_role"
    },
    "sports_role": {
        "question": "What role in sports and fitness appeals to you most?",
        "options": [
            "Competing directly as a player or athlete",
            "Analyzing team strategies & coaching players",
            "Managing sports business & marketing events",
            "Treating sports injuries as a physiotherapist",
            "Reporting on sports events & writing commentary"
        ],
        "category": "sports_area",
        "next": "subjects"
    },

    # ── Helping People & Social Service branch ────────────────────────────
    "helping_people": {
        "question": "In what way would you most like to help people?",
        "options": [
            "Healthcare & medicine",
            "Teaching & education",
            "Social work & community service",
            "Psychology & counselling",
            "Non-profit, NGO & development work",
            "I am not sure yet"
        ],
        "category": "helping_area",
        "next": "helping_context"
    },
    "helping_context": {
        "question": "In what environment would you prefer to help others?",
        "options": [
            "In a clinical setting (hospital or counseling center)",
            "In a classroom or education center",
            "In a community NGO or field work environment",
            "In a corporate office handling employee welfare",
            "I am open to helping in any setting"
        ],
        "category": "helping_area",
        "next": "subjects"
    },

    # ── Still Exploring branch ─────────────────────────────────────────────
    "exploring": {
        "question": "Since you are still exploring, which of these do you find most enjoyable?",
        "options": [
            "Creating art, music, or stories",
            "Solving puzzles and mathematical problems",
            "Organising events and leading teams",
            "Learning about nature and the human body",
            "Talking to people, debating, and writing",
            "Building things or fixing gadgets"
        ],
        "category": "general_exploration",
        "next": "exploration_style"
    },
    "exploration_style": {
        "question": "What is your preferred style of exploring new ideas?",
        "options": [
            "Doing DIY projects and hands-on experiments",
            "Reading books, articles, and research reviews",
            "Brainstorming with a group and discussing ideas",
            "Solving puzzles and analytical problems individually",
            "Creating art, stories, or digital content"
        ],
        "category": "general_exploration",
        "next": "subjects"
    },

    # ── Common Tail (Q4 onward) ─────────────────
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
        "next": "certainty"
    },
    "learning_style": {
        "question": "What is your preferred learning style?",
        "options": [
            "Visual (diagrams, videos, mind maps)",
            "Auditory (lectures, discussions, podcasts)",
            "Hands-on (experiments, building projects, practice)",
            "Reading/Writing (textbooks, notes, essays)"
        ],
        "category": "personality",
        "next": "work_style"
    },
    "work_environment": {
        "question": "Which work environment sounds most appealing to you?",
        "options": [
            "A structured corporate office",
            "A creative studio or collaborative space",
            "A laboratory, research center or library",
            "Working outdoors, traveling or on-field"
        ],
        "category": "personality",
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
        "next": "END"
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
        "next": "certainty"
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
        "next": "END"
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


def is_uncertain_answer(answer: str) -> bool:
    """Classify if the certainty question answer indicates uncertainty, normalizing dashes and whitespace."""
    if not answer:
        return False
    normalized = answer.strip().replace("—", "-").replace("–", "-").replace("--", "-")
    normalized = " ".join(normalized.split())
    normalized = normalized.lower()
    uncertain_patterns = [
        "somewhat clear - i have a few options but need guidance",
        "not clear at all - i am completely open to exploration",
        "somewhat clear",
        "uncertain / exploring",
        "somewhat certain",
        "completely lost",
        "uncertain",
        "not clear at all"
    ]
    for pattern in uncertain_patterns:
        if pattern in normalized:
            return True
    return False


def get_remaining_distance(bank: dict[str, Any], start_q_id: str) -> int:
    """BFS to find the shortest path length from start_q_id to 'certainty'."""
    if not start_q_id or start_q_id == "certainty":
        return 0
    import collections
    queue = collections.deque([(start_q_id, 0)])
    visited = {start_q_id}
    while queue:
        curr, dist = queue.popleft()
        if curr == "certainty":
            return dist
        q_data = bank.get(curr)
        if not q_data:
            continue
        targets = []
        if "next" in q_data:
            targets.append(q_data["next"])
        if "branches" in q_data:
            targets.extend(q_data["branches"].values())
        for t in targets:
            if t == "END":
                t = "certainty"
            if t in bank and t not in visited:
                visited.add(t)
                queue.append((t, dist + 1))
    return 0


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

    # Check if the user has answered certainty in their history
    history_certainty_answer = None
    for ans in history:
        if ans.get("question_id") == "certainty":
            history_certainty_answer = ans.get("answer")
            break

    is_uncertain = False
    if history_certainty_answer:
        is_uncertain = is_uncertain_answer(history_certainty_answer)

    # 3. Dynamic tail routing logic
    next_q_id = None
    if last_q_id == "certainty":
        is_uncertain = is_uncertain_answer(last_answer)
        if is_uncertain:
            # We try to use Gemini if configured
            gemini_key = os.getenv("GEMINI_API_KEY")
            if gemini_key:
                try:
                    prompt = build_adaptive_clarification_prompt(history, stage)
                    raw_res = call_gemini(prompt)
                    if raw_res:
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
                            state["adaptive_clarification_question"] = {
                                "question": parsed["question"],
                                "options": parsed["options"],
                                "category": parsed.get("category", "adaptive_clarification"),
                                "id": "adaptive_1"
                            }
                            next_q_id = "adaptive_1"
                except Exception as e:
                    print(f"[Adaptive Clarification] Gemini generation failed: {e}")
            
            if not next_q_id:
                next_q_id = "predefined_clarification"
        else:
            next_q_id = "learning_style" if stage == "Class 10" else "activities"

    elif last_q_id in ["predefined_clarification", "adaptive_1"]:
        next_q_id = "learning_style" if stage == "Class 10" else "work_style"

    elif last_q_id == "learning_style":
        if is_uncertain:
            next_q_id = "work_style"
        else:
            next_q_id = "work_environment"

    elif last_q_id == "work_environment":
        next_q_id = "work_style"

    elif last_q_id == "activities":
        next_q_id = "work_style"

    else:
        # 4. Normal Branching logic from question banks
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

        if "branches" in last_q_data:
            # 1. Exact match first
            next_q_id = last_q_data["branches"].get(last_answer)
            
            # 2. Case-insensitive exact match
            if not next_q_id:
                for opt_str, target in last_q_data["branches"].items():
                    if opt_str.strip().lower() == last_answer.strip().lower():
                        next_q_id = target
                        break
                        
            # 3. Case-insensitive substring match
            if not next_q_id:
                for opt_str, target in last_q_data["branches"].items():
                    if opt_str.lower() in last_answer.lower() or last_answer.lower() in opt_str.lower():
                        next_q_id = target
                        break

        if not next_q_id:
            next_q_id = last_q_data.get("next")

    # 4. Starting node fallbacks if answer didn't match any option and next is None
    if not next_q_id and last_q_id == "start":
        next_q_id = "vocational_interest" if stage == "Class 12" else "exploring"

    # 5. Handle completion
    if next_q_id == "END":
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

    # Stage-aware answer floor (exactly 10 questions required)
    stage = state.get("academic_stage", "Class 10")
    if len(answers) < 10:
        raise ValueError(
            f"Assessment is incomplete. "
            f"Answered {len(answers)} of exactly 10 questions "
            f"for {stage}."
        )

    # 2. Find the certainty answer in history to determine if clarification was required
    certainty_answer = None
    for ans in answers:
        if ans.get("question_id") == "certainty":
            certainty_answer = ans.get("answer")
            break

    if not certainty_answer:
        raise ValueError("Assessment is incomplete. Awaiting certainty question response.")

    # 3. Terminal question ID check (must end on career_values)
    last_q_id = answers[-1].get("question_id")
    if last_q_id != "career_values":
        raise ValueError(
            f"Assessment has not reached the terminal node. "
            f"Last answered: '{last_q_id}'."
        )

    # Validate all answers are non-empty
    for idx, ans in enumerate(answers):
        if not ans.get("answer") or not ans.get("answer").strip():
            raise ValueError(f"Empty answer found at question {idx + 1}")

