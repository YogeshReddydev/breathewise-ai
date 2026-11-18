import pytest
from app.models.sustainability import (
    EmissionsCalculationRequest,
    TransportMode,
)
from app.services.sustainability_service import SustainabilityService


def test_emissions_calculation_petrol_to_metro():
    service = SustainabilityService()
    # 20 km trip, Petrol Car (170g) to Metro (22g)
    request = EmissionsCalculationRequest(
        distance_km=20.0,
        baseline_mode=TransportMode.PETROL_CAR,
        target_mode=TransportMode.METRO_TRAIN,
        trips_per_week=10,
    )
    result = service.calculate_emissions(request, current_aqi=50)

    # 20km * 170g = 3400g = 3.4 kg
    assert result.single_trip_baseline_kg == 3.4
    # 20km * 22g = 440g = 0.44 kg
    assert result.single_trip_target_kg == 0.44
    # Avoided = 3.4 - 0.44 = 2.96 kg
    assert result.single_trip_avoided_kg == 2.96
    assert result.weekly_avoided_kg == 29.6
    assert result.avoided_percentage > 80.0
    assert result.tailpipe_pm2_5_avoided_g > 0.5


def test_emissions_high_aqi_warning_on_cycling():
    service = SustainabilityService()
    # High AQI of 180
    request = EmissionsCalculationRequest(
        distance_km=10.0,
        baseline_mode=TransportMode.PETROL_CAR,
        target_mode=TransportMode.WALK_CYCLE,
        trips_per_week=5,
    )
    result = service.calculate_emissions(request, current_aqi=180)
    # Context should flag outdoor aerobic risk
    assert "elevated" in result.air_safety_context.lower() or "unhealthy" in result.air_safety_context.lower()


def test_transport_options_matrix():
    service = SustainabilityService()
    matrix = service.get_transport_options_matrix(aqi=45)
    assert len(matrix) >= 8
    # Walking/cycling should be recommended in clean air
    active_opt = next(opt for opt in matrix if opt.mode == TransportMode.WALK_CYCLE)
    assert active_opt.recommended_today is True
