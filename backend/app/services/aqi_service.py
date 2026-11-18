import logging
from typing import List, Optional, Tuple
from app.models.aqi import AQIReading, AQIStandard, AirQualityForecast, LocationSearchResult
from app.models.family import FamilyGroup, get_default_family_group
from app.models.recommendations import ComprehensiveRecommendation
from app.providers.registry import get_registry
from app.services.gemini_service import get_gemini_service
from app.services.recommendation_engine import get_recommendation_engine

logger = logging.getLogger(__name__)


class AQIService:
    """High-level environmental intelligence coordinator."""

    def __init__(self):
        self.registry = get_registry()
        self.engine = get_recommendation_engine()
        self.gemini = get_gemini_service()

    async def resolve_location(self, city: Optional[str], lat: Optional[float], lon: Optional[float]) -> Tuple[float, float, str]:
        """Resolves city query or coordinates into validated (lat, lon, location_name)."""
        if lat is not None and lon is not None:
            name = city or f"Coordinates ({lat:.2f}, {lon:.2f})"
            return lat, lon, name

        if city:
            results = await self.registry.search_locations(city)
            if results:
                top = results[0]
                full_name = f"{top.name}, {top.country}" if top.country else top.name
                return top.latitude, top.longitude, full_name

        # Fallback to default urban center: San Francisco
        return 37.7749, -122.4194, "San Francisco, United States"

    async def get_current(
        self,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        city: Optional[str] = None,
        standard: Optional[AQIStandard] = None,
    ) -> AQIReading:
        resolved_lat, resolved_lon, resolved_name = await self.resolve_location(city, lat, lon)
        return await self.registry.get_current_aqi(
            lat=resolved_lat,
            lon=resolved_lon,
            location_name=resolved_name,
            standard=standard,
        )

    async def get_forecast(
        self,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        city: Optional[str] = None,
        hours: int = 24,
    ) -> AirQualityForecast:
        resolved_lat, resolved_lon, resolved_name = await self.resolve_location(city, lat, lon)
        return await self.registry.get_forecast(
            lat=resolved_lat,
            lon=resolved_lon,
            location_name=resolved_name,
            hours=hours,
        )

    async def get_comprehensive_assessment(
        self,
        city: Optional[str] = None,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        family: Optional[FamilyGroup] = None,
        standard: Optional[AQIStandard] = None,
    ) -> ComprehensiveRecommendation:
        target_family = family or get_default_family_group()
        resolved_lat, resolved_lon, resolved_name = await self.resolve_location(city, lat, lon)

        current_aqi = await self.registry.get_current_aqi(
            lat=resolved_lat,
            lon=resolved_lon,
            location_name=resolved_name,
            standard=standard,
        )
        forecast = await self.registry.get_forecast(
            lat=resolved_lat,
            lon=resolved_lon,
            location_name=resolved_name,
            hours=24,
        )

        active_std = standard or current_aqi.active_standard
        base_rec = self.engine.evaluate_comprehensive(current_aqi, target_family, forecast, active_std)

        # Enrich with Gemini if available
        enriched_rec = await self.gemini.enrich_recommendation(current_aqi, target_family, base_rec)
        return enriched_rec


_aqi_service_instance: Optional[AQIService] = None


def get_aqi_service() -> AQIService:
    global _aqi_service_instance
    if _aqi_service_instance is None:
        _aqi_service_instance = AQIService()
    return _aqi_service_instance
