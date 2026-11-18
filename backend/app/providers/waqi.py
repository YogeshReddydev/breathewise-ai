import logging
from datetime import datetime, timezone
from typing import List, Optional
import httpx

from app.models.aqi import (
    AQIReading,
    AQIStandard,
    AirQualityForecast,
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


class WAQIAQIProvider(BaseAQIProvider):
    """World Air Quality Index (WAQI / aqicn.org) modular provider."""

    BASE_URL = "https://api.waqi.info"

    def __init__(self, api_key: str, timeout: float = 10.0):
        self.api_key = api_key
        self.timeout = timeout

    @property
    def name(self) -> str:
        return "waqi"

    async def get_current_aqi(
        self,
        lat: float,
        lon: float,
        location_name: Optional[str] = None,
        standard: Optional[AQIStandard] = None,
    ) -> AQIReading:
        if not self.api_key:
            raise ValueError("WAQI_API_KEY is not configured")

        url = f"{self.BASE_URL}/feed/geo:{lat};{lon}/"
        params = {"token": self.api_key}

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            payload = resp.json()

        if payload.get("status") != "ok":
            raise RuntimeError(f"WAQI API Error: {payload.get('data')}")

        data = payload.get("data", {})
        aqi_val = int(data.get("aqi", 50))
        iaqi = data.get("iaqi", {})

        pm2_5 = float(iaqi.get("pm25", {}).get("v", 12.0))
        pm10 = float(iaqi.get("pm10", {}).get("v", 20.0))
        o3 = float(iaqi.get("o3", {}).get("v")) if "o3" in iaqi else None
        no2 = float(iaqi.get("no2", {}).get("v")) if "no2" in iaqi else None
        so2 = float(iaqi.get("so2", {}).get("v")) if "so2" in iaqi else None
        co = float(iaqi.get("co", {}).get("v")) if "co" in iaqi else None

        category = get_category_from_aqi(aqi_val)
        dominant = data.get("dominentpol", "PM2.5").upper()
        city_name = location_name or data.get("city", {}).get("name", f"Coords ({lat:.2f}, {lon:.2f})")

        # CPCB computation
        cpcb_res = calculate_cpcb_aqi(pm2_5=pm2_5, pm10=pm10, no2=no2, o3=o3, so2=so2, co=co)

        return AQIReading(
            aqi_us=aqi_val,
            category=category,
            category_label=get_category_label(category),
            color_hex=get_category_color(category),
            dominant_pollutant=dominant,
            timestamp=datetime.now(timezone.utc).isoformat(),
            location_name=city_name,
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
            active_standard=standard or AQIStandard.US_EPA,
            us_epa=USEPAReading(
                aqi=aqi_val,
                category=category,
                category_label=get_category_label(category),
                color_hex=get_category_color(category),
                dominant_pollutant=dominant,
            ),
            data_type="observation",
            source_attribution=f"WAQI Ground Station Monitoring ({city_name})",
        )

    async def get_forecast(
        self,
        lat: float,
        lon: float,
        location_name: Optional[str] = None,
        hours: int = 24,
    ) -> AirQualityForecast:
        raise NotImplementedError("WAQI basic tier does not support granular hourly forecasts; use open-meteo provider.")

    async def search_locations(self, query: str) -> List[LocationSearchResult]:
        if not self.api_key:
            return []
        url = f"{self.BASE_URL}/search/"
        params = {"token": self.api_key, "keyword": query}

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            payload = resp.json()

        results = []
        for station in payload.get("data", []):
            geo = station.get("station", {}).get("geo", [])
            if len(geo) == 2:
                results.append(
                    LocationSearchResult(
                        name=station.get("station", {}).get("name", "Unknown"),
                        country="",
                        latitude=geo[0],
                        longitude=geo[1],
                    )
                )
        return results
