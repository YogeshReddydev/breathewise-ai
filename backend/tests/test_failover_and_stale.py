import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import validate_coordinates, sanitize_query
from app.providers.registry import get_registry

client = TestClient(app)


def test_coordinate_validation():
    assert validate_coordinates(28.6139, 77.2090) is True
    assert validate_coordinates(-33.8688, 151.2093) is True
    # Out of range
    assert validate_coordinates(95.0, 50.0) is False
    assert validate_coordinates(50.0, 200.0) is False


def test_query_sanitization():
    clean = sanitize_query("New Delhi; DROP TABLE users;--")
    assert ";" not in clean
    assert "--" not in clean
    assert "New Delhi" in clean


def test_invalid_coordinates_api_response():
    # Lat = 120 is invalid
    resp = client.get("/api/aqi/current?lat=120&lon=50")
    assert resp.status_code == 400
    assert "Invalid coordinates" in resp.json()["detail"]


def test_provider_registry_failover():
    registry = get_registry()
    # Requesting non-existent provider should return open-meteo as fallback
    provider = registry.get_provider("non_existent_provider")
    assert provider.name == "open-meteo"


def test_stale_cache_retrieval_on_upstream_outage():
    import asyncio
    from unittest.mock import AsyncMock, patch
    from app.models.aqi import AQIReading, HealthCategory, PollutantBreakdown

    registry = get_registry()
    lat, lon = 28.61, 77.21
    cache_key = registry._get_cache_key("current", lat, lon, "default")

    # Seed an expired cache entry
    mock_reading = AQIReading(
        location_name="Cached Delhi",
        latitude=lat,
        longitude=lon,
        timestamp="2026-11-18T00:00:00Z",
        aqi_us=180,
        category=HealthCategory.UNHEALTHY,
        category_label="Unhealthy",
        color_hex="#EF4444",
        dominant_pollutant="PM2.5",
        pollutants=PollutantBreakdown(pm2_5=120.0, pm10=200.0, no2=40.0),
        provider="open-meteo",
        is_stale=False,
    )
    # Set timestamp in past so it is expired
    registry._cache[cache_key] = (0.0, mock_reading)

    # Force all providers to fail to simulate a network outage
    with patch.object(registry, "get_provider") as mock_get_prov:
        mock_prov = AsyncMock()
        mock_prov.get_current_aqi.side_effect = RuntimeError("Upstream Open-Meteo connection timeout")
        mock_prov.name = "open-meteo"
        mock_get_prov.return_value = mock_prov

        result = asyncio.run(registry.get_current_aqi(lat, lon))
        assert result is not None
        assert result.location_name == "Cached Delhi"
        assert result.is_stale is True


def test_waqi_provider_cpcb_inclusion():
    import asyncio
    from unittest.mock import AsyncMock, MagicMock, patch
    from app.providers.waqi import WAQIAQIProvider

    provider = WAQIAQIProvider(api_key="mock_test_key")

    mock_response = {
        "status": "ok",
        "data": {
            "aqi": 185,
            "dominentpol": "pm25",
            "city": {"name": "Delhi Test Station"},
            "iaqi": {
                "pm25": {"v": 110.0},
                "pm10": {"v": 180.0},
                "no2": {"v": 45.0},
            },
        },
    }

    mock_resp = MagicMock()
    mock_resp.json.return_value = mock_response
    mock_resp.raise_for_status.return_value = None

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_resp

        reading = asyncio.run(provider.get_current_aqi(28.61, 77.20))
        assert reading.provider == "waqi"
        assert reading.cpcb is not None
        assert reading.cpcb.calculable is True
        assert reading.cpcb.aqi is not None
        assert "PM2_5" in reading.cpcb.sub_indices


def test_hazardous_smog_window_caution():
    from app.models.aqi import AQIReading, HealthCategory, PollutantBreakdown, AirQualityForecast, HourlyForecastItem
    from app.models.family import FamilyGroup
    from app.services.recommendation_engine import IntelligentRecommendationEngine

    engine = IntelligentRecommendationEngine()
    family = FamilyGroup(family_name="Test Household", members=[])

    # Case A: Severe smog with forecast
    forecast = AirQualityForecast(
        location_name="Delhi Smog",
        latitude=28.61,
        longitude=77.20,
        hourly=[],
        best_window_start="2026-11-18T05:00:00Z",
        best_window_end="2026-11-18T08:00:00Z",
        best_window_aqi=260,
        worst_window_start="2026-11-18T16:00:00Z",
        worst_window_aqi=380,
        avg_next_24h_aqi=310,
    )
    reading = AQIReading(
        location_name="Delhi Smog",
        latitude=28.61,
        longitude=77.20,
        timestamp="2026-11-18T10:00:00Z",
        aqi_us=310,
        category=HealthCategory.VERY_UNHEALTHY,
        category_label="Very Unhealthy",
        color_hex="#8B5CF6",
        dominant_pollutant="PM2.5",
        pollutants=PollutantBreakdown(pm2_5=220.0, pm10=350.0, no2=90.0),
        provider="open-meteo",
    )

    recs = engine.evaluate_comprehensive(reading, family, forecast)
    assert "Caution: AQI remains severe" in recs.best_outdoor_window

    # Case B: Severe smog without forecast
    recs_no_fc = engine.evaluate_comprehensive(reading, family, None)
    assert "No safe outdoor exercise window" in recs_no_fc.best_outdoor_window
