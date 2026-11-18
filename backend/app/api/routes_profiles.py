from fastapi import APIRouter, HTTPException
from app.models.family import FamilyGroup, FamilyMember, get_default_family_group, get_empty_family_group

router = APIRouter(prefix="/profiles", tags=["Family Profiles"])

# In-memory session state for user profile
_active_profile: FamilyGroup = get_default_family_group()


@router.get("/default", response_model=FamilyGroup)
async def get_default_profile():
    """Returns standard fictional demonstration family profile."""
    return get_default_family_group()


@router.get("/current", response_model=FamilyGroup)
async def get_active_profile():
    """Retrieve active family group configuration."""
    global _active_profile
    return _active_profile


@router.post("/update", response_model=FamilyGroup)
async def update_profile(profile: FamilyGroup):
    """Save updated family members, vulnerability tiers, and alert thresholds."""
    global _active_profile
    _active_profile = profile
    return _active_profile


@router.post("/reset-demo", response_model=FamilyGroup)
async def reset_demo_profile():
    """Resets the household profile to the initial fictional demonstration cohorts."""
    global _active_profile
    _active_profile = get_default_family_group()
    return _active_profile


@router.post("/clear-demo", response_model=FamilyGroup)
async def clear_demo_profile():
    """Clears demonstration profiles, leaving an empty household container for custom entries."""
    global _active_profile
    _active_profile = get_empty_family_group()
    return _active_profile


@router.post("/members/add", response_model=FamilyGroup)
async def add_family_member(member: FamilyMember):
    """Adds a new custom household member to the active family profile."""
    global _active_profile
    # Prevent duplicate ID
    if any(m.id == member.id for m in _active_profile.members):
        member.id = f"custom_mem_{len(_active_profile.members) + 1}"
    _active_profile.members.append(member)
    _active_profile.is_demo = False
    return _active_profile


@router.delete("/members/{member_id}", response_model=FamilyGroup)
async def remove_family_member(member_id: str):
    """Removes a household member by ID."""
    global _active_profile
    initial_len = len(_active_profile.members)
    _active_profile.members = [m for m in _active_profile.members if m.id != member_id]
    if len(_active_profile.members) == initial_len:
        raise HTTPException(status_code=404, detail="Household member not found.")
    return _active_profile
