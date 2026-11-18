import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from app.core.security import validate_coordinates, sanitize_query
from app.models.aqi import AQIStandard
from app.models.family import FamilyGroup, get_default_family_group
from app.models.recommendations import ComprehensiveRecommendation
from app.services.aqi_service import get_aqi_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/recommendations", tags=["Health Recommendations"])


class CustomEvaluationPayload(BaseModel):
    city: Optional[str] = Field(None, max_length=100)
    lat: Optional[float] = None
    lon: Optional[float] = None
    family: Optional[FamilyGroup] = None
    standard: Optional[AQIStandard] = None


@router.get("/comprehensive", response_model=ComprehensiveRecommendation)
async def get_comprehensive_recommendations(
    city: Optional[str] = Query(None, max_length=100, description="City name"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude"),
    standard: Optional[AQIStandard] = Query(None, description="cpcb, us_epa, european"),
):
    """Generate intelligent health advisories and indoor protocols for default family profile."""
    if (lat is not None and lon is None) or (lat is None and lon is not None):
        raise HTTPException(status_code=400, detail="Both latitude and longitude must be provided together.")
    if lat is not None and lon is not None:
        if not validate_coordinates(lat, lon):
            raise HTTPException(status_code=400, detail="Invalid coordinates range.")

    service = get_aqi_service()
    try:
        sanitized_city = sanitize_query(city) if city else None
        return await service.get_comprehensive_assessment(city=sanitized_city, lat=lat, lon=lon, standard=standard)
    except Exception as e:
        logger.error(f"Recommendation generation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate atmospheric recommendations. Please try again.")


@router.post("/evaluate-custom", response_model=ComprehensiveRecommendation)
async def evaluate_custom_profile(payload: CustomEvaluationPayload):
    """Generate tailored advisories for custom user and family group configurations."""
    if (payload.lat is not None and payload.lon is None) or (payload.lat is None and payload.lon is not None):
        raise HTTPException(status_code=400, detail="Both latitude and longitude must be provided together.")
    if payload.lat is not None and payload.lon is not None:
        if not validate_coordinates(payload.lat, payload.lon):
            raise HTTPException(status_code=400, detail="Invalid coordinates range.")

    service = get_aqi_service()
    try:
        family = payload.family or get_default_family_group()
        sanitized_city = sanitize_query(payload.city) if payload.city else None
        return await service.get_comprehensive_assessment(
            city=sanitized_city,
            lat=payload.lat,
            lon=payload.lon,
            family=family,
            standard=payload.standard,
        )
    except Exception as e:
        logger.error(f"Custom evaluation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to evaluate custom family profile recommendations. Please try again.")
