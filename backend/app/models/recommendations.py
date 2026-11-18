from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class ActivitySafetyLevel(str, Enum):
    SAFE = "safe"
    MODERATE = "moderate"
    RESTRICTED = "restricted"
    DANGEROUS = "dangerous"


class StructuredRecommendation(BaseModel):
    cohort: str = Field(..., description="Target cohort: children, older_adults, students, daily_commuters, outdoor_workers, general_household")
    target_group: str = Field(..., description="Display title for the group")
    recommended_action: str = Field(..., description="Clear, practical prescriptive directive")
    reason: str = Field(..., description="Physiological and environmental rationale")
    supporting_measurement: str = Field(..., description="Specific telemetry value justifying action (e.g. PM2.5 > 35 µg/m³)")
    expected_benefit: str = Field(..., description="Expected clinical or exposure-reduction benefit")
    limitations: str = Field(..., description="Limitations or caveats (e.g. advisory only; does not eliminate risk)")


class MemberAdvisory(BaseModel):
    member_id: str
    member_name: str
    vulnerability_tier: str
    risk_score: int = Field(..., ge=0, le=100, description="Risk assessment score 0-100")
    activity_safety: ActivitySafetyLevel
    outdoor_exercise_allowed: bool
    mask_recommended: bool
    mask_type: Optional[str] = None
    key_recommendation: str
    
    # Granular 5-dimension scientific structure
    recommended_action: str = ""
    reason: str = ""
    supporting_measurement: str = ""
    expected_benefit: str = ""
    limitations: str = ""

    actions: List[str]
    symptoms_to_watch: List[str]


class IndoorProtocol(BaseModel):
    windows_open: bool
    purifier_setting: str = Field(..., description="Off, Low, Auto, High, Turbo")
    recommended_action: str
    ventilation_guide: str


class ComprehensiveRecommendation(BaseModel):
    overall_risk_score: int = Field(..., ge=0, le=100)
    headline: str
    summary: str
    best_outdoor_window: Optional[str] = None
    worst_outdoor_window: Optional[str] = None
    member_advisories: List[MemberAdvisory]
    cohort_recommendations: List[StructuredRecommendation] = Field(default_factory=list)
    indoor_protocol: IndoorProtocol
    engine_source: str = "expert_rules_engine"
    timestamp: str
    active_standard: str = "US EPA"
    medical_disclaimer: str = (
        "Advisory Notice: Recommendations are generated based on EPA AQI, WHO 2021, and CPCB environmental guidelines. "
        "They are educational and do not constitute clinical diagnosis or medical care. Consult licensed healthcare professionals for medical conditions."
    )


class EvaluationRequest(BaseModel):
    aqi: int
    dominant_pollutant: str = "PM2.5"
    pm2_5: float = 12.0
    pm10: float = 20.0
    location_name: str = "San Francisco"
    member_ids: Optional[List[str]] = None
    standard: Optional[str] = "us_epa"
