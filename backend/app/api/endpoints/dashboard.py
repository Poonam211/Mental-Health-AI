from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from backend.app.services import report_service
from backend.app.core.database import get_db
from backend.app.api.endpoints.auth import get_current_user

router = APIRouter()

@router.get("/stats", response_model=Dict[str, Any])
def get_dashboard_statistics(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retrieves aggregated dashboard metrics (intakes, unique cities, average risk/wellness scores).
    """
    try:
        stats = report_service.get_dashboard_stats(db=db)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard stats: {str(e)}")

