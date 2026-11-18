from typing import List, Optional, Tuple
from app.models.aqi import AQIStandard
from app.models.family import (
    ActivityPreference,
    FamilyMember,
    HealthCondition,
    VulnerabilityTier,
)
from app.models.recommendations import ActivitySafetyLevel


class RiskScorer:
    """Calculates standardized, clinically-informed vulnerability risk scores (0-100)."""

    VULNERABILITY_MULTIPLIERS = {
        VulnerabilityTier.STANDARD: 1.0,
        VulnerabilityTier.SENSITIVE: 1.35,
        VulnerabilityTier.HIGH_RISK: 1.75,
    }

    @classmethod
    def calculate_base_score(cls, aqi: int) -> float:
        """Converts raw AQI into a normalized base risk score (0-100) aligned with EPA/CPCB categories."""
        if aqi <= 50:
            return (aqi / 50.0) * 25.0
        elif aqi <= 100:
            return 25.0 + ((aqi - 50.0) / 50.0) * 25.0
        elif aqi <= 150:
            return 50.0 + ((aqi - 100.0) / 50.0) * 20.0
        elif aqi <= 200:
            return 70.0 + ((aqi - 150.0) / 50.0) * 15.0
        else:
            return min(100.0, 85.0 + ((aqi - 200.0) / 100.0) * 15.0)

    @classmethod
    def calculate_member_risk(cls, member: FamilyMember, aqi: int) -> int:
        """Calculates final combined risk score integrating vulnerability tier and medical conditions."""
        multiplier = cls.VULNERABILITY_MULTIPLIERS.get(member.vulnerability_tier, 1.0)
        base_score = cls.calculate_base_score(aqi)
        score = min(100, int(base_score * multiplier))

        # Condition-specific risk scaling
        has_asthma = HealthCondition.ASTHMA in member.conditions
        has_cardio = HealthCondition.CARDIOVASCULAR in member.conditions
        is_outdoor_labor = (
            HealthCondition.OUTDOOR_LABOR in member.conditions
            or member.activity_preference == ActivityPreference.OUTDOOR_WORK
        )
        is_runner = member.activity_preference in {
            ActivityPreference.OUTDOOR_RUNNING,
            ActivityPreference.CYCLING,
        }

        if has_asthma and aqi > 50:
            score = min(100, score + 15)
        if has_cardio and aqi > 70:
            score = min(100, score + 18)
        if is_outdoor_labor and aqi > 100:
            score = min(100, score + 15)
        if is_runner and aqi > 80:
            score = min(100, score + 12)

        return score


class ActivitySafetyEvaluator:
    """Evaluates outdoor physical exertion safety and particulate respirator requirements."""

    @classmethod
    def evaluate_activity_safety(
        cls,
        member: FamilyMember,
        aqi: int,
        pm2_5: float,
        calculated_score: int,
    ) -> Tuple[ActivitySafetyLevel, bool]:
        """Returns (safety_level, outdoor_exercise_allowed)."""
        is_runner = member.activity_preference in {
            ActivityPreference.OUTDOOR_RUNNING,
            ActivityPreference.CYCLING,
        }

        # Severe thresholds: PM2.5 > 55.4 µg/m³ or AQI > 150
        if aqi > 150 or pm2_5 > 55.4 or calculated_score >= 70:
            safety = ActivitySafetyLevel.RESTRICTED if (calculated_score < 85 and aqi <= 250) else ActivitySafetyLevel.DANGEROUS
            return safety, False

        # Moderate/Sensitive thresholds: PM2.5 > 35.4 µg/m³ or AQI > 100
        if aqi > 100 or pm2_5 > 35.4 or member.vulnerability_tier != VulnerabilityTier.STANDARD or calculated_score >= 50:
            if member.vulnerability_tier == VulnerabilityTier.STANDARD and not is_runner and calculated_score < 55:
                return ActivitySafetyLevel.MODERATE, True
            return ActivitySafetyLevel.RESTRICTED, False

        if calculated_score >= 30:
            return ActivitySafetyLevel.MODERATE, True

        return ActivitySafetyLevel.SAFE, True

    @classmethod
    def evaluate_mask_requirement(
        cls,
        member: FamilyMember,
        aqi: int,
        calculated_score: int,
    ) -> Tuple[bool, Optional[str]]:
        """Determines whether a particulate respirator is required and the appropriate certification level."""
        if aqi > 150 or (calculated_score >= 60 and aqi > 80):
            return True, "Well-fitted N95 or KN95 particulate respirator"
        if aqi > 100 and member.vulnerability_tier != VulnerabilityTier.STANDARD:
            return True, "KN95 or FFP2 particulate filtering mask"
        return False, None


