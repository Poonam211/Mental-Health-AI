from pydantic import BaseModel, Field
from typing import List, Dict, Any, Literal

PHQOption = Literal["Not at all", "Several days", "More than half the days", "Nearly every day"]

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
    phq_answers: List[PHQOption] = Field(..., min_length=9, max_length=9)
    gad_answers: List[PHQOption] = Field(..., min_length=7, max_length=7)
    symptoms: str = Field(...)
    eating_habits: str = Field("Balanced", description="Eating habits of the user")

class DailyWellnessPlan(BaseModel):
    walking_goals: str
    hydration: str
    sleep_target: str
    meditation: str
    exercise: str
    diet_suggestions: str
    breathing_exercises: str
    follow_up: str

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
    symptom_analysis: Dict[str, Any]
    recommendations: List[str]
    latitude: float | None
    longitude: float | None
    message: str
    daily_wellness_plan: DailyWellnessPlan | None = None
    avg_depression_percent: float | None = None
    avg_anxiety_percent: float | None = None
    avg_stress_percent: float | None = None
