from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class HealthCondition(str, Enum):
    ASTHMA = "asthma"
    COPD = "copd"
    CARDIOVASCULAR = "cardiovascular"
    ALLERGIES = "allergies"
    PREGNANCY = "pregnancy"
    ELDERLY_VULNERABILITY = "elderly_vulnerability"
    PEDIATRIC_VULNERABILITY = "pediatric_vulnerability"
    ATHLETE_HIGH_VENTILATION = "athlete_high_ventilation"
    NONE = "none"


class SensitivityLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


class FamilyMember(BaseModel):
    id: str = Field(..., description="Unique identifier for family member")
    name: str = Field(..., min_length=1, max_length=50)
    relationship: str = Field(..., description="e.g., Child, Parent, Partner, Self")
    age: int = Field(..., ge=0, le=125)
    conditions: List[HealthCondition] = Field(default_factory=list)
    sensitivity: SensitivityLevel = SensitivityLevel.MODERATE
    alert_threshold_aqi: int = Field(default=100, ge=0, le=500)
    primary_activity: str = Field(default="Standard outdoor commute")
    notes: Optional[str] = ""


class FamilyMemberCreate(BaseModel):
    name: str
    relationship: str
    age: int
    conditions: List[HealthCondition] = []
    sensitivity: SensitivityLevel = SensitivityLevel.MODERATE
    alert_threshold_aqi: int = 100
    primary_activity: str = "Standard outdoor commute"
    notes: Optional[str] = ""


class FamilyMemberListResponse(BaseModel):
    members: List[FamilyMember]
    active_member_id: Optional[str] = None
