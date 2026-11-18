from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.models.aqi import AQIStandard
from app.models.family import FamilyGroup, get_default_family_group
from app.models.recommendations import ComprehensiveRecommendation
from app.services.aqi_service import get_aqi_service

router = APIRouter(prefix="/recommendations", tags=["Health Recommendations"])


class CustomEvaluationPayload(BaseModel):
    city: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    family: Optional[FamilyGroup] = None
    standard: Optional[AQIStandard] = None


@router.get("/comprehensive", response_model=ComprehensiveRecommendation)
async def get_comprehensive_recommendations(
    city: Optional[str] = Query(None, description="City name"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude"),
    standard: Optional[AQIStandard] = Query(None, description="cpcb, us_epa, european"),
):
    """Generate intelligent health advisories and indoor protocols for default family profile."""
    service = get_aqi_service()
    try:
        return await service.get_comprehensive_assessment(city=city, lat=lat, lon=lon, standard=standard)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation generation error: {str(e)}")


@router.post("/evaluate-custom", response_model=ComprehensiveRecommendation)
async def evaluate_custom_profile(payload: CustomEvaluationPayload):
    """Generate tailored advisories for custom user and family group configurations."""
    service = get_aqi_service()
    try:
        family = payload.family or get_default_family_group()
        return await service.get_comprehensive_assessment(
            city=payload.city,
            lat=payload.lat,
            lon=payload.lon,
            family=family,
            standard=payload.standard,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Custom evaluation error: {str(e)}")
