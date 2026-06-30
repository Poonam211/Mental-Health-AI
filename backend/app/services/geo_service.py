import requests
from typing import Tuple, Optional
from functools import lru_cache

# Static registry of coordinates for major Indian cities to avoid external requests
INDIAN_CITIES_REGISTRY = {
    "delhi": (28.7041, 77.1025),
    "mumbai": (19.0760, 72.8777),
    "pune": (18.5204, 73.8567),
    "bangalore": (12.9716, 77.5946),
    "bengaluru": (12.9716, 77.5946),
    "hyderabad": (17.3850, 78.4867),
    "chennai": (13.0827, 80.2707),
    "kolkata": (22.5726, 88.3639),
    "nagpur": (21.1458, 79.0882),
    "satara": (17.6805, 74.0183),
    "bhopal": (23.2599, 77.4126),
    "indore": (22.7196, 75.8577),
    "jaipur": (26.9124, 75.7873),
    "ahmedabad": (23.0225, 72.5714),
    "surat": (21.1702, 72.8311),
    "lucknow": (26.8467, 80.9462),
    "chandigarh": (30.7333, 76.7794),
    "bhubaneswar": (20.2961, 85.8245),
    "patna": (25.5941, 85.1376),
    "guwahati": (26.1158, 91.7086),
    "kochi": (9.9312, 76.2673)
}

@lru_cache(maxsize=1024)
def _query_nominatim(city: str) -> Tuple[Optional[float], Optional[float]]:
    """
    Helper function to query Nominatim API, cached using thread-safe lru_cache.
    """
    try:
        url = (
            f"https://nominatim.openstreetmap.org/search?"
            f"q={city},India&format=json&limit=1"
        )
        headers = {
            "User-Agent": "MentalHealthApp/1.0"
        }
        response = requests.get(
            url,
            headers=headers,
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            if len(data) > 0:
                return (
                    float(data[0]["lat"]),
                    float(data[0]["lon"])
                )
    except Exception as e:
        print(f"Error geocoding city '{city}': {e}")
        
    return None, None

def get_coordinates(city: str) -> Tuple[Optional[float], Optional[float]]:
    """
    Fetches latitude and longitude for a given city in India using Nominatim OpenStreetMap API,
    with static registry lookup and in-memory caching.
    """
    if not city:
        return None, None

    city_clean = city.strip().lower()

    # 1. Check Static Registry
    if city_clean in INDIAN_CITIES_REGISTRY:
        return INDIAN_CITIES_REGISTRY[city_clean]

    # 2. Call Nominatim API (Cached via lru_cache)
    return _query_nominatim(city_clean)

