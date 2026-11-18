import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "BreatheWise AI Backend"


def test_security_headers_present():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("Strict-Transport-Security") == "max-age=31536000; includeSubDomains"
    assert "default-src 'self'" in response.headers.get("Content-Security-Policy", "")


def test_api_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_default_profiles_endpoint():
    response = client.get("/api/profiles/default")
    assert response.status_code == 200
    data = response.json()
    assert "members" in data
    assert len(data["members"]) >= 3
    # Check that Leo has asthma and is flagged as demo
    has_asthma = any("asthma" in m.get("conditions", []) for m in data["members"])
    assert has_asthma is True
    assert data.get("is_demo") is True


def test_chat_message_endpoint():
    payload = {
        "message": "Is it safe to go for a run today?",
        "context_aqi": None,
        "context_family": None,
    }
    response = client.post("/api/chat/message", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 10


def test_evaluate_custom_profile_endpoint():
    payload = {
        "city": "San Francisco",
        "lat": 37.7749,
        "lon": -122.4194,
    }
    response = client.post("/api/recommendations/evaluate-custom", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "overall_risk_score" in data
    assert "member_advisories" in data
    assert "indoor_protocol" in data
    assert "cohort_recommendations" in data


def test_sustainability_calculate_endpoint():
    payload = {
        "distance_km": 15.0,
        "baseline_mode": "petrol_car",
        "target_mode": "metro_train",
        "trips_per_week": 10,
    }
    response = client.post("/api/sustainability/calculate?aqi=60", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["distance_km"] == 15.0
    assert data["single_trip_avoided_kg"] > 1.5
    assert data["avoided_percentage"] > 70.0
    assert "air_safety_context" in data


def test_sustainability_options_endpoint():
    response = client.get("/api/sustainability/options?aqi=160")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 8
    # Walking/cycling should NOT be recommended when AQI is 160
    walk_opt = next(item for item in data if item["mode"] == "walk_cycle")
    assert walk_opt["recommended_today"] is False
