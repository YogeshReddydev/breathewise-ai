import pytest
from app.utils.cpcb_calculator import (
    calculate_cpcb_aqi,
    calculate_sub_index,
    get_cpcb_category_and_color,
)


def test_cpcb_sub_index_pm2_5_breakpoints():
    # Good band: 0-30 -> 0-50
    assert calculate_sub_index("pm2_5", 15.0) == 25
    # Satisfactory: 31-60 -> 51-100
    assert calculate_sub_index("pm2_5", 45.0) == 75
    # Moderate: 61-90 -> 101-200
    assert calculate_sub_index("pm2_5", 75.0) == 150
    # Poor: 91-120 -> 201-300 (halfway at 105 is 250)
    assert calculate_sub_index("pm2_5", 105.0) == 250
    # Very Poor: 121-250 -> 301-400
    assert calculate_sub_index("pm2_5", 185.0) == 350
    # Severe: 251-500 -> 401-500
    assert calculate_sub_index("pm2_5", 300.0) == 421


def test_cpcb_co_conversion():
    # CO in µg/m³ (e.g. 2000 µg/m³ = 2.0 mg/m³)
    assert calculate_sub_index("co", 2000.0) == 100
    # CO in mg/m³
    assert calculate_sub_index("co", 1.0) == 50


def test_cpcb_validation_rules():
    # Rule 1: At least 3 pollutants required.
    # Only 2 pollutants provided -> Should return calculable=False
    insufficient = calculate_cpcb_aqi(pm2_5=25.0, pm10=40.0)
    assert insufficient["calculable"] is False
    assert insufficient["aqi"] is None
    assert "at least 3 monitored pollutants" in insufficient["limitation_note"]

    # Rule 2: At least one of PM2.5 or PM10 must be present.
    # 3 pollutants (NO2, SO2, CO) but NO particulates -> Should return calculable=False
    no_particulates = calculate_cpcb_aqi(no2=30.0, so2=20.0, co=500.0)
    assert no_particulates["calculable"] is False
    assert "strictly requires at least PM2.5 or PM10" in no_particulates["limitation_note"]


def test_cpcb_valid_calculation():
    # 3 pollutants including PM2.5 -> Valid calculation
    result = calculate_cpcb_aqi(pm2_5=45.0, pm10=80.0, no2=35.0)
    assert result["calculable"] is True
    assert result["aqi"] is not None
    assert result["category"] in {"Satisfactory", "Moderate", "Good", "Poor", "Very Poor", "Severe"}
    assert result["dominant_pollutant"] is not None


def test_cpcb_category_colors():
    cat, col = get_cpcb_category_and_color(35)
    assert cat == "Good"
    assert col == "#10B981"

    cat, col = get_cpcb_category_and_color(85)
    assert cat == "Satisfactory"
    assert col == "#84CC16"

    cat, col = get_cpcb_category_and_color(165)
    assert cat == "Moderate"
    assert col == "#EAB308"

    cat, col = get_cpcb_category_and_color(240)
    assert cat == "Poor"
    assert col == "#F97316"

    cat, col = get_cpcb_category_and_color(360)
    assert cat == "Very Poor"
    assert col == "#EF4444"

    cat, col = get_cpcb_category_and_color(450)
    assert cat == "Severe"
    assert col == "#7F1D1D"
