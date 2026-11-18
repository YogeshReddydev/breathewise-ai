from typing import List
from fastapi import APIRouter, HTTPException, Path
from app.models.family import FamilyMember, FamilyMemberCreate, FamilyMemberListResponse
from app.services.family_service import family_service

router = APIRouter(prefix="/family", tags=["Family Profile & Vulnerabilities"])


@router.get("", response_model=FamilyMemberListResponse)
async def list_family_members():
    """Retrieve all configured family profiles and identify the currently active member."""
    members = family_service.list_members()
    active = family_service.get_active_member()
    return FamilyMemberListResponse(
        members=members,
        active_member_id=active.id if active else None,
    )


@router.post("", response_model=FamilyMember, status_code=201)
async def create_family_member(payload: FamilyMemberCreate):
    """Add a new family member with specific health conditions and sensitivity thresholds."""
    member = family_service.create_member(payload)
    return member


@router.get("/{member_id}", response_model=FamilyMember)
async def get_family_member(member_id: str = Path(...)):
    """Retrieve a single family profile."""
    member = family_service.get_member(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    return member


@router.post("/active/{member_id}", response_model=FamilyMemberListResponse)
async def set_active_family_member(member_id: str = Path(...)):
    """Set the active family member for dashboard context."""
    success = family_service.set_active_member(member_id)
    if not success:
        raise HTTPException(status_code=404, detail="Family member not found")
    return FamilyMemberListResponse(
        members=family_service.list_members(),
        active_member_id=member_id,
    )


@router.delete("/{member_id}", status_code=204)
async def delete_family_member(member_id: str = Path(...)):
    """Remove a family profile."""
    success = family_service.delete_member(member_id)
    if not success:
        raise HTTPException(status_code=404, detail="Family member not found")
    return None
