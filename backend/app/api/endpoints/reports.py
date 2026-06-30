from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.services import report_service
from backend.app.core.database import get_db
from backend.app.api.endpoints.auth import get_current_user

router = APIRouter()

@router.get("", response_model=List[Dict[str, Any]])
def get_reports(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retrieves all collected mental health assessment reports.
    """
    try:
        reports = report_service.get_all_reports(db=db)
        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch reports: {str(e)}")

