from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """BreatheWise AI Application Configuration."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "BreatheWise AI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    # Google Gemini Settings
    GEMINI_API_KEY: str = Field(default="", description="Google AI Studio Gemini API Key")
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # AQI Data Provider Settings
    DEFAULT_AQI_PROVIDER: str = "open_meteo"
    AQI_CACHE_TTL_SECONDS: int = 900  # 15 minutes
    WAQI_API_TOKEN: str = ""

    # Consultation limits
    MAX_CONSULTATION_HISTORY: int = 12


settings = Settings()
