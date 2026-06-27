import requests
from typing import Tuple, Optional

def get_coordinates(city: str) -> Tuple[Optional[float], Optional[float]]:
    """
    Fetches latitude and longitude for a given city in India using Nominatim OpenStreetMap API.
    """
    try:
        url = (
            f"https://nominatim.openstreetmap.org/search?"
            f"q={city},India&format=json&limit=1"
        )
        headers = {
            "User-Agent": "MentalHealthApp"
        }
        response = requests.get(
            url,
            headers=headers,
            timeout=10
        )
        data = response.json()
        if len(data) > 0:
            return (
                float(data[0]["lat"]),
                float(data[0]["lon"])
            )
    except Exception:
        pass
    return None, None
