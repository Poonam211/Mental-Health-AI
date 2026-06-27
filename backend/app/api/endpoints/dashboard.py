from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from backend.app.services import report_service

router = APIRouter()

@router.get("/stats", response_model=Dict[str, Any])
def get_dashboard_statistics():
    """
    Retrieves aggregated dashboard metrics (intakes, unique cities, average risk/wellness scores).
    """
    try:
        stats = report_service.get_dashboard_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard stats: {str(e)}")
