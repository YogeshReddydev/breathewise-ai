from typing import List, Dict, Any
from fastapi import APIRouter, Query, HTTPException
from app.models.aqi import CurrentAQIResponse, ForecastAQIResponse
from app.providers.registry import aqi_registry

router = APIRouter(prefix="/aqi", tags=["Air Quality Intelligence"])

MAJOR_CITIES = [
    {"name": "New Delhi, India", "latitude": 28.6139, "longitude": 77.2090, "timezone": "Asia/Kolkata"},
    {"name": "London, United Kingdom", "latitude": 51.5074, "longitude": -0.1278, "timezone": "Europe/London"},
    {"name": "New York, USA", "latitude": 40.7128, "longitude": -74.0060, "timezone": "America/New_York"},
    {"name": "Tokyo, Japan", "latitude": 35.6762, "longitude": 139.6503, "timezone": "Asia/Tokyo"},
    {"name": "Paris, France", "latitude": 48.8566, "longitude": 2.3522, "timezone": "Europe/Paris"},
    {"name": "Los Angeles, USA", "latitude": 34.0522, "longitude": -118.2437, "timezone": "America/Los_Angeles"},
    {"name": "Mumbai, India", "latitude": 19.0760, "longitude": 72.8777, "timezone": "Asia/Kolkata"},
    {"name": "Singapore", "latitude": 1.3521, "longitude": 103.8198, "timezone": "Asia/Singapore"},
]


@router.get("/cities", response_model=List[Dict[str, Any]])
async def get_major_cities():
    """Retrieve pre-configured urban monitoring locations."""
    return MAJOR_CITIES


@router.get("/current", response_model=CurrentAQIResponse)
async def get_current_aqi(
    latitude: float = Query(28.6139, ge=-90.0, le=90.0),
    longitude: float = Query(77.2090, ge=-180.0, le=180.0),
    location_name: str = Query("New Delhi, India"),
    refresh: bool = Query(False, description="Bypass in-memory cache"),
):
    """
    Fetch real-time air quality index, pollutant breakdowns (PM2.5, PM10, NO2, O3, CO, SO2),
    and atmospheric indicators.
    """
    try:
        data = await aqi_registry.get_current_aqi(
            latitude=latitude,
            longitude=longitude,
            location_name=location_name,
            force_refresh=refresh,
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve AQI data: {str(e)}")


@router.get("/forecast", response_model=ForecastAQIResponse)
async def get_forecast_aqi(
    latitude: float = Query(28.6139, ge=-90.0, le=90.0),
    longitude: float = Query(77.2090, ge=-180.0, le=180.0),
    location_name: str = Query("New Delhi, India"),
    refresh: bool = Query(False, description="Bypass in-memory cache"),
):
    """
    Fetch multi-hour atmospheric pollution forecast, identifying diurnal peaks
    and cleanest outdoor ventilation windows.
    """
    try:
        data = await aqi_registry.get_forecast_aqi(
            latitude=latitude,
            longitude=longitude,
            location_name=location_name,
            force_refresh=refresh,
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve AQI forecast: {str(e)}")
