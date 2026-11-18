import pytest
from app.models.aqi import AQIStandard
from app.services.recommendation_engine import IntelligentRecommendationEngine


def test_cohort_recommendations_structure():
    engine = IntelligentRecommendationEngine()
    recs = engine.generate_cohort_recommendations(
        aqi=120,
        dominant_pollutant="PM2.5",
        pm2_5=45.0,
        standard=AQIStandard.US_EPA,
    )

    # Must cover 6 cohorts
    assert len(recs) == 6
    cohort_keys = {r.cohort for r in recs}
    assert cohort_keys == {"children", "older_adults", "students", "daily_commuters", "outdoor_workers", "general_household"}

    # Validate 5 required attributes per recommendation
    for r in recs:
        assert len(r.recommended_action) > 10
        assert len(r.reason) > 10
        assert "PM2.5" in r.supporting_measurement or "AQI" in r.supporting_measurement
        assert len(r.expected_benefit) > 10
        assert len(r.limitations) > 5
