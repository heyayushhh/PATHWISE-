# pyrefly: ignore [missing-import]
from fastapi import FastAPI
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

from app.api.career import router as career_router
from app.api import assessment_routes
from app.api import explore_routes
from app.api import roadmap_routes

app = FastAPI(title="PathWise AI Engine (MS2)")

# Minimal CORS setup to allow MS1 calls (adjust as needed for prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(career_router)
app.include_router(assessment_routes.router)
app.include_router(explore_routes.router, prefix="/api/explore")
app.include_router(roadmap_routes.router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/connection-test")
def connection_test():
    return {"message": "AI Engine Connected"}