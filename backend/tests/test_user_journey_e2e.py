import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_complete_12_step_user_journey():
    """Verify the entire end-to-end user journey for Challenge 6 evaluator verification."""

    # Step 1: Launch application & check system health
    health_resp = client.get("/api/health")
    assert health_resp.status_code == 200
    health_data = health_resp.json()
    assert health_data["status"] == "healthy"
    assert "default_provider" in health_data

    # Step 2: Location search & selection
    search_resp = client.get("/api/aqi/locations/search?q=New Delhi")
    assert search_resp.status_code == 200
    locations = search_resp.json()
    assert len(locations) > 0
    delhi = locations[0]
    assert "delhi" in delhi["name"].lower()
    lat, lon = delhi["latitude"], delhi["longitude"]

    # Step 3: Retrieve current AQI with Indian CPCB and US EPA standards
    aqi_resp = client.get(f"/api/aqi/current?lat={lat}&lon={lon}&city=New Delhi&standard=cpcb")
    assert aqi_resp.status_code == 200
    aqi_data = aqi_resp.json()
    assert aqi_data["aqi_us"] > 0
    assert "category" in aqi_data
    assert "dominant_pollutant" in aqi_data
    assert aqi_data["provider"] == "open-meteo"
    # Verify CPCB object exists
    assert "cpcb" in aqi_data

    # Step 4: Inspect pollutants and units
    pollutants = aqi_data["pollutants"]
    assert "pm2_5" in pollutants and pollutants["pm2_5"] >= 0
    assert "pm10" in pollutants and pollutants["pm10"] >= 0

    # Step 5: View 24-hour & 48-hour atmospheric forecast
    forecast_resp = client.get(f"/api/aqi/forecast?lat={lat}&lon={lon}&hours=24")
    assert forecast_resp.status_code == 200
    forecast_data = forecast_resp.json()
    assert len(forecast_data["hourly"]) >= 12
    assert "best_window_start" in forecast_data or "worst_window_start" in forecast_data

    # Step 6: Select family member (retrieve default demonstration profile)
    profile_resp = client.get("/api/profiles/current")
    assert profile_resp.status_code == 200
    family = profile_resp.json()
    assert family["is_demo"] is True
    assert len(family["members"]) == 4

    # Locate Leo (child with asthma)
    leo = next((m for m in family["members"] if "Leo" in m["name"]), None)
    assert leo is not None
    assert leo["cohort"] == "children"
    assert "asthma" in leo["conditions"]

    # Step 7: Generate personalized recommendations for family roster
    rec_payload = {
        "city": "New Delhi",
        "lat": lat,
        "lon": lon,
        "family": family,
        "standard": "cpcb",
    }
    rec_resp = client.post("/api/recommendations/evaluate-custom", json=rec_payload)
    assert rec_resp.status_code == 200
    rec_data = rec_resp.json()
    assert 0 <= rec_data["overall_risk_score"] <= 100
    assert len(rec_data["member_advisories"]) >= 1

    leo_advisory = next((a for a in rec_data["member_advisories"] if "leo" in a["member_name"].lower()), None)
    assert leo_advisory is not None
    assert leo_advisory["risk_score"] > 0
    assert "activity_safety" in leo_advisory

    # Step 8 & 9: Open Gemini Assistant and ask a pollution-related question
    chat_payload = {
        "message": "What precautions should Leo take today given his asthma and current PM2.5 levels?",
        "context_aqi": aqi_data,
        "context_family": family,
    }
    chat_resp = client.post("/api/chat/message", json=chat_payload)
    assert chat_resp.status_code == 200
    chat_data = chat_resp.json()
    assert "reply" in chat_data
    assert len(chat_data["reply"]) > 20
    assert chat_data["source"] in {"gemini", "expert_rules_engine"}

    # Step 10: Review indoor air quality guidance
    indoor = rec_data["indoor_protocol"]
    assert "windows_open" in indoor
    assert "purifier_setting" in indoor
    assert "recommended_action" in indoor

    # Step 11: Review sustainable commuting alternatives
    options_resp = client.get("/api/sustainability/options?aqi=150")
    assert options_resp.status_code == 200
    options = options_resp.json()
    assert len(options) >= 5
    modes = [o["mode"] for o in options]
    assert "metro_train" in modes
    assert "city_bus" in modes
    assert "walk_cycle" in modes

    # Step 12: Inspect environmental impact estimates
    calc_payload = {
        "distance_km": 15.0,
        "baseline_mode": "petrol_car",
        "target_mode": "metro_train",
        "trips_per_week": 10,
    }
    calc_resp = client.post("/api/sustainability/calculate?aqi=150", json=calc_payload)
    assert calc_resp.status_code == 200
    calc_data = calc_resp.json()
    assert calc_data["single_trip_avoided_kg"] > 0
    assert calc_data["weekly_avoided_kg"] > 0
    assert calc_data["avoided_percentage"] > 70
    assert calc_data["tailpipe_pm2_5_avoided_g"] > 0
