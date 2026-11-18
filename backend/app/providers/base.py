from abc import ABC, abstractmethod
from typing import List, Optional
from app.models.aqi import AQIReading, AQIStandard, AirQualityForecast, LocationSearchResult


class BaseAQIProvider(ABC):
    """Abstract Base Class for modular real-time AQI providers."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Provider identifier."""
        pass

    @abstractmethod
    async def get_current_aqi(
        self,
        lat: float,
        lon: float,
        location_name: Optional[str] = None,
        standard: Optional[AQIStandard] = None,
    ) -> AQIReading:
        """Fetch current air quality reading for coordinates."""
        pass

    @abstractmethod
    async def get_forecast(
        self,
        lat: float,
        lon: float,
        location_name: Optional[str] = None,
        hours: int = 24,
    ) -> AirQualityForecast:
        """Fetch hourly air quality forecast for coordinates."""
        pass

    @abstractmethod
    async def search_locations(self, query: str) -> List[LocationSearchResult]:
        """Search cities and coordinates matching query."""
        pass
