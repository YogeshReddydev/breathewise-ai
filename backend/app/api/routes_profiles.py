from fastapi import APIRouter, HTTPException
from app.models.family import FamilyGroup, FamilyMember
from app.services.family_service import get_family_service

router = APIRouter(prefix="/profiles", tags=["Family Profiles"])


@router.get("/default", response_model=FamilyGroup)
async def get_default_profile():
    """Returns standard fictional demonstration family profile."""
    service = get_family_service()
    return service.get_default_profile()


@router.get("/current", response_model=FamilyGroup)
async def get_active_profile():
    """Retrieve active family group configuration."""
    service = get_family_service()
    return service.get_active_profile()


@router.post("/update", response_model=FamilyGroup)
async def update_profile(profile: FamilyGroup):
    """Save updated family members, vulnerability tiers, and alert thresholds."""
    service = get_family_service()
    return service.update_profile(profile)


@router.post("/reset-demo", response_model=FamilyGroup)
async def reset_demo_profile():
    """Resets the household profile to the initial fictional demonstration cohorts."""
    service = get_family_service()
    return service.reset_demo_profile()


@router.post("/clear-demo", response_model=FamilyGroup)
async def clear_demo_profile():
    """Clears demonstration profiles, leaving an empty household container for custom entries."""
    service = get_family_service()
    return service.clear_demo_profile()


@router.post("/members/add", response_model=FamilyGroup)
async def add_family_member(member: FamilyMember):
    """Adds a new custom household member to the active family profile."""
    service = get_family_service()
    return service.add_member(member)


@router.delete("/members/{member_id}", response_model=FamilyGroup)
async def remove_family_member(member_id: str):
    """Removes a household member by ID."""
    service = get_family_service()
    try:
        return service.remove_member(member_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
