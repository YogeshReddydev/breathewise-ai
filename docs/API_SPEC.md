# BreatheWise AI — REST API Specification (v0.2.0)

Base URL: `http://localhost:8000/api`

---

## 1. System Health

### `GET /api/health`
Monitors backend operational readiness, active telemetry provider, and Gemini status.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "service": "BreatheWise AI Backend",
  "version": "0.1.0",
  "default_provider": "open-meteo",
  "gemini_active": false
}
```

---

## 2. Air Quality Telemetry & Standards

### `GET /api/aqi/current`
Fetches real-time air quality index, pollutant concentrations, and multi-standard breakdown.

**Parameters**:
- `city` (string, optional): City or neighborhood name (e.g. `New Delhi`, `San Francisco`, `Tokyo`).
- `lat` (float, optional): Latitude $[-90, 90]$.
- `lon` (float, optional): Longitude $[-180, 180]$.
- `standard` (string, optional): Active standard: `cpcb`, `us_epa`, or `european`.

**Response `200 OK`**:
```json
{
  "aqi_us": 142,
  "aqi_eu": 65,
  "category": "sensitive",
  "category_label": "Unhealthy for Sensitive Groups",
  "color_hex": "#F97316",
  "dominant_pollutant": "PM2.5",
  "timestamp": "2026-11-18T10:00:00Z",
  "location_name": "New Delhi, India",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "pollutants": {
    "pm2_5": 52.4,
    "pm10": 118.2,
    "o3": 38.5,
    "no2": 42.1,
    "so2": 8.4,
    "co": 850.0
  },
  "provider": "open-meteo",
  "active_standard": "cpcb",
  "cpcb": {
    "calculable": true,
    "aqi": 112,
    "category": "Moderate",
    "color_hex": "#EAB308",
    "dominant_pollutant": "PM10",
    "sub_indices": {
      "PM2.5": 87,
      "PM10": 112,
      "NO2": 53
    },
    "limitation_note": null
  },
  "us_epa": {
    "aqi": 142,
    "category": "sensitive",
    "category_label": "Unhealthy for Sensitive Groups",
    "color_hex": "#F97316",
    "dominant_pollutant": "PM2.5"
  },
  "data_type": "observation",
  "source_attribution": "Open-Meteo High-Resolution Atmospheric Models (CAMS/ECMWF)"
}
```

---

### `GET /api/aqi/forecast`
Fetches multi-hour numerical predictions, companion CPCB forecasts, and optimal activity windows.

**Parameters**:
- `city` (string, optional)
- `lat` (float, optional)
- `lon` (float, optional)
- `hours` (integer, optional, default: 24, supports 24 or 48)

---

## 3. Health & Recommendations

### `GET /api/recommendations/comprehensive`
Generates clinical health advisories, target cohort directives, and indoor haven protocols.

**Parameters**:
- `city` (string, optional)
- `lat` (float, optional)
- `lon` (float, optional)
- `standard` (string, optional): `cpcb`, `us_epa`, `european`

**Response `200 OK` includes**:
- `overall_risk_score` (0-100)
- `headline` & `summary`
- `best_outdoor_window` & `worst_outdoor_window`
- `member_advisories`: Individualized 5-dimension advisories
- `cohort_recommendations`: 6 cohort structured directives (Children, Older Adults, Students, Commuters, Outdoor Workers, General)
- `indoor_protocol`: Window ventilation and HEPA speed
- `medical_disclaimer`: Standard clinical disclaimer

---

## 4. Sustainable Living & Mobility

### `POST /api/sustainability/calculate`
Calculates greenhouse gas and particulate emissions avoided when shifting from a baseline mode to a clean alternative.

**Request Payload**:
```json
{
  "distance_km": 15.0,
  "baseline_mode": "petrol_car",
  "target_mode": "metro_train",
  "trips_per_week": 10
}
```

**Response `200 OK`**:
```json
{
  "distance_km": 15.0,
  "baseline_mode_label": "Solo Petrol Car",
  "target_mode_label": "Metro / Electric Train",
  "single_trip_baseline_kg": 2.55,
  "single_trip_target_kg": 0.33,
  "single_trip_avoided_kg": 2.22,
  "weekly_avoided_kg": 22.2,
  "annual_avoided_kg": 1154.4,
  "avoided_percentage": 87.1,
  "tailpipe_pm2_5_avoided_g": 0.52,
  "air_safety_context": "Safe outdoor conditions. Shifting from private vehicles to public transit reduces urban congestion and emissions."
}
```

### `GET /api/sustainability/options`
Retrieves the comparative transport matrix with current AQI safety flags.

---

## 5. Family Profiles & Protection Mode

### `GET /api/profiles/current`
Returns active household profile.

### `POST /api/profiles/reset-demo`
Restores the 4 fictional demonstration cohorts (Marcus, Elena, Leo, Sophia).

### `POST /api/profiles/clear-demo`
Clears demonstration cohorts, returning an empty household container.

### `POST /api/profiles/members/add`
Adds a custom household member with voluntary vulnerability categories.

### `DELETE /api/profiles/members/{member_id}`
Removes a household member.

---

## 6. Conversational AI Assistant

### `POST /api/chat/message`
Ground-truth context-injected AI assistant powered by Gemini 2.5 Flash with expert clinical fallback.
