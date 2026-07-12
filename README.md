# PathWise - AI Career Intelligence Platform

A modern AI-powered Career Intelligence Platform that helps users discover personalized career opportunities, build skill roadmaps, and become job-ready.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Backend 1 (Express)**: Node.js, Express.js, JWT, Google OAuth
- **Backend 2 (FastAPI)**: Python, FastAPI, LangGraph, AI Agents
- **Databases**: PostgreSQL, Neo4j, Redis, Qdrant
- **Deployment**: Docker, Docker Compose, NGINX, Vercel, Railway

## Architecture

Microservice Architecture: Frontend → Express Backend → FastAPI AI Backend → Databases → LLM

## Monorepo Structure

```
.
├── apps/
│   ├── frontend/       # Next.js Frontend
│   ├── api/            # Express.js Backend
│   └── ai-service/     # FastAPI AI Backend
├── packages/
│   ├── shared-types/   # Shared TypeScript types
│   └── config/         # Shared config files
├── docs/               # Documentation
├── docker/             # Dockerfiles
├── .github/            # GitHub Actions workflows
├── docker-compose.yml  # Local development stack
└── README.md
```

## Getting Started

[TODO: Add detailed setup instructions]

## Development Standards

- Follow Git Flow: No direct pushes to main, feature branches, PRs
- Conventional Commit messages
- Production-quality code, SOLID principles, loose coupling
