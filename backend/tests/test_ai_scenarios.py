import pytest
from app.models.aqi import AQIReading, PollutantBreakdown, CPCBReading, HealthCategory
from app.models.family import FamilyGroup, FamilyMember, VulnerabilityTier, HealthCondition, ActivityPreference, TargetCohort
from app.services.gemini_service import GeminiService


@pytest.fixture
def base_aqi_reading():
    return AQIReading(
        location_name="New Delhi, India",
        latitude=28.6139,
        longitude=77.2090,
        timestamp="2026-11-18T10:00:00Z",
        aqi_us=245,
        category=HealthCategory.VERY_UNHEALTHY,
        category_label="Very Unhealthy",
        color_hex="#8B5CF6",
        dominant_pollutant="PM2.5",
        pollutants=PollutantBreakdown(
            pm2_5=195.0,
            pm10=310.0,
            no2=85.0,
            so2=25.0,
            co=2.1,
            o3=40.0,
        ),
        provider="open-meteo",
        cpcb=CPCBReading(
            calculable=True,
            aqi=380,
            category="Very Poor",
            color_hex="#990000",
            dominant_pollutant="PM2.5",
            sub_indices={"PM2_5": 380, "PM10": 260, "NO2": 106},
            limitation_note=None,
        ),
        source_attribution="Open-Meteo Atmospheric Models",
    )


@pytest.fixture
def family_group():
    return FamilyGroup(
        family_name="Demo Household",
        is_demo=True,
        members=[
            FamilyMember(
                id="leo_demo",
                name="Leo",
                relationship="Child",
                age=8,
                cohort=TargetCohort.CHILDREN,
                vulnerability_tier=VulnerabilityTier.HIGH_RISK,
                conditions=[HealthCondition.ASTHMA],
                activity_preference=ActivityPreference.LIGHT_WALKING,
                is_demo=True,
            ),
            FamilyMember(
                id="elena_demo",
                name="Elena",
                relationship="Grandmother",
                age=71,
                cohort=TargetCohort.OLDER_ADULTS,
                vulnerability_tier=VulnerabilityTier.HIGH_RISK,
                conditions=[HealthCondition.CARDIOVASCULAR],
                activity_preference=ActivityPreference.LIGHT_WALKING,
                is_demo=True,
            ),
            FamilyMember(
                id="marcus_demo",
                name="Marcus",
                relationship="Father",
                age=38,
                cohort=TargetCohort.DAILY_COMMUTERS,
                vulnerability_tier=VulnerabilityTier.STANDARD,
                conditions=[],
                activity_preference=ActivityPreference.OUTDOOR_RUNNING,
                is_demo=True,
            ),
        ],
    )


@pytest.fixture
def gemini_service():
    service = GeminiService()
    # Force fallback mode to verify deterministic safety rules
    service._client = None
    return service


def test_scenario_1_general_user_high_aqi(gemini_service, base_aqi_reading):
    """Scenario 1: General user in high AQI area (>200)."""
    result = gemini_service._generate_expert_chat_fallback(
        message="What is the general air quality situation outside?",
        aqi_reading=base_aqi_reading,
        family=None,
    )
    assert result["source"] == "expert_rules_engine"
    assert "New Delhi, India" in result["reply"]
    assert "245" in result["reply"]
    assert "195.0" in result["reply"]
    assert "forecast curve" in result["reply"].lower() or "recommendations" in result["reply"].lower()


def test_scenario_2_child_with_asthma(gemini_service, base_aqi_reading, family_group):
    """Scenario 2: Child with asthma during elevated air pollution."""
    result = gemini_service._generate_expert_chat_fallback(
        message="Can my child Leo with asthma play outside at school recess today?",
        aqi_reading=base_aqi_reading,
        family=family_group,
    )
    assert result["source"] == "expert_rules_engine"
    reply_lower = result["reply"].lower()
    assert "child" in reply_lower or "student" in reply_lower
    assert "inhaler" in reply_lower
    assert "pediatrician" in reply_lower or "physician" in reply_lower


def test_scenario_3_older_adult_cardiovascular(gemini_service, base_aqi_reading, family_group):
    """Scenario 3: Older adult with cardiovascular vulnerability."""
    result = gemini_service._generate_expert_chat_fallback(
        message="Should my senior mother Elena with cardiovascular concerns go for a morning walk?",
        aqi_reading=base_aqi_reading,
        family=family_group,
    )
    assert result["source"] == "expert_rules_engine"
    reply_lower = result["reply"].lower()
    assert "older adult" in reply_lower or "senior" in reply_lower
    assert "blood pressure" in reply_lower or "vascular" in reply_lower
    assert "limit outdoor physical exertion" in reply_lower or "air-filtered" in reply_lower


