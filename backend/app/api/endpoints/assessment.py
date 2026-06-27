from fastapi import APIRouter, HTTPException
from backend.app.schemas.assessment import PredictionRequest, PredictionResponse
from backend.app.services import ml_service, geo_service, report_service

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
def predict_assessment(request: PredictionRequest):
    """
    Validates input assessment, performs ML risk assessment, geocodes the city,
    saves the report, and returns the detailed risk score and recommendations.
    """
    try:
        # 1. Geocode City
        lat, lon = geo_service.get_coordinates(request.city)
        
        # 2. Run Predictions and Analysis
        results, recommendations = ml_service.predict_mental_health(
            age=request.age,
            gender=request.gender,
            occupation=request.occupation,
            physical_activity=request.physical_activity,
            mental_history=request.mental_history,
            chronic_illness=request.chronic_illness,
            sleep_hours=request.sleep_hours,
            days_of_treatment=request.days_of_treatment,
            phq_answers=request.phq_answers,
            gad_answers=request.gad_answers,
            symptoms=request.symptoms
        )
        
        # 3. Save Report for City Analytics
        saved = report_service.save_report(
            city=request.city,
            lat=lat,
            lon=lon,
            occupation=request.occupation,
            age=request.age,
            risk_score=results["risk_score"],
            risk_level=results["risk_level"],
            mental_state=results["mental_state"],
            depression_score=results["depression_score"],
            anxiety_score=results["anxiety_score"],
            depression_percent=results["depression_percent"],
            anxiety_percent=results["anxiety_percent"],
            stress_percent=results["stress_percent"],
            wellness_score=results["wellness_score"]
        )
        
        if not saved:
            raise HTTPException(status_code=500, detail="Failed to save report to CSV")
            
        # 4. Construct Response
        return PredictionResponse(
            risk_score=results["risk_score"],
            wellness_score=results["wellness_score"],
            risk_level=results["risk_level"],
            mental_state=results["mental_state"],
            depression_score=results["depression_score"],
            anxiety_score=results["anxiety_score"],
            depression_percent=results["depression_percent"],
            anxiety_percent=results["anxiety_percent"],
            stress_percent=results["stress_percent"],
            symptom_analysis=results["symptom_analysis"],
            recommendations=recommendations,
            latitude=lat,
            longitude=lon,
            message="Assessment predicted and report saved successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
