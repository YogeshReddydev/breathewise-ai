import pytest
from app.services.recommendation_engine import RecommendationEngine
from app.models.family import FamilyMember, HealthCondition, SensitivityLevel
from app.models.recommendation import RiskLevel, ActionUrgency
from app.providers.registry import aqi_registry


def test_risk_scoring_differentials():
    # Healthy adult
    healthy = FamilyMember(
        id="h1",
        name="Healthy Person",
        relationship="Self",
        age=30,
        conditions=[],
        sensitivity=SensitivityLevel.LOW,
        alert_threshold_aqi=150,
    )

    # Vulnerable child with asthma
    child_asthma = FamilyMember(
        id="c1",
        name="Child with Asthma",
        relationship="Child",
        age=6,
        conditions=[HealthCondition.ASTHMA, HealthCondition.PEDIATRIC_VULNERABILITY],
        sensitivity=SensitivityLevel.CRITICAL,
        alert_threshold_aqi=70,
    )

    aqi = 120
    score_healthy = RecommendationEngine.evaluate_risk_score(aqi, healthy)
    score_child = RecommendationEngine.evaluate_risk_score(aqi, child_asthma)

    # Vulnerable child with asthma MUST have higher risk score than healthy low-sensitivity adult
    assert score_child > score_healthy
    assert score_healthy < 50
    assert score_child > 50


def test_recommendation_actions_generation():
    dummy_aqi = aqi_registry._create_deterministic_current_fallback(28.61, 77.20, "Delhi")
    recs = RecommendationEngine.build_recommendations(dummy_aqi)

    assert recs.location_name == "Delhi"
    assert recs.risk_score >= 0
    assert len(recs.actions) > 0
    assert recs.mask_recommendation != ""
    assert recs.ventilation is not None
    assert recs.outdoor_activity is not None


def test_severe_aqi_actions():
    dummy_aqi = aqi_registry._create_deterministic_current_fallback(28.61, 77.20, "Hazardous City")
    dummy_aqi.aqi = 250
    recs = RecommendationEngine.build_recommendations(dummy_aqi)

    assert "N95" in recs.mask_recommendation or "FFP" in recs.mask_recommendation
    assert recs.ventilation.windows_open_recommended is False
    assert recs.outdoor_activity.is_outdoor_exercise_safe is False
