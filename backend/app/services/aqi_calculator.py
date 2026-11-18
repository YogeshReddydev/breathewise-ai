import math
from typing import Tuple, Dict, Any, Optional
from app.models.aqi import AQICategory, PollutantData


class AQICalculator:
    """
    Standard AQI computation engine based on US EPA breakpoints.
    Includes sub-index calculations for PM2.5, PM10, NO2, O3, CO, and SO2.
    """

    # US EPA PM2.5 Breakpoints (concentration in ug/m3)
    PM25_BREAKPOINTS = [
        (0.0, 9.0, 0, 50),
        (9.1, 35.4, 51, 100),
        (35.5, 55.4, 101, 150),
        (55.5, 125.4, 151, 200),
        (125.5, 225.4, 201, 300),
        (225.5, 325.4, 301, 400),
        (325.5, 500.4, 401, 500),
    ]

    # US EPA PM10 Breakpoints (ug/m3)
    PM10_BREAKPOINTS = [
        (0, 54, 0, 50),
        (55, 154, 51, 100),
        (155, 254, 101, 150),
        (255, 354, 151, 200),
        (355, 424, 201, 300),
        (425, 504, 301, 400),
        (505, 604, 401, 500),
    ]

    # NO2 1-hr Breakpoints (ug/m3 approx: 1 ppb ~ 1.88 ug/m3)
    NO2_BREAKPOINTS = [
        (0.0, 100.0, 0, 50),
        (100.1, 188.0, 51, 100),
        (188.1, 677.0, 101, 150),
        (677.1, 1221.0, 151, 200),
        (1221.1, 2350.0, 201, 300),
        (2350.1, 3100.0, 301, 400),
        (3100.1, 3850.0, 401, 500),
    ]

    # Ozone (O3) 8-hr / 1-hr Breakpoints (ug/m3 approx: 1 ppb ~ 2.0 ug/m3)
    O3_BREAKPOINTS = [
        (0.0, 108.0, 0, 50),
        (108.1, 140.0, 51, 100),
        (140.1, 170.0, 101, 150),
        (170.1, 210.0, 151, 200),
        (210.1, 400.0, 201, 300),
        (400.1, 800.0, 301, 500),
    ]

    # Carbon Monoxide (CO) (mg/m3 approx)
    CO_BREAKPOINTS = [
        (0.0, 4.4, 0, 50),
        (4.5, 9.4, 51, 100),
        (9.5, 12.4, 101, 150),
        (12.5, 15.4, 151, 200),
        (15.5, 30.4, 201, 300),
        (30.5, 50.4, 301, 500),
    ]

    # SO2 1-hr Breakpoints (ug/m3 approx)
    SO2_BREAKPOINTS = [
        (0.0, 92.0, 0, 50),
        (92.1, 196.0, 51, 100),
        (196.1, 485.0, 101, 150),
        (485.1, 797.0, 151, 200),
        (797.1, 1583.0, 201, 300),
        (1583.1, 2100.0, 301, 500),
    ]

    @staticmethod
    def calculate_sub_index(conc: float, breakpoints: list) -> int:
        """Calculates standard sub-index using linear interpolation on EPA breakpoints."""
        if conc < 0:
            return 0

        for c_low, c_high, i_low, i_high in breakpoints:
            if c_low <= conc <= c_high:
                aqi = ((i_high - i_low) / (c_high - c_low)) * (conc - c_low) + i_low
                return max(0, min(500, round(aqi)))

        # If concentration exceeds highest breakpoint
        highest = breakpoints[-1]
        if conc > highest[1]:
            return 500
        return 0

    @classmethod
    def get_category(cls, aqi: int) -> AQICategory:
        if aqi <= 50:
            return AQICategory.GOOD
        elif aqi <= 100:
            return AQICategory.MODERATE
        elif aqi <= 150:
            return AQICategory.UNHEALTHY_SENSITIVE
        elif aqi <= 200:
            return AQICategory.UNHEALTHY
        elif aqi <= 300:
            return AQICategory.VERY_UNHEALTHY
        else:
            return AQICategory.HAZARDOUS

    @classmethod
    def compute_pollutant_data(cls, pollutant_name: str, conc: float) -> PollutantData:
        bp_map = {
            "pm2_5": cls.PM25_BREAKPOINTS,
            "pm10": cls.PM10_BREAKPOINTS,
            "no2": cls.NO2_BREAKPOINTS,
            "o3": cls.O3_BREAKPOINTS,
            "co": cls.CO_BREAKPOINTS,
            "so2": cls.SO2_BREAKPOINTS,
        }
        breakpoints = bp_map.get(pollutant_name.lower(), cls.PM25_BREAKPOINTS)
        sub_index = cls.calculate_sub_index(conc, breakpoints)
        cat = cls.get_category(sub_index)
        unit = "mg/m³" if pollutant_name.lower() == "co" else "µg/m³"
        return PollutantData(value=round(conc, 1), sub_index=sub_index, category=cat, unit=unit)

    @classmethod
    def get_health_statements(cls, category: AQICategory, dominant: str) -> Tuple[str, str]:
        dominant_formatted = dominant.upper().replace("_", ".")
        statements = {
            AQICategory.GOOD: (
                "Air quality is ideal and healthy for outdoor recreation.",
                "Air pollution poses little or no risk to any demographic. Open windows for fresh air ventilation."
            ),
            AQICategory.MODERATE: (
                f"Air quality is acceptable; {dominant_formatted} is elevated.",
                "Unusually sensitive individuals with respiratory allergies or asthma should observe mild caution during extended exertion."
            ),
            AQICategory.UNHEALTHY_SENSITIVE: (
                f"Adverse conditions for sensitive demographics ({dominant_formatted} elevated).",
                "Children, seniors, pregnant individuals, and those with asthma or cardiovascular conditions should limit prolonged outdoor exertion."
            ),
            AQICategory.UNHEALTHY: (
                f"Unhealthy atmospheric pollution dominated by {dominant_formatted}.",
                "Everyone may begin to experience health effects; sensitive groups are advised to wear certified N95 masks outdoors and activate HEPA purifiers."
            ),
            AQICategory.VERY_UNHEALTHY: (
                "Health alert: Risk of health effects is elevated for everyone.",
                "Keep windows tightly shut, run indoor HEPA filtration on medium/high, and avoid all non-essential outdoor physical activity."
            ),
            AQICategory.HAZARDOUS: (
                "Emergency atmospheric health warning: Hazardous air conditions.",
                "Entire population is at severe risk. Remain indoors with filtered air; avoid all outdoor exposure without fitted N95/FFP3 protection."
            ),
        }
        return statements.get(category, (
            "Air quality index reported.",
            "Review pollutant concentrations and minimize prolonged outdoor exposure."
        ))
