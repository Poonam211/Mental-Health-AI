import joblib
import pandas as pd
from typing import Dict, List, Tuple
from backend.app.core import config
from src.symptom_detector import detect_symptoms

# Global variables to cache models and encoders in memory
_models_loaded = False
risk_level_model = None
risk_score_model = None
risk_encoder = None
gender_encoder = None
work_encoder = None
activity_encoder = None
history_encoder = None
illness_encoder = None

def load_models_and_encoders():
    """
    Loads all models and encoders into memory once.
    """
    global _models_loaded, risk_level_model, risk_score_model, risk_encoder
    global gender_encoder, work_encoder, activity_encoder, history_encoder, illness_encoder
    
    if _models_loaded:
        return
        
    risk_level_model = joblib.load(config.RISK_LEVEL_MODEL_PATH)
    risk_score_model = joblib.load(config.RISK_SCORE_MODEL_PATH)
    risk_encoder = joblib.load(config.RISK_LEVEL_ENCODER_PATH)
    gender_encoder = joblib.load(config.GENDER_ENCODER_PATH)
    work_encoder = joblib.load(config.WORK_ENCODER_PATH)
    activity_encoder = joblib.load(config.ACTIVITY_ENCODER_PATH)
    history_encoder = joblib.load(config.HISTORY_ENCODER_PATH)
    illness_encoder = joblib.load(config.ILLNESS_ENCODER_PATH)
    
    _models_loaded = True

# Map occupation to work status as per original logic
OCCUPATION_TO_WORK = {
    "Student": "Student",
    "Employee": "Employed",
    "Farmer": "Employed",
    "Business": "Employed",
    "Freelancer": "Employed",
    "Painter": "Employed",
    "Homemaker": "Unemployed",
    "Unemployed": "Unemployed",
    "Retired": "Retired",
    "Other": "Unemployed"
}

# PHQ-9 and GAD-7 Options mapping
OPTIONS_MAPPING = {
    "Not at all": 0,
    "Several days": 1,
    "More than half the days": 2,
    "Nearly every day": 3
}

def calculate_depression_score(phq_answers: List[str]) -> int:
    return sum(OPTIONS_MAPPING[ans] for ans in phq_answers)

def calculate_anxiety_score(gad_answers: List[str]) -> int:
    return sum(OPTIONS_MAPPING[ans] for ans in gad_answers)

def get_recommendations(depression_score: int, anxiety_score: int, risk_score: float) -> List[str]:
    """
    Returns clinical recommendation guidelines based on depression, anxiety, and stress risk scores.
    """
    if depression_score >= 20:
        return [
            "Consult a mental health professional.",
            "Talk with trusted family or friends.",
            "Maintain a healthy sleep routine.",
            "Seek immediate help if self-harm thoughts occur."
        ]
    elif depression_score >= 15:
        return [
            "Increase social interaction.",
            "Exercise regularly.",
            "Maintain a daily routine."
        ]
    elif anxiety_score >= 10:
        return [
            "Practice deep breathing exercises.",
            "Reduce caffeine intake.",
            "Practice mindfulness meditation."
        ]
    elif risk_score >= 40:
        return [
            "Take regular breaks.",
            "Improve work-life balance.",
            "Exercise and sleep adequately."
        ]
    else:
        return [
            "Continue healthy habits.",
            "Maintain social connections.",
            "Stay physically active."
        ]

def predict_mental_health(
    age: int,
    gender: str,
    occupation: str,
    physical_activity: str,
    mental_history: str,
    chronic_illness: str,
    sleep_hours: float,
    days_of_treatment: int,
    phq_answers: List[str],
    gad_answers: List[str],
    symptoms: str
) -> Tuple[Dict, List[str]]:
    """
    Performs predictions and calculates scores based on inputs.
    Returns:
        prediction_results: Dict containing scores, levels, states, etc.
        recommendations: List of recommended actions.
    """
    # Ensure models are loaded
    load_models_and_encoders()
    
    # Calculate Scores
    depression_score = calculate_depression_score(phq_answers)
    anxiety_score = calculate_anxiety_score(gad_answers)
    
    # AI Symptom Analysis
    symptom_result = detect_symptoms(symptoms)
    
    # Encode Inputs
    work_status = OCCUPATION_TO_WORK.get(occupation, "Unemployed")
    gender_encoded = gender_encoder.transform([gender])[0]
    work_encoded = work_encoder.transform([work_status])[0]
    activity_encoded = activity_encoder.transform([physical_activity])[0]
    history_encoded = history_encoder.transform([mental_history])[0]
    illness_encoded = illness_encoder.transform([chronic_illness])[0]
    
    # Create input DataFrame
    data = pd.DataFrame([[
        age,
        depression_score,
        anxiety_score,
        sleep_hours,
        days_of_treatment,
        gender_encoded,
        work_encoded,
        activity_encoded,
        history_encoded,
        illness_encoded
    ]], columns=[
        "Age",
        "Depression_Score",
        "Anxiety_Score",
        "Sleep_Hours",
        "Days_of_Treatment",
        "Gender",
        "Work_Status",
        "Physical_Activity",
        "Mental_Health_History",
        "Chronic_Illness"
    ])
    
    # Model Predictions
    risk_score = float(risk_score_model.predict(data)[0])
    wellness_score = max(0.0, 100.0 - risk_score)
    
    risk_level_encoded = risk_level_model.predict(data)[0]
    risk_level = str(risk_encoder.inverse_transform([risk_level_encoded])[0])
    
    # Calculate Percentages
    depression_percent = (depression_score / 27) * 100
    anxiety_percent = (anxiety_score / 21) * 100
    stress_percent = min(risk_score, 100.0)
    
    # Mental State Logic
    if depression_score >= 20:
        mental_state = "Severe Depression"
    elif depression_score >= 15:
        mental_state = "Moderate Depression"
    elif anxiety_score >= 15:
        mental_state = "Severe Anxiety"
    elif anxiety_score >= 10:
        mental_state = "Moderate Anxiety"
    elif risk_score >= 60:
        mental_state = "High Stress"
    elif risk_score >= 40:
        mental_state = "Moderate Stress"
    else:
        mental_state = "Healthy"
        
    # Recommendations
    recommendations = get_recommendations(depression_score, anxiety_score, risk_score)
        
    results = {
        "risk_score": round(risk_score, 2),
        "wellness_score": round(wellness_score, 2),
        "risk_level": risk_level,
        "mental_state": mental_state,
        "depression_score": depression_score,
        "anxiety_score": anxiety_score,
        "depression_percent": round(depression_percent, 2),
        "anxiety_percent": round(anxiety_percent, 2),
        "stress_percent": round(stress_percent, 2),
        "symptom_analysis": symptom_result
    }
    
    return results, recommendations
