import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.core.security import sanitize_query
from app.models.aqi import AQIReading
from app.models.family import FamilyGroup
from app.services.gemini_service import get_gemini_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Conversational AI Assistant"])


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    context_aqi: Optional[AQIReading] = None
    context_family: Optional[FamilyGroup] = None
    chat_history: Optional[List[Dict[str, str]]] = Field(default_factory=list)


class ChatMessageResponse(BaseModel):
    reply: str
    model: str
    source: str


@router.post("/message", response_model=ChatMessageResponse)
async def send_chat_message(request: ChatMessageRequest):
    """Interact with BreatheWise AI assistant for personalized environmental health queries."""
    cleaned_message = sanitize_query(request.message)
    if not cleaned_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty or solely whitespace.")

    gemini_svc = get_gemini_service()
    try:
        result = await gemini_svc.chat(
            message=cleaned_message,
            context_aqi=request.context_aqi,
            context_family=request.context_family,
            chat_history=request.chat_history,
        )
        return ChatMessageResponse(**result)
    except Exception as e:
        logger.error(f"Assistant processing error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your environmental consultation query. Please try again.",
        )
