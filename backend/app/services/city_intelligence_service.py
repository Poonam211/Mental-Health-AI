import requests
import time
from typing import Dict, Any

import threading
import time
from typing import Dict, Any

class SimpleTTLCache:
    def __init__(self, ttl_seconds: int, max_size: int = 1024):
        self.ttl = ttl_seconds
        self.max_size = max_size
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.lock = threading.Lock()
        
    def get(self, key: str) -> Any | None:
        with self.lock:
            if key in self.cache:
                entry = self.cache[key]
                if time.time() - entry["timestamp"] < self.ttl:
                    return entry["data"]
                else:
                    del self.cache[key]
            return None
            
    def set(self, key: str, value: Any):
        with self.lock:
            now = time.time()
            if len(self.cache) >= self.max_size:
                # Evict expired entries first
                expired_keys = [k for k, v in self.cache.items() if now - v["timestamp"] >= self.ttl]
                for k in expired_keys:
                    del self.cache[k]
                # If still too large, evict the oldest entry
                if len(self.cache) >= self.max_size:
                    oldest_key = min(self.cache.keys(), key=lambda k: self.cache[k]["timestamp"])
                    del self.cache[oldest_key]
            self.cache[key] = {"timestamp": now, "data": value}

# Thread-safe cache with 15 minutes TTL and max 1024 items
_api_cache = SimpleTTLCache(ttl_seconds=900, max_size=1024)

def _fetch_live_environmental_stressors(lat: float, lon: float) -> Dict[str, Any]:
    """
    Queries keyless Open-Meteo APIs for real-time Air Quality and Weather Forecast,
    caching the outputs to avoid request rate limits.
    """
    cache_key = f"{round(lat, 3)}_{round(lon, 3)}"
    cached_data = _api_cache.get(cache_key)
    if cached_data is not None:
        return cached_data
        
    aqi = None
    weather_stress = None
    
    # 1. Fetch live AQI from Open-Meteo Air Quality API
    try:
        aqi_url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=us_aqi"
        resp = requests.get(aqi_url, timeout=4)
        if resp.status_code == 200:
            data = resp.json()
            if "current" in data and "us_aqi" in data["current"]:
                aqi = int(data["current"]["us_aqi"])
    except Exception as e:
        print(f"Error fetching AQI from Open-Meteo: {e}")
        
    # 2. Fetch temperature and humidity from Open-Meteo Forecast API
    try:
        weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m"
        resp = requests.get(weather_url, timeout=4)
        if resp.status_code == 200:
            data = resp.json()
            if "current" in data:
                temp = data["current"].get("temperature_2m", None)
                humidity = data["current"].get("relative_humidity_2m", None)
                if temp is not None and humidity is not None:
                    # Compute weather stress index based on extreme temperature & humidity deviations
                    temp_deviation = abs(temp - 22.0)
                    humidity_stress = abs(humidity - 50.0) / 10.0
                    weather_stress = min(10.0, (temp_deviation * 0.3) + (humidity_stress * 0.1))
                    weather_stress = round(max(0.0, weather_stress), 2)
    except Exception as e:
        print(f"Error fetching weather from Open-Meteo: {e}")
        
    result = {"aqi": aqi, "weather_stress": weather_stress}
    _api_cache.set(cache_key, result)
    return result

