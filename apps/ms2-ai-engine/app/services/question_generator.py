"""Deterministic question generation for adaptive assessment with MCQ support."""

from typing import Any

# MCQ Question Banks for different stages
CLASS_10_QUESTIONS = {
    "start": {
        "question": "What kind of activities naturally interest you the most?",
        "options": [
            "Science & Technology",
            "Business & Money",
            "Arts & Humanities",
            "Creative Work & Design",
            "Sports & Fitness",
            "Helping People",
            "I'm Still Exploring"
        ],
        "category": "interests",
        "branches": {
            "Science & Technology": "science_tech",
            "Business & Money": "business_money",
            "Arts & Humanities": "arts_humanities",
            "Creative Work & Design": "creative_design",
            "Sports & Fitness": "sports_fitness",
            "Helping People": "helping_people",
            "I'm Still Exploring": "exploring"
        }
    },
    "science_tech": {
        "question": "Which area of Science & Technology sounds most interesting to you?",
        "options": [
            "Mathematics & Problem Solving",
            "Biology & Healthcare",
            "Computers & Technology",
            "Engineering & Building Things",
            "Research & Discovery",
            "I'm Not Sure Yet"
        ],
        "category": "science_tech_area",
        "branches": {
            "Computers & Technology": "computers_tech",
            "Biology & Healthcare": "biology_health"
        },
        "next": "work_style"
    },
    "computers_tech": {
        "question": "In Computers & Technology, what would you enjoy exploring most?",
        "options": [
            "Building apps or websites",
            "Artificial Intelligence",
            "Cybersecurity",
            "Video Games",
            "Understanding how computers work",
            "I haven't explored these yet"
        ],
        "category": "computers_tech_sub",
        "next": "work_style"
    },
    "biology_health": {
        "question": "Which part of Biology & Healthcare interests you?",
        "options": [
            "Treating patients (Medicine)",
            "Understanding human biology",
            "Healthcare technology",
            "Environmental science",
            "Biological research",
            "I'm not sure yet"
        ],
        "category": "biology_health_sub",
        "next": "work_style"
    },
    "business_money": {
        "question": "What aspect of business interests you the most?",
        "options": [
            "Starting a company (Entrepreneurship)",
            "Managing money and investments",
            "Leading and managing teams",
            "Marketing and selling products",
            "Analyzing business trends",
            "I'm not sure"
        ],
        "category": "business_area",
        "next": "work_style"
    },
    "creative_design": {
        "question": "Which creative field would you like to explore?",
        "options": [
            "Graphic design or UI/UX",
            "Music and sound production",
            "Creative writing",
            "Filmmaking and content creation",
            "Animation and 3D modeling",
            "Architecture",
            "I'm not sure"
        ],
        "category": "creative_area",
        "next": "work_style"
    },
    "sports_fitness": {
        "question": "How would you like sports to be part of your future?",
        "options": [
            "Professional athlete",
            "Coaching and training",
            "Sports management",
            "Sports medicine/physiotherapy",
            "Sports media and content",
            "Just a hobby",
            "I'm not sure"
        ],
        "category": "sports_goal",
        "next": "work_style"
    },
    "work_style": {
        "question": "How do you prefer to work on tasks?",
        "options": [
            "Solving complex problems individually",
            "Collaborating in a creative team",
            "Leading others to achieve a goal",
            "Hands-on practical work",
            "Helping and teaching others",
            "I like a mix of everything"
        ],
        "category": "work_style",
        "next": "end"
    },
    "arts_humanities": {
        "question": "Which area of Arts & Humanities interests you most?",
        "options": [
            "History & Archaeology",
            "Literature & Languages",
            "Sociology & Psychology",
            "Political Science & Law",
            "Performing Arts",
            "I'm Not Sure Yet"
        ],
        "category": "arts_humanities_area",
        "next": "work_style"
    },
    "helping_people": {
        "question": "In what way would you like to help people in your career?",
        "options": [
            "Teaching & Education",
            "Medicine & Healthcare",
            "Social Work & Community Service",
            "Counseling & Therapy",
            "Public Service & Governance",
            "I'm Not Sure Yet"
        ],
        "category": "helping_people_area",
        "next": "work_style"
    },
    "exploring": {
        "question": "Since you are exploring, what kind of activities do you find most fun?",
        "options": [
            "Creating art, music, or stories",
            "Solving puzzles and mathematical games",
            "Organizing events or leading teams",
            "Learning about nature and human body",
            "Talking to people and debate",
            "Building things or fixing gadgets"
        ],
        "category": "general_exploration",
        "next": "work_style"
    }
}

