import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import validate_coordinates, sanitize_query
from app.providers.registry import get_registry

client = TestClient(app)


def test_coordinate_validation():
    assert validate_coordinates(28.6139, 77.2090) is True
    assert validate_coordinates(-33.8688, 151.2093) is True
    # Out of range
    assert validate_coordinates(95.0, 50.0) is False
    assert validate_coordinates(50.0, 200.0) is False


def test_query_sanitization():
    clean = sanitize_query("New Delhi; DROP TABLE users;--")
    assert ";" not in clean
    assert "--" not in clean
    assert "New Delhi" in clean


def test_invalid_coordinates_api_response():
    # Lat = 120 is invalid
    resp = client.get("/api/aqi/current?lat=120&lon=50")
    assert resp.status_code == 400
    assert "Invalid coordinates" in resp.json()["detail"]


def test_provider_registry_failover():
    registry = get_registry()
    # Requesting non-existent provider should return open-meteo as fallback
    provider = registry.get_provider("non_existent_provider")
    assert provider.name == "open-meteo"
