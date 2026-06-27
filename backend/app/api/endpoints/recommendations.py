from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List
from backend.app.services import ml_service

router = APIRouter()

class RecommendationsRequest(BaseModel):
    depression_score: int = Field(..., ge=0, le=27, description="PHQ-9 depression score sum (0-27)")
    anxiety_score: int = Field(..., ge=0, le=21, description="GAD-7 anxiety score sum (0-21)")
    risk_score: float = Field(..., ge=0.0, le=100.0, description="Estimated stress risk score percentage (0-100)")

@router.post("", response_model=List[str])
def get_clinical_recommendations(request: RecommendationsRequest):
    """
    Retrieves a list of personalized clinical recommendations and remedies based on PHQ-9, GAD-7, and Stress Risk scores.
    """
    try:
        recommendations = ml_service.get_recommendations(
            depression_score=request.depression_score,
            anxiety_score=request.anxiety_score,
            risk_score=request.risk_score
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch recommendations: {str(e)}")
