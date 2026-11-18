from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class HealthCondition(str, Enum):
    ASTHMA = "asthma"
    ALLERGIES = "allergies"
    CARDIOVASCULAR = "cardiovascular"
    COPD = "copd"
    PREGNANCY = "pregnancy"
    OUTDOOR_LABOR = "outdoor_labor"
    STUDENT_COMMUTE = "student_commute"
    NONE = "none"


class ActivityPreference(str, Enum):
    INDOOR_ONLY = "indoor_only"
    LIGHT_WALKING = "light_walking"
    OUTDOOR_RUNNING = "outdoor_running"
    CYCLING = "cycling"
    COMMUTING = "commuting"
    PUBLIC_TRANSIT = "public_transit"
    OUTDOOR_WORK = "outdoor_work"


class VulnerabilityTier(str, Enum):
    STANDARD = "standard"
    SENSITIVE = "sensitive"
    HIGH_RISK = "high_risk"


class TargetCohort(str, Enum):
    CHILDREN = "children"
    OLDER_ADULTS = "older_adults"
    STUDENTS = "students"
    DAILY_COMMUTERS = "daily_commuters"
    OUTDOOR_WORKERS = "outdoor_workers"
    GENERAL_HOUSEHOLD = "general_household"


def determine_vulnerability(age: int, conditions: List[HealthCondition]) -> VulnerabilityTier:
    """Calculates vulnerability tier based on clinical epidemiological guidelines."""
    high_risk_conditions = {HealthCondition.ASTHMA, HealthCondition.COPD, HealthCondition.CARDIOVASCULAR}
    has_high_risk = any(c in high_risk_conditions for c in conditions)

    if has_high_risk:
        return VulnerabilityTier.HIGH_RISK
    if age < 10 or age >= 65:
        return VulnerabilityTier.HIGH_RISK
    if HealthCondition.ALLERGIES in conditions or HealthCondition.PREGNANCY in conditions or HealthCondition.OUTDOOR_LABOR in conditions:
        return VulnerabilityTier.SENSITIVE
    if 10 <= age < 18:
        return VulnerabilityTier.SENSITIVE

    return VulnerabilityTier.STANDARD


class FamilyMember(BaseModel):
    id: str
    name: str
    relationship: str
    age: int
    conditions: List[HealthCondition] = Field(default_factory=list)
    activity_preference: ActivityPreference = ActivityPreference.LIGHT_WALKING
    vulnerability_tier: VulnerabilityTier = VulnerabilityTier.STANDARD
    cohort: TargetCohort = TargetCohort.GENERAL_HOUSEHOLD
    notes: Optional[str] = None
    is_demo: bool = False


class FamilyGroup(BaseModel):
    id: str = "default_family"
    family_name: str = "Household Profile"
    members: List[FamilyMember] = Field(default_factory=list)
    alert_threshold_aqi: int = 100
    home_city: str = "San Francisco"
    home_lat: float = 37.7749
    home_lon: float = -122.4194
    is_demo: bool = False
    disclaimer: str = (
        "Demonstration profiles (Marcus, Elena, Leo, Sophia) contain fictional simulation data "
        "designed to illustrate multi-generational vulnerability responses. They do not represent real individuals."
    )


def get_default_family_group() -> FamilyGroup:
    """Generates the standard fictional demonstration profiles with clear demo badges."""
    return FamilyGroup(
        id="demo_household",
        family_name="Fictional Demonstration Household",
        home_city="San Francisco",
        home_lat=37.7749,
        home_lon=-122.4194,
        alert_threshold_aqi=100,
        is_demo=True,
        members=[
            FamilyMember(
                id="demo_mem_1",
                name="Marcus (Demo)",
                relationship="Adult (Father / Athlete)",
                age=38,
                conditions=[HealthCondition.NONE],
                activity_preference=ActivityPreference.OUTDOOR_RUNNING,
                vulnerability_tier=VulnerabilityTier.STANDARD,
                cohort=TargetCohort.GENERAL_HOUSEHOLD,
                notes="Fictional runner profile; illustrates heavy aerobic respiratory ventilation.",
                is_demo=True,
            ),
            FamilyMember(
                id="demo_mem_2",
                name="Elena (Demo)",
                relationship="Adult (Mother / Commuter)",
                age=36,
                conditions=[HealthCondition.ALLERGIES],
                activity_preference=ActivityPreference.COMMUTING,
                vulnerability_tier=VulnerabilityTier.SENSITIVE,
                cohort=TargetCohort.DAILY_COMMUTERS,
                notes="Fictional commuter profile; illustrates seasonal ozone & traffic particulate exposure.",
                is_demo=True,
            ),
            FamilyMember(
                id="demo_mem_3",
                name="Leo (Demo)",
                relationship="Child (Son / Student)",
                age=8,
                conditions=[HealthCondition.ASTHMA],
                activity_preference=ActivityPreference.LIGHT_WALKING,
                vulnerability_tier=VulnerabilityTier.HIGH_RISK,
                cohort=TargetCohort.CHILDREN,
                notes="Fictional pediatric asthma profile; illustrates school recess & inhaler guidance.",
                is_demo=True,
            ),
            FamilyMember(
                id="demo_mem_4",
                name="Sophia (Demo)",
                relationship="Senior (Grandmother)",
                age=72,
                conditions=[HealthCondition.CARDIOVASCULAR],
                activity_preference=ActivityPreference.LIGHT_WALKING,
                vulnerability_tier=VulnerabilityTier.HIGH_RISK,
                cohort=TargetCohort.OLDER_ADULTS,
                notes="Fictional cardiovascular profile; illustrates exertion limits during pollution spikes.",
                is_demo=True,
            ),
        ],
    )


def get_empty_family_group() -> FamilyGroup:
    """Returns an empty custom family container ready for user-entered members."""
    return FamilyGroup(
        id="custom_household",
        family_name="My Household",
        home_city="New Delhi",
        home_lat=28.6139,
        home_lon=77.2090,
        alert_threshold_aqi=100,
        is_demo=False,
        members=[],
    )