def test_scenario_4_outdoor_athlete_workout(gemini_service, base_aqi_reading):
    """Scenario 4: Outdoor athlete asking about marathon training / high-intensity running."""
    result = gemini_service._generate_expert_chat_fallback(
        message="I have a 10 km running workout scheduled. Is it safe to run outdoors?",
        aqi_reading=base_aqi_reading,
        family=None,
    )
    assert result["source"] == "expert_rules_engine"
    reply_lower = result["reply"].lower()
    assert "ventilation rate" in reply_lower or "deep particulate" in reply_lower
    assert "treadmill" in reply_lower or "indoors" in reply_lower
    assert "hepa" in reply_lower


def test_scenario_5_daily_commuter_transit_vs_car(gemini_service, base_aqi_reading):
    """Scenario 5: Daily commuter asking about transport, metro vs driving."""
    result = gemini_service._generate_expert_chat_fallback(
        message="What is the best way to commute to work today given the smog?",
        aqi_reading=base_aqi_reading,
        family=None,
    )
    assert result["source"] == "expert_rules_engine"
    reply_lower = result["reply"].lower()
    assert "metro" in reply_lower or "transit" in reply_lower
    assert "recirculation" in reply_lower or "filtered" in reply_lower


def test_scenario_6_missing_aqi_data_graceful_handling(gemini_service):
    """Scenario 6: Missing AQI data telemetry handled gracefully without fabrication."""
    result = gemini_service._generate_expert_chat_fallback(
        message="What precautions should we take today?",
        aqi_reading=None,
        family=None,
    )
    assert result["source"] == "expert_rules_engine"
    assert "your area" in result["reply"]
    # Must not crash or invent a fictional monitoring station ID
    assert "Station #" not in result["reply"]
    assert "CAQI-999" not in result["reply"]


def test_scenario_7_gemini_api_unavailable_deterministic_fallback(gemini_service, base_aqi_reading):
    """Scenario 7: Gemini API unavailable or unconfigured fallback returns deterministic expert guidance."""
    assert gemini_service.is_configured is False
    result = gemini_service._generate_expert_chat_fallback(
        message="Should we open windows for ventilation right now?",
        aqi_reading=base_aqi_reading,
        family=None,
    )
    assert result["source"] == "expert_rules_engine"
    assert result["model"] == "breathewise-expert-rules"
    assert "windows closed" in result["reply"].lower()
    assert "hepa" in result["reply"].lower()


def test_scenario_8_contradictory_user_instructions_refutation(gemini_service, base_aqi_reading):
    """Scenario 8: Contradictory instructions / dangerous myths are scientifically refuted."""
    result = gemini_service._generate_expert_chat_fallback(
        message="Is it true that taking deep breath in smog builds immunity and strengthens lungs?",
        aqi_reading=base_aqi_reading,
        family=None,
    )
    assert result["source"] == "expert_rules_engine"
    reply_lower = result["reply"].lower()
    assert "does not build immunity" in reply_lower
    assert "inflammation" in reply_lower or "oxidative" in reply_lower
    assert "avoided" in reply_lower


def test_scenario_9_unsafe_medical_prescription_guardrail(gemini_service, base_aqi_reading):
    """Scenario 9: Unsafe clinical medical requests (dosages, stopping medication) trigger safety notice."""
    result = gemini_service._generate_expert_chat_fallback(
        message="Should I double my medication dose or stop my asthma inhaler today?",
        aqi_reading=base_aqi_reading,
        family=None,
    )
    assert result["source"] == "expert_rules_engine"
    reply_lower = result["reply"].lower()
    assert "medical safety notice" in reply_lower
    assert "do not prescribe" in reply_lower or "not prescribe" in reply_lower
    assert "physician" in reply_lower or "healthcare" in reply_lower
    assert "emergency" in reply_lower


@pytest.mark.anyio
async def test_scenario_10_malformed_gemini_enrichment_graceful_recovery(gemini_service, base_aqi_reading, family_group):
    """Scenario 10: In unconfigured or failed enrichment, baseline recommendation is preserved intact."""
    from app.services.recommendation_engine import get_recommendation_engine
    engine = get_recommendation_engine()
    base_rec = engine.evaluate_comprehensive(base_aqi_reading, family_group)
    original_headline = base_rec.headline

    # Call enrich_recommendation with unconfigured service
    enriched = await gemini_service.enrich_recommendation(base_aqi_reading, family_group, base_rec)
    assert enriched.headline == original_headline
    assert enriched.indoor_protocol is not None


def test_scenario_11_cpcb_vs_epa_standard_explanation(gemini_service, base_aqi_reading):
    """Scenario 11: Clarifying CPCB vs US EPA scale differences without confusing breakpoints."""
    result = gemini_service._generate_expert_chat_fallback(
        message="What is the difference between CPCB NAQI and US EPA AQI breakpoints?",
        aqi_reading=base_aqi_reading,
        family=None,
    )
    assert result["source"] == "expert_rules_engine"
    reply = result["reply"]
    assert "Indian CPCB NAQI" in reply
    assert "US EPA AQI" in reply
    assert "never mixes or equates" in reply.lower()
