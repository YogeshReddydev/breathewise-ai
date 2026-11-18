import uuid
from typing import List, Optional
from app.models.aqi import CurrentAQIResponse, AQICategory
from app.models.family import FamilyMember, HealthCondition, SensitivityLevel
from app.models.recommendation import (
    RecommendationResponse,
    RiskLevel,
    ActionUrgency,
    PersonalizedAction,
    VentilationGuidance,
    OutdoorActivityGuidance,
)


class RecommendationEngine:
    """
    Intelligent Environmental Health & Preventative Risk Recommendation Engine.
    Combines atmospheric pollutant sub-indices with clinical vulnerability factors.
    """

    @classmethod
    def evaluate_risk_score(cls, aqi: int, member: Optional[FamilyMember]) -> int:
        """
        Calculates a 0-100 personal vulnerability risk score.
        AQI baseline is scaled and multiplied by individual clinical risk multipliers.
        """
        # Base risk from AQI (0-500 scale normalized to 0-70)
        base_score = min(70.0, (aqi / 300.0) * 70.0)

        if not member:
            return min(100, round(base_score))

        multiplier = 1.0

        # Sensitivity multiplier
        sensitivity_factors = {
            SensitivityLevel.LOW: 0.85,
            SensitivityLevel.MODERATE: 1.0,
            SensitivityLevel.HIGH: 1.35,
            SensitivityLevel.CRITICAL: 1.6,
        }
        multiplier *= sensitivity_factors.get(member.sensitivity, 1.0)

        # Condition multipliers
        conditions = member.conditions
        if HealthCondition.ASTHMA in conditions:
            multiplier += 0.35
        if HealthCondition.COPD in conditions:
            multiplier += 0.45
        if HealthCondition.CARDIOVASCULAR in conditions:
            multiplier += 0.30
        if HealthCondition.PREGNANCY in conditions:
            multiplier += 0.25
        if HealthCondition.PEDIATRIC_VULNERABILITY in conditions or member.age < 12:
            multiplier += 0.20
        if HealthCondition.ELDERLY_VULNERABILITY in conditions or member.age > 65:
            multiplier += 0.20
        if HealthCondition.ATHLETE_HIGH_VENTILATION in conditions:
            # High minute ventilation rate inhales 4-10x more particulate matter during exertion
            multiplier += 0.15

        final_score = base_score * multiplier
        return max(0, min(100, round(final_score)))

    @classmethod
    def determine_risk_level(cls, risk_score: int) -> RiskLevel:
        if risk_score < 20:
            return RiskLevel.MINIMAL
        elif risk_score < 40:
            return RiskLevel.MILD
        elif risk_score < 65:
            return RiskLevel.MODERATE
        elif risk_score < 85:
            return RiskLevel.HIGH
        else:
            return RiskLevel.CRITICAL

    @classmethod
    def build_recommendations(
        cls, aqi_data: CurrentAQIResponse, member: Optional[FamilyMember] = None
    ) -> RecommendationResponse:
        aqi = aqi_data.aqi
        risk_score = cls.evaluate_risk_score(aqi, member)
        risk_level = cls.determine_risk_level(risk_score)
        dominant = aqi_data.dominant_pollutant

        # 1. Mask Recommendation
        if aqi <= 50:
            mask_rec = "No respirator or mask needed. Outdoor air is safe and pure."
        elif aqi <= 100:
            if member and member.sensitivity in (SensitivityLevel.HIGH, SensitivityLevel.CRITICAL):
                mask_rec = "Fitted N95 / FFP2 mask recommended for sensitive individuals during prolonged transit."
            else:
                mask_rec = "Mask not required for general population; optional for sensitive individuals."
        elif aqi <= 150:
            if member and member.sensitivity != SensitivityLevel.LOW:
                mask_rec = "Certified N95 / FFP2 respirator advised during all outdoor exposure."
            else:
                mask_rec = "N95 / KN95 recommended for strenuous outdoor exertion or prolonged transit."
        elif aqi <= 200:
            mask_rec = "Mandatory certified N95 / FFP2 respirator for everyone venturing outdoors."
        else:
            mask_rec = "Emergency Grade: Strict N95 / FFP3 respirator with silicone seal required for any essential outdoors trip."

        # 2. Ventilation Guidance
        if aqi <= 50:
            vent = VentilationGuidance(
                windows_open_recommended=True,
                optimal_window_opening_hours="Open all windows freely throughout the day",
                purifier_mode="Eco / Auto",
                indoor_air_advice="Take advantage of pristine outdoor air to flush indoor CO2 and volatile compounds."
            )
        elif aqi <= 100:
            vent = VentilationGuidance(
                windows_open_recommended=True,
                optimal_window_opening_hours="Ventilate during low-traffic afternoon hours (1:00 PM - 4:00 PM)",
                purifier_mode="Auto (Low Fan)",
                indoor_air_advice="Brief cross-ventilation acceptable in the afternoon when atmospheric boundary layer is highest."
            )
        elif aqi <= 150:
            vent = VentilationGuidance(
                windows_open_recommended=False,
                optimal_window_opening_hours="Keep windows sealed. Open only for 5 minutes during peak afternoon warmth if necessary",
                purifier_mode="Continuous Medium HEPA",
                indoor_air_advice="Keep doors and windows sealed. Rely on HEPA filtration to scrub infiltrating particulate matter."
            )
        else:
            vent = VentilationGuidance(
                windows_open_recommended=False,
                optimal_window_opening_hours="DO NOT OPEN WINDOWS",
                purifier_mode="Max / Turbo HEPA continuous",
                indoor_air_advice="Hermetically seal doors and windows. Inspect window gaskets. Maintain high indoor air recirculation with True HEPA + Activated Carbon."
            )

        # 3. Outdoor Activity Guidance
        if aqi <= 50:
            outdoor = OutdoorActivityGuidance(
                is_outdoor_exercise_safe=True,
                recommended_duration_max_minutes=180,
                best_time_window="Anytime",
                commute_guidance="Safe for walking, cycling, and active commuting."
            )
        elif aqi <= 100:
            safe = True if not member or member.sensitivity != SensitivityLevel.CRITICAL else False
            outdoor = OutdoorActivityGuidance(
                is_outdoor_exercise_safe=safe,
                recommended_duration_max_minutes=90 if safe else 30,
                best_time_window="1:00 PM - 4:30 PM (Avoid morning rush hour inversion)",
                commute_guidance="Active commuting fine for most; sensitive individuals should select low-traffic routes."
            )
        elif aqi <= 150:
            safe = False if member and member.sensitivity in (SensitivityLevel.HIGH, SensitivityLevel.CRITICAL) else True
            outdoor = OutdoorActivityGuidance(
                is_outdoor_exercise_safe=safe,
                recommended_duration_max_minutes=45 if safe else 0,
                best_time_window="Early afternoon if unavoidable",
                commute_guidance="Prefer closed-cabin transit (car with AC on recirculation, metro) over walking or open auto-rickshaws/bikes."
            )
        else:
            outdoor = OutdoorActivityGuidance(
                is_outdoor_exercise_safe=False,
                recommended_duration_max_minutes=0,
                best_time_window="None - Stay indoors",
                commute_guidance="Minimize non-essential travel. Keep vehicle AC strictly in internal recirculation mode with cabin air filter."
            )

        # 4. Action Cards
        actions: List[PersonalizedAction] = []

        # Action: Air Purifier
        if aqi > 80:
            actions.append(
                PersonalizedAction(
                    id=str(uuid.uuid4())[:8],
                    title="Engage HEPA Air Filtration",
                    urgency=ActionUrgency.CRITICAL if aqi > 150 else ActionUrgency.WARNING,
                    icon="wind",
                    description=f"Set air purifiers to {vent.purifier_mode} in primary living and sleeping zones.",
                    rationale=f"Ambient {dominant} concentration is elevated. True HEPA captures 99.97% of fine particles down to 0.3 microns."
                )
            )

        # Action: Inhaler / Medication Readiness
        if member and any(c in member.conditions for c in [HealthCondition.ASTHMA, HealthCondition.COPD, HealthCondition.ALLERGIES]):
            actions.append(
                PersonalizedAction(
                    id=str(uuid.uuid4())[:8],
                    title=f"Emergency Bronchodilator / Medication Check for {member.name}",
                    urgency=ActionUrgency.CRITICAL if aqi > 100 else ActionUrgency.WARNING,
                    icon="shield-alert",
                    description=f"Verify {member.name}'s rescue inhaler (Albuterol/Salbutamol) and maintenance doses are readily accessible.",
                    rationale=f"{dominant} triggers bronchial hyper-responsiveness and airway inflammation in individuals with respiratory vulnerability."
                )
            )

        # Action: Pediatric / Elderly specific protection
        if member and (member.age < 12 or member.age > 65):
            actions.append(
                PersonalizedAction(
                    id=str(uuid.uuid4())[:8],
                    title=f"Hydration & Indoor Physical Rest for {member.name}",
                    urgency=ActionUrgency.WARNING if aqi > 100 else ActionUrgency.INFO,
                    icon="heart-pulse",
                    description=f"Ensure regular warm water hydration to maintain mucous membrane defense and avoid strenuous exertion.",
                    rationale="Mucociliary clearance in airway passages is impaired when fine particulate concentrations spike."
                )
            )

        # Action: Window & Infiltration Seal
        if aqi > 100:
            actions.append(
                PersonalizedAction(
                    id=str(uuid.uuid4())[:8],
                    title="Seal External Ventilation Gaps",
                    urgency=ActionUrgency.WARNING,
                    icon="door-closed",
                    description="Keep exterior balcony and room doors sealed; turn off kitchen exhaust fans when not cooking to stop backdrafting.",
                    rationale="Negative indoor air pressure draws polluted outdoor micro-particulates through framing cracks and window seals."
                )
            )
        else:
            actions.append(
                PersonalizedAction(
                    id=str(uuid.uuid4())[:8],
                    title="Optimal Natural Ventilation Window",
                    urgency=ActionUrgency.INFO,
                    icon="check-circle",
                    description="Open windows to refresh indoor air during daylight hours.",
                    rationale="Indoor CO2 and VOC levels rise in sealed spaces; atmospheric conditions are safe for fresh air exchange."
                )
            )

        ai_summary = (
            f"Risk for {member.name if member else 'general household'} is rated {risk_level.value} (Score: {risk_score}/100) "
            f"under prevailing AQI {aqi} ({aqi_data.category.value}). Dominant pollutant is {dominant}."
        )

        return RecommendationResponse(
            member_id=member.id if member else None,
            member_name=member.name if member else None,
            location_name=aqi_data.location_name,
            aqi=aqi,
            risk_score=risk_score,
            risk_level=risk_level,
            mask_recommendation=mask_rec,
            ventilation=vent,
            outdoor_activity=outdoor,
            actions=actions,
            ai_summary=ai_summary,
        )
