import os
import pandas as pd
from datetime import datetime
from typing import List, Dict, Any
from backend.app.core import config

def save_report(
    city: str,
    lat: float | None,
    lon: float | None,
    occupation: str,
    age: int,
    risk_score: float,
    risk_level: str,
    mental_state: str,
    depression_score: int,
    anxiety_score: int,
    depression_percent: float,
    anxiety_percent: float,
    stress_percent: float,
    wellness_score: float
) -> bool:
    """
    Saves a prediction report to the city_reports.csv file.
    """
    report_data = {
        "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "City": city,
        "Latitude": lat if lat is not None else "",
        "Longitude": lon if lon is not None else "",
        "Occupation": occupation,
        "Age": age,
        "Risk_Score": round(float(risk_score), 2),
        "Risk_Level": risk_level,
        "Mental_State": mental_state,
        "Depression_Score": depression_score,
        "Anxiety_Score": anxiety_score,
        "Depression_Percent": round(depression_percent, 2),
        "Anxiety_Percent": round(anxiety_percent, 2),
        "Stress_Percent": round(stress_percent, 2),
        "Wellness_Score": round(wellness_score, 2)
    }
    
    report_df = pd.DataFrame([report_data])
    
    # Ensure parent directory exists
    os.makedirs(os.path.dirname(config.REPORTS_CSV), exist_ok=True)
    
    file_exists = os.path.exists(config.REPORTS_CSV)
    
    if file_exists:
        report_df.to_csv(
            config.REPORTS_CSV,
            mode="a",
            header=False,
            index=False
        )
    else:
        report_df.to_csv(
            config.REPORTS_CSV,
            index=False
        )
    return True

def get_all_reports() -> List[Dict[str, Any]]:
    """
    Reads all reports from the CSV file and returns them as a list of dictionaries.
    """
    if not os.path.exists(config.REPORTS_CSV):
        return []
        
    try:
        df = pd.read_csv(config.REPORTS_CSV)
        # Handle case if Wellness_Score is missing
        if "Wellness_Score" not in df.columns and "Risk_Score" in df.columns:
            df["Wellness_Score"] = 100 - df["Risk_Score"]
        
        # Replace NaN/None with appropriate empty values to ensure clean JSON serialization
        df = df.fillna("")
        return df.to_dict(orient="records")
    except Exception:
        return []

def age_group(age: int) -> str:
    if age <= 20:
        return "10-20"
    elif age <= 35:
        return "21-35"
    elif age <= 50:
        return "36-50"
    else:
        return "50+"

def get_dashboard_stats() -> Dict[str, Any]:
    """
    Computes dashboard-level aggregate statistics from collected reports.
    """
    reports = get_all_reports()
    if not reports:
        return {
            "total_reports": 0,
            "unique_cities": 0,
            "avg_risk": 0.0,
            "avg_wellness": 100.0
        }
    
    df = pd.DataFrame(reports)
    
    return {
        "total_reports": len(df),
        "unique_cities": int(df["City"].nunique()) if "City" in df.columns else 0,
        "avg_risk": round(float(df["Risk_Score"].mean()), 2) if "Risk_Score" in df.columns else 0.0,
        "avg_wellness": round(float(df["Wellness_Score"].mean()), 2) if "Wellness_Score" in df.columns else 100.0
    }

def get_analytics_demographics() -> Dict[str, Any]:
    """
    Computes demographic breakdowns (Age and Occupation) from collected reports.
    """
    reports = get_all_reports()
    if not reports:
        return {
            "age_analytics": [],
            "occupation_analytics": []
        }
        
    df = pd.DataFrame(reports)
    
    # Age Group Analytics
    age_analytics = []
    if "Age" in df.columns:
        df["Age_Group"] = df["Age"].apply(age_group)
        age_grouped = df.groupby("Age_Group").agg({
            "Risk_Score": "mean",
            "Anxiety_Percent": "mean",
            "Depression_Percent": "mean"
        }).round(2).reset_index()
        age_analytics = age_grouped.to_dict(orient="records")
        
    # Occupation Analytics
    occupation_analytics = []
    if "Occupation" in df.columns:
        occ_grouped = df.groupby("Occupation").agg({
            "Risk_Score": "mean",
            "Anxiety_Percent": "mean",
            "Depression_Percent": "mean"
        }).round(2).reset_index()
        occupation_analytics = occ_grouped.to_dict(orient="records")
        
    return {
        "age_analytics": age_analytics,
        "occupation_analytics": occupation_analytics
    }

def get_map_data() -> List[Dict[str, Any]]:
    """
    Computes city-level aggregated map data including risk zones.
    """
    reports = get_all_reports()
    if not reports:
        return []
        
    df = pd.DataFrame(reports)
    
    if "City" not in df.columns:
        return []
        
    # Group by City
    agg_dict = {
        "Risk_Score": "mean",
        "Anxiety_Percent": "mean",
        "Depression_Percent": "mean",
        "Stress_Percent": "mean"
    }
    if "Latitude" in df.columns:
        agg_dict["Latitude"] = "first"
    if "Longitude" in df.columns:
        agg_dict["Longitude"] = "first"
        
    city_grouped = df.groupby("City").agg(agg_dict).round(2).reset_index()
    
    # Define Risk Zone
    def get_risk_zone(score: float) -> str:
        if score >= 60:
            return "High"
        elif score >= 45:
            return "Moderate"
        elif score >= 30:
            return "Medium"
        else:
            return "Low"
            
    city_grouped["Risk_Zone"] = city_grouped["Risk_Score"].apply(get_risk_zone)
    
    return city_grouped.to_dict(orient="records")
