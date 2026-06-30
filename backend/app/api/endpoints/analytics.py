from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from backend.app.services import report_service
from backend.app.core.database import get_db
from backend.app.api.endpoints.auth import get_current_user

router = APIRouter()

@router.get("/demographics", response_model=Dict[str, Any])
def get_demographics_analytics(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retrieves demographic risk breakdowns by age groups and occupational categories.
    """
    try:
        analytics = report_service.get_analytics_demographics(db=db)
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch demographics analytics: {str(e)}")

