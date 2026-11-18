import pytest
from app.services.family_service import FamilyService
from app.models.family import FamilyMemberCreate, HealthCondition, SensitivityLevel


def test_family_service_defaults():
    fs = FamilyService()
    members = fs.list_members()
    assert len(members) >= 3

    active = fs.get_active_member()
    assert active is not None
    assert active.name == "Leo Vance"


def test_family_service_crud():
    fs = FamilyService()
    new_member = fs.create_member(
        FamilyMemberCreate(
            name="Grandpa Joe",
            relationship="Grandparent",
            age=72,
            conditions=[HealthCondition.COPD],
            sensitivity=SensitivityLevel.CRITICAL,
            alert_threshold_aqi=60,
            primary_activity="Balcony reading",
            notes="Needs clean air reminder.",
        )
    )

    assert new_member.id is not None
    assert new_member.name == "Grandpa Joe"

    # Set active
    assert fs.set_active_member(new_member.id) is True
    assert fs.get_active_member().id == new_member.id

    # Delete
    deleted = fs.delete_member(new_member.id)
    assert deleted is True
    assert fs.get_member(new_member.id) is None