CLASS_12_QUESTIONS = {
    "start": {
        "question": "Which academic stream are you currently studying?",
        "options": [
            "Science — PCM (Physics, Chem, Math)",
            "Science — PCB (Physics, Chem, Bio)",
            "Science — PCMB (All sciences)",
            "Commerce",
            "Arts / Humanities",
            "Vocational / Other"
        ],
        "category": "stream",
        "branches": {
            "Science — PCM (Physics, Chem, Math)": "pcm_interests",
            "Science — PCB (Physics, Chem, Bio)": "pcb_interests",
            "Science — PCMB (All sciences)": "pcmb_interests",
            "Commerce": "commerce_interests",
            "Arts / Humanities": "arts_interests"
        },
        "next": "work_style"
    },
    "pcmb_interests": {
        "question": "With both Math and Biology, which direction do you prefer?",
        "options": [
            "Engineering & Technology",
            "Medicine & Biotechnology",
            "Pure Sciences & Research",
            "Interdisciplinary fields (e.g. Bioinformatics)",
            "I'm exploring other options"
        ],
        "category": "pcmb_area",
        "next": "work_style"
    },
    "pcm_interests": {
        "question": "Within PCM, which area excites you the most?",
        "options": [
            "Engineering & Technology",
            "Pure Mathematics & Research",
            "Architecture & Design",
            "Data Science & AI",
            "Defence Services",
            "I'm exploring other options"
        ],
        "category": "pcm_area",
        "next": "work_style"
    },
    "pcb_interests": {
        "question": "Within PCB, which career path interests you?",
        "options": [
            "Medicine (MBBS/BDS)",
            "Biotechnology & Research",
            "Psychology & Mental Health",
            "Healthcare Management",
            "Environmental Sciences",
            "Other interests"
        ],
        "category": "pcb_area",
        "next": "work_style"
    },
    "commerce_interests": {
        "question": "Which area of Commerce sounds most appealing?",
        "options": [
            "Finance & Investment Banking",
            "Chartered Accountancy",
            "Business Management (BBA/MBA)",
            "Economics & Policy",
            "Marketing & Advertising",
            "Entrepreneurship"
        ],
        "category": "commerce_area",
        "next": "work_style"
    },
    "arts_interests": {
        "question": "Which field in Arts/Humanities do you want to pursue?",
        "options": [
            "Law & Legal Studies",
            "Psychology",
            "Design & Fine Arts",
            "Journalism & Mass Comm",
            "Civil Services (UPSC)",
            "Languages & Education"
        ],
        "category": "arts_area",
        "next": "work_style"
    },
    "work_style": {
        "question": "What is your preferred work environment?",
        "options": [
            "A fast-paced corporate office",
            "A creative studio or agency",
            "A research lab or academic setting",
            "Working outdoors or on-field",
            "Remote / Flexible work",
            "I'm still figuring this out"
        ],
        "category": "work_style",
        "next": "end"
    }
}

def generate_next_question(state: dict[str, Any]) -> dict[str, Any]:
    """Generate next question based on current stage and previous answers."""
    
    stage = state.get("academic_stage", "Class 10")
    history = state.get("answers", [])
    
    bank = CLASS_12_QUESTIONS if stage == "Class 12" else CLASS_10_QUESTIONS
    
    # If no history, return the start question
    if not history:
        q_data = bank["start"]
        return {
            "question": q_data["question"],
            "options": q_data["options"],
            "category": q_data["category"],
            "id": "start"
        }

    # Get the last question asked
    last_answer_data = history[-1]
    last_q_id = last_answer_data.get("question_id", "start")
    last_answer = last_answer_data.get("answer", "")
    
    last_q_data = bank.get(last_q_id)
    if not last_q_data:
        # Fallback to start if something goes wrong
        q_data = bank["start"]
        return {
            "question": q_data["question"],
            "options": q_data["options"],
            "category": q_data["category"],
            "id": "start"
        }

    # Determine next question based on branching or sequential flow
    next_q_id = None
    if "branches" in last_q_data:
        next_q_id = last_q_data["branches"].get(last_answer)
    
    if not next_q_id:
        next_q_id = last_q_data.get("next")

    # If next is 'end' or no next question, mark complete
    if not next_q_id or next_q_id == "end" or next_q_id not in bank:
        state["is_complete"] = True
        return {}

    q_data = bank[next_q_id]
    return {
        "question": q_data["question"],
        "options": q_data["options"],
        "category": q_data["category"],
        "id": next_q_id
    }


def get_total_questions(state: dict[str, Any]) -> int:
    """Dynamically determine the total questions for the active path."""
    stage = state.get("academic_stage", "Class 10")
    if stage == "Class 12":
        return 3

    # Class 10
    answers = state.get("answers", [])
    if not answers:
        return 4  # Default estimate at start

    first_ans = answers[0].get("answer")
    if first_ans == "Science & Technology":
        if len(answers) >= 2:
            second_ans = answers[1].get("answer")
            if second_ans in ["Computers & Technology", "Biology & Healthcare"]:
                return 4
            else:
                return 3
        return 4
    return 3


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

