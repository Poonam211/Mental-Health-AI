import os
import json
import random
import pandas as pd
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from backend.app.core import config
from backend.app.core.database import AssessmentReport
from backend.app.services import city_intelligence_service

def save_report(
    db: Session,
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
    wellness_score: float,
    sleep_hours: float = 7.0,
    eating_habits: str = "Balanced",
    physical_activity: str = "Moderate",
    symptoms: str | None = None,
    symptom_analysis: Dict[str, Any] | None = None
) -> bool:
    """
    Saves a prediction report to the database.
    """
    try:
        report = AssessmentReport(
            city=city,
            latitude=lat,
            longitude=lon,
            occupation=occupation,
            age=age,
            risk_score=round(float(risk_score), 2),
            risk_level=risk_level,
            mental_state=mental_state,
            depression_score=depression_score,
            anxiety_score=anxiety_score,
            depression_percent=round(depression_percent, 2),
            anxiety_percent=round(anxiety_percent, 2),
            stress_percent=round(stress_percent, 2),
            wellness_score=round(wellness_score, 2),
            sleep_hours=round(float(sleep_hours), 2),
            eating_habits=eating_habits,
            physical_activity=physical_activity,
            symptoms=symptoms,
            symptom_analysis=json.dumps(symptom_analysis) if symptom_analysis else None
        )
        db.add(report)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        print(f"Error saving report to DB: {e}")
        return False

def get_all_reports(db: Session) -> List[Dict[str, Any]]:
    """
    Reads all reports from the database and returns them as a list of dictionaries.
    """
    try:
        reports = db.query(AssessmentReport).order_by(AssessmentReport.timestamp.desc()).all()
        result = []
        for r in reports:
            symptom_analysis_dict = None
            if r.symptom_analysis:
                try:
                    symptom_analysis_dict = json.loads(r.symptom_analysis)
                except Exception:
                    pass
            
            result.append({
                "Timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "City": r.city,
                "Latitude": r.latitude if r.latitude is not None else "",
                "Longitude": r.longitude if r.longitude is not None else "",
                "Occupation": r.occupation,
                "Age": r.age,
                "Risk_Score": r.risk_score,
                "Risk_Level": r.risk_level,
                "Mental_State": r.mental_state,
                "Depression_Score": r.depression_score,
                "Anxiety_Score": r.anxiety_score,
                "Depression_Percent": r.depression_percent,
                "Anxiety_Percent": r.anxiety_percent,
                "Stress_Percent": r.stress_percent,
                "Wellness_Score": r.wellness_score,
                "Sleep_Hours": r.sleep_hours,
                "Eating_Habits": r.eating_habits,
                "Physical_Activity": r.physical_activity,
                "Symptoms": r.symptoms or "",
                "Symptom_Analysis": symptom_analysis_dict
            })
        return result
    except Exception as e:
        print(f"Error fetching reports from DB: {e}")
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

def age_group_expr(age_col):
    return case(
        (age_col <= 20, "10-20"),
        (age_col <= 35, "21-35"),
        (age_col <= 50, "36-50"),
        else_="50+"
    )

