# PathWise

PathWise is an AI-powered Career Intelligence Platform built as a monorepo. It is designed to help students and professionals discover relevant career paths, understand skill gaps, and move toward a personalized roadmap.

## Current Stack

- Frontend: Next.js 14, React, TypeScript, Tailwind CSS
- Core API: Node.js, Express, TypeScript, JWT, Drizzle ORM
- AI Engine: FastAPI, Python, LangChain, LangGraph
- Data: PostgreSQL, Neo4j, Redis
- Tooling: pnpm workspaces, Turborepo, Docker Compose

## Monorepo Structure

```text
apps/
  frontend/         Next.js app
  ms1-core-api/     Express + TypeScript API
  ms2-ai-engine/    FastAPI service
packages/
  shared-types/
  shared-utils/
  ui/
docs/
  02-Architecture.md
  03-Database.md
  05-Product-Flow.md
```

## Current Status

- Bootstrap monorepo is in place
- Sprint 2B auth foundation is wired up
- PostgreSQL auth tables are defined through Drizzle migrations
- Local database containers can be started through Docker Compose

## Local Development

### 1. Install workspace dependencies

```bash
pnpm install
```

### 2. Create environment files

At the repo root:

```bash
cp .env.example .env
```

For the AI engine:

```bash
cd apps/ms2-ai-engine
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item` instead of `cp`.

### 3. Start database containers

This is the cleanest local path right now:

```bash
docker compose up -d postgres redis neo4j
```

### 4. Run Drizzle migration

```bash
cd apps/ms1-core-api
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 5. Start the services

Frontend:

```bash
pnpm --filter frontend dev
```

Core API:

```bash
pnpm --filter ms1-core-api dev
```

AI engine:

```bash
cd apps/ms2-ai-engine
py -3.12 -m venv venv
.\venv\Scripts\pip install -r requirements.txt
.\venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port 3002 --reload
```

## Default Local Ports

- Frontend: `http://localhost:3000`
- MS1 Core API: `http://localhost:3001`
- MS2 AI Engine: `http://localhost:3002`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Neo4j Browser: `http://localhost:7474`

## Current API Surface

MS1 currently exposes:

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/ai/connection-test`

MS2 currently exposes:

- `GET /health`
- `GET /connection-test`

## Notes

- A root `pnpm-lock.yaml` is present and should be committed for Docker-based installs.
- The most reliable local workflow today is: databases in Docker, app services running directly on the host machine.
- Set `AI_ENGINE_URL=http://127.0.0.1:3002` in MS1 when running locally to avoid `localhost` resolving to the wrong process on some Windows setups.
- The deeper product, architecture, and database planning docs live in [docs/02-Architecture.md](file:///C:/Users/hp/Desktop/Pathwise/PATHWISE-/docs/02-Architecture.md), [docs/03-Database.md](file:///C:/Users/hp/Desktop/Pathwise/PATHWISE-/docs/03-Database.md), and [docs/05-Product-Flow.md](file:///C:/Users/hp/Desktop/Pathwise/PATHWISE-/docs/05-Product-Flow.md).

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
