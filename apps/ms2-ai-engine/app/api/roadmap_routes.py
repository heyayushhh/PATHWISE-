from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any

from app.services.roadmap_engine import generate_roadmap_flow

router = APIRouter(prefix="/roadmap", tags=["roadmap"])

@router.post("/generate")
async def generate_roadmap(context: Dict[str, Any]):
    try:
        roadmap_dict = generate_roadmap_flow(context)
        return roadmap_dict
    except Exception as e:
        print(f"[MS2 Roadmap] Generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
