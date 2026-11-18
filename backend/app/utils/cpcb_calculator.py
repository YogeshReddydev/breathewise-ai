from typing import Dict, Optional, Tuple


# CPCB Breakpoints: List of (B_LO, B_HI, I_LO, I_HI)
CPCB_BREAKPOINTS = {
    "pm2_5": [
        (0.0, 30.0, 0, 50),
        (30.1, 60.0, 51, 100),
        (60.1, 90.0, 101, 200),
        (90.1, 120.0, 201, 300),
        (120.1, 250.0, 301, 400),
        (250.1, 500.0, 401, 500),
    ],
    "pm10": [
        (0.0, 50.0, 0, 50),
        (50.1, 100.0, 51, 100),
        (100.1, 250.0, 101, 200),
        (250.1, 350.0, 201, 300),
        (350.1, 430.0, 301, 400),
        (430.1, 600.0, 401, 500),
    ],
    "no2": [
        (0.0, 40.0, 0, 50),
        (40.1, 80.0, 51, 100),
        (80.1, 180.0, 101, 200),
        (180.1, 280.0, 201, 300),
        (280.1, 400.0, 301, 400),
        (400.1, 800.0, 401, 500),
    ],
    "o3": [
        (0.0, 50.0, 0, 50),
        (50.1, 100.0, 51, 100),
        (100.1, 168.0, 101, 200),
        (168.1, 208.0, 201, 300),
        (208.1, 748.0, 301, 400),
        (748.1, 1000.0, 401, 500),
    ],
    "so2": [
        (0.0, 40.0, 0, 50),
        (40.1, 80.0, 51, 100),
        (80.1, 380.0, 101, 200),
        (380.1, 800.0, 201, 300),
        (800.1, 1600.0, 301, 400),
        (1600.1, 2000.0, 401, 500),
    ],
    "co": [
        (0.0, 1.0, 0, 50),
        (1.01, 2.0, 51, 100),
        (2.01, 10.0, 101, 200),
        (10.01, 17.0, 201, 300),
        (17.01, 34.0, 301, 400),
        (34.01, 50.0, 401, 500),
    ],
}


def calculate_sub_index(pollutant: str, concentration: float) -> Optional[int]:
    """Calculate single pollutant sub-index based on CPCB linear interpolation."""
    if concentration < 0:
        return None

    # Handle CO: if passed in µg/m³ (value > 50), convert to mg/m³
    if pollutant == "co" and concentration > 50:
        concentration = concentration / 1000.0

    table = CPCB_BREAKPOINTS.get(pollutant.lower())
    if not table:
        return None

    for b_lo, b_hi, i_lo, i_hi in table:
        if b_lo <= concentration <= b_hi:
            val = ((i_hi - i_lo) / (b_hi - b_lo)) * (concentration - b_lo) + i_lo
            return int(round(val))

    # If concentration exceeds highest breakpoint, cap at 500
    if concentration > table[-1][1]:
        return 500

    return None


def get_cpcb_category_and_color(aqi: int) -> Tuple[str, str]:
    """Returns official CPCB category and color hex code.
    
    Categories:
    - Good (0-50): Emerald #10B981
    - Satisfactory (51-100): Light Green #84CC16
    - Moderate (101-200): Amber/Yellow #EAB308
    - Poor (201-300): Orange #F97316
    - Very Poor (301-400): Red #EF4444
    - Severe (401-500): Maroon #7F1D1D
    """
    if aqi <= 50:
        return "Good", "#10B981"
    elif aqi <= 100:
        return "Satisfactory", "#84CC16"
    elif aqi <= 200:
        return "Moderate", "#EAB308"
    elif aqi <= 300:
        return "Poor", "#F97316"
    elif aqi <= 400:
        return "Very Poor", "#EF4444"
    else:
        return "Severe", "#7F1D1D"


def calculate_cpcb_aqi(
    pm2_5: Optional[float] = None,
    pm10: Optional[float] = None,
    no2: Optional[float] = None,
    o3: Optional[float] = None,
    so2: Optional[float] = None,
    co: Optional[float] = None,
) -> Dict:
    """Calculates official Indian CPCB National AQI following strict validation rules:
    
    1. At least three pollutants must have valid monitored readings.
    2. At least one of PM2.5 or PM10 must be present.
    If conditions are not met, calculable is set to False with an explicit explanation.
    """
    sub_indices: Dict[str, int] = {}
    inputs = {
        "pm2_5": pm2_5,
        "pm10": pm10,
        "no2": no2,
        "o3": o3,
        "so2": so2,
        "co": co,
    }

    for p, val in inputs.items():
        if val is not None and val >= 0:
            si = calculate_sub_index(p, val)
            if si is not None:
                sub_indices[p.upper()] = si

    # Validation criteria checks
    has_particulate = ("PM2_5" in sub_indices) or ("PM10" in sub_indices)
    has_min_pollutants = len(sub_indices) >= 3

    if not has_min_pollutants:
        return {
            "calculable": False,
            "aqi": None,
            "category": "Insufficient Data",
            "color_hex": "#64748B",
            "dominant_pollutant": None,
            "sub_indices": sub_indices,
            "limitation_note": f"CPCB calculation requires at least 3 monitored pollutants; only {len(sub_indices)} were available.",
        }

    if not has_particulate:
        return {
            "calculable": False,
            "aqi": None,
            "category": "Insufficient Data",
            "color_hex": "#64748B",
            "dominant_pollutant": None,
            "sub_indices": sub_indices,
            "limitation_note": "CPCB calculation strictly requires at least PM2.5 or PM10 to be monitored.",
        }

    # AQI is the maximum of the valid sub-indices
    dominant = max(sub_indices, key=sub_indices.get)
    max_aqi = min(500, sub_indices[dominant])
    category, color = get_cpcb_category_and_color(max_aqi)

    return {
        "calculable": True,
        "aqi": max_aqi,
        "category": category,
        "color_hex": color,
        "dominant_pollutant": dominant.replace("_", "."),
        "sub_indices": sub_indices,
        "limitation_note": None,
    }
