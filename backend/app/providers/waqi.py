from datetime import datetime, timezone
from typing import Optional
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


class WAQIAQIProvider(BaseAQIProvider):
    """
    World Air Quality Index (WAQI) integration.
    Supports official WAQI token integration; falls back gracefully when unconfigured.
    """

    BASE_URL = "https://api.waqi.info/feed"

    def __init__(self, api_token: Optional[str] = None):
        self.api_token = api_token or ""

    @property
    def name(self) -> str:
        return "WAQI Global Sensor Network"

    async def health_check(self) -> bool:
        if not self.api_token:
            return False
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(f"{self.BASE_URL}/here/?token={self.api_token}")
                return res.status_code == 200 and res.json().get("status") == "ok"
        except Exception:
            return False

    async def get_current_aqi(
        self, latitude: float, longitude: float, location_name: str
    ) -> CurrentAQIResponse:
        if not self.api_token:
            raise ValueError("WAQI API token not configured")

        url = f"{self.BASE_URL}/geo:{latitude};{longitude}/?token={self.api_token}"
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()

        if data.get("status") != "ok":
            raise RuntimeError(f"WAQI API Error: {data.get('data')}")

        d = data["data"]
        reported_aqi = int(d.get("aqi", 50))
        dominentpol = d.get("dominentpol", "pm25").lower()
        iaqi = d.get("iaqi", {})

        pm25_val = float(iaqi.get("pm25", {}).get("v", 15.0))
        pm10_val = float(iaqi.get("pm10", {}).get("v", 30.0))
        no2_val = float(iaqi.get("no2", {}).get("v", 20.0))
        o3_val = float(iaqi.get("o3", {}).get("v", 35.0))
        co_val = float(iaqi.get("co", {}).get("v", 0.5))
        so2_val = float(iaqi.get("so2", {}).get("v", 5.0))

        p_pm25 = AQICalculator.compute_pollutant_data("pm2_5", pm25_val)
        p_pm10 = AQICalculator.compute_pollutant_data("pm10", pm10_val)
        p_no2 = AQICalculator.compute_pollutant_data("no2", no2_val)
        p_o3 = AQICalculator.compute_pollutant_data("o3", o3_val)
        p_co = AQICalculator.compute_pollutant_data("co", co_val)
        p_so2 = AQICalculator.compute_pollutant_data("so2", so2_val)

        category = AQICalculator.get_category(reported_aqi)
        headline, caution = AQICalculator.get_health_statements(category, dominentpol)

        temp_c = float(iaqi.get("t", {}).get("v", 22.0))
        rh = float(iaqi.get("h", {}).get("v", 55.0))
        wind = float(iaqi.get("w", {}).get("v", 10.0))

        return CurrentAQIResponse(
            location_name=location_name,
            latitude=latitude,
            longitude=longitude,
            timestamp=d.get("time", {}).get("iso", datetime.now(timezone.utc).isoformat()),
            aqi=reported_aqi,
            category=category,
            dominant_pollutant=dominentpol.upper(),
            pollutants=PollutantsBreakdown(
                pm2_5=p_pm25,
                pm10=p_pm10,
                no2=p_no2,
                o3=p_o3,
                co=p_co,
                so2=p_so2,
            ),
            atmospheric=AtmosphericConditions(
                temperature_c=temp_c,
                relative_humidity_percent=rh,
                wind_speed_kmh=wind,
            ),
            provider=self.name,
            health_headline=headline,
            cautionary_statement=caution,
        )

    async def get_forecast_aqi(
        self, latitude: float, longitude: float, location_name: str
    ) -> ForecastAQIResponse:
        # If forecast isn't full in basic WAQI feed, delegate or build basic daily steps
        curr = await self.get_current_aqi(latitude, longitude, location_name)
        hourly = [
            HourlyAQIPoint(
                timestamp=datetime.now(timezone.utc).isoformat(),
                hour=12,
                aqi=curr.aqi,
                category=curr.category,
                pm2_5=curr.pollutants.pm2_5.value if curr.pollutants.pm2_5 else 15.0,
                pm10=curr.pollutants.pm10.value if curr.pollutants.pm10 else 30.0,
                dominant_pollutant=curr.dominant_pollutant,
            )
        ]
        return ForecastAQIResponse(
            location_name=location_name,
            latitude=latitude,
            longitude=longitude,
            current_aqi=curr.aqi,
            peak_aqi=curr.aqi,
            peak_timestamp=curr.timestamp,
            cleanest_aqi=curr.aqi,
            cleanest_timestamp=curr.timestamp,
            hourly=hourly,
            provider=self.name,
        )
