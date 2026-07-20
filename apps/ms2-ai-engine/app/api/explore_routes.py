from fastapi import APIRouter, HTTPException
import logging
from app.schemas.explore_schema import ExplorePersonalizeRequest
from app.services.explore_insight_engine import run_explore_insight_engine

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/personalize")
def personalize_explore(request: ExplorePersonalizeRequest):
    try:
        result = run_explore_insight_engine(request)
        if result.get("error"):
            # Return 200 with error so MS1 can log it and degrade gracefully
            return {"insight": None, "error": result["error"]}
        return result
    except Exception as e:
        logger.error(f"Error in personalize_explore: {e}")
        raise HTTPException(status_code=500, detail=str(e))
