import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.aqi import AQIStandard
from app.providers.open_meteo import OpenMeteoAQIProvider
from app.providers.registry import ProviderRegistry
from app.services.gemini_service import GeminiService
from app.utils.cpcb_calculator import calculate_cpcb_aqi, calculate_sub_index

client = TestClient(app)


def test_aqi_standard_differentiation_no_mixing():
    """Verify that US EPA, Indian CPCB, and European standards produce distinct indices and are never conflated."""
    pm2_5_sample = 75.0  # 75 µg/m³
    pm10_sample = 120.0  # 120 µg/m³
    no2_sample = 45.0    # 45 µg/m³

    # CPCB Calculation
    cpcb_res = calculate_cpcb_aqi(pm2_5=pm2_5_sample, pm10=pm10_sample, no2=no2_sample)
    assert cpcb_res["calculable"] is True
    # In CPCB: 75 µg/m³ PM2.5 falls in 60.1-90.0 breakpoint -> Sub-index 150 (Moderate)
    assert cpcb_res["sub_indices"]["PM2_5"] == 150
    assert cpcb_res["category"] == "Moderate"

    # In US EPA: 75.0 µg/m³ PM2.5 falls in 55.5-125.4 breakpoint -> Index 161 (Unhealthy)
    provider = OpenMeteoAQIProvider()
    cat_us = provider._determine_dominant_pollutant(pm2_5=pm2_5_sample, pm10=pm10_sample, o3=20.0, no2=no2_sample)
    assert cat_us == "PM2.5"

    # Category and sub-index must not be confused
    assert cpcb_res["category"] != "Unhealthy"  # In CPCB, 150 is Moderate, whereas in EPA it is Unhealthy


def test_missing_pollutant_graceful_handling():
    """Verify that when mandatory pollutants are missing, CPCB communicates limitation clearly."""
    # Only 1 pollutant
    sparse = calculate_cpcb_aqi(pm2_5=35.0)
    assert sparse["calculable"] is False
    assert sparse["aqi"] is None
    assert "at least 3 monitored pollutants" in sparse["limitation_note"]

    # 3 gaseous pollutants but missing both PM2.5 and PM10
    gases_only = calculate_cpcb_aqi(no2=45.0, so2=30.0, co=1.2)
    assert gases_only["calculable"] is False
    assert "strictly requires at least PM2.5 or PM10" in gases_only["limitation_note"]


def test_invalid_user_coordinate_inputs():
    """Test boundary validation on coordinates."""
    # Latitude out of bounds (> 90)
    res_lat = client.get("/api/aqi/current?lat=120.5&lon=77.2")
    assert res_lat.status_code == 400
    assert "Invalid coordinates" in res_lat.json()["detail"]

    # Longitude out of bounds (< -180)
    res_lon = client.get("/api/aqi/current?lat=28.6&lon=-205.0")
    assert res_lon.status_code == 400
    assert "Invalid coordinates" in res_lon.json()["detail"]

    # NaN / Inf coordinate rejection
    res_nan = client.get("/api/aqi/current?lat=nan&lon=77.2")
    assert res_nan.status_code == 400
    res_inf = client.get("/api/aqi/current?lat=28.6&lon=inf")
    assert res_inf.status_code == 400

    # Single coordinate input rejection (must provide both or neither)
    res_lat_only = client.get("/api/aqi/current?lat=28.6")
    assert res_lat_only.status_code == 400
    assert "Both latitude and longitude must be provided together" in res_lat_only.json()["detail"]

    res_lon_only = client.get("/api/aqi/current?lon=77.2")
    assert res_lon_only.status_code == 400
    assert "Both latitude and longitude must be provided together" in res_lon_only.json()["detail"]


def test_security_headers_present(monkeypatch):
    """Verify OWASP recommended security headers on all responses and environment-aware CSP."""
    # Development mode check
    monkeypatch.delenv("VERCEL", raising=False)
    monkeypatch.delenv("VERCEL_ENV", raising=False)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    csp_dev = response.headers.get("Content-Security-Policy")
    assert "localhost" in csp_dev
    assert "'unsafe-inline'" in csp_dev

    # Production mode check
    monkeypatch.setenv("VERCEL_ENV", "production")
    response_prod = client.get("/health")
    csp_prod = response_prod.headers.get("Content-Security-Policy")
    assert "localhost" not in csp_prod
    assert "127.0.0.1" not in csp_prod
    assert "script-src 'self';" in csp_prod


def test_in_memory_rate_limiting():
    """Verify in-memory rate limiter throttles excessive requests."""
    from app.core.security import InMemoryRateLimiter
    limiter = InMemoryRateLimiter(max_requests=3, window_seconds=10)
    client_ip = "192.168.1.100"
    assert limiter.is_allowed(client_ip) is True
    assert limiter.is_allowed(client_ip) is True
    assert limiter.is_allowed(client_ip) is True
    # 4th request must be rejected
    assert limiter.is_allowed(client_ip) is False



