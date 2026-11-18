import logging
from typing import Optional
from app.models.family import (
    FamilyGroup,
    FamilyMember,
    get_default_family_group,
    get_empty_family_group,
)

logger = logging.getLogger(__name__)


class FamilyProfileService:
    """Encapsulates family profile state, member lifecycle, and demonstration datasets."""

    def __init__(self):
        self._active_profile: FamilyGroup = get_default_family_group()

    def get_default_profile(self) -> FamilyGroup:
        """Returns the immutable standard demonstration household."""
        return get_default_family_group()

    def get_active_profile(self) -> FamilyGroup:
        """Retrieves the current active household configuration."""
        return self._active_profile

    def update_profile(self, profile: FamilyGroup) -> FamilyGroup:
        """Replaces the active household configuration."""
        self._active_profile = profile
        logger.info(f"Updated family profile '{profile.family_name}' with {len(profile.members)} members")
        return self._active_profile

    def reset_demo_profile(self) -> FamilyGroup:
        """Resets the household profile to default demonstration cohorts."""
        self._active_profile = get_default_family_group()
        logger.info("Reset household profile to default demo cohorts")
        return self._active_profile

    def clear_demo_profile(self) -> FamilyGroup:
        """Clears demonstration profiles, leaving an empty household container."""
        self._active_profile = get_empty_family_group()
        logger.info("Cleared demonstration profiles")
        return self._active_profile

    def add_member(self, member: FamilyMember) -> FamilyGroup:
        """Adds a new member, assigning a unique ID if duplicates exist."""
        if any(m.id == member.id for m in self._active_profile.members):
            member.id = f"custom_mem_{len(self._active_profile.members) + 1}"
        self._active_profile.members.append(member)
        self._active_profile.is_demo = False
        logger.info(f"Added member '{member.name}' (id: {member.id}) to family profile")
        return self._active_profile

    def remove_member(self, member_id: str) -> FamilyGroup:
        """Removes a household member by ID. Raises KeyError if not found."""
        initial_count = len(self._active_profile.members)
        self._active_profile.members = [m for m in self._active_profile.members if m.id != member_id]
        if len(self._active_profile.members) == initial_count:
            raise KeyError(f"Member with ID '{member_id}' not found in active profile.")
        logger.info(f"Removed member '{member_id}' from family profile")
        return self._active_profile


_family_service_instance: Optional[FamilyProfileService] = None


def get_family_service() -> FamilyProfileService:
    global _family_service_instance
    if _family_service_instance is None:
        _family_service_instance = FamilyProfileService()
    return _family_service_instance
