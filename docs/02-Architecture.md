




















# Responsibilities of Each Component

## 1. Frontend (Next.js)

**Technology:** Next.js, React, TypeScript, Tailwind CSS

### Responsibilities

- User Registration & Login
- Career Assessment Interface
- Career Explorer
- Opportunity Explorer
- Personalized Dashboard
- Roadmap Visualization
- Progress Tracking
- Resume Upload
- AI Mentor Chat Interface
- Communicate with Backend APIs

---

## 2. Backend 1 - Core API (Express.js)

**Technology:** Node.js, Express.js, TypeScript

### Responsibilities

- Authentication (JWT & Google OAuth)
- User Management
- CRUD Operations
- Business Logic
- Request Validation
- Rate Limiting
- Database Operations
- Calling AI Backend (FastAPI)
- Returning API Responses to Frontend

---

## 3. Backend 2 - AI Engine (FastAPI)

**Technology:** Python, FastAPI, LangGraph

### Responsibilities

- AI Career Recommendation Engine
- Career Assessment Analysis
- Skill Gap Analysis
- Learning Roadmap Generation
- Resume Analysis
- AI Mentor
- Opportunity Recommendation
- Prompt Engineering
- AI Agent Orchestration

---

## 4. PostgreSQL

### Responsibilities

Stores all structured application data including:

- Users
- Profiles
- Assessment Questions
- Assessment Answers
- Streams
- Courses
- Roadmaps
- Progress
- Bookmarks
- Admin Data

---

## 5. Neo4j

### Responsibilities

Stores graph-based relationships between:

- Streams
- Courses
- Specializations
- Careers
- Skills
- Opportunities
- Companies
- Certifications

Used for intelligent relationship traversal and recommendation generation.

---

## 6. Redis

### Responsibilities

- Caching
- Session Storage
- Rate Limiting
- Queue Management (Future)
- Temporary Data Storage

---

## 7. LLM Provider

Examples:

- OpenAI
- Gemini

### Responsibilities

- Career Recommendation
- Resume Analysis
- AI Mentor Responses
- Roadmap Generation
- Natural Language Reasoning

---

## 8. AWS EC2

### Responsibilities

Deployment environment hosting:

- Frontend
- Express Backend
- FastAPI Backend
- PostgreSQL
- Neo4j
- Redis

using Docker Compose.


# Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend 1 | Node.js, Express.js, TypeScript |
| Backend 2 | Python, FastAPI, LangGraph |
| Authentication | JWT, Google OAuth |
| Relational Database | PostgreSQL |
| Graph Database | Neo4j |
| Cache | Redis |
| AI Models | OpenAI / Gemini |
| Containerization | Docker, Docker Compose |
| Deployment | AWS EC2 |
| Version Control | Git, GitHub |

# Request Flow

## Authentication Flow

User

↓

Next.js Frontend

↓

Express Backend

↓

PostgreSQL

↓

JWT Generated

↓

Frontend

---

## Career Assessment Flow

User

↓

Next.js Frontend

↓

Express Backend

↓

Store Assessment Answers (PostgreSQL)

↓

Call FastAPI AI Engine

↓

LangGraph

↓

Neo4j

↓

LLM

↓

Career Recommendation Generated

↓

Express Backend

↓

Frontend

---

## Resume Analysis Flow

User Uploads Resume

↓

Next.js

↓

Express Backend

↓

FastAPI

↓

Resume Processing

↓

LLM Analysis

↓

Resume Report Generated

↓

Express Backend

↓

Frontend

---

## Roadmap Generation Flow

Assessment Completed

↓

Express Backend

↓

FastAPI

↓

Neo4j

↓

LLM

↓

Generate Personalized Roadmap

↓

Store in PostgreSQL

↓

Frontend Dashboard

# Project Folder Structure

```text
PATHWISE/
│
├── apps/
│   ├── frontend/
│   ├── ms1-core-api/
│   └── ms2-ai-engine/
│
├── packages/
│   ├── shared-types/
│   ├── shared-utils/
│   └── ui/
│
├── docs/
│   ├── 01-PRD.md
│   ├── 02-Architecture.md
│   ├── 03-Database.md
│   ├── 04-API-Design.md
│   ├── 05-Product-Flow.md
│   └── 06-Development-Notes.md
│
├── docker/
│   ├── frontend/
│   ├── ms1/
│   ├── ms2/
│   ├── postgres/
│   └── redis/
│
├── scripts/
│
├── .github/
│
├── .vscode/
│
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── .gitignore
├── .env.example
└── README.md
```

