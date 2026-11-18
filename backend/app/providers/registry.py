import logging
import time
from typing import Dict, List, Optional, Tuple
from app.core.config import get_settings
from app.models.aqi import AQIReading, AQIStandard, AirQualityForecast, LocationSearchResult
from app.providers.base import BaseAQIProvider
from app.providers.open_meteo import OpenMeteoAQIProvider
from app.providers.waqi import WAQIAQIProvider

logger = logging.getLogger(__name__)


class ProviderRegistry:
    """Manages active AQI data providers with in-memory caching and fallback."""

    def __init__(self):
        settings = get_settings()
        self._providers: Dict[str, BaseAQIProvider] = {}
        self._cache: Dict[str, Tuple[float, any]] = {}
        self._cache_ttl = settings.AQI_CACHE_TTL_SECONDS

        # Register open-meteo provider (primary, always operational)
        open_meteo = OpenMeteoAQIProvider()
        self.register(open_meteo)

        # Register WAQI if token provided
        if settings.WAQI_API_KEY:
            self.register(WAQIAQIProvider(api_key=settings.WAQI_API_KEY))

        self.default_provider_name = settings.DEFAULT_AQI_PROVIDER

    def register(self, provider: BaseAQIProvider) -> None:
        self._providers[provider.name] = provider
        logger.info(f"Registered AQI provider: {provider.name}")

    def get_provider(self, name: Optional[str] = None) -> BaseAQIProvider:
        key = name or self.default_provider_name
        if key in self._providers:
            return self._providers[key]
        if "open-meteo" in self._providers:
            return self._providers["open-meteo"]
        raise RuntimeError("No AQI providers are registered")

    def _get_cache_key(self, prefix: str, lat: float, lon: float, extra: str = "") -> str:
        # Round coordinates to 3 decimals (~100m) for cache reuse
        return f"{prefix}:{round(lat, 3)}:{round(lon, 3)}:{extra}"

    async def get_current_aqi(
        self,
        lat: float,
        lon: float,
        location_name: Optional[str] = None,
        provider_name: Optional[str] = None,
        standard: Optional[AQIStandard] = None,
    ) -> AQIReading:
        std_str = standard.value if standard else "default"
        cache_key = self._get_cache_key("current", lat, lon, std_str)
        now = time.time()

        if cache_key in self._cache:
            ts, cached_data = self._cache[cache_key]
            if now - ts < self._cache_ttl:
                return cached_data

        provider = self.get_provider(provider_name)
        try:
            reading = await provider.get_current_aqi(lat, lon, location_name, standard)
            self._cache[cache_key] = (now, reading)
            return reading
        except Exception as e:
            logger.warning(f"Provider {provider.name} failed: {e}. Attempting failover to open-meteo.")
            if provider.name != "open-meteo" and "open-meteo" in self._providers:
                fallback = self._providers["open-meteo"]
                reading = await fallback.get_current_aqi(lat, lon, location_name, standard)
                self._cache[cache_key] = (now, reading)
                return reading
            raise

    async def get_forecast(
        self,
        lat: float,
        lon: float,
        location_name: Optional[str] = None,
        hours: int = 24,
    ) -> AirQualityForecast:
        cache_key = self._get_cache_key("forecast", lat, lon, str(hours))
        now = time.time()

        if cache_key in self._cache:
            ts, cached_data = self._cache[cache_key]
            if now - ts < self._cache_ttl:
                return cached_data

        provider = self.get_provider("open-meteo")
        forecast = await provider.get_forecast(lat, lon, location_name, hours)
        self._cache[cache_key] = (now, forecast)
        return forecast

    async def search_locations(self, query: str) -> List[LocationSearchResult]:
        provider = self.get_provider("open-meteo")
        return await provider.search_locations(query)


# Global registry singleton
_registry_instance: Optional[ProviderRegistry] = None


def get_registry() -> ProviderRegistry:
    global _registry_instance
    if _registry_instance is None:
        _registry_instance = ProviderRegistry()
    return _registry_instance
