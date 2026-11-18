from enum import Enum
from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class AQICategory(str, Enum):
    GOOD = "Good"
    MODERATE = "Moderate"
    UNHEALTHY_SENSITIVE = "Unhealthy for Sensitive Groups"
    UNHEALTHY = "Unhealthy"
    VERY_UNHEALTHY = "Very Unhealthy"
    HAZARDOUS = "Hazardous"


class PollutantData(BaseModel):
    value: float = Field(..., description="Concentration value in ug/m3 or ppm")
    sub_index: int = Field(..., description="Calculated sub-index for this pollutant")
    category: AQICategory
    unit: str = "µg/m³"


class PollutantsBreakdown(BaseModel):
    pm2_5: Optional[PollutantData] = None
    pm10: Optional[PollutantData] = None
    no2: Optional[PollutantData] = None
    o3: Optional[PollutantData] = None
    co: Optional[PollutantData] = None
    so2: Optional[PollutantData] = None


class AtmosphericConditions(BaseModel):
    temperature_c: Optional[float] = None
    relative_humidity_percent: Optional[float] = None
    wind_speed_kmh: Optional[float] = None
    wind_direction_deg: Optional[float] = None


class HourlyAQIPoint(BaseModel):
    timestamp: str
    hour: int
    aqi: int
    category: AQICategory
    pm2_5: float
    pm10: float
    dominant_pollutant: str


class CurrentAQIResponse(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    timestamp: str
    aqi: int
    category: AQICategory
    dominant_pollutant: str
    pollutants: PollutantsBreakdown
    atmospheric: AtmosphericConditions
    provider: str
    health_headline: str
    cautionary_statement: str


class ForecastAQIResponse(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    current_aqi: int
    peak_aqi: int
    peak_timestamp: str
    cleanest_aqi: int
    cleanest_timestamp: str
    hourly: List[HourlyAQIPoint]
    provider: str