class AdvisoryTextGenerator:
    """Generates structured 5-dimension explanations, action items, and symptom watchlists."""

    @classmethod
    def generate_action_items(
        cls,
        member: FamilyMember,
        safety: ActivitySafetyLevel,
        mask_recommended: bool,
        mask_type: Optional[str],
    ) -> List[str]:
        actions: List[str] = []
        has_asthma = HealthCondition.ASTHMA in member.conditions
        has_allergies = HealthCondition.ALLERGIES in member.conditions
        is_outdoor_labor = (
            HealthCondition.OUTDOOR_LABOR in member.conditions
            or member.activity_preference == ActivityPreference.OUTDOOR_WORK
        )
        is_runner = member.activity_preference in {
            ActivityPreference.OUTDOOR_RUNNING,
            ActivityPreference.CYCLING,
        }

        if safety == ActivitySafetyLevel.SAFE:
            actions.append("Ideal conditions for outdoor training, school play, and commute.")
            actions.append("Open home windows for fresh air cross-ventilation.")
        elif safety == ActivitySafetyLevel.MODERATE:
            if has_asthma or has_allergies:
                actions.append("Keep physician-prescribed rescue inhaler accessible as directed; monitor respiratory comfort.")
                actions.append("Prefer shaded green parks over busy traffic corridors.")
            else:
                actions.append("Outdoor workouts acceptable; reduce intensity if airway dryness develops.")
        elif safety == ActivitySafetyLevel.RESTRICTED:
            if is_runner:
                actions.append("Substitute outdoor run with indoor treadmill or stationary cycling.")
            if member.age < 12:
                actions.append("Shift school recess and physical education to filtered indoor gyms.")
            if is_outdoor_labor:
                actions.append("Wear continuous particulate respirator and schedule indoor recovery breaks.")
            actions.append("Wear an N95 respirator if outdoor transit exceeds 15 minutes.")
            actions.append("Keep indoor HEPA air filtration active.")
        else:
            actions.append("Remain indoors in a sealed, clean-air haven.")
            actions.append("Strictly close windows and operate air purifiers on high/turbo.")
            if mask_recommended:
                actions.append(f"Wear {mask_type} for any non-negotiable outdoor exposure.")

        return actions

    @classmethod
    def generate_symptom_watchlist(cls, member: FamilyMember) -> List[str]:
        symptoms: List[str] = []
        has_asthma = HealthCondition.ASTHMA in member.conditions
        has_cardio = HealthCondition.CARDIOVASCULAR in member.conditions
        has_allergies = HealthCondition.ALLERGIES in member.conditions
        is_outdoor_labor = (
            HealthCondition.OUTDOOR_LABOR in member.conditions
            or member.activity_preference == ActivityPreference.OUTDOOR_WORK
        )

        if has_asthma:
            symptoms.extend(["Wheezing or whistling sound while breathing", "Chest tightness", "Persistent dry cough"])
        if has_cardio:
            symptoms.extend(["Shortness of breath on mild exertion", "Unusual fatigue", "Heart palpitations"])
        if has_allergies:
            symptoms.extend(["Watery/irritated eyes", "Sneezing fits", "Nasal mucosal congestion"])
        if is_outdoor_labor:
            symptoms.extend(["Throat burn", "Headache from particulate & CO exposure", "Reduced stamina"])
        if not symptoms:
            symptoms.extend(["Eye irritation", "Throat scratchiness upon deep breathing"])

        return symptoms

    @classmethod
    def generate_structured_dimensions(
        cls,
        member: FamilyMember,
        safety: ActivitySafetyLevel,
    ) -> Tuple[str, str, str, str, str]:
        """Returns (key_recommendation, recommended_action, reason, expected_benefit, limitations)."""
        if safety == ActivitySafetyLevel.SAFE:
            return (
                f"{member.name} has no air quality restrictions today. Enjoy outdoor activities!",
                f"{member.name} can engage freely in planned daily routines and outdoor endurance activities.",
                "Ambient particulate concentrations are well below the WHO 24-hour health guideline.",
                "Promotes cardiovascular fitness and vitamin D synthesis without oxidative pulmonary stress.",
                "Guidance assumes no localized smoke plumes, burning trash, or direct industrial exhaust.",
            )
        elif safety == ActivitySafetyLevel.MODERATE:
            return (
                f"Moderate air quality: {member.name} can proceed with casual awareness of symptoms.",
                f"{member.name} should maintain light-to-moderate activities and monitor respiratory comfort.",
                "Sub-micron particulates are slightly elevated, posing mild risks for sensitized airways.",
                "Prevents early inflammatory triggers while maintaining daily physical mobility.",
                "Individual hyper-reactivity may still cause mild symptoms near high-traffic avenues.",
            )
        elif safety == ActivitySafetyLevel.RESTRICTED:
            return (
                f"Air pollution elevated: {member.name} should limit prolonged outdoor exertion and stay indoors.",
                f"{member.name} should limit prolonged outdoor exertion and wear an N95 respirator outdoors.",
                "Fine particulates (PM2.5) penetrate deep into alveolar spaces, triggering bronchospasm and systemic inflammation.",
                "Reduces inhaled particle burden by 90-95% when an airtight respirator is utilized.",
                "Surgical or cloth masks offer minimal sub-micron protection; respirator must fit snugly without beard leaks.",
            )
        else:
            return (
                f"High alert: {member.name} must avoid outdoor exposure and maintain filtered indoor air.",
                f"{member.name} must remain indoors in an air-purified room and avoid all outdoor physical exertion.",
                "Severe particulate concentrations trigger acute cardiopulmonary emergencies in vulnerable demographics.",
                "Protects pulmonary parenchyma and prevents emergency hospital admissions.",
                "Indoor air must be actively filtered; passive staying indoors with unsealed windows still allows 70% infiltration.",
            )