def get_dashboard_stats(db: Session) -> Dict[str, Any]:
    """
    Computes dashboard-level aggregate statistics from the database.
    """
    try:
        stats = db.query(
            func.count(AssessmentReport.id).label("total_reports"),
            func.count(func.distinct(AssessmentReport.city)).label("unique_cities"),
            func.avg(AssessmentReport.risk_score).label("avg_risk"),
            func.avg(AssessmentReport.wellness_score).label("avg_wellness"),
            func.avg(AssessmentReport.depression_percent).label("avg_depression_percent"),
            func.avg(AssessmentReport.anxiety_percent).label("avg_anxiety_percent")
        ).first()

        if not stats or stats.total_reports == 0:
            return {
                "total_reports": 0,
                "unique_cities": 0,
                "avg_risk": 0.0,
                "avg_wellness": 100.0,
                "avg_depression_percent": 35.0,
                "avg_anxiety_percent": 30.0
            }

        return {
            "total_reports": stats.total_reports,
            "unique_cities": stats.unique_cities,
            "avg_risk": round(float(stats.avg_risk), 2) if stats.avg_risk else 0.0,
            "avg_wellness": round(float(stats.avg_wellness), 2) if stats.avg_wellness else 100.0,
            "avg_depression_percent": round(float(stats.avg_depression_percent), 2) if stats.avg_depression_percent else 35.0,
            "avg_anxiety_percent": round(float(stats.avg_anxiety_percent), 2) if stats.avg_anxiety_percent else 30.0
        }
    except Exception as e:
        print(f"Error computing dashboard stats: {e}")
        return {
            "total_reports": 0,
            "unique_cities": 0,
            "avg_risk": 0.0,
            "avg_wellness": 100.0,
            "avg_depression_percent": 35.0,
            "avg_anxiety_percent": 30.0
        }

def get_analytics_demographics(db: Session) -> Dict[str, Any]:
    """
    Computes demographic breakdowns (Age and Occupation) from the database.
    """
    try:
        # Age Group Analytics
        age_grouped = db.query(
            age_group_expr(AssessmentReport.age).label("Age_Group"),
            func.avg(AssessmentReport.risk_score).label("Risk_Score"),
            func.avg(AssessmentReport.anxiety_percent).label("Anxiety_Percent"),
            func.avg(AssessmentReport.depression_percent).label("Depression_Percent")
        ).group_by("Age_Group").all()

        age_analytics = [
            {
                "Age_Group": row.Age_Group,
                "Risk_Score": round(float(row.Risk_Score), 2),
                "Anxiety_Percent": round(float(row.Anxiety_Percent), 2),
                "Depression_Percent": round(float(row.Depression_Percent), 2)
            }
            for row in age_grouped
        ]

        # Occupation Analytics
        occ_grouped = db.query(
            AssessmentReport.occupation.label("Occupation"),
            func.avg(AssessmentReport.risk_score).label("Risk_Score"),
            func.avg(AssessmentReport.anxiety_percent).label("Anxiety_Percent"),
            func.avg(AssessmentReport.depression_percent).label("Depression_Percent")
        ).group_by(AssessmentReport.occupation).all()

        occupation_analytics = [
            {
                "Occupation": row.Occupation,
                "Risk_Score": round(float(row.Risk_Score), 2),
                "Anxiety_Percent": round(float(row.Anxiety_Percent), 2),
                "Depression_Percent": round(float(row.Depression_Percent), 2)
            }
            for row in occ_grouped
        ]

        return {
            "age_analytics": age_analytics,
            "occupation_analytics": occupation_analytics
        }
    except Exception as e:
        print(f"Error computing demographics analytics: {e}")
        return {
            "age_analytics": [],
            "occupation_analytics": []
        }

