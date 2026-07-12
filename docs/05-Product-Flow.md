# PATHWISE PRODUCT FLOW

## Purpose

This document defines the complete user journey and product behavior of the Pathwise platform.

It focuses on how users interact with the system, how the platform makes decisions, and how personalized recommendations are generated.

This document DOES NOT describe the database.

---

# Product Vision

Pathwise is an AI-powered Career Intelligence Platform.

Instead of asking every user the same questions, the platform dynamically adapts based on the user's academic or professional stage.

The goal is to help users discover career opportunities, understand possible paths, identify skill gaps, and generate personalized learning roadmaps.

---

# User Journey

Landing Page

↓

Register / Login

↓

Career Assessment

↓

Career Discovery

↓

Opportunity Explorer

↓

Career Comparison

↓

Skill Gap Analysis

↓

Learning Roadmap

↓

Progress Tracking

↓

Resume Intelligence

↓

AI Mentor (Future)

---

# Career Assessment Engine

The assessment should behave like a conversation rather than a long registration form.

Each answer determines the next question.

Different users should receive different questions.

---

## Root Decision

What best describes you?

○ Class 10

○ Class 11-12

○ College Student

○ Working Professional

Each option launches a completely different assessment flow.

---

## Class 10 Flow

Current Stage

↓

Favourite Subjects

↓

Interests & Hobbies

↓

Career Goal?

├── YES
│
│   Desired Career
│
│   ↓
│
│   Personalized Guidance
│
└── NO
    │
    ↓
    Career Discovery
    ↓
    Stream Explorer
    ↓
    Career Suggestions

---

## Future Flows

- Class 11–12 Assessment
- College Student Assessment
- Working Professional Assessment

These will be designed independently.

---

# Product Rules

- Never ask unnecessary questions.
- Questions should adapt based on previous answers.
- Every answer should influence recommendations.
- Users can skip optional questions.
- Recommendations should always be explainable.
- Users should be able to revisit and update their assessment.

---

# Future Features

- AI Mentor
- Voice Assessment
- Resume Parsing
- Mock Interviews
- AI Learning Coach
- Career Readiness Score