from datetime import datetime, timezone
from typing import Optional, Dict, Any
import httpx
from app.providers.base import BaseAQIProvider
from app.models.aqi import (
    CurrentAQIResponse,
    ForecastAQIResponse,
    PollutantsBreakdown,
    AtmosphericConditions,
    HourlyAQIPoint,
    AQICategory,
)
from app.services.aqi_calculator import AQICalculator


class OpenMeteoAQIProvider(BaseAQIProvider):
    """
    Live real-time atmospheric data provider leveraging the Open-Meteo Air Quality & Weather API.
    Zero API key required; delivers global, high-resolution continuous sensor & atmospheric model data.
    """

    AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
    WEATHER_URL = "https://api.open-meteo.com/v1/forecast"

    @property
    def name(self) -> str:
        return "Open-Meteo High-Res Atmosphere"

    async def health_check(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(
                    self.AIR_URL,
                    params={"latitude": 28.6139, "longitude": 77.2090, "current": "us_aqi"},
                )
                return res.status_code == 200
        except Exception:
            return False

    async def get_current_aqi(
        self, latitude: float, longitude: float, location_name: str
    ) -> CurrentAQIResponse:
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": [
                "us_aqi",
                "pm10",
                "pm2_5",
                "carbon_monoxide",
                "nitrogen_dioxide",
                "sulphur_dioxide",
                "ozone",
            ],
            "timezone": "auto",
        }

        weather_params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": ["temperature_2m", "relative_humidity_2m", "wind_speed_10m", "wind_direction_10m"],
            "timezone": "auto",
        }

        async with httpx.AsyncClient(timeout=8.0) as client:
            air_resp = await client.get(self.AIR_URL, params=params)
            air_resp.raise_for_status()
            air_data = air_resp.json()

            # Attempt fetching atmospheric weather conditions
            temp_c, rh, wind_kmh, wind_deg = 24.0, 50.0, 8.0, 180.0
            try:
                w_resp = await client.get(self.WEATHER_URL, params=weather_params)
                if w_resp.status_code == 200:
                    w_curr = w_resp.json().get("current", {})
                    temp_c = w_curr.get("temperature_2m", temp_c)
                    rh = w_curr.get("relative_humidity_2m", rh)
                    wind_kmh = w_curr.get("wind_speed_10m", wind_kmh)
                    wind_deg = w_curr.get("wind_direction_10m", wind_deg)
            except Exception:
                pass  # Weather is non-critical enrichments

        current_dict = air_data.get("current", {})
        pm2_5_val = float(current_dict.get("pm2_5", 15.0) or 15.0)
        pm10_val = float(current_dict.get("pm10", 30.0) or 30.0)
        no2_val = float(current_dict.get("nitrogen_dioxide", 20.0) or 20.0)
        o3_val = float(current_dict.get("ozone", 45.0) or 45.0)
        co_val = float(current_dict.get("carbon_monoxide", 0.5) or 0.5)
        so2_val = float(current_dict.get("sulphur_dioxide", 5.0) or 5.0)

        # Convert CO from ug/m3 to mg/m3 if large (> 100)
        if co_val > 50.0:
            co_val = round(co_val / 1000.0, 2)

        # Calculate sub-indices
        p_pm25 = AQICalculator.compute_pollutant_data("pm2_5", pm2_5_val)
        p_pm10 = AQICalculator.compute_pollutant_data("pm10", pm10_val)
        p_no2 = AQICalculator.compute_pollutant_data("no2", no2_val)
        p_o3 = AQICalculator.compute_pollutant_data("o3", o3_val)
        p_co = AQICalculator.compute_pollutant_data("co", co_val)
        p_so2 = AQICalculator.compute_pollutant_data("so2", so2_val)

        sub_indices = {
            "PM2.5": p_pm25.sub_index,
            "PM10": p_pm10.sub_index,
            "NO2": p_no2.sub_index,
            "O3": p_o3.sub_index,
            "CO": p_co.sub_index,
            "SO2": p_so2.sub_index,
        }

        dominant_pollutant = max(sub_indices, key=sub_indices.get)
        calculated_aqi = sub_indices[dominant_pollutant]

        # Use Open-Meteo's provided US AQI if available and non-zero, or our calculated index
        reported_aqi = current_dict.get("us_aqi")
        if reported_aqi is not None and reported_aqi > 0:
            aqi = int(reported_aqi)
        else:
            aqi = calculated_aqi

        category = AQICalculator.get_category(aqi)
        headline, caution = AQICalculator.get_health_statements(category, dominant_pollutant)

        breakdown = PollutantsBreakdown(
            pm2_5=p_pm25,
            pm10=p_pm10,
            no2=p_no2,
            o3=p_o3,
            co=p_co,
            so2=p_so2,
        )

        atm = AtmosphericConditions(
            temperature_c=round(temp_c, 1),
            relative_humidity_percent=round(rh, 1),
            wind_speed_kmh=round(wind_kmh, 1),
            wind_direction_deg=round(wind_deg, 1),
        )

        ts = current_dict.get("time", datetime.now(timezone.utc).isoformat())

        return CurrentAQIResponse(
            location_name=location_name,
            latitude=latitude,
            longitude=longitude,
            timestamp=ts,
            aqi=aqi,
            category=category,
            dominant_pollutant=dominant_pollutant,
            pollutants=breakdown,
            atmospheric=atm,
            provider=self.name,
            health_headline=headline,
            cautionary_statement=caution,
        )

    async def get_forecast_aqi(
        self, latitude: float, longitude: float, location_name: str
    ) -> ForecastAQIResponse:
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "hourly": ["us_aqi", "pm2_5", "pm10"],
            "forecast_days": 2,
            "timezone": "auto",
        }

        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(self.AIR_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        hourly_dict = data.get("hourly", {})
        times = hourly_dict.get("time", [])
        aqis = hourly_dict.get("us_aqi", [])
        pm25s = hourly_dict.get("pm2_5", [])
        pm10s = hourly_dict.get("pm10", [])

        hourly_points = []
        peak_aqi = 0
        peak_ts = ""
        cleanest_aqi = 999
        cleanest_ts = ""

        # Limit to next 24-36 hours
        for idx in range(min(36, len(times))):
            t_str = times[idx]
            val_aqi = aqis[idx] if idx < len(aqis) and aqis[idx] is not None else 50
            val_pm25 = pm25s[idx] if idx < len(pm25s) and pm25s[idx] is not None else 12.0
            val_pm10 = pm10s[idx] if idx < len(pm10s) and pm10s[idx] is not None else 25.0

            cat = AQICalculator.get_category(int(val_aqi))
            hour_int = int(t_str.split("T")[-1].split(":")[0]) if "T" in t_str else idx

            point = HourlyAQIPoint(
                timestamp=t_str,
                hour=hour_int,
                aqi=int(val_aqi),
                category=cat,
                pm2_5=round(float(val_pm25), 1),
                pm10=round(float(val_pm10), 1),
                dominant_pollutant="PM2.5" if val_pm25 * 2 > val_pm10 else "PM10",
            )
            hourly_points.append(point)

            if int(val_aqi) > peak_aqi:
                peak_aqi = int(val_aqi)
                peak_ts = t_str

            if int(val_aqi) < cleanest_aqi:
                cleanest_aqi = int(val_aqi)
                cleanest_ts = t_str

        current_val = hourly_points[0].aqi if hourly_points else 50

        return ForecastAQIResponse(
            location_name=location_name,
            latitude=latitude,
            longitude=longitude,
            current_aqi=current_val,
            peak_aqi=peak_aqi if peak_aqi > 0 else current_val,
            peak_timestamp=peak_ts or (hourly_points[0].timestamp if hourly_points else ""),
            cleanest_aqi=cleanest_aqi if cleanest_aqi < 999 else current_val,
            cleanest_timestamp=cleanest_ts or (hourly_points[0].timestamp if hourly_points else ""),
            hourly=hourly_points,
            provider=self.name,
        )