def get_city_environmental_data(
    city: str,
    lat: float | None = None,
    lon: float | None = None,
    city_reports_df = None
) -> Dict[str, Any]:
    """
    Returns environmental stressors for a given city, pulling from Open-Meteo APIs
    if coordinates exist, and deriving socio-demographics dynamically from reports.
    If live or historical data is missing, we strictly return None.
    """
    city_clean = city.strip().title()
    
    # Initialize all environmental variables as None
    base_data = {
        "aqi": None,
        "population_density": None,
        "google_trends": None,
        "weather_stress": None,
        "employment_stress": None,
        "sentiment_index": None
    }
    
    # 1. Fetch Open-Meteo data if coordinates are present
    if lat is not None and lon is not None:
        live_env = _fetch_live_environmental_stressors(lat, lon)
        base_data["aqi"] = live_env["aqi"]
        base_data["weather_stress"] = live_env["weather_stress"]
        
    # 2. Dynamically apply actual Indian cities densities (if matching one of the mapped cities)
    KNOWN_DENSITIES = {
        "Mumbai": 21000, "Delhi": 11320, "Kolkata": 24000, "Chennai": 26550,
        "Bangalore": 4380, "Hyderabad": 5800, "Pune": 5600, "Bhopal": 4100,
        "Indore": 9700, "Jaipur": 6500, "Ahmedabad": 12000, "Surat": 13700,
        "Lucknow": 7000, "Chandigarh": 9200, "Bhubaneswar": 2100, "Patna": 1800,
        "Guwahati": 2800, "Kochi": 6200
    }
    if city_clean in KNOWN_DENSITIES:
        base_data["population_density"] = KNOWN_DENSITIES[city_clean]
    
    # 3. Derive dynamic indicators if assessments are passed
    if city_reports_df is not None and not city_reports_df.empty:
        # Google Trends dynamic proxy based on average anxiety levels
        avg_anxiety = city_reports_df["Anxiety_Percent"].mean()
        base_data["google_trends"] = round(float(min(100.0, max(10.0, avg_anxiety * 1.5))), 2)
        
        # Employment Stress derived from occupation distributions
        total = len(city_reports_df)
        unemployed = len(city_reports_df[city_reports_df["Occupation"].str.lower() == "unemployed"])
        students = len(city_reports_df[city_reports_df["Occupation"].str.lower() == "student"])
        employees = len(city_reports_df[city_reports_df["Occupation"].str.lower().isin(["employee", "freelancer", "business"])])
        
        unemployed_ratio = unemployed / total
        students_ratio = students / total
        employees_ratio = employees / total
        
        emp_stress = (unemployed_ratio * 8.5) + (students_ratio * 7.5) + (employees_ratio * 5.5)
        remaining_ratio = max(0.0, 1.0 - unemployed_ratio - students_ratio - employees_ratio)
        emp_stress += remaining_ratio * 6.0
        base_data["employment_stress"] = min(10.0, max(0.0, round(emp_stress, 2)))
        
        # Sentiment Index derived from average wellness score
        avg_wellness = city_reports_df["Wellness_Score"].mean()
        base_data["sentiment_index"] = min(10.0, max(0.0, round(avg_wellness / 10.0, 2)))
        
    base_data["city"] = city_clean
    return base_data

def calculate_city_risk_index(city: str, avg_user_risk: float, env_data: Dict[str, Any]) -> float:
    """
    Calculates a multi-variate City Mental Health Risk Index (0-100) combining
    anonymous clinical user assessments (40%) with environmental stressors (60%).
    If a stressor factor is None (not available), its weight is redistributed.
    """
    factors = []
    weights = []
    
    # User Risk always has 40% weight
    factors.append(avg_user_risk)
    weights.append(0.40)
    
    # 15% AQI
    if env_data.get("aqi") is not None:
        aqi_norm = min(100.0, (env_data["aqi"] / 400.0) * 100.0)
        factors.append(aqi_norm)
        weights.append(0.15)
        
    # 15% Density
    if env_data.get("population_density") is not None:
        density_norm = min(100.0, (env_data["population_density"] / 25000.0) * 100.0)
        factors.append(density_norm)
        weights.append(0.15)
        
    # 10% Weather
    if env_data.get("weather_stress") is not None:
        weather_norm = env_data["weather_stress"] * 10.0
        factors.append(weather_norm)
        weights.append(0.10)
        
    # 10% Google Trends
    if env_data.get("google_trends") is not None:
        trends_norm = float(env_data["google_trends"])
        factors.append(trends_norm)
        weights.append(0.10)
        
    # 10% Employment Stress
    if env_data.get("employment_stress") is not None:
        employment_norm = env_data["employment_stress"] * 10.0
        factors.append(employment_norm)
        weights.append(0.10)
        
    # Re-normalize weights so they sum to 1.0 (or just scale proportionally)
    total_weight = sum(weights)
    if total_weight > 0:
        risk_index = sum(f * w for f, w in zip(factors, weights)) / total_weight
    else:
        risk_index = avg_user_risk
        
    return round(max(0.0, min(100.0, risk_index)), 2)