def test_gemini_failure_fallback_resilience():
    """Test that when Gemini service client is unconfigured or fails, expert deterministic chat responds safely."""
    service = GeminiService()
    # Force unconfigured to test fallback
    service._client = None

    result = service._generate_expert_chat_fallback(
        message="Should Leo play soccer in this air quality?",
        aqi_reading=None,
        family=None,
    )
    assert "reply" in result
    assert result["source"] == "expert_rules_engine"
    assert len(result["reply"]) > 20
    assert "asthma" in result["reply"].lower() or "breathewise" in result["reply"].lower()


def test_provider_failover_resilience():
    """Test registry gracefully resolves open-meteo provider even if customized provider requested."""
    registry = ProviderRegistry()
    provider = registry.get_provider("open-meteo")
    assert provider.name == "open-meteo"
    # Fallback lookup
    default_p = registry.get_provider("non_existent_provider")
    assert default_p.name == "open-meteo"


def test_chat_message_validation_empty_or_whitespace():
    """Verify that chat messages cannot be solely whitespace or empty."""
    res_empty = client.post("/api/chat/message", json={"message": "   "})
    assert res_empty.status_code == 400
    assert "whitespace" in res_empty.json()["detail"].lower()


def test_chat_message_validation_too_long():
    """Verify that overly long chat messages exceeding 1000 characters are rejected."""
    res_long = client.post("/api/chat/message", json={"message": "x" * 1001})
    assert res_long.status_code == 422


def test_payload_too_large_rejection():
    """Verify that request bodies exceeding 1MB are rejected with 413 Payload Too Large."""
    res = client.post(
        "/api/chat/message",
        headers={"Content-Length": "2000000"},
        content=b"oversized_payload",
    )
    assert res.status_code == 413
    assert "exceeds" in res.json()["detail"].lower()


def test_recommendations_paired_coordinates_validation():
    """Verify recommendation endpoints reject single coordinate inputs."""
    # Comprehensive endpoint
    res_comp_lat = client.get("/api/recommendations/comprehensive?lat=28.6")
    assert res_comp_lat.status_code == 400
    assert "Both latitude and longitude must be provided together" in res_comp_lat.json()["detail"]

    # Evaluate-custom endpoint
    res_custom_lon = client.post("/api/recommendations/evaluate-custom", json={"lon": 77.2})
    assert res_custom_lon.status_code == 400
    assert "Both latitude and longitude must be provided together" in res_custom_lon.json()["detail"]


def test_cpcb_breakpoint_boundaries_and_extreme_capping():
    """Test CPCB sub-index calculations at exact boundary points and extreme capping."""
    # Zero concentration -> 0
    sub_zero = calculate_sub_index("pm2_5", 0.0)
    assert sub_zero == 0

    # Exact boundary 30.0 µg/m³ -> 50
    sub_30 = calculate_sub_index("pm2_5", 30.0)
    assert sub_30 == 50

    # Exact boundary 60.0 µg/m³ -> 100
    sub_60 = calculate_sub_index("pm2_5", 60.0)
    assert sub_60 == 100

    # Severe concentration 380.0 µg/m³ -> 500 max cap
    sub_severe = calculate_sub_index("pm2_5", 500.0)
    assert sub_severe == 500

    # Extreme value exceeding 500 µg/m³ capped at 500
    sub_extreme = calculate_sub_index("pm2_5", 750.0)
    assert sub_extreme == 500


def test_forecast_invalid_hours_validation():
    """Verify that forecast hours must be bounded between 6 and 72 hours."""
    # Under minimum (ge=6)
    res_low = client.get("/api/aqi/forecast?city=Delhi&hours=4")
    assert res_low.status_code == 422

    # Over maximum (le=72)
    res_high = client.get("/api/aqi/forecast?city=Delhi&hours=96")
    assert res_high.status_code == 422


def test_sustainability_invalid_mode_rejection():
    """Verify that unsupported transport modes are strictly rejected."""
    payload = {
        "distance_km": 10.0,
        "baseline_mode": "rocket_ship",
        "target_mode": "metro_train",
        "trips_per_week": 5,
    }
    res = client.post("/api/sustainability/calculate", json=payload)
    assert res.status_code == 422


def test_sql_and_xss_query_sanitization():
    """Verify that malicious injection characters and SQL comment sequences are sanitized."""
    from app.core.security import sanitize_query
    dirty_input = "Delhi'; DROP TABLE aqi; -- <script>alert(1)</script>"
    clean_output = sanitize_query(dirty_input)
    assert "DROP TABLE" in clean_output  # words remain
    assert ";" not in clean_output       # statement separators stripped
    assert "--" not in clean_output      # sql comments stripped
    assert "<" not in clean_output       # tags stripped
    assert ">" not in clean_output


def test_strict_coordinate_finite_check():
    """Verify that boolean, string, or inf values are strictly rejected by coordinate validator."""
    from app.core.security import validate_coordinates
    assert validate_coordinates(28.6, 77.2) is True
    assert validate_coordinates("28.6", 77.2) is False  # type: ignore
    assert validate_coordinates(float("nan"), 77.2) is False
    assert validate_coordinates(28.6, float("inf")) is False
    assert validate_coordinates(95.0, 77.2) is False
    assert validate_coordinates(28.6, -185.0) is False

