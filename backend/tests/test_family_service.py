import pytest
from app.models.family import (
    ActivityPreference,
    FamilyMember,
    HealthCondition,
    TargetCohort,
    VulnerabilityTier,
)
from app.services.family_service import FamilyProfileService


def test_family_service_defaults():
    service = FamilyProfileService()
    default_p = service.get_default_profile()
    assert default_p.is_demo is True
    assert len(default_p.members) == 4
    assert any(m.name.startswith("Marcus") for m in default_p.members)


def test_family_service_member_lifecycle():
    service = FamilyProfileService()
    initial_count = len(service.get_active_profile().members)

    new_member = FamilyMember(
        id="custom_test_1",
        name="Aarav",
        relationship="Son",
        age=12,
        conditions=[HealthCondition.ALLERGIES],
        activity_preference=ActivityPreference.CYCLING,
        vulnerability_tier=VulnerabilityTier.SENSITIVE,
        cohort=TargetCohort.STUDENTS,
    )

    updated = service.add_member(new_member)
    assert len(updated.members) == initial_count + 1
    assert updated.is_demo is False
    assert any(m.name == "Aarav" for m in updated.members)

    # Test duplicate ID resolution
    dup_member = FamilyMember(
        id="custom_test_1",
        name="Aarav Duplicate",
        relationship="Son",
        age=12,
        conditions=[HealthCondition.NONE],
        activity_preference=ActivityPreference.LIGHT_WALKING,
        vulnerability_tier=VulnerabilityTier.STANDARD,
        cohort=TargetCohort.STUDENTS,
    )
    updated2 = service.add_member(dup_member)
    assert updated2.members[-1].id != "custom_test_1"

    # Remove member
    updated3 = service.remove_member("custom_test_1")
    assert not any(m.id == "custom_test_1" for m in updated3.members)

    # Remove non-existent member raises KeyError
    with pytest.raises(KeyError):
        service.remove_member("non_existent_id")


def test_family_service_reset_and_clear():
    service = FamilyProfileService()
    cleared = service.clear_demo_profile()
    assert len(cleared.members) == 0

    reset = service.reset_demo_profile()
    assert reset.is_demo is True
    assert len(reset.members) == 4
