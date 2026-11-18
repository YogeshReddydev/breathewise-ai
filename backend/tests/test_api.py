import pytest
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "BreatheWise" in data["service"]


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_cities_endpoint():
    response = client.get("/api/v1/aqi/cities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5
    assert any(c["name"].startswith("New Delhi") for c in data)


def test_current_aqi_endpoint():
    response = client.get("/api/v1/aqi/current?latitude=28.6139&longitude=77.2090&location_name=Delhi")
    assert response.status_code == 200
    data = response.json()
    assert data["location_name"] == "Delhi"
    assert "aqi" in data
    assert "category" in data
    assert "pollutants" in data
    assert data["pollutants"]["pm2_5"] is not None


def test_forecast_aqi_endpoint():
    response = client.get("/api/v1/aqi/forecast?latitude=28.6139&longitude=77.2090&location_name=Delhi")
    assert response.status_code == 200
    data = response.json()
    assert "hourly" in data
    assert len(data["hourly"]) > 0


def test_recommendations_endpoint():
    response = client.get("/api/v1/recommendations?latitude=28.6139&longitude=77.2090&location_name=Delhi")
    assert response.status_code == 200
    data = response.json()
    assert "risk_score" in data
    assert "mask_recommendation" in data
    assert "ventilation" in data
    assert "outdoor_activity" in data
    assert len(data["actions"]) > 0


def test_family_endpoints():
    # List members
    res = client.get("/api/v1/family")
    assert res.status_code == 200
    data = res.json()
    assert len(data["members"]) > 0
    first_id = data["members"][0]["id"]

    # Get single
    res_single = client.get(f"/api/v1/family/{first_id}")
    assert res_single.status_code == 200
    assert res_single.json()["id"] == first_id

    # Set active
    res_active = client.post(f"/api/v1/family/active/{first_id}")
    assert res_active.status_code == 200
    assert res_active.json()["active_member_id"] == first_id


def test_consultation_endpoint():
    payload = {
        "message": "Is it safe for Leo to play soccer outside today?",
        "history": [],
        "location_name": "New Delhi, India",
        "current_aqi": 115,
        "dominant_pollutant": "PM2.5",
    }
    response = client.post("/api/v1/consult", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 10
    assert "suggested_followups" in data
