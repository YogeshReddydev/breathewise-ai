import pytest
from app.models.aqi import (
    AQIReading,
    HealthCategory,
    PollutantBreakdown,
)
from app.models.family import get_default_family_group
from app.services.gemini_service import GeminiService


def test_gemini_service_initialization():
    service = GeminiService()
    # In test environment without key, it must stay resilient
    assert service.model_name is not None


def test_expert_fallback_chat_responses():
    service = GeminiService()
    family = get_default_family_group()
    reading = AQIReading(
        aqi_us=125,
        category=HealthCategory.SENSITIVE,
        category_label="Unhealthy for Sensitive Groups",
        color_hex="#F97316",
        dominant_pollutant="PM2.5",
        timestamp="2026-11-18T10:00:00Z",
        location_name="Seattle",
        latitude=47.6062,
        longitude=-122.3321,
        pollutants=PollutantBreakdown(pm2_5=45.2, pm10=60.0),
        provider="open-meteo",
    )

    # Test runner query
    run_resp = service._generate_expert_chat_fallback("Can I go for an outdoor run?", reading, family)
    assert "exercise" in run_resp["reply"].lower() or "run" in run_resp["reply"].lower()
    assert run_resp["source"] == "expert_rules_engine"

    # Test mask query
    mask_resp = service._generate_expert_chat_fallback("Should I wear an N95 mask?", reading, family)
    assert "mask" in mask_resp["reply"].lower()

    # Test window ventilation query
    win_resp = service._generate_expert_chat_fallback("Should I open the windows?", reading, family)
    assert "window" in win_resp["reply"].lower()
