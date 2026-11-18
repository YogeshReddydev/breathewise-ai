from typing import List, Optional
from fastapi import APIRouter, Query
from app.models.sustainability import (
    EmissionsCalculationRequest,
    EmissionsCalculationResult,
    SustainableTransportOption,
)
from app.services.sustainability_service import get_sustainability_service

router = APIRouter(prefix="/sustainability", tags=["Sustainable Living & Mobility"])


@router.post("/calculate", response_model=EmissionsCalculationResult)
async def calculate_transport_emissions(
    request: EmissionsCalculationRequest,
    aqi: int = Query(50, ge=0, le=500, description="Current ambient AQI for contextual travel safety advice"),
):
    """Calculates comparative greenhouse gas and particulate emissions avoided for chosen transit options."""
    service = get_sustainability_service()
    return service.calculate_emissions(request, current_aqi=aqi)


@router.get("/options", response_model=List[SustainableTransportOption])
async def get_sustainable_transport_options(
    aqi: int = Query(50, ge=0, le=500, description="Current ambient AQI"),
):
    """Returns matrix of urban transport alternatives with tailpipe emissions factors and safety flags."""
    service = get_sustainability_service()
    return service.get_transport_options_matrix(aqi)
