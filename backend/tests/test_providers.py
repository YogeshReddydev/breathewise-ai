import asyncio
import time
import pytest
from app.providers.registry import ResilientAQIProviderRegistry
from app.providers.open_meteo import OpenMeteoAQIProvider
from app.models.aqi import CurrentAQIResponse, ForecastAQIResponse


def test_registry_fallback_generation():
    registry = ResilientAQIProviderRegistry(ttl_seconds=60)
    # Test deterministic fallback generation when offline/unreachable
    fallback_curr = registry._create_deterministic_current_fallback(28.61, 77.20, "Test Location")
    assert isinstance(fallback_curr, CurrentAQIResponse)
    assert fallback_curr.location_name == "Test Location"
    assert fallback_curr.aqi > 0
    assert fallback_curr.pollutants.pm2_5 is not None

    fallback_fc = registry._create_deterministic_forecast_fallback(28.61, 77.20, "Test Location")
    assert isinstance(fallback_fc, ForecastAQIResponse)
    assert len(fallback_fc.hourly) == 24
    assert fallback_fc.peak_aqi >= fallback_fc.cleanest_aqi


def test_provider_caching():
    async def _run():
        registry = ResilientAQIProviderRegistry(ttl_seconds=300)
        dummy = registry._create_deterministic_current_fallback(10.0, 20.0, "Cached City")
        key = registry._make_key(10.0, 20.0)
        registry._current_cache[key] = (time.time(), dummy)

        cached_res = await registry.get_current_aqi(10.0, 20.0, "Cached City")
        assert cached_res.location_name == "Cached City"
        assert cached_res.provider == dummy.provider

    asyncio.run(_run())
