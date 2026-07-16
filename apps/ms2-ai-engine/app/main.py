# pyrefly: ignore [missing-import]
from fastapi import FastAPI
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

from app.api.career import router as career_router
from app.api.assessment_routes import router as assessment_router

# Load environment variables
load_dotenv()

app = FastAPI(title="PathWise AI Engine")

app.include_router(career_router)
app.include_router(assessment_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/connection-test")
def connection_test():
    return {"message": "AI Engine Connected"}