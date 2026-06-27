from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from backend.app.services import report_service

router = APIRouter()

@router.get("/demographics", response_model=Dict[str, Any])
def get_demographics_analytics():
    """
    Retrieves demographic risk breakdowns by age groups and occupational categories.
    """
    try:
        analytics = report_service.get_analytics_demographics()
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch demographics analytics: {str(e)}")
