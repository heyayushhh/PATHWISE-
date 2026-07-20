# pyrefly: ignore [missing-import]
from fastapi import FastAPI
from pathlib import Path

from app.api.career import router as career_router
from app.api.assessment_routes import router as assessment_router
from app.api.explore_routes import router as explore_router

app = FastAPI(title="PathWise AI Engine")

app.include_router(career_router)
app.include_router(assessment_router)
app.include_router(explore_router, prefix="/api/explore")

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/connection-test")
def connection_test():
    return {"message": "AI Engine Connected"}