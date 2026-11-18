from typing import List, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'model'")
    content: str


class ConsultationRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: List[ChatMessage] = Field(default_factory=list)
    member_id: Optional[str] = None
    location_name: Optional[str] = "Default Location"
    current_aqi: Optional[int] = None
    dominant_pollutant: Optional[str] = None


class ConsultationResponse(BaseModel):
    reply: str
    suggested_followups: List[str] = Field(default_factory=list)
    health_alerts: List[str] = Field(default_factory=list)
    ai_engine: str = "Google Gemini"
