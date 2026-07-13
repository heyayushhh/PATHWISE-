# PathWise - AI Career Intelligence Platform

A modern AI-powered Career Intelligence Platform that helps users discover personalized career opportunities, build skill roadmaps, and become job-ready.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Backend 1 (Express)**: Node.js, Express.js, JWT, Google OAuth
- **Backend 2 (FastAPI)**: Python, FastAPI, LangGraph, AI Agents
- **Databases**: PostgreSQL, Neo4j, Redis, Qdrant
- **Deployment**: Docker, Docker Compose, NGINX, AWS EC2 (Self-hosted), GitHub Actions, Custom Domain Name

## Architecture

Microservice Architecture: Frontend → Express Backend → FastAPI AI Backend → Databases → LLM

## Monorepo Structure

```
PATHWISE/
├── apps/
│   ├── frontend/        # Next.js Frontend
│   ├── ms1-core-api/    # Express.js Backend (Microservice 1)
│   └── ms2-ai-engine/   # FastAPI AI Backend (Microservice 2)
├── packages/
│   ├── shared-types/    # Shared TypeScript types
│   ├── shared-utils/    # Shared utilities
│   └── ui/              # Shared UI components
├── docker/              # Dockerfiles
├── docs/                # Documentation
│   ├── 01-PRD.md
│   ├── 02-Architecture.md
│   ├── 03-Database.md
│   ├── 04-API-Design.md
│   ├── 05-Product-Flow.md
│   └── 06-Development-Notes.md
├── .github/             # GitHub Actions workflows
├── docker-compose.yml   # Local development stack
├── package.json
└── README.md
```

## Getting Started

[TODO: Add detailed setup instructions]

## Development Standards

- Follow Git Flow: No direct pushes to main, feature branches, PRs
- Conventional Commit messages
- Production-quality code, SOLID principles, loose coupling
