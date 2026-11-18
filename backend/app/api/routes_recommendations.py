import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from app.api.dependencies import CoordinateQuery, validate_coordinate_pair
from app.core.security import sanitize_query
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
    coords: CoordinateQuery = Depends(),
    standard: Optional[AQIStandard] = Query(None, description="cpcb, us_epa, european"),
):
    """Generate intelligent health advisories and indoor protocols for default family profile."""
    service = get_aqi_service()
    try:
        return await service.get_comprehensive_assessment(
            city=coords.city,
            lat=coords.lat,
            lon=coords.lon,
            standard=standard,
        )
    except Exception as e:
        logger.error(f"Recommendation generation error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to generate atmospheric recommendations. Please try again.",
        )


@router.post("/evaluate-custom", response_model=ComprehensiveRecommendation)
async def evaluate_custom_profile(payload: CustomEvaluationPayload):
    """Generate tailored advisories for custom user and family group configurations."""
    lat, lon = validate_coordinate_pair(payload.lat, payload.lon)

    service = get_aqi_service()
    try:
        family = payload.family or get_default_family_group()
        sanitized_city = sanitize_query(payload.city) if payload.city else None
        return await service.get_comprehensive_assessment(
            city=sanitized_city,
            lat=lat,
            lon=lon,
            family=family,
            standard=payload.standard,
        )
    except Exception as e:
        logger.error(f"Custom evaluation error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to evaluate custom family profile recommendations. Please try again.",
        )
