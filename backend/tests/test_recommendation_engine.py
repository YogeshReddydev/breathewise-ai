import pytest
from app.models.family import (
    ActivityPreference,
    FamilyGroup,
    FamilyMember,
    HealthCondition,
    VulnerabilityTier,
    determine_vulnerability,
    get_default_family_group,
)
from app.models.recommendations import ActivitySafetyLevel
from app.services.recommendation_engine import IntelligentRecommendationEngine


def test_vulnerability_determination():
    # Asthma triggers high risk
    tier_asthma = determine_vulnerability(age=25, conditions=[HealthCondition.ASTHMA])
    assert tier_asthma == VulnerabilityTier.HIGH_RISK

    # Child under 10 triggers high risk
    tier_child = determine_vulnerability(age=8, conditions=[HealthCondition.NONE])
    assert tier_child == VulnerabilityTier.HIGH_RISK

    # Senior 70+ triggers high risk
    tier_senior = determine_vulnerability(age=72, conditions=[HealthCondition.NONE])
    assert tier_senior == VulnerabilityTier.HIGH_RISK

    # Healthy adult
    tier_healthy = determine_vulnerability(age=30, conditions=[HealthCondition.NONE])
    assert tier_healthy == VulnerabilityTier.STANDARD


def test_member_evaluation_clean_air():
    engine = IntelligentRecommendationEngine()
    member = FamilyMember(
        id="test_runner",
        name="Alex",
        relationship="Self",
        age=28,
        conditions=[HealthCondition.NONE],
        activity_preference=ActivityPreference.OUTDOOR_RUNNING,
        vulnerability_tier=VulnerabilityTier.STANDARD,
    )
    # AQI 25 (Good)
    advisory = engine.evaluate_member(member, aqi=25, dominant_pollutant="PM2.5", pm2_5=6.0)
    assert advisory.risk_score < 30
    assert advisory.activity_safety == ActivitySafetyLevel.SAFE
    assert advisory.outdoor_exercise_allowed is True
    assert advisory.mask_recommended is False


def test_member_evaluation_elevated_asthma():
    engine = IntelligentRecommendationEngine()
    child = FamilyMember(
        id="test_child",
        name="Timmy",
        relationship="Son",
        age=7,
        conditions=[HealthCondition.ASTHMA],
        activity_preference=ActivityPreference.LIGHT_WALKING,
        vulnerability_tier=VulnerabilityTier.HIGH_RISK,
    )
    # AQI 130 (Unhealthy for Sensitive Groups)
    advisory = engine.evaluate_member(child, aqi=130, dominant_pollutant="PM2.5", pm2_5=48.0)
    assert advisory.risk_score > 50
    assert advisory.activity_safety in {ActivitySafetyLevel.RESTRICTED, ActivitySafetyLevel.DANGEROUS}
    assert advisory.outdoor_exercise_allowed is False
    assert advisory.mask_recommended is True


def test_indoor_protocol_levels():
    engine = IntelligentRecommendationEngine()
    proto_good = engine.generate_indoor_protocol(aqi=30, pm2_5=5.0)
    assert proto_good.windows_open is True

    proto_bad = engine.generate_indoor_protocol(aqi=160, pm2_5=65.0)
    assert proto_bad.windows_open is False
    assert "Turbo" in proto_bad.purifier_setting or "High" in proto_bad.purifier_setting
