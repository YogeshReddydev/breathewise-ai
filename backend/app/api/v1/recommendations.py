from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from app.models.recommendation import RecommendationResponse
from app.providers.registry import aqi_registry
from app.services.family_service import family_service
from app.services.recommendation_engine import RecommendationEngine

router = APIRouter(prefix="/recommendations", tags=["Health & Action Engine"])


@router.get("", response_model=RecommendationResponse)
async def get_personalized_recommendations(
    latitude: float = Query(28.6139, ge=-90.0, le=90.0),
    longitude: float = Query(77.2090, ge=-180.0, le=180.0),
    location_name: str = Query("New Delhi, India"),
    member_id: Optional[str] = Query(None, description="Family member ID for individualized clinical scoring"),
):
    """
    Generate deterministic, personalized health and environmental recommendations
    correlating live atmospheric levels with family vulnerability profiles.
    """
    try:
        aqi_data = await aqi_registry.get_current_aqi(latitude, longitude, location_name)
        member = family_service.get_member(member_id) if member_id else family_service.get_active_member()
        recs = RecommendationEngine.build_recommendations(aqi_data, member)
        return recs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation engine error: {str(e)}")
