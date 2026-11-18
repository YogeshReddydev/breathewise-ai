from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    MINIMAL = "Minimal"
    MILD = "Mild"
    MODERATE = "Moderate"
    HIGH = "High"
    CRITICAL = "Critical"


class ActionUrgency(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class PersonalizedAction(BaseModel):
    id: str
    title: str
    urgency: ActionUrgency
    icon: str
    description: str
    rationale: str


class VentilationGuidance(BaseModel):
    windows_open_recommended: bool
    optimal_window_opening_hours: Optional[str] = None
    purifier_mode: str  # e.g., "Eco / Auto", "Medium HEPA", "Max / Turbo HEPA"
    indoor_air_advice: str


class OutdoorActivityGuidance(BaseModel):
    is_outdoor_exercise_safe: bool
    recommended_duration_max_minutes: int
    best_time_window: Optional[str] = None
    commute_guidance: str


class RecommendationResponse(BaseModel):
    member_id: Optional[str] = None
    member_name: Optional[str] = None
    location_name: str
    aqi: int
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    mask_recommendation: str
    ventilation: VentilationGuidance
    outdoor_activity: OutdoorActivityGuidance
    actions: List[PersonalizedAction]
    ai_summary: Optional[str] = None
