from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class AQIStandard(str, Enum):
    US_EPA = "us_epa"
    CPCB = "cpcb"
    EUROPEAN = "european"


class HealthCategory(str, Enum):
    GOOD = "good"
    MODERATE = "moderate"
    SENSITIVE = "sensitive"
    UNHEALTHY = "unhealthy"
    VERY_UNHEALTHY = "very_unhealthy"
    HAZARDOUS = "hazardous"


def get_category_from_aqi(aqi: int) -> HealthCategory:
    if aqi <= 50:
        return HealthCategory.GOOD
    elif aqi <= 100:
        return HealthCategory.MODERATE
    elif aqi <= 150:
        return HealthCategory.SENSITIVE
    elif aqi <= 200:
        return HealthCategory.UNHEALTHY
    elif aqi <= 300:
        return HealthCategory.VERY_UNHEALTHY
    else:
        return HealthCategory.HAZARDOUS


def get_category_label(category: HealthCategory) -> str:
    labels = {
        HealthCategory.GOOD: "Good",
        HealthCategory.MODERATE: "Moderate",
        HealthCategory.SENSITIVE: "Unhealthy for Sensitive Groups",
        HealthCategory.UNHEALTHY: "Unhealthy",
        HealthCategory.VERY_UNHEALTHY: "Very Unhealthy",
        HealthCategory.HAZARDOUS: "Hazardous",
    }
    return labels.get(category, "Unknown")


def get_category_color(category: HealthCategory) -> str:
    """Hex color codes matching US EPA guidelines and premium dashboard accents."""
    colors = {
        HealthCategory.GOOD: "#10B981",          # Emerald Green
        HealthCategory.MODERATE: "#F59E0B",      # Amber Yellow
        HealthCategory.SENSITIVE: "#F97316",     # Warm Orange
        HealthCategory.UNHEALTHY: "#EF4444",     # Crimson Red
        HealthCategory.VERY_UNHEALTHY: "#8B5CF6", # Deep Violet
        HealthCategory.HAZARDOUS: "#7F1D1D",     # Maroon
    }
    return colors.get(category, "#6B7280")


class CPCBReading(BaseModel):
    calculable: bool = Field(..., description="Whether CPCB criteria (>=3 pollutants, PM10/PM2.5) were met")
    aqi: Optional[int] = Field(default=None, description="National AQI integer 0-500")
    category: str = Field(..., description="Good, Satisfactory, Moderate, Poor, Very Poor, Severe, or Insufficient Data")
    color_hex: str = Field(..., description="CPCB official category color")
    dominant_pollutant: Optional[str] = None
    sub_indices: Dict[str, int] = Field(default_factory=dict)
    limitation_note: Optional[str] = None


class USEPAReading(BaseModel):
    aqi: int = Field(..., ge=0, le=500)
    category: HealthCategory
    category_label: str
    color_hex: str
    dominant_pollutant: str


class EuropeanReading(BaseModel):
    aqi: Optional[int] = None
    category: str = "Good"
    color_hex: str = "#10B981"


class PollutantBreakdown(BaseModel):
    pm2_5: float = Field(..., description="Particulate Matter < 2.5 µm (µg/m³)")
    pm10: float = Field(..., description="Particulate Matter < 10 µm (µg/m³)")
    o3: Optional[float] = Field(default=None, description="Ozone (µg/m³)")
    no2: Optional[float] = Field(default=None, description="Nitrogen Dioxide (µg/m³)")
    so2: Optional[float] = Field(default=None, description="Sulphur Dioxide (µg/m³)")
    co: Optional[float] = Field(default=None, description="Carbon Monoxide (µg/m³)")


class AQIReading(BaseModel):
    # Backward compatible fields
    aqi_us: int = Field(..., ge=0, le=500, description="US EPA Air Quality Index standard")
    aqi_eu: Optional[int] = Field(default=None, description="European Air Quality Index")
    category: HealthCategory
    category_label: str
    color_hex: str
    dominant_pollutant: str
    timestamp: str
    location_name: str
    latitude: float
    longitude: float
    pollutants: PollutantBreakdown
    provider: str

    # Standard explicit objects
    active_standard: AQIStandard = AQIStandard.US_EPA
    cpcb: Optional[CPCBReading] = None
    us_epa: Optional[USEPAReading] = None
    european: Optional[EuropeanReading] = None

    # Telemetry provenance & observation metadata
    data_type: str = Field(default="observation", description="'observation' or 'forecast'")
    source_attribution: str = Field(default="Open-Meteo High-Resolution Atmospheric Models")
    measurement_units: Dict[str, str] = Field(
        default_factory=lambda: {
            "pm2_5": "µg/m³",
            "pm10": "µg/m³",
            "o3": "µg/m³",
            "no2": "µg/m³",
            "so2": "µg/m³",
            "co": "µg/m³",
        }
    )


class HourlyForecastItem(BaseModel):
    time: str
    aqi_us: int
    pm2_5: float
    pm10: float
    dominant_pollutant: str
    category: HealthCategory
    category_label: str
    color_hex: str

    # CPCB companion forecast
    cpcb_aqi: Optional[int] = None
    cpcb_category: Optional[str] = None
    cpcb_color: Optional[str] = None


class AirQualityForecast(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    hourly: List[HourlyForecastItem]
    best_window_start: Optional[str] = None
    best_window_end: Optional[str] = None
    worst_window_start: Optional[str] = None
    worst_window_end: Optional[str] = None
    avg_next_24h_aqi: int = 0
    forecast_horizon_hours: int = 24
    data_type: str = "forecast"
    source_attribution: str = "Open-Meteo Numerical Prediction Models"


class LocationSearchResult(BaseModel):
    name: str
    country: str
    admin1: Optional[str] = None
    latitude: float
    longitude: float
    timezone: Optional[str] = None
