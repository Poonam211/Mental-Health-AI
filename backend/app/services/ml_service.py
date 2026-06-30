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
    
    # Pre-warm the AI symptom detector NLP model at startup
    try:
        detect_symptoms("warmup")
    except Exception as e:
        print(f"Error warming up AI symptom model: {e}")

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

def get_recommendations(
    depression_score: int,
    anxiety_score: int,
    risk_score: float,
    symptom_analysis: Dict = None,
    age: int = 25,
    occupation: str = "Employee",
    sleep_hours: float = 7.0,
    physical_activity: str = "Moderate",
    eating_habits: str = "Balanced"
) -> List[str]:
    """
    Returns clinical recommendation guidelines based on depression, anxiety, stress risk scores,
    and holistic lifestyle parameters. Backward-compatible with recommendations router.
    """
    recs = []
    
    # 1. AI Intent Crisis Alert check
    is_crisis = False
    if symptom_analysis and symptom_analysis.get("Intent_Crisis_Alert", 0) >= 6:
        is_crisis = True
        
    if is_crisis or depression_score >= 20 or anxiety_score >= 15 or risk_score >= 70:
        recs.append("CRITICAL: Consult a licensed therapist or mental health professional immediately.")
        recs.append("EMERGENCY SUPPORT: Call the AASRA 24/7 Helpline at +91-9820466726 or Vandrevala Foundation at +91-9999666555.")
    elif depression_score >= 15 or anxiety_score >= 10:
        recs.append("Recommend scheduling a counseling or clinical therapy evaluation.")
        
    # 2. General Score-based recommendations
    if depression_score >= 10:
        recs.append("Incorporate behavioral activation: schedule one enjoyable activity daily.")
    if anxiety_score >= 7:
        recs.append("Practice regular somatic grounding exercises (e.g., progressive muscle relaxation).")
    if risk_score >= 40:
        recs.append("Implement time-blocking techniques and regular decompression breaks to manage stress.")
        
    # 3. Demographic personalizations
    if age < 21:
        recs.append("Student Support: Reach out to campus wellness advisors or peer counseling networks.")
    elif occupation == "Retired":
        recs.append("Retirement Activity: Engage in structured volunteering or social hobby clubs.")
    elif occupation in ["Employee", "Freelancer"]:
        recs.append("Professional boundary setting: Practice turning off work notifications after business hours.")
        
    # 4. Lifestyle & Sleep recommendations
    if sleep_hours < 6.0:
        recs.append("Sleep Hygiene: Establish a screens-off curfew 1 hour before sleeping and optimize room darkness.")
    elif sleep_hours > 9.0:
        recs.append("Limit oversleeping by setting a consistent waking alarm, aligning with circadian rhythm.")
        
    if physical_activity == "Low":
        recs.append("Gradual mobility: Aim for 10-15 minute gentle walking intervals to boost neuroplasticity.")
        
    if eating_habits in ["Irregular", "Junk food"]:
        recs.append("Nutritional balance: Swap high-glycemic snacks with magnesium-rich foods (nuts, spinach) to support stress reduction.")
        
    # Fallback default recommendations if empty
    if not recs:
        recs = [
            "Continue maintaining positive clinical and self-care habits.",
            "Maintain strong interpersonal connections with friends and family.",
            "Ensure regular schedules for work, sleep, and physical activity."
        ]
        
    return recs