def get_map_data(db: Session) -> List[Dict[str, Any]]:
    """
    Computes city-level aggregated map data including environmental stressors and composite risk.
    """
    CITY_METADATA = {
        "Delhi": {"state": "Delhi NCR", "zone": "North"},
        "Mumbai": {"state": "Maharashtra", "zone": "West"},
        "Pune": {"state": "Maharashtra", "zone": "West"},
        "Bangalore": {"state": "Karnataka", "zone": "South"},
        "Bengaluru": {"state": "Karnataka", "zone": "South"},
        "Hyderabad": {"state": "Telangana", "zone": "South"},
        "Chennai": {"state": "Tamil Nadu", "zone": "South"},
        "Kolkata": {"state": "West Bengal", "zone": "East"},
        "Nagpur": {"state": "Maharashtra", "zone": "West"},
        "Satara": {"state": "Maharashtra", "zone": "West"},
        "Bhopal": {"state": "Madhya Pradesh", "zone": "Central"},
        "Indore": {"state": "Madhya Pradesh", "zone": "Central"},
        "Jaipur": {"state": "Rajasthan", "zone": "North"},
        "Ahmedabad": {"state": "Gujarat", "zone": "West"},
        "Surat": {"state": "Gujarat", "zone": "West"},
        "Lucknow": {"state": "Uttar Pradesh", "zone": "North"},
        "Chandigarh": {"state": "Punjab & Haryana", "zone": "North"},
        "Bhubaneswar": {"state": "Odisha", "zone": "East"},
        "Patna": {"state": "Bihar", "zone": "East"},
        "Guwahati": {"state": "Assam", "zone": "East"},
        "Kochi": {"state": "Kerala", "zone": "South"}
    }

    try:
        # Group by City (Initial Aggregation)
        city_grouped = db.query(
            AssessmentReport.city.label("City"),
            func.avg(AssessmentReport.risk_score).label("Risk_Score"),
            func.avg(AssessmentReport.anxiety_percent).label("Anxiety_Percent"),
            func.avg(AssessmentReport.depression_percent).label("Depression_Percent"),
            func.avg(AssessmentReport.stress_percent).label("Stress_Percent"),
            func.count(AssessmentReport.id).label("Count"),
            func.min(AssessmentReport.latitude).label("Latitude"),
            func.min(AssessmentReport.longitude).label("Longitude")
        ).group_by(AssessmentReport.city).all()

        if not city_grouped:
            return []

        # Pre-fetch all reports in a single query to eliminate the N+1 query bug
        all_reports = db.query(AssessmentReport).all()
        
        # Group reports by city in memory
        from collections import defaultdict
        reports_by_city = defaultdict(list)
        for r in all_reports:
            if r.city:
                reports_by_city[r.city.strip().lower()].append(r)

        def get_risk_zone(score: float) -> str:
            if score >= 65:
                return "Critical"
            elif score >= 50:
                return "High"
            elif score >= 35:
                return "Moderate"
            else:
                return "Low"

        records = []
        for row in city_grouped:
            city_name = row.City
            city_clean = city_name.strip().title()
            
            # Retrieve from in-memory dictionary
            city_reports = reports_by_city.get(city_name.strip().lower(), [])
            if not city_reports:
                continue
                
            city_rows = []
            for r in city_reports:
                age_grp = "50+"
                if r.age <= 20:
                    age_grp = "10-20"
                elif r.age <= 35:
                    age_grp = "21-35"
                elif r.age <= 50:
                    age_grp = "36-50"
                    
                city_rows.append({
                    "Age_Group": age_grp,
                    "Occupation": r.occupation,
                    "Anxiety_Percent": r.anxiety_percent,
                    "Wellness_Score": r.wellness_score
                })
            city_df = pd.DataFrame(city_rows)
            
            top_age = city_df["Age_Group"].mode()[0] if not city_df["Age_Group"].mode().empty else "21-35"
            top_job = city_df["Occupation"].mode()[0] if not city_df["Occupation"].mode().empty else "Employee"
            
            metadata = CITY_METADATA.get(city_clean, {"state": "India", "zone": "Central"})
            
            rec = {
                "City": city_name,
                "Risk_Score": round(float(row.Risk_Score), 2),
                "Anxiety_Percent": round(float(row.Anxiety_Percent), 2),
                "Depression_Percent": round(float(row.Depression_Percent), 2),
                "Stress_Percent": round(float(row.Stress_Percent), 2),
                "Count": row.Count,
                "Latitude": row.Latitude,
                "Longitude": row.Longitude,
                "Top_Age": top_age,
                "Top_Job": top_job,
                "State": metadata["state"],
                "Zone": metadata["zone"]
            }
            
            env_data = city_intelligence_service.get_city_environmental_data(
                city=city_name,
                lat=rec["Latitude"],
                lon=rec["Longitude"],
                city_reports_df=city_df
            )
            
            composite_risk = city_intelligence_service.calculate_city_risk_index(
                city=city_name,
                avg_user_risk=rec["Risk_Score"],
                env_data=env_data
            )
            
            rec.update({
                "Composite_Risk_Index": composite_risk,
                "Risk_Zone": get_risk_zone(composite_risk),
                "aqi": env_data["aqi"],
                "population_density": env_data["population_density"],
                "google_trends": env_data["google_trends"],
                "weather_stress": env_data["weather_stress"],
                "employment_stress": env_data["employment_stress"],
                "sentiment_index": env_data["sentiment_index"]
            })
            records.append(rec)
            
        return records
    except Exception as e:
        print(f"Error building map data: {e}")
        return []

