from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from backend.app.services import report_service

router = APIRouter()

@router.get("", response_model=List[Dict[str, Any]])
def get_reports():
    """
    Retrieves all collected mental health assessment reports.
    """
    try:
        reports = report_service.get_all_reports()
        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch reports: {str(e)}")
