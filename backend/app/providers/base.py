from abc import ABC, abstractmethod
from app.models.aqi import CurrentAQIResponse, ForecastAQIResponse


class BaseAQIProvider(ABC):
    """Abstract Base Class for AQI Data Providers."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Name of the AQI provider."""
        pass

    @abstractmethod
    async def get_current_aqi(
        self, latitude: float, longitude: float, location_name: str
    ) -> CurrentAQIResponse:
        """Retrieve real-time air quality index and pollutant concentrations."""
        pass

    @abstractmethod
    async def get_forecast_aqi(
        self, latitude: float, longitude: float, location_name: str
    ) -> ForecastAQIResponse:
        """Retrieve multi-hour atmospheric forecast and peak pollution predictions."""
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """Verify provider availability."""
        pass
