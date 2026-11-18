from typing import Optional, Tuple
from fastapi import HTTPException, Query
from app.core.security import sanitize_query, validate_coordinates


class CoordinateQuery:
    """FastAPI dependency for validated coordinate pairs and optional city name."""

    def __init__(
        self,
        city: Optional[str] = Query(None, max_length=100, description="City name (e.g. New Delhi, Mumbai, San Francisco)"),
        lat: Optional[float] = Query(None, description="Latitude [-90, 90]"),
        lon: Optional[float] = Query(None, description="Longitude [-180, 180]"),
    ):
        self.lat, self.lon = validate_coordinate_pair(lat, lon)
        self.city = sanitize_query(city) if city else None


def validate_coordinate_pair(lat: Optional[float], lon: Optional[float]) -> Tuple[Optional[float], Optional[float]]:
    """Validates that latitude and longitude are either both provided or both absent,

    and that their values fall within valid geographic bounds [-90, 90] and [-180, 180].
    """
    if (lat is not None and lon is None) or (lat is None and lon is not None):
        raise HTTPException(
            status_code=400,
            detail="Both latitude and longitude must be provided together.",
        )
    if lat is not None and lon is not None:
        if not validate_coordinates(lat, lon):
            raise HTTPException(
                status_code=400,
                detail="Invalid coordinates range.",
            )
    return lat, lon
