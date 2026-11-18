from fastapi import APIRouter, HTTPException
from app.models.consultation import ConsultationRequest, ConsultationResponse
from app.services.family_service import family_service
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/consult", tags=["Gemini AI Assistant"])


@router.post("", response_model=ConsultationResponse)
async def consult_air_quality_assistant(request: ConsultationRequest):
    """
    Engage in conversational, multi-turn environmental health consultation powered by Google Gemini.
    Provides context-aware risk analysis for active family members and current atmospheric conditions.
    """
    try:
        member = None
        if request.member_id:
            member = family_service.get_member(request.member_id)
        else:
            member = family_service.get_active_member()

        response = await gemini_service.consult(request, member=member)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Consultation failed: {str(e)}")
