import pytest
from app.models.aqi import (
    HealthCategory,
    get_category_color,
    get_category_from_aqi,
    get_category_label,
)
from app.providers.open_meteo import OpenMeteoAQIProvider
from app.providers.registry import ProviderRegistry


def test_aqi_category_mapping():
    assert get_category_from_aqi(25) == HealthCategory.GOOD
    assert get_category_from_aqi(50) == HealthCategory.GOOD
    assert get_category_from_aqi(75) == HealthCategory.MODERATE
    assert get_category_from_aqi(120) == HealthCategory.SENSITIVE
    assert get_category_from_aqi(175) == HealthCategory.UNHEALTHY
    assert get_category_from_aqi(250) == HealthCategory.VERY_UNHEALTHY
    assert get_category_from_aqi(350) == HealthCategory.HAZARDOUS


def test_aqi_labels_and_colors():
    assert get_category_label(HealthCategory.GOOD) == "Good"
    assert get_category_color(HealthCategory.GOOD) == "#10B981"
    assert get_category_color(HealthCategory.UNHEALTHY) == "#EF4444"


def test_open_meteo_dominant_pollutant_logic():
    provider = OpenMeteoAQIProvider()
    # High PM2.5 compared to threshold
    dominant = provider._determine_dominant_pollutant(pm2_5=55.0, pm10=20.0, o3=30.0, no2=20.0)
    assert dominant == "PM2.5"

    # High Ozone compared to threshold
    dominant_o3 = provider._determine_dominant_pollutant(pm2_5=5.0, pm10=10.0, o3=180.0, no2=10.0)
    assert dominant_o3 == "O3"


def test_provider_registry_initialization():
    registry = ProviderRegistry()
    assert "open-meteo" in registry._providers
    provider = registry.get_provider("open-meteo")
    assert provider.name == "open-meteo"
