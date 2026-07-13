from fastapi import FastAPI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="PathWise AI Engine")


@app.get("/health")
def health_check():
    return {"status": "ok"}
