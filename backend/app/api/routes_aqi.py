import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from app.api.dependencies import CoordinateQuery
from app.core.security import sanitize_query
from app.models.aqi import AQIReading, AQIStandard, AirQualityForecast, LocationSearchResult
from app.services.aqi_service import get_aqi_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/aqi", tags=["Air Quality Telemetry"])


@router.get("/current", response_model=AQIReading)
async def get_current_aqi(
    coords: CoordinateQuery = Depends(),
    standard: Optional[AQIStandard] = Query(None, description="AQI standard: cpcb, us_epa, european"),
):
    """Retrieve real-time air quality index, pollutant concentrations, and multi-standard breakdown."""
    service = get_aqi_service()
    try:
        return await service.get_current(
            lat=coords.lat,
            lon=coords.lon,
            city=coords.city,
            standard=standard,
        )
    except Exception as e:
        logger.error(f"Failed to fetch real-time AQI data: {e}", exc_info=True)
        raise HTTPException(
            status_code=502,
            detail="Failed to fetch real-time atmospheric data from upstream provider. Please try again.",
        )


@router.get("/forecast", response_model=AirQualityForecast)
async def get_aqi_forecast(
    coords: CoordinateQuery = Depends(),
    hours: int = Query(24, ge=6, le=72, description="Forecast horizon in hours (e.g. 24 or 48)"),
):
    """Retrieve multi-hour atmospheric forecast with optimal activity windows and CPCB predictions."""
    service = get_aqi_service()
    try:
        return await service.get_forecast(
            lat=coords.lat,
            lon=coords.lon,
            city=coords.city,
            hours=hours,
        )
    except Exception as e:
        logger.error(f"Failed to fetch atmospheric forecast: {e}", exc_info=True)
        raise HTTPException(
            status_code=502,
            detail="Failed to fetch atmospheric forecast from upstream provider. Please try again.",
        )


@router.get("/locations/search", response_model=List[LocationSearchResult])
async def search_locations(
    q: str = Query(..., min_length=2, max_length=100, description="Location search query (e.g. Delhi, London, Seattle)"),
):
    """Search global cities and coordinates via geocoding."""
    sanitized = sanitize_query(q)
    if len(sanitized) < 2:
        return []
    service = get_aqi_service()
    try:
        return await service.registry.search_locations(sanitized)
    except Exception as e:
        logger.error(f"Location lookup error: {e}", exc_info=True)
        raise HTTPException(
            status_code=502,
            detail="Unable to complete location geocoding lookup. Please verify the query and try again.",
        )
