from pydantic import BaseModel, Field
from typing import List, Dict

class PredictionRequest(BaseModel):
    age: int = Field(..., ge=10, le=100)
    city: str = Field(..., min_length=1)
    gender: str = Field(..., pattern="^(Male|Female)$")
    occupation: str = Field(...)
    physical_activity: str = Field(..., pattern="^(Low|Moderate|High)$")
    mental_history: str = Field(..., pattern="^(No|Yes)$")
    chronic_illness: str = Field(..., pattern="^(No|Yes)$")
    sleep_hours: float = Field(..., ge=1.0, le=12.0)
    days_of_treatment: int = Field(..., ge=0, le=365)
    phq_answers: List[str] = Field(..., min_items=9, max_items=9)
    gad_answers: List[str] = Field(..., min_items=7, max_items=7)
    symptoms: str = Field(...)

class PredictionResponse(BaseModel):
    risk_score: float
    wellness_score: float
    risk_level: str
    mental_state: str
    depression_score: int
    anxiety_score: int
    depression_percent: float
    anxiety_percent: float
    stress_percent: float
    symptom_analysis: Dict[str, int]
    recommendations: List[str]
    latitude: float | None
    longitude: float | None
    message: str
