from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.services import report_service
from backend.app.core.database import get_db
from backend.app.api.endpoints.auth import get_current_user

router = APIRouter()

@router.get("/data", response_model=List[Dict[str, Any]])
def get_city_map_data(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retrieves aggregated mental health risk averages, coordinate mappings, and risk zones for all cities.
    """
    try:
        map_data = report_service.get_map_data(db=db)
        return map_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch map data: {str(e)}")

