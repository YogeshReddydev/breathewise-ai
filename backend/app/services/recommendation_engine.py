from datetime import datetime, timezone
from typing import List, Optional

from app.models.aqi import AQIReading, AQIStandard, AirQualityForecast
from app.models.family import FamilyGroup, FamilyMember
from app.models.recommendations import (
    ComprehensiveRecommendation,
    IndoorProtocol,
    MemberAdvisory,
    StructuredRecommendation,
)
from app.services.cohort_advisories import CohortAdvisoryService
from app.services.recommendation_scoring import (
    ActivitySafetyEvaluator,
    AdvisoryTextGenerator,
    RiskScorer,
)


class IntelligentRecommendationEngine:
    """Scientific recommendation engine adhering to EPA AQI standards, CPCB criteria, and WHO clinical guidelines."""

    def evaluate_member(
        self,
        member: FamilyMember,
        aqi: int,
        dominant_pollutant: str = "PM2.5",
        pm2_5: float = 15.0,
        standard: AQIStandard = AQIStandard.US_EPA,
    ) -> MemberAdvisory:
        """Evaluates an individual family member against real-time ambient pollution metrics."""
        # 1. Numerical Risk Scoring
        calculated_score = RiskScorer.calculate_member_risk(member, aqi)

        # 2. Activity Safety & Respirator Evaluation
        safety, exercise_allowed = ActivitySafetyEvaluator.evaluate_activity_safety(
            member, aqi, pm2_5, calculated_score
        )
        mask_recommended, mask_type = ActivitySafetyEvaluator.evaluate_mask_requirement(
            member, aqi, calculated_score
        )

        # 3. Action Items & Symptoms Watchlist
        actions = AdvisoryTextGenerator.generate_action_items(
            member, safety, mask_recommended, mask_type
        )
        symptoms = AdvisoryTextGenerator.generate_symptom_watchlist(member)

        # 4. Structured Clinical Dimensions
        key_rec, rec_action, reason, expected_benefit, limits = (
            AdvisoryTextGenerator.generate_structured_dimensions(member, safety)
        )
        supporting_m = f"Current {dominant_pollutant} concentration is {pm2_5:.1f} µg/m³ with active {standard.value.upper()} AQI of {aqi}."

        return MemberAdvisory(
            member_id=member.id,
            member_name=member.name,
            vulnerability_tier=member.vulnerability_tier.value,
            risk_score=calculated_score,
            activity_safety=safety,
            outdoor_exercise_allowed=exercise_allowed,
            mask_recommended=mask_recommended,
            mask_type=mask_type,
            key_recommendation=key_rec,
            recommended_action=rec_action,
            reason=reason,
            supporting_measurement=supporting_m,
            expected_benefit=expected_benefit,
            limitations=limits,
            actions=actions,
            symptoms_to_watch=symptoms,
        )

    def generate_cohort_recommendations(
        self,
        aqi: int,
        dominant_pollutant: str,
        pm2_5: float,
        standard: AQIStandard,
    ) -> List[StructuredRecommendation]:
        """Delegates cohort guidance generation to CohortAdvisoryService."""
        return CohortAdvisoryService.generate_cohort_recommendations(
            aqi=aqi,
            dominant_pollutant=dominant_pollutant,
            pm2_5=pm2_5,
            standard=standard,
        )

    def generate_indoor_protocol(self, aqi: int, pm2_5: float) -> IndoorProtocol:
        """Determines indoor air quality protection, window ventilation, and HEPA air purifier settings."""
        if aqi <= 50:
            return IndoorProtocol(
                windows_open=True,
                purifier_setting="Low / Auto",
                recommended_action="Optimal outdoor air: open windows for full fresh air cross-ventilation.",
                ventilation_guide="Cross-ventilate for 30-45 minutes to purge indoor VOCs, CO2, and indoor allergens.",
            )
        elif aqi <= 100:
            return IndoorProtocol(
                windows_open=True,
                purifier_setting="Auto",
                recommended_action="Moderate air: ventilate selectively during early morning or low-traffic hours.",
                ventilation_guide="Ventilate briefly when ambient traffic and photochemical ozone levels are lowest.",
            )
        elif aqi <= 150:
            return IndoorProtocol(
                windows_open=False,
                purifier_setting="Medium / Auto",
                recommended_action="Sensitive thresholds exceeded: close windows and activate HEPA filtration.",
                ventilation_guide="Keep external windows closed. Use internal AC recirculation mode.",
            )
        else:
            return IndoorProtocol(
                windows_open=False,
                purifier_setting="High / Turbo",
                recommended_action="High pollution alert: seal external windows, activate multi-room HEPA purifiers.",
                ventilation_guide="Seal gaps around windows and doors; avoid vacuuming or burning candles/incense indoors.",
            )

    def evaluate_comprehensive(
        self,
        aqi_reading: AQIReading,
        family: FamilyGroup,
        forecast: Optional[AirQualityForecast] = None,
        standard: AQIStandard = AQIStandard.US_EPA,
    ) -> ComprehensiveRecommendation:
        """Orchestrates comprehensive household environmental health assessment."""
        # Standard-aware AQI benchmark selection
        if standard == AQIStandard.CPCB and aqi_reading.cpcb and aqi_reading.cpcb.calculable and aqi_reading.cpcb.aqi is not None:
            aqi = aqi_reading.cpcb.aqi
            active_std_name = "CPCB NAQI (India)"
        elif standard == AQIStandard.EUROPEAN and aqi_reading.european and aqi_reading.european.aqi is not None:
            aqi = aqi_reading.european.aqi
            active_std_name = "European AQI"
        else:
            aqi = aqi_reading.aqi_us
            active_std_name = "US EPA AQI"

        dominant = aqi_reading.dominant_pollutant
        pm2_5 = aqi_reading.pollutants.pm2_5

        advisories: List[MemberAdvisory] = [
            self.evaluate_member(member, aqi, dominant, pm2_5, standard)
            for member in family.members
        ]

        cohort_recs = self.generate_cohort_recommendations(aqi, dominant, pm2_5, standard)
        overall_risk = max([adv.risk_score for adv in advisories]) if advisories else min(100, int(aqi * 0.4))
        indoor_protocol = self.generate_indoor_protocol(aqi, pm2_5)

        # Formulate executive headline and summary
        headline, summary = self._generate_executive_briefing(aqi, aqi_reading.location_name, active_std_name, family.family_name)
        best_window, worst_window = self._resolve_activity_windows(aqi, forecast)

        return ComprehensiveRecommendation(
            overall_risk_score=overall_risk,
            headline=headline,
            summary=summary,
            best_outdoor_window=best_window,
            worst_outdoor_window=worst_window,
            member_advisories=advisories,
            cohort_recommendations=cohort_recs,
            indoor_protocol=indoor_protocol,
            engine_source="expert_rules_engine",
            timestamp=datetime.now(timezone.utc).isoformat(),
            active_standard=active_std_name,
        )

    def _generate_executive_briefing(self, aqi: int, location: str, standard_name: str, family_name: str) -> tuple[str, str]:
        if aqi <= 50:
            return (
                f"Air Quality in {location} is Pristine ({standard_name})",
                "Atmospheric conditions are safe and clear for all household members, outdoor cardio, and cross-ventilation.",
            )
        elif aqi <= 100:
            return (
                f"Moderate Air Quality in {location} ({standard_name})",
                "Air quality is acceptable for the general public, but members with respiratory sensitivities should moderate intense endurance workouts.",
            )
        elif aqi <= 150:
            return (
                f"Sensitive Air Warning for {family_name} ({standard_name})",
                "Fine particulate levels are elevated. High-risk family members should avoid strenuous outdoor exertion and keep indoor air filtered.",
            )
        elif aqi <= 200:
            return (
                f"Unhealthy Air Alert for {location} ({standard_name})",
                "Everyone may begin to experience health effects; members with asthma and cardio conditions must avoid outdoor exertion.",
            )
        else:
            return (
                f"Severe Environmental Health Advisory ({standard_name})",
                "Emergency health conditions. All household members must shelter in clean indoor spaces with high-efficiency air purification.",
            )

    def _resolve_activity_windows(self, aqi: int, forecast: Optional[AirQualityForecast]) -> tuple[str, str]:
        if forecast and forecast.best_window_start:
            if (forecast.best_window_aqi and forecast.best_window_aqi > 200) or aqi > 200:
                best = f"{forecast.best_window_start} (Caution: AQI remains severe at {forecast.best_window_aqi or aqi}; avoid outdoor exertion)"
            else:
                best = forecast.best_window_start
            worst = forecast.worst_window_start or "Late afternoon / peak congestion"
            return best, worst
        elif aqi > 200:
            return (
                "No safe outdoor exercise window (Severe pollution / winter smog)",
                "Early morning & late night (Atmospheric inversion smog trap)",
            )
        return "Morning (06:00 - 09:00)", "Late afternoon (14:00 - 18:00)"


_engine_instance: Optional[IntelligentRecommendationEngine] = None


def get_recommendation_engine() -> IntelligentRecommendationEngine:
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = IntelligentRecommendationEngine()
    return _engine_instance
