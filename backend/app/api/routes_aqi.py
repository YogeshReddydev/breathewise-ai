from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.core.security import sanitize_query, validate_coordinates
from app.models.aqi import AQIReading, AQIStandard, AirQualityForecast, LocationSearchResult
from app.services.aqi_service import get_aqi_service

router = APIRouter(prefix="/aqi", tags=["Air Quality Telemetry"])


@router.get("/current", response_model=AQIReading)
async def get_current_aqi(
    city: Optional[str] = Query(None, description="City name (e.g., New Delhi, Mumbai, San Francisco)"),
    lat: Optional[float] = Query(None, description="Latitude [-90, 90]"),
    lon: Optional[float] = Query(None, description="Longitude [-180, 180]"),
    standard: Optional[AQIStandard] = Query(None, description="AQI standard: cpcb, us_epa, european"),
):
    """Retrieve real-time air quality index, pollutant concentrations, and multi-standard breakdown."""
    if lat is not None and lon is not None:
        if not validate_coordinates(lat, lon):
            raise HTTPException(status_code=400, detail="Invalid coordinates range.")

    service = get_aqi_service()
    try:
        sanitized_city = sanitize_query(city) if city else None
        return await service.get_current(lat=lat, lon=lon, city=sanitized_city, standard=standard)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch real-time AQI data: {str(e)}")


@router.get("/forecast", response_model=AirQualityForecast)
async def get_aqi_forecast(
    city: Optional[str] = Query(None, description="City name"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude"),
    hours: int = Query(24, ge=6, le=72, description="Forecast horizon in hours (e.g. 24 or 48)"),
):
    """Retrieve multi-hour atmospheric forecast with optimal activity windows and CPCB predictions."""
    if lat is not None and lon is not None:
        if not validate_coordinates(lat, lon):
            raise HTTPException(status_code=400, detail="Invalid coordinates range.")

    service = get_aqi_service()
    try:
        sanitized_city = sanitize_query(city) if city else None
        return await service.get_forecast(lat=lat, lon=lon, city=sanitized_city, hours=hours)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch forecast: {str(e)}")


@router.get("/locations/search", response_model=List[LocationSearchResult])
async def search_locations(
    q: str = Query(..., min_length=2, description="Location search query (e.g. Delhi, London, Seattle)"),
):
    """Search global cities and coordinates via geocoding."""
    sanitized = sanitize_query(q)
    if len(sanitized) < 2:
        return []
    service = get_aqi_service()
    try:
        return await service.registry.search_locations(sanitized)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Location lookup error: {str(e)}")
