import logging
from datetime import datetime, timezone
from typing import List, Optional
import httpx

from app.models.aqi import (
    AQIReading,
    AQIStandard,
    AirQualityForecast,
    CPCBReading,
    EuropeanReading,
    HourlyForecastItem,
    LocationSearchResult,
    PollutantBreakdown,
    USEPAReading,
    get_category_color,
    get_category_from_aqi,
    get_category_label,
)
from app.providers.base import BaseAQIProvider
from app.utils.cpcb_calculator import calculate_cpcb_aqi

logger = logging.getLogger(__name__)


class OpenMeteoAQIProvider(BaseAQIProvider):
    """Real live AQI data provider backed by the Open-Meteo Air Quality API.
    
    Provides real atmospheric data, satellite observations, and numerical models
    globally with zero API key requirement.
    """

    AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
    GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"

    def __init__(self, timeout: float = 10.0):
        self.timeout = timeout

    @property
    def name(self) -> str:
        return "open-meteo"

    def _determine_dominant_pollutant(self, pm2_5: float, pm10: float, o3: Optional[float], no2: Optional[float]) -> str:
        # Standard EPA ratio threshold comparison
        scores = {
            "PM2.5": pm2_5 / 12.0 if pm2_5 else 0,
            "PM10": pm10 / 54.0 if pm10 else 0,
            "O3": (o3 / 100.0) if o3 else 0,
            "NO2": (no2 / 100.0) if no2 else 0,
        }
        return max(scores, key=scores.get)

    def _is_indian_coordinate(self, lat: float, lon: float, location_name: Optional[str]) -> bool:
        """Heuristic to detect Indian geography for India-first AQI prioritization."""
        if location_name and "india" in location_name.lower():
            return True
        # Bounding box for India approximately: Lat 6.5 to 37.5, Lon 68.0 to 97.5
        return 6.5 <= lat <= 37.5 and 68.0 <= lon <= 97.5

    async def get_current_aqi(
        self,
        lat: float,
        lon: float,
        location_name: Optional[str] = None,
        standard: Optional[AQIStandard] = None,
    ) -> AQIReading:
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "us_aqi,european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone",
            "timezone": "auto",
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(self.AIR_QUALITY_URL, params=params)
            response.raise_for_status()
            data = response.json()

        current = data.get("current", {})
        us_aqi = int(current.get("us_aqi") or 35)
        eu_aqi = int(current.get("european_aqi") or 25)
        pm2_5 = float(current.get("pm2_5") or 8.5)
        pm10 = float(current.get("pm10") or 14.2)
        o3 = float(current.get("ozone")) if current.get("ozone") is not None else None
        no2 = float(current.get("nitrogen_dioxide")) if current.get("nitrogen_dioxide") is not None else None
        so2 = float(current.get("sulphur_dioxide")) if current.get("sulphur_dioxide") is not None else None
        co = float(current.get("carbon_monoxide")) if current.get("carbon_monoxide") is not None else None

        category = get_category_from_aqi(us_aqi)
        dominant = self._determine_dominant_pollutant(pm2_5, pm10, o3, no2)

        # Compute validated Indian CPCB National AQI
        cpcb_result = calculate_cpcb_aqi(
            pm2_5=pm2_5,
            pm10=pm10,
            no2=no2,
            o3=o3,
            so2=so2,
            co=co,
        )

        cpcb_reading = CPCBReading(
            calculable=cpcb_result["calculable"],
            aqi=cpcb_result["aqi"],
            category=cpcb_result["category"],
            color_hex=cpcb_result["color_hex"],
            dominant_pollutant=cpcb_result["dominant_pollutant"],
            sub_indices=cpcb_result["sub_indices"],
            limitation_note=cpcb_result["limitation_note"],
        )

        us_epa_reading = USEPAReading(
            aqi=us_aqi,
            category=category,
            category_label=get_category_label(category),
            color_hex=get_category_color(category),
            dominant_pollutant=dominant,
        )

        # European AQI evaluation
        eu_category = "Good"
        eu_color = "#10B981"
        if eu_aqi > 100:
            eu_category, eu_color = "Very Poor", "#7F1D1D"
        elif eu_aqi > 75:
            eu_category, eu_color = "Poor", "#EF4444"
        elif eu_aqi > 50:
            eu_category, eu_color = "Moderate", "#F59E0B"
        elif eu_aqi > 25:
            eu_category, eu_color = "Fair", "#84CC16"

        european_reading = EuropeanReading(
            aqi=eu_aqi,
            category=eu_category,
            color_hex=eu_color,
        )

        # Determine active standard
        is_india = self._is_indian_coordinate(lat, lon, location_name)
        active_std = standard or (AQIStandard.CPCB if is_india and cpcb_reading.calculable else AQIStandard.US_EPA)

        return AQIReading(
            aqi_us=us_aqi,
            aqi_eu=eu_aqi,
            category=category,
            category_label=get_category_label(category),
            color_hex=get_category_color(category),
            dominant_pollutant=dominant,
            timestamp=current.get("time") or datetime.now(timezone.utc).isoformat(),
            location_name=location_name or f"Coords ({lat:.2f}, {lon:.2f})",
            latitude=lat,
            longitude=lon,
            pollutants=PollutantBreakdown(
                pm2_5=pm2_5,
                pm10=pm10,
                o3=o3,
                no2=no2,
                so2=so2,
                co=co,
            ),
            provider=self.name,
            active_standard=active_std,
            cpcb=cpcb_reading,
            us_epa=us_epa_reading,
            european=european_reading,
            data_type="observation",
            source_attribution="Open-Meteo High-Resolution Atmospheric Models (CAMS/ECMWF)",
        )

    async def get_forecast(
        self,
        lat: float,
        lon: float,
        location_name: Optional[str] = None,
        hours: int = 24,
    ) -> AirQualityForecast:
        forecast_days = 3 if hours > 24 else 2
        params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": "pm2_5,pm10,us_aqi,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide",
            "forecast_days": forecast_days,
            "timezone": "auto",
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(self.AIR_QUALITY_URL, params=params)
            response.raise_for_status()
            data = response.json()

        hourly_raw = data.get("hourly", {})
        times = hourly_raw.get("time", [])
        aqi_list = hourly_raw.get("us_aqi", [])
        pm2_5_list = hourly_raw.get("pm2_5", [])
        pm10_list = hourly_raw.get("pm10", [])
        no2_list = hourly_raw.get("nitrogen_dioxide", [])
        o3_list = hourly_raw.get("ozone", [])
        so2_list = hourly_raw.get("sulphur_dioxide", [])
        co_list = hourly_raw.get("carbon_monoxide", [])

        hourly_items: List[HourlyForecastItem] = []
        limit = min(len(times), hours)

        for i in range(limit):
            aqi_val = int(aqi_list[i]) if i < len(aqi_list) and aqi_list[i] is not None else 40
            pm2_val = float(pm2_5_list[i]) if i < len(pm2_5_list) and pm2_5_list[i] is not None else 10.0
            pm10_val = float(pm10_list[i]) if i < len(pm10_list) and pm10_list[i] is not None else 18.0
            no2_val = float(no2_list[i]) if i < len(no2_list) and no2_list[i] is not None else None
            o3_val = float(o3_list[i]) if i < len(o3_list) and o3_list[i] is not None else None
            so2_val = float(so2_list[i]) if i < len(so2_list) and so2_list[i] is not None else None
            co_val = float(co_list[i]) if i < len(co_list) and co_list[i] is not None else None

            cat = get_category_from_aqi(aqi_val)

            # Companion CPCB calculation
            cpcb_res = calculate_cpcb_aqi(
                pm2_5=pm2_val,
                pm10=pm10_val,
                no2=no2_val,
                o3=o3_val,
                so2=so2_val,
                co=co_val,
            )

            hourly_items.append(
                HourlyForecastItem(
                    time=times[i],
                    aqi_us=aqi_val,
                    pm2_5=pm2_val,
                    pm10=pm10_val,
                    dominant_pollutant="PM2.5" if pm2_val > 12 else "Moderate",
                    category=cat,
                    category_label=get_category_label(cat),
                    color_hex=get_category_color(cat),
                    cpcb_aqi=cpcb_res["aqi"],
                    cpcb_category=cpcb_res["category"] if cpcb_res["calculable"] else None,
                    cpcb_color=cpcb_res["color_hex"] if cpcb_res["calculable"] else None,
                )
            )

        # Calculate optimal & worst outdoor activity windows
        best_window_start, best_window_end = None, None
        worst_window_start, worst_window_end = None, None
        best_window_aqi, worst_window_aqi = None, None

        if len(hourly_items) >= 4:
            # 3-hour sliding windows
            window_scores = []
            for w in range(len(hourly_items) - 2):
                avg_aqi = (hourly_items[w].aqi_us + hourly_items[w + 1].aqi_us + hourly_items[w + 2].aqi_us) / 3
                window_scores.append((avg_aqi, w))

            best_score, best_w = min(window_scores, key=lambda x: x[0])
            worst_score, worst_w = max(window_scores, key=lambda x: x[0])

            best_window_start = hourly_items[best_w].time
            best_window_end = hourly_items[min(best_w + 3, len(hourly_items) - 1)].time
            best_window_aqi = int(round(best_score))

            worst_window_start = hourly_items[worst_w].time
            worst_window_end = hourly_items[min(worst_w + 3, len(hourly_items) - 1)].time
            worst_window_aqi = int(round(worst_score))

        avg_aqi = int(sum(item.aqi_us for item in hourly_items) / len(hourly_items)) if hourly_items else 0

        return AirQualityForecast(
            location_name=location_name or f"Coords ({lat:.2f}, {lon:.2f})",
            latitude=lat,
            longitude=lon,
            hourly=hourly_items,
            best_window_start=best_window_start,
            best_window_end=best_window_end,
            best_window_aqi=best_window_aqi,
            worst_window_start=worst_window_start,
            worst_window_end=worst_window_end,
            worst_window_aqi=worst_window_aqi,
            avg_next_24h_aqi=avg_aqi,
            forecast_horizon_hours=hours,
            data_type="forecast",
            source_attribution="Open-Meteo Numerical Prediction Models (CAMS/ECMWF)",
        )

    async def search_locations(self, query: str) -> List[LocationSearchResult]:
        if not query or len(query.strip()) < 2:
            return []

        params = {
            "name": query.strip(),
            "count": 6,
            "language": "en",
            "format": "json",
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(self.GEOCODING_URL, params=params)
            response.raise_for_status()
            data = response.json()

        results: List[LocationSearchResult] = []
        for item in data.get("results", []):
            results.append(
                LocationSearchResult(
                    name=item.get("name", "Unknown"),
                    country=item.get("country", ""),
                    admin1=item.get("admin1"),
                    latitude=float(item.get("latitude")),
                    longitude=float(item.get("longitude")),
                    timezone=item.get("timezone"),
                )
            )
        return results
