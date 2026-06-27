from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from backend.app.services import report_service

router = APIRouter()

@router.get("/data", response_model=List[Dict[str, Any]])
def get_city_map_data():
    """
    Retrieves aggregated mental health risk averages, coordinate mappings, and risk zones for all cities.
    """
    try:
        map_data = report_service.get_map_data()
        return map_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch map data: {str(e)}")
