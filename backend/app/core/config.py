from functools import lru_cache
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "BreatheWise AI"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    # Google Gemini API
    GEMINI_API_KEY: str = Field(default="", description="Google Gemini API key")
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # AQI Providers
    DEFAULT_AQI_PROVIDER: str = "open-meteo"
    WAQI_API_KEY: str = Field(default="", description="WAQI / aqicn.org API token")
    OPENAQ_API_KEY: str = Field(default="", description="OpenAQ API key")
    AQI_CACHE_TTL_SECONDS: int = 900  # 15 minutes


@lru_cache()
def get_settings() -> Settings:
    return Settings()
