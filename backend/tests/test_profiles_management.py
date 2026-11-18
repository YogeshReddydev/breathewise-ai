import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_default_profiles_flagged_as_demo():
    resp = client.get("/api/profiles/default")
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_demo"] is True
    assert "fictional" in data["disclaimer"].lower() or "demonstration" in data["disclaimer"].lower()
    for member in data["members"]:
        assert member["is_demo"] is True


def test_clear_and_reset_demo_profiles():
    # Clear demo
    resp_clear = client.post("/api/profiles/clear-demo")
    assert resp_clear.status_code == 200
    cleared = resp_clear.json()
    assert cleared["is_demo"] is False
    assert len(cleared["members"]) == 0

    # Add custom member
    new_member = {
        "id": "custom_user_1",
        "name": "Priya",
        "relationship": "Self",
        "age": 29,
        "conditions": ["none"],
        "activity_preference": "outdoor_running",
        "vulnerability_tier": "standard",
        "cohort": "general_household",
        "notes": "Daily morning jogger",
        "is_demo": False,
    }
    resp_add = client.post("/api/profiles/members/add", json=new_member)
    assert resp_add.status_code == 200
    added = resp_add.json()
    assert len(added["members"]) == 1
    assert added["members"][0]["name"] == "Priya"

    # Reset demo
    resp_reset = client.post("/api/profiles/reset-demo")
    assert resp_reset.status_code == 200
    reset = resp_reset.json()
    assert reset["is_demo"] is True
    assert len(reset["members"]) == 4
