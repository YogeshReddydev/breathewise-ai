from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class TransportMode(str, Enum):
    PETROL_CAR = "petrol_car"
    DIESEL_CAR = "diesel_car"
    HYBRID_CAR = "hybrid_car"
    ELECTRIC_CAR = "electric_car"
    CARPOOL_2 = "carpool_2"
    CARPOOL_3 = "carpool_3"
    TWO_WHEELER = "two_wheeler"
    CITY_BUS = "city_bus"
    METRO_TRAIN = "metro_train"
    WALK_CYCLE = "walk_cycle"


# Standard transport emission factors in grams CO2 equivalent per passenger-km (DEFRA / ARAI benchmarks)
EMISSION_FACTORS: Dict[TransportMode, float] = {
    TransportMode.PETROL_CAR: 170.0,
    TransportMode.DIESEL_CAR: 155.0,
    TransportMode.HYBRID_CAR: 100.0,
    TransportMode.ELECTRIC_CAR: 50.0,   # Grid-average lifecycle
    TransportMode.CARPOOL_2: 85.0,
    TransportMode.CARPOOL_3: 56.7,
    TransportMode.TWO_WHEELER: 75.0,
    TransportMode.CITY_BUS: 35.0,
    TransportMode.METRO_TRAIN: 22.0,
    TransportMode.WALK_CYCLE: 0.0,
}

MODE_LABELS: Dict[TransportMode, str] = {
    TransportMode.PETROL_CAR: "Solo Petrol Car",
    TransportMode.DIESEL_CAR: "Solo Diesel Car",
    TransportMode.HYBRID_CAR: "Hybrid Car",
    TransportMode.ELECTRIC_CAR: "Electric Vehicle (EV)",
    TransportMode.CARPOOL_2: "Carpooling (2 People)",
    TransportMode.CARPOOL_3: "Carpooling (3+ People)",
    TransportMode.TWO_WHEELER: "Motorcycle / Scooter",
    TransportMode.CITY_BUS: "Public City Bus",
    TransportMode.METRO_TRAIN: "Metro / Electric Train",
    TransportMode.WALK_CYCLE: "Walking / Cycling (Active)",
}


class SustainableTransportOption(BaseModel):
    mode: TransportMode
    label: str
    emissions_per_km: float
    safety_advisory_for_today: str
    is_active_travel: bool
    recommended_today: bool


class EmissionsCalculationRequest(BaseModel):
    distance_km: float = Field(..., gt=0, le=1000, description="Trip distance in kilometers")
    baseline_mode: TransportMode = TransportMode.PETROL_CAR
    target_mode: TransportMode = TransportMode.METRO_TRAIN
    trips_per_week: int = Field(default=10, ge=1, le=50)


class EmissionsCalculationResult(BaseModel):
    distance_km: float
    baseline_mode_label: str
    target_mode_label: str
    single_trip_baseline_kg: float
    single_trip_target_kg: float
    single_trip_avoided_kg: float
    weekly_avoided_kg: float
    annual_avoided_kg: float
    avoided_percentage: float
    tailpipe_pm2_5_avoided_g: float
    air_safety_context: str
    methodology_note: str = (
        "Emissions estimates are calculated using standard vehicle emission factors (g CO2e/passenger-km). "
        "These represent tailpipe and life-cycle vehicle emissions avoided, distinct from ambient atmospheric measurements."
    )
