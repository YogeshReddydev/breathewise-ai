import pytest
from app.models.family import (
    ActivityPreference,
    FamilyMember,
    HealthCondition,
    TargetCohort,
    VulnerabilityTier,
)
from app.models.recommendations import ActivitySafetyLevel
from app.services.recommendation_scoring import (
    ActivitySafetyEvaluator,
    AdvisoryTextGenerator,
    RiskScorer,
)


def test_risk_scorer_base_scale():
    assert RiskScorer.calculate_base_score(25) == 12.5
    assert RiskScorer.calculate_base_score(50) == 25.0
    assert RiskScorer.calculate_base_score(100) == 50.0
    assert RiskScorer.calculate_base_score(150) == 70.0
    assert RiskScorer.calculate_base_score(200) == 85.0
    assert RiskScorer.calculate_base_score(300) == 100.0


def test_risk_scorer_member_multipliers():
    member_std = FamilyMember(
        id="m1",
        name="Healthy Adult",
        relationship="Self",
        age=30,
        conditions=[HealthCondition.NONE],
        activity_preference=ActivityPreference.LIGHT_WALKING,
        vulnerability_tier=VulnerabilityTier.STANDARD,
        cohort=TargetCohort.GENERAL_HOUSEHOLD,
    )
    score_std = RiskScorer.calculate_member_risk(member_std, 100)
    assert score_std == 50

    member_asthma = FamilyMember(
        id="m2",
        name="Child with Asthma",
        relationship="Son",
        age=8,
        conditions=[HealthCondition.ASTHMA],
        activity_preference=ActivityPreference.LIGHT_WALKING,
        vulnerability_tier=VulnerabilityTier.HIGH_RISK,
        cohort=TargetCohort.CHILDREN,
    )
    score_asthma = RiskScorer.calculate_member_risk(member_asthma, 100)
    # High risk multiplier 1.75 * 50 = 87 + 15 asthma adjustment = 100 (capped)
    assert score_asthma == 100


def test_activity_safety_evaluator_thresholds():
    member = FamilyMember(
        id="m1",
        name="Runner",
        relationship="Self",
        age=28,
        conditions=[HealthCondition.NONE],
        activity_preference=ActivityPreference.OUTDOOR_RUNNING,
        vulnerability_tier=VulnerabilityTier.STANDARD,
        cohort=TargetCohort.GENERAL_HOUSEHOLD,
    )

    # Clean air: AQI 30, PM2.5 8
    safety, allowed = ActivitySafetyEvaluator.evaluate_activity_safety(member, 30, 8.0, 15)
    assert safety == ActivitySafetyLevel.SAFE
    assert allowed is True

    # Severe air: AQI 160, PM2.5 60
    safety_sev, allowed_sev = ActivitySafetyEvaluator.evaluate_activity_safety(member, 160, 60.0, 75)
    assert safety_sev == ActivitySafetyLevel.RESTRICTED
    assert allowed_sev is False

    # Mask evaluation
    mask_req, mask_type = ActivitySafetyEvaluator.evaluate_mask_requirement(member, 160, 75)
    assert mask_req is True
    assert "N95" in mask_type or "KN95" in mask_type


def test_advisory_text_generator():
    member = FamilyMember(
        id="m1",
        name="Elena",
        relationship="Mother",
        age=68,
        conditions=[HealthCondition.CARDIOVASCULAR],
        activity_preference=ActivityPreference.LIGHT_WALKING,
        vulnerability_tier=VulnerabilityTier.HIGH_RISK,
        cohort=TargetCohort.OLDER_ADULTS,
    )

    actions = AdvisoryTextGenerator.generate_action_items(member, ActivitySafetyLevel.RESTRICTED, True, "N95 Respirator")
    assert any("N95" in a for a in actions)

    symptoms = AdvisoryTextGenerator.generate_symptom_watchlist(member)
    assert any("Shortness of breath" in s for s in symptoms)

    key_rec, action, reason, benefit, limits = AdvisoryTextGenerator.generate_structured_dimensions(member, ActivitySafetyLevel.SAFE)
    assert "Elena" in key_rec
    assert "cardiovascular" in benefit.lower()
