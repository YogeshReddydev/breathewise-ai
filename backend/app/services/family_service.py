import uuid
from typing import List, Optional, Dict
from app.models.family import FamilyMember, FamilyMemberCreate, HealthCondition, SensitivityLevel


class FamilyService:
    """
    Manages family member health profiles, clinical vulnerabilities, and notification preferences.
    """

    def __init__(self):
        self._members: Dict[str, FamilyMember] = {}
        self._active_member_id: Optional[str] = None
        self._seed_default_profiles()

    def _seed_default_profiles(self):
        leo = FamilyMember(
            id="mem_leo_01",
            name="Leo Vance",
            relationship="Child (Son)",
            age=7,
            conditions=[HealthCondition.ASTHMA, HealthCondition.PEDIATRIC_VULNERABILITY, HealthCondition.ALLERGIES],
            sensitivity=SensitivityLevel.HIGH,
            alert_threshold_aqi=85,
            primary_activity="School playground & outdoor soccer",
            notes="Has exercise-induced asthma; uses Albuterol rescue inhaler before sports.",
        )
        martha = FamilyMember(
            id="mem_martha_02",
            name="Martha Vance",
            relationship="Parent (Grandmother)",
            age=68,
            conditions=[HealthCondition.CARDIOVASCULAR, HealthCondition.ELDERLY_VULNERABILITY],
            sensitivity=SensitivityLevel.CRITICAL,
            alert_threshold_aqi=75,
            primary_activity="Morning neighborhood walking & gardening",
            notes="Hypertension history; sensitive to particulate spikes.",
        )
        alex = FamilyMember(
            id="mem_alex_03",
            name="Alex Vance",
            relationship="Self",
            age=29,
            conditions=[HealthCondition.ATHLETE_HIGH_VENTILATION],
            sensitivity=SensitivityLevel.MODERATE,
            alert_threshold_aqi=120,
            primary_activity="Daily 10km marathon training & bicycle commute",
            notes="Trains outdoors 5 days a week; tracks minute-ventilation exposure.",
        )
        priya = FamilyMember(
            id="mem_priya_04",
            name="Priya Vance",
            relationship="Partner",
            age=31,
            conditions=[],
            sensitivity=SensitivityLevel.LOW,
            alert_threshold_aqi=150,
            primary_activity="Hybrid office commute via metro",
            notes="General urban commuter.",
        )

        for m in [leo, martha, alex, priya]:
            self._members[m.id] = m

        self._active_member_id = leo.id

    def list_members(self) -> List[FamilyMember]:
        return list(self._members.values())

    def get_member(self, member_id: str) -> Optional[FamilyMember]:
        return self._members.get(member_id)

    def get_active_member(self) -> Optional[FamilyMember]:
        if self._active_member_id and self._active_member_id in self._members:
            return self._members[self._active_member_id]
        if self._members:
            return next(iter(self._members.values()))
        return None

    def set_active_member(self, member_id: str) -> bool:
        if member_id in self._members:
            self._active_member_id = member_id
            return True
        return False

    def create_member(self, payload: FamilyMemberCreate) -> FamilyMember:
        new_id = f"mem_{uuid.uuid4().hex[:8]}"
        member = FamilyMember(
            id=new_id,
            name=payload.name,
            relationship=payload.relationship,
            age=payload.age,
            conditions=payload.conditions,
            sensitivity=payload.sensitivity,
            alert_threshold_aqi=payload.alert_threshold_aqi,
            primary_activity=payload.primary_activity,
            notes=payload.notes,
        )
        self._members[new_id] = member
        return member

    def delete_member(self, member_id: str) -> bool:
        if member_id in self._members:
            del self._members[member_id]
            if self._active_member_id == member_id:
                self._active_member_id = next(iter(self._members.keys())) if self._members else None
            return True
        return False


family_service = FamilyService()
