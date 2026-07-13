# PathWise - AI Career Intelligence Platform

A modern AI-powered Career Intelligence Platform that helps users discover personalized career opportunities, build skill roadmaps, and become job-ready.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Backend 1 (Express)**: Node.js, Express.js, JWT, Google OAuth
- **Backend 2 (FastAPI)**: Python, FastAPI, LangGraph, AI Agents
- **Databases**: PostgreSQL, Neo4j, Redis, Qdrant
- **Deployment**: Docker, Docker Compose, AWS EC2 (Self-hosted), GitHub Actions, Custom Domain Name

## Architecture

Microservice Architecture: Frontend → Express Backend → FastAPI AI Backend → Databases → LLM

## Monorepo Structure

```
PATHWISE/
│
├── apps/
│   ├── frontend/        # Next.js Frontend
│   ├── ms1-core-api/    # Express.js Backend (Microservice 1)
│   └── ms2-ai-engine/   # FastAPI AI Backend (Microservice 2)
│
├── packages/
│   ├── shared-types/    # Shared TypeScript types
│   ├── shared-utils/    # Shared utilities
│   └── ui/              # Shared UI components
│
├── docs/                # Documentation
│   ├── 01-PRD.md
│   ├── 02-Architecture.md
│   ├── 03-Database.md
│   ├── 04-API-Design.md
│   ├── 05-Product-Flow.md
│   └── 06-Development-Notes.md
│
├── docker/              # Dockerfiles
│   ├── frontend/
│   ├── ms1/
│   ├── ms2/
│   ├── postgres/
│   └── redis/
│
├── scripts/
│
├── .github/             # GitHub Actions workflows
│
├── .vscode/             # VS Code settings
│
├── docker-compose.yml   # Local development stack
├── package.json
├── pnpm-workspace.yaml  # pnpm monorepo config
├── turbo.json           # Turborepo config
├── .gitignore
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >=20
- pnpm >=9
- Python >=3.12 (optional for local development)
- Docker & Docker Compose

### Local Setup

1. Install pnpm globally:
   ```bash
   npm install -g pnpm@9
   ```

2. Clone the repository:
   ```bash
   git clone https://github.com/heyayushhh/PATHWISE-.git
   cd PATHWISE-
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Install dependencies:
   ```bash
   pnpm install
   ```

5. Start development stack with Docker Compose:
   ```bash
   docker compose up -d
   ```

6. Run services locally:
   ```bash
   # Start all services with Turborepo
   pnpm dev

   # Or start individual services:
   # Frontend: cd apps/frontend && pnpm dev
   # MS1 Core API: cd apps/ms1-core-api && pnpm dev
   # MS2 AI Engine: cd apps/ms2-ai-engine && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload
   ```

## Development Standards

- Follow Git Flow: No direct pushes to main, feature branches, PRs
- Conventional Commit messages
- Production-quality code, SOLID principles, loose coupling