def generate_daily_wellness_plan(
    depression_score: int,
    anxiety_score: int,
    risk_score: float,
    symptom_analysis: Dict,
    age: int,
    occupation: str,
    sleep_hours: float,
    physical_activity: str,
    eating_habits: str
) -> Dict[str, str]:
    """
    Generates a structured, clinical-grade Daily Wellness Plan based on user metrics.
    """
    # 1. Walking Goals
    if physical_activity == "Low":
        walking = "4,000 - 5,000 steps daily (gentle pacing, focus on consistency)"
    elif physical_activity == "Moderate":
        walking = "7,500 - 8,500 steps daily (brisk tempo, outdoors if possible)"
    else:
        walking = "10,000+ steps daily (active tracking, include cardiovascular bursts)"
        
    # 2. Hydration
    if physical_activity == "High" or risk_score >= 50:
        hydration = "3.0 - 3.5 Liters daily (track using hourly visual reminders)"
    else:
        hydration = "2.5 Liters daily (sufficient hydration supporting neural balance)"
        
    # 3. Sleep Target
    if age < 25:
        sleep = "8.0 - 9.0 hours (essential for youthful cognitive recovery)"
    elif age > 60:
        sleep = "6.5 - 7.5 hours (natural senior circadian rhythm target)"
    else:
        sleep = "7.5 - 8.0 hours (ideal window for adult neurological repair)"
        
    # 4. Meditation
    if anxiety_score >= 15:
        meditation = "15 minutes of guided mindfulness or body-scan meditation twice daily"
    elif anxiety_score >= 8:
        meditation = "10 minutes of daily mindfulness meditation (morning focus)"
    elif risk_score >= 40:
        meditation = "5 minutes of grounding exercises (5-4-3-2-1 sensory method) when overwhelmed"
    else:
        meditation = "5 minutes of daily positive visualization or self-reflection"
        
    # 5. Exercise
    if physical_activity == "Low":
        exercise = "15 minutes of dynamic stretching or beginner-friendly Hatha yoga"
    else:
        exercise = "30 minutes of aerobic exercise (brisk walking, cycling, or swimming) 5 days/week"
        
    # 6. Diet Suggestions
    if eating_habits == "Junk food":
        diet = "Reduce refined sugars and processed fats; substitute with complex carbs (oats, brown rice)"
    elif eating_habits == "Irregular":
        diet = "Establish rigid meal times to regulate blood glucose levels; include lean proteins and hydration"
    elif eating_habits in ["Vegan/Vegetarian", "Veg"]:
        diet = "Ensure adequate vitamin B12 and iron intake (fortified cereals, lentils, seeds, spinach)"
    else:
        diet = "Balanced diet: rich in whole grains, healthy fats (olive oil, nuts), and green vegetables"
        
    # 7. Breathing Exercises
    if anxiety_score >= 10 or risk_score >= 50:
        breathing = "4-7-8 Breathing Technique: Inhale 4s, hold 7s, exhale 8s (complete 4 cycles morning & night)"
    else:
        breathing = "Box Breathing: Inhale 4s, hold 4s, exhale 4s, hold empty 4s (perform for 3-5 minutes during stress)"
        
    # 8. Follow-up Recommendations
    is_crisis = symptom_analysis.get("Intent_Crisis_Alert", 0) >= 6
    if is_crisis or risk_score >= 70 or depression_score >= 20:
        follow_up = "IMMEDIATE Action: Seek professional clinical consult. Contact AASRA (+91-9820466726) for immediate safety support."
    elif depression_score >= 10 or anxiety_score >= 8:
        follow_up = "Schedule a weekly or bi-weekly psychotherapy session. Re-assess risk using this observatory in 1 week."
    else:
        follow_up = "Standard wellness follow-up. Re-assess wellness index monthly to track progress."
        
    return {
        "walking_goals": walking,
        "hydration": hydration,
        "sleep_target": sleep,
        "meditation": meditation,
        "exercise": exercise,
        "diet_suggestions": diet,
        "breathing_exercises": breathing,
        "follow_up": follow_up
    }

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
    symptoms: str,
    eating_habits: str = "Balanced"
) -> Tuple[Dict, List[str]]:
    """
    Performs predictions and calculates scores based on inputs.
    Returns:
        prediction_results: Dict containing scores, levels, states, wellness plan, etc.
        recommendations: List of recommended actions.
    """
    # Ensure models are loaded
    load_models_and_encoders()
    
    # Calculate Scores
    depression_score = calculate_depression_score(phq_answers)
    anxiety_score = calculate_anxiety_score(gad_answers)
    
    # AI Symptom Analysis
    symptom_result = detect_symptoms(symptoms)
    
    # Dynamic classification of natural language occupation to standard ML categories
    occ_lower = occupation.lower()
    if any(k in occ_lower for k in ["student", "school", "college", "study", "exam", "placement", "academic", "university", "prep"]):
        standard_occupation = "Student"
    elif any(k in occ_lower for k in ["job", "work", "engineer", "manager", "employee", "corporate", "office", "developer", "staff", "technician", "clerk", "salary"]):
        standard_occupation = "Employee"
    elif any(k in occ_lower for k in ["farmer", "agriculture", "cultivator", "crop", "farm"]):
        standard_occupation = "Farmer"
    elif any(k in occ_lower for k in ["business", "owner", "shop", "founder", "entrepreneur", "ceo", "merchant"]):
        standard_occupation = "Business"
    elif any(k in occ_lower for k in ["freelance", "contractor", "consultant", "writer", "designer", "artist"]):
        standard_occupation = "Freelancer"
    elif any(k in occ_lower for k in ["home", "housewife", "homemaker", "family care", "parent"]):
        standard_occupation = "Homemaker"
    elif any(k in occ_lower for k in ["retire", "senior citizen", "pension"]):
        standard_occupation = "Retired"
    elif any(k in occ_lower for k in ["unemployed", "jobless", "looking for work", "laid off"]):
        standard_occupation = "Unemployed"
    else:
        standard_occupation = "Other"
        
    # Determine Community Type
    community_map = {
        "Student": "Academic Prep Cohort",
        "Employee": "Corporate & Professional",
        "Farmer": "Agricultural Community",
        "Business": "Independent / Gig Economy",
        "Freelancer": "Independent / Gig Economy",
        "Homemaker": "Domestic & Family Care",
        "Retired": "Retirement & Senior Care",
        "Unemployed": "Job-Seeking Support Group",
        "Other": "General Urban Cohort"
    }
    community_type = community_map.get(standard_occupation, "General Urban Cohort")
    symptom_result["community_type"] = community_type
    symptom_result["user_situation"] = occupation
    
    # Encode Inputs
    work_status = OCCUPATION_TO_WORK.get(standard_occupation, "Unemployed")
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
        
    # Recommendations & Daily Wellness Plan
    recommendations = get_recommendations(
        depression_score=depression_score,
        anxiety_score=anxiety_score,
        risk_score=risk_score,
        symptom_analysis=symptom_result,
        age=age,
        occupation=standard_occupation,
        sleep_hours=sleep_hours,
        physical_activity=physical_activity,
        eating_habits=eating_habits
    )
    
    if symptom_result and "personalized_recommendations" in symptom_result:
        for rec in symptom_result["personalized_recommendations"]:
            if rec not in recommendations:
                recommendations.append(rec)
    
    daily_wellness_plan = generate_daily_wellness_plan(
        depression_score=depression_score,
        anxiety_score=anxiety_score,
        risk_score=risk_score,
        symptom_analysis=symptom_result,
        age=age,
        occupation=standard_occupation,
        sleep_hours=sleep_hours,
        physical_activity=physical_activity,
        eating_habits=eating_habits
    )
        
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
        "symptom_analysis": symptom_result,
        "daily_wellness_plan": daily_wellness_plan
    }
    
    return results, recommendations