def seed_reports_if_empty(db: Session):
    """
    Checks if assessment reports are empty in the database, and:
    1. Migrates existing records from city_reports.csv if present.
    2. Seeds 300 realistic user assessments from cleaned_mental_health.csv if no CSV is found.
    """
    # 1. Check if database has enough records
    try:
        db_count = db.query(AssessmentReport).count()
        if db_count >= 100:
            print(f"Database already seeded with {db_count} records.")
            return
    except Exception as e:
        print(f"Error checking database count: {e}")
        return

    # 2. Try migrating from city_reports.csv
    file_exists = os.path.exists(config.REPORTS_CSV)
    if file_exists:
        try:
            print(f"Migrating reports from {config.REPORTS_CSV} to database...")
            df = pd.read_csv(config.REPORTS_CSV)
            if len(df) > 0:
                for _, row in df.iterrows():
                    # Parse Timestamp
                    ts_str = str(row["Timestamp"])
                    try:
                        timestamp = datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S")
                    except Exception:
                        timestamp = datetime.utcnow()
                        
                    lat = float(row["Latitude"]) if not pd.isna(row["Latitude"]) and str(row["Latitude"]).strip() != "" else None
                    lon = float(row["Longitude"]) if not pd.isna(row["Longitude"]) and str(row["Longitude"]).strip() != "" else None
                    
                    report = AssessmentReport(
                        timestamp=timestamp,
                        city=str(row["City"]),
                        latitude=lat,
                        longitude=lon,
                        occupation=str(row["Occupation"]),
                        age=int(row["Age"]),
                        risk_score=round(float(row["Risk_Score"]), 2),
                        risk_level=str(row["Risk_Level"]),
                        mental_state=str(row["Mental_State"]),
                        depression_score=int(row["Depression_Score"]),
                        anxiety_score=int(row["Anxiety_Score"]),
                        depression_percent=round(float(row["Depression_Percent"]), 2),
                        anxiety_percent=round(float(row["Anxiety_Percent"]), 2),
                        stress_percent=round(float(row["Stress_Percent"]), 2) if "Stress_Percent" in row else round(float(row["Risk_Score"]), 2),
                        wellness_score=round(float(row["Wellness_Score"]), 2) if "Wellness_Score" in row else round(max(0.0, 100.0 - float(row["Risk_Score"])), 2),
                        sleep_hours=round(float(row["Sleep_Hours"]), 2) if "Sleep_Hours" in row else 7.0,
                        eating_habits=str(row["Eating_Habits"]) if "Eating_Habits" in row else "Balanced",
                        physical_activity=str(row["Physical_Activity"]) if "Physical_Activity" in row else "Moderate"
                    )
                    db.add(report)
                db.commit()
                print(f"Successfully migrated {len(df)} records from CSV to database.")
                return
        except Exception as e:
            db.rollback()
            print(f"Failed to migrate CSV to database: {e}")

    # 3. Seed from cleaned_mental_health.csv if no CSV or migration failed
    source_csv = config.DATA_DIR / "cleaned_mental_health.csv"
    if not os.path.exists(source_csv):
        print(f"Source dataset {source_csv} not found. Skipping database seeding.")
        return
        
    print("Seeding database with high-fidelity dynamic user assessments from cleaned_mental_health...")
    try:
        source_df = pd.read_csv(source_csv)
        sample_df = source_df.sample(n=300, random_state=42).copy()
        
        INDIAN_CITIES = [
            ("Delhi", 28.7041, 77.1025),
            ("Mumbai", 19.0760, 72.8777),
            ("Pune", 18.5204, 73.8567),
            ("Bangalore", 12.9716, 77.5946),
            ("Hyderabad", 17.3850, 78.4867),
            ("Chennai", 13.0827, 80.2707),
            ("Kolkata", 22.5726, 88.3639),
            ("Nagpur", 21.1458, 79.0882),
            ("Satara", 17.6805, 74.0183),
            ("Bhopal", 23.2599, 77.4126),
            ("Indore", 22.7196, 75.8577),
            ("Jaipur", 26.9124, 75.7873),
            ("Ahmedabad", 23.0225, 72.5714),
            ("Surat", 21.1702, 72.8311),
            ("Lucknow", 26.8467, 80.9462),
            ("Chandigarh", 30.7333, 76.7794),
            ("Bhubaneswar", 20.2961, 85.8245),
            ("Patna", 25.5941, 85.1376),
            ("Guwahati", 26.1158, 91.7086),
            ("Kochi", 9.9312, 76.2673)
        ]
        
        seeded_rows = []
        random.seed(42)
        
        start_ts = int(datetime(2026, 1, 1).timestamp())
        end_ts = int(datetime(2026, 6, 26).timestamp())
        
        for idx, (_, row) in enumerate(sample_df.iterrows()):
            city_info = INDIAN_CITIES[idx % len(INDIAN_CITIES)]
            city_name, lat, lon = city_info
            
            work_status = str(row["Work_Status"]).strip()
            age = int(row["Age"])
            if age <= 22 or work_status.lower() == "student":
                occupation = "Student"
            elif age >= 60 or work_status.lower() == "retired":
                occupation = "Retired"
            elif work_status.lower() == "unemployed":
                occupation = "Unemployed"
            else:
                occupation = random.choice(["Employee", "Freelancer", "Business"])
                
            rand_ts = random.randint(start_ts, end_ts)
            timestamp = datetime.fromtimestamp(rand_ts)
            
            risk_score = float(row["Risk_Score"])
            if risk_score >= 65:
                eating_habits = random.choice(["Junk food", "Irregular"])
            elif risk_score >= 45:
                eating_habits = random.choice(["Irregular", "Balanced"])
            else:
                eating_habits = random.choice(["Balanced", "Veg", "Vegan"])
                
            depression_percent = (int(row["Depression_Score"]) / 27) * 100
            anxiety_percent = (int(row["Anxiety_Score"]) / 21) * 100
            wellness_score = max(0.0, 100.0 - risk_score)
            stress_percent = float(row["Stress_Score"]) if "Stress_Score" in row else risk_score
            
            report = AssessmentReport(
                timestamp=timestamp,
                city=city_name,
                latitude=lat,
                longitude=lon,
                occupation=occupation,
                age=age,
                risk_score=round(risk_score, 2),
                risk_level=str(row["Risk_Level"]),
                mental_state=str(row["Mental_State"]),
                depression_score=int(row["Depression_Score"]),
                anxiety_score=int(row["Anxiety_Score"]),
                depression_percent=round(depression_percent, 2),
                anxiety_percent=round(anxiety_percent, 2),
                stress_percent=round(stress_percent, 2),
                wellness_score=round(wellness_score, 2),
                sleep_hours=round(float(row["Sleep_Hours"]), 2),
                eating_habits=eating_habits,
                physical_activity=str(row["Physical_Activity"])
            )
            db.add(report)
            
        db.commit()
        print(f"Successfully seeded {len(sample_df)} user reports from dataset.")
    except Exception as e:
        db.rollback()
        print(f"Failed to seed database: {e}")
