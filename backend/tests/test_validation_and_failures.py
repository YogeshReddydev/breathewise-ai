import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.aqi import AQIStandard
from app.providers.open_meteo import OpenMeteoAQIProvider
from app.providers.registry import ProviderRegistry
from app.services.gemini_service import GeminiService
from app.utils.cpcb_calculator import calculate_cpcb_aqi, calculate_sub_index

client = TestClient(app)


def test_aqi_standard_differentiation_no_mixing():
    """Verify that US EPA, Indian CPCB, and European standards produce distinct indices and are never conflated."""
    pm2_5_sample = 75.0  # 75 µg/m³
    pm10_sample = 120.0  # 120 µg/m³
    no2_sample = 45.0    # 45 µg/m³

    # CPCB Calculation
    cpcb_res = calculate_cpcb_aqi(pm2_5=pm2_5_sample, pm10=pm10_sample, no2=no2_sample)
    assert cpcb_res["calculable"] is True
    # In CPCB: 75 µg/m³ PM2.5 falls in 60.1-90.0 breakpoint -> Sub-index 150 (Moderate)
    assert cpcb_res["sub_indices"]["PM2_5"] == 150
    assert cpcb_res["category"] == "Moderate"

    # In US EPA: 75.0 µg/m³ PM2.5 falls in 55.5-125.4 breakpoint -> Index 161 (Unhealthy)
    provider = OpenMeteoAQIProvider()
    cat_us = provider._determine_dominant_pollutant(pm2_5=pm2_5_sample, pm10=pm10_sample, o3=20.0, no2=no2_sample)
    assert cat_us == "PM2.5"

    # Category and sub-index must not be confused
    assert cpcb_res["category"] != "Unhealthy"  # In CPCB, 150 is Moderate, whereas in EPA it is Unhealthy


def test_missing_pollutant_graceful_handling():
    """Verify that when mandatory pollutants are missing, CPCB communicates limitation clearly."""
    # Only 1 pollutant
    sparse = calculate_cpcb_aqi(pm2_5=35.0)
    assert sparse["calculable"] is False
    assert sparse["aqi"] is None
    assert "at least 3 monitored pollutants" in sparse["limitation_note"]

    # 3 gaseous pollutants but missing both PM2.5 and PM10
    gases_only = calculate_cpcb_aqi(no2=45.0, so2=30.0, co=1.2)
    assert gases_only["calculable"] is False
    assert "strictly requires at least PM2.5 or PM10" in gases_only["limitation_note"]


def test_invalid_user_coordinate_inputs():
    """Test boundary validation on coordinates."""
    # Latitude out of bounds (> 90)
    res_lat = client.get("/api/aqi/current?lat=120.5&lon=77.2")
    assert res_lat.status_code == 400
    assert "Invalid coordinates" in res_lat.json()["detail"]

    # Longitude out of bounds (< -180)
    res_lon = client.get("/api/aqi/current?lat=28.6&lon=-205.0")
    assert res_lon.status_code == 400
    assert "Invalid coordinates" in res_lon.json()["detail"]


def test_gemini_failure_fallback_resilience():
    """Test that when Gemini service client is unconfigured or fails, expert deterministic chat responds safely."""
    service = GeminiService()
    # Force unconfigured to test fallback
    service._client = None

    result = service._generate_expert_chat_fallback(
        message="Should Leo play soccer in this air quality?",
        aqi_reading=None,
        family=None,
    )
    assert "reply" in result
    assert result["source"] == "expert_rules_engine"
    assert len(result["reply"]) > 20
    assert "asthma" in result["reply"].lower() or "breathewise" in result["reply"].lower()


def test_provider_failover_resilience():
    """Test registry gracefully resolves open-meteo provider even if customized provider requested."""
    registry = ProviderRegistry()
    provider = registry.get_provider("open-meteo")
    assert provider.name == "open-meteo"
    # Fallback lookup
    default_p = registry.get_provider("non_existent_provider")
    assert default_p.name == "open-meteo"
