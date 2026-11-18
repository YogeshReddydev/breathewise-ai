import pytest
from app.services.aqi_calculator import AQICalculator
from app.models.aqi import AQICategory


def test_aqi_category_boundaries():
    assert AQICalculator.get_category(0) == AQICategory.GOOD
    assert AQICalculator.get_category(50) == AQICategory.GOOD
    assert AQICalculator.get_category(51) == AQICategory.MODERATE
    assert AQICalculator.get_category(100) == AQICategory.MODERATE
    assert AQICalculator.get_category(101) == AQICategory.UNHEALTHY_SENSITIVE
    assert AQICalculator.get_category(150) == AQICategory.UNHEALTHY_SENSITIVE
    assert AQICalculator.get_category(151) == AQICategory.UNHEALTHY
    assert AQICalculator.get_category(200) == AQICategory.UNHEALTHY
    assert AQICalculator.get_category(201) == AQICategory.VERY_UNHEALTHY
    assert AQICalculator.get_category(300) == AQICategory.VERY_UNHEALTHY
    assert AQICalculator.get_category(301) == AQICategory.HAZARDOUS
    assert AQICalculator.get_category(500) == AQICategory.HAZARDOUS


def test_pm25_sub_index_calculation():
    # 0.0 ug/m3 -> 0 AQI
    assert AQICalculator.calculate_sub_index(0.0, AQICalculator.PM25_BREAKPOINTS) == 0
    # 9.0 ug/m3 -> 50 AQI
    assert AQICalculator.calculate_sub_index(9.0, AQICalculator.PM25_BREAKPOINTS) == 50
    # 35.4 ug/m3 -> 100 AQI
    assert AQICalculator.calculate_sub_index(35.4, AQICalculator.PM25_BREAKPOINTS) == 100
    # 55.4 ug/m3 -> 150 AQI
    assert AQICalculator.calculate_sub_index(55.4, AQICalculator.PM25_BREAKPOINTS) == 150


def test_pm10_sub_index_calculation():
    assert AQICalculator.calculate_sub_index(0, AQICalculator.PM10_BREAKPOINTS) == 0
    assert AQICalculator.calculate_sub_index(54, AQICalculator.PM10_BREAKPOINTS) == 50
    assert AQICalculator.calculate_sub_index(154, AQICalculator.PM10_BREAKPOINTS) == 100


def test_compute_pollutant_data():
    p_data = AQICalculator.compute_pollutant_data("pm2_5", 22.0)
    assert p_data.value == 22.0
    assert p_data.category == AQICategory.MODERATE
    assert 50 < p_data.sub_index <= 100
    assert p_data.unit == "µg/m³"


def test_health_statements():
    headline, caution = AQICalculator.get_health_statements(AQICategory.GOOD, "PM2.5")
    assert "ideal" in headline.lower() or "healthy" in headline.lower()
    assert "little or no risk" in caution.lower()

    headline_bad, caution_bad = AQICalculator.get_health_statements(AQICategory.HAZARDOUS, "PM2.5")
    assert "hazardous" in headline_bad.lower() or "emergency" in headline_bad.lower()
    assert "severe risk" in caution_bad.lower()
