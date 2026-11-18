from datetime import datetime, timezone
from typing import List, Optional

from app.models.aqi import AQIReading, AQIStandard, AirQualityForecast
from app.models.family import (
    ActivityPreference,
    FamilyGroup,
    FamilyMember,
    HealthCondition,
    TargetCohort,
    VulnerabilityTier,
)
from app.models.recommendations import (
    ActivitySafetyLevel,
    ComprehensiveRecommendation,
    IndoorProtocol,
    MemberAdvisory,
    StructuredRecommendation,
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
        # Base vulnerability multiplier
        vuln_multipliers = {
            VulnerabilityTier.STANDARD: 1.0,
            VulnerabilityTier.SENSITIVE: 1.35,
            VulnerabilityTier.HIGH_RISK: 1.75,
        }
        multiplier = vuln_multipliers.get(member.vulnerability_tier, 1.0)

        # Standard clinical scaling aligned with EPA / CPCB breakpoints
        if aqi <= 50:
            base_score = (aqi / 50.0) * 25.0
        elif aqi <= 100:
            base_score = 25.0 + ((aqi - 50.0) / 50.0) * 25.0
        elif aqi <= 150:
            base_score = 50.0 + ((aqi - 100.0) / 50.0) * 20.0
        elif aqi <= 200:
            base_score = 70.0 + ((aqi - 150.0) / 50.0) * 15.0
        else:
            base_score = min(100.0, 85.0 + ((aqi - 200.0) / 100.0) * 15.0)

        calculated_score = min(100, int(base_score * multiplier))

        # Condition-specific adjustments
        has_asthma = HealthCondition.ASTHMA in member.conditions
        has_cardio = HealthCondition.CARDIOVASCULAR in member.conditions
        has_allergies = HealthCondition.ALLERGIES in member.conditions
        is_outdoor_labor = HealthCondition.OUTDOOR_LABOR in member.conditions or member.activity_preference == ActivityPreference.OUTDOOR_WORK
        is_runner = member.activity_preference in {ActivityPreference.OUTDOOR_RUNNING, ActivityPreference.CYCLING}

        if has_asthma and aqi > 50:
            calculated_score = min(100, calculated_score + 15)
        if has_cardio and aqi > 70:
            calculated_score = min(100, calculated_score + 18)
        if is_outdoor_labor and aqi > 100:
            calculated_score = min(100, calculated_score + 15)
        if is_runner and aqi > 80:
            calculated_score = min(100, calculated_score + 12)

        # Activity Safety Level & Exercise Allowed
        # Clinical Rule: At AQI > 150 or PM2.5 > 55.4 µg/m³, vigorous outdoor cardio is unsafe for ALL cohorts including healthy standard adults.
        # At AQI > 100 or PM2.5 > 35.4 µg/m³, vigorous cardio is restricted for Sensitive / High-Risk tiers.
        if aqi > 150 or pm2_5 > 55.4 or calculated_score >= 70:
            exercise_allowed = False
            safety = ActivitySafetyLevel.RESTRICTED if (calculated_score < 85 and aqi <= 250) else ActivitySafetyLevel.DANGEROUS
        elif aqi > 100 or pm2_5 > 35.4 or member.vulnerability_tier != VulnerabilityTier.STANDARD or calculated_score >= 50:
            if member.vulnerability_tier == VulnerabilityTier.STANDARD and not is_runner and calculated_score < 55:
                exercise_allowed = True
                safety = ActivitySafetyLevel.MODERATE
            else:
                exercise_allowed = False
                safety = ActivitySafetyLevel.RESTRICTED
        elif calculated_score >= 30:
            safety = ActivitySafetyLevel.MODERATE
            exercise_allowed = True
        else:
            safety = ActivitySafetyLevel.SAFE
            exercise_allowed = True

        # Mask Guidance
        mask_recommended = False
        mask_type = None
        if aqi > 150 or (calculated_score >= 60 and aqi > 80):
            mask_recommended = True
            mask_type = "Well-fitted N95 or KN95 particulate respirator"
        elif aqi > 100 and member.vulnerability_tier != VulnerabilityTier.STANDARD:
            mask_recommended = True
            mask_type = "KN95 or FFP2 particulate filtering mask"

        # Tailored Action Items
        actions: List[str] = []
        symptoms: List[str] = []

        if safety == ActivitySafetyLevel.SAFE:
            actions.append("Ideal conditions for outdoor training, school play, and commute.")
            actions.append("Open home windows for fresh air cross-ventilation.")
        elif safety == ActivitySafetyLevel.MODERATE:
            if has_asthma or has_allergies:
                actions.append("Keep quick-relief inhaler accessible; monitor respiratory rhythm.")
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

        # Symptoms to watch
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

        # Structured 5-dimension clinical explanation
        supporting_m = f"Current {dominant_pollutant} concentration is {pm2_5:.1f} µg/m³ with active {standard.value.upper()} AQI of {aqi}."
        
        if safety == ActivitySafetyLevel.SAFE:
            rec_action = f"{member.name} can engage freely in planned daily routines and outdoor endurance activities."
            reason = "Ambient particulate concentrations are well below the WHO 24-hour health guideline."
            benefit = "Promotes cardiovascular fitness and vitamin D synthesis without oxidative pulmonary stress."
            limits = "Guidance assumes no localized smoke plumes, burning trash, or direct industrial exhaust."
            key_rec = f"{member.name} has no air quality restrictions today. Enjoy outdoor activities!"
        elif safety == ActivitySafetyLevel.MODERATE:
            rec_action = f"{member.name} should maintain light-to-moderate activities and monitor respiratory comfort."
            reason = "Sub-micron particulates are slightly elevated, posing mild risks for sensitized airways."
            benefit = "Prevents early inflammatory triggers while maintaining daily physical mobility."
            limits = "Individual hyper-reactivity may still cause mild symptoms near high-traffic avenues."
            key_rec = f"Moderate air quality: {member.name} can proceed with casual awareness of symptoms."
        elif safety == ActivitySafetyLevel.RESTRICTED:
            rec_action = f"{member.name} should limit prolonged outdoor exertion and wear an N95 respirator outdoors."
            reason = "Fine particulates (PM2.5) penetrate deep into alveolar spaces, triggering bronchospasm and systemic inflammation."
            benefit = "Reduces inhaled particle burden by 90-95% when an airtight respirator is utilized."
            limits = "Surgical or cloth masks offer minimal sub-micron protection; respirator must fit snugly without beard leaks."
            key_rec = f"Air pollution elevated: {member.name} should limit prolonged outdoor exertion and stay indoors."
        else:
            rec_action = f"{member.name} must remain indoors in an air-purified room and avoid all outdoor physical exertion."
            reason = "Severe particulate concentrations trigger acute cardiopulmonary emergencies in vulnerable demographics."
            benefit = "Protects pulmonary parenchyma and prevents emergency hospital admissions."
            limits = "Indoor air must be actively filtered; passive staying indoors with unsealed windows still allows 70% infiltration."
            key_rec = f"High alert: {member.name} must avoid outdoor exposure and maintain filtered indoor air."

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
            expected_benefit=benefit,
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
        """Generates transparent, 5-point structured recommendations for all 6 core cohorts."""
        recs: List[StructuredRecommendation] = []
        sup_m = f"Ambient {dominant_pollutant} is {pm2_5:.1f} µg/m³ (AQI {aqi} {standard.value.upper()})."

        # 1. Families with Children
        if aqi <= 50:
            recs.append(
                StructuredRecommendation(
                    cohort="children",
                    target_group="Families with Children",
                    recommended_action="Unrestricted outdoor play, park visits, and school physical education.",
                    reason="Low ambient particulate concentration allows safe pediatric alveolar lung development.",
                    supporting_measurement=sup_m,
                    expected_benefit="Promotes gross motor development and outdoor active play safely.",
                    limitations="Ensure adequate hydration and sun protection during midday.",
                )
            )
        elif aqi <= 100:
            recs.append(
                StructuredRecommendation(
                    cohort="children",
                    target_group="Families with Children",
                    recommended_action="Permit standard outdoor play, but ensure children rest if coughing or throat scratchiness develops.",
                    reason="Children have a higher respiratory volume per kilogram of body weight, increasing relative inhalation of PM2.5.",
                    supporting_measurement=sup_m,
                    expected_benefit="Prevents mild pediatric airway irritation while allowing normal social and sports routines.",
                    limitations="Asthmatic children may need preventative bronchodilator actuation prior to heavy playground games.",
                )
            )
        else:
            recs.append(
                StructuredRecommendation(
                    cohort="children",
                    target_group="Families with Children",
                    recommended_action="Move recess and sports indoors; seal bedroom windows and ensure clean HEPA filtration during sleep.",
                    reason="Elevated PM2.5 leads to decreased lung growth velocity and heightened incidence of childhood asthma flare-ups.",
                    supporting_measurement=sup_m,
                    expected_benefit="Reduces inflammatory bronchial deposition by over 80% when indoor air is scrubbed.",
                    limitations="Children often resist wearing N95 masks; focus on indoor clean-air sanctuaries rather than relying solely on masks.",
                )
            )

        # 2. Older Adults
        if aqi <= 75:
            recs.append(
                StructuredRecommendation(
                    cohort="older_adults",
                    target_group="Older Adults (65+)",
                    recommended_action="Enjoy morning walks in local gardens or green corridors.",
                    reason="Clean atmospheric air supports vascular relaxation and aerobic joint mobility.",
                    supporting_measurement=sup_m,
                    expected_benefit="Sustains cardiovascular health and mobility without autonomic heart-rate variability stress.",
                    limitations="Dress appropriately for temperature inversions during early morning hours.",
                )
            )
        else:
            recs.append(
                StructuredRecommendation(
                    cohort="older_adults",
                    target_group="Older Adults (65+)",
                    recommended_action="Shift walks to indoor corridors or filtered shopping malls; monitor resting blood pressure.",
                    reason="Fine particulates cross into bloodstream capillaries, elevating arterial plaque instability and blood viscosity.",
                    supporting_measurement=sup_m,
                    expected_benefit="Significantly diminishes risk of pollution-triggered cardiac arrhythmias and ischemic events.",
                    limitations="Guidance is preventative; contact emergency medical services immediately if chest pressure occurs.",
                )
            )

        # 3. Students
        if aqi <= 100:
            recs.append(
                StructuredRecommendation(
                    cohort="students",
                    target_group="Students & School Commuters",
                    recommended_action="Walking or cycling to campus is safe and environmentally friendly.",
                    reason="Air pollution remains within acceptable bounds for young healthy airways.",
                    supporting_measurement=sup_m,
                    expected_benefit="Lowers carbon footprint while enhancing cognitive alertness through physical commute.",
                    limitations="Avoid walking directly behind idling heavy commercial school buses.",
                )
            )
        else:
            recs.append(
                StructuredRecommendation(
                    cohort="students",
                    target_group="Students & School Commuters",
                    recommended_action="Commute via enclosed bus or metro; wear an N95 respirator during roadside walking; keep classroom windows shut.",
                    reason="High PM2.5 and nitrogen dioxide near school commute roads impairs concentration and exacerbates absenteeism.",
                    supporting_measurement=sup_m,
                    expected_benefit="Prevents acute respiratory absences and sustains classroom cognitive focus.",
                    limitations="Classrooms require mechanical ventilation or portable purifiers to prevent CO2 buildup when sealed.",
                )
            )

        # 4. Daily Commuters
        if aqi <= 100:
            recs.append(
                StructuredRecommendation(
                    cohort="daily_commuters",
                    target_group="Daily Urban Commuters",
                    recommended_action="Utilize public transit, electric scooters, or active walking to reduce peak hour congestion.",
                    reason="Moderate ambient air poses minimal acute threat for brief transit intervals.",
                    supporting_measurement=sup_m,
                    expected_benefit="Reduces personal urban transport carbon footprint by up to 85%.",
                    limitations="Wear a light dust mask if traveling through major construction zones.",
                )
            )
        else:
            recs.append(
                StructuredRecommendation(
                    cohort="daily_commuters",
                    target_group="Daily Urban Commuters",
                    recommended_action="Shift commute to underground electric rail; set car ventilation to 'Internal Recirculation' with AC cabin filter.",
                    reason="Roadway micro-environments contain 3x to 5x higher ultrafine particle concentrations than ambient background air.",
                    supporting_measurement=sup_m,
                    expected_benefit="Prevents direct exposure to concentrated diesel soot and volatile organic exhaust.",
                    limitations="Car cabin filters must be replaced every 10,000 km to maintain particulate capture efficiency.",
                )
            )

        # 5. Outdoor Workers
        if aqi <= 75:
            recs.append(
                StructuredRecommendation(
                    cohort="outdoor_workers",
                    target_group="Outdoor Workers & Laborers",
                    recommended_action="Standard shift operations permitted; ensure adequate hydration and dust protection.",
                    reason="Particulate levels do not exceed occupational environmental thresholds.",
                    supporting_measurement=sup_m,
                    expected_benefit="Maintains safe occupational productivity without respiratory fatigue.",
                    limitations="Site-specific dust generation (demolition, cutting) still requires standard occupational PPE.",
                )
            )
        else:
            recs.append(
                StructuredRecommendation(
                    cohort="outdoor_workers",
                    target_group="Outdoor Workers & Laborers",
                    recommended_action="Mandatory NIOSH-certified N95/FFP2 respirators; implement 15-minute indoor filtered rest rotations every 2 hours.",
                    reason="Sustained physical labor increases tidal breathing volume 4-fold over 8-hour shifts, causing extreme cumulative particulate dose.",
                    supporting_measurement=sup_m,
                    expected_benefit="Protects long-term occupational pulmonary capacity and reduces acute exhaustion.",
                    limitations="Respirators add breathing resistance; workers with pre-existing lung conditions need occupational clearance.",
                )
            )

        # 6. General Households
        if aqi <= 50:
            recs.append(
                StructuredRecommendation(
                    cohort="general_household",
                    target_group="General Households",
                    recommended_action="Open all windows for full cross-ventilation for 45 minutes; air out mattresses and soft furnishings.",
                    reason="Outdoor air is cleaner than typical indoor air, which accumulates cooking VOCs, radon, and CO2.",
                    supporting_measurement=sup_m,
                    expected_benefit="Purges stagnant indoor bio-effluents and volatile chemicals naturally at zero energy cost.",
                    limitations="Avoid ventilation if local neighbors are burning leaves or operating smoky diesel generators.",
                )
            )
        else:
            recs.append(
                StructuredRecommendation(
                    cohort="general_household",
                    target_group="General Households",
                    recommended_action="Keep windows sealed; operate HEPA purifiers continuously in living/sleeping rooms; avoid frying or incense burning.",
                    reason="Outdoor fine particulates readily infiltrate home envelope gaps, degrading indoor safety.",
                    supporting_measurement=sup_m,
                    expected_benefit="Creates a safe indoor clean air haven with 75-90% lower PM2.5 than the street.",
                    limitations="Cooking on gas stoves without an exhaust hood can temporarily spike indoor PM2.5 higher than outside air.",
                )
            )

        return recs

    def generate_indoor_protocol(self, aqi: int, pm2_5: float) -> IndoorProtocol:
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
        # Use appropriate AQI based on standard
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

        advisories: List[MemberAdvisory] = []
        for member in family.members:
            advisory = self.evaluate_member(member, aqi, dominant, pm2_5, standard)
            advisories.append(advisory)

        cohort_recs = self.generate_cohort_recommendations(aqi, dominant, pm2_5, standard)
        overall_risk = max([adv.risk_score for adv in advisories]) if advisories else min(100, int(aqi * 0.4))
        indoor_protocol = self.generate_indoor_protocol(aqi, pm2_5)

        # Formulate executive summary
        if aqi <= 50:
            headline = f"Air Quality in {aqi_reading.location_name} is Pristine ({active_std_name})"
            summary = "Atmospheric conditions are safe and clear for all household members, outdoor cardio, and cross-ventilation."
        elif aqi <= 100:
            headline = f"Moderate Air Quality in {aqi_reading.location_name} ({active_std_name})"
            summary = "Air quality is acceptable for the general public, but members with respiratory sensitivities should moderate intense endurance workouts."
        elif aqi <= 150:
            headline = f"Sensitive Air Warning for {family.family_name} ({active_std_name})"
            summary = "Fine particulate levels are elevated. High-risk family members should avoid strenuous outdoor exertion and keep indoor air filtered."
        elif aqi <= 200:
            headline = f"Unhealthy Air Alert for {aqi_reading.location_name} ({active_std_name})"
            summary = "Everyone may begin to experience health effects; members with asthma and cardio conditions must avoid outdoor exertion."
        else:
            headline = f"Severe Environmental Health Advisory ({active_std_name})"
            summary = "Emergency health conditions. All household members must shelter in clean indoor spaces with high-efficiency air purification."

        if forecast and forecast.best_window_start:
            if (forecast.best_window_aqi and forecast.best_window_aqi > 200) or aqi > 200:
                best_window = f"{forecast.best_window_start} (Caution: AQI remains severe at {forecast.best_window_aqi or aqi}; avoid outdoor exertion)"
            else:
                best_window = forecast.best_window_start
            worst_window = forecast.worst_window_start or "Late afternoon / peak congestion"
        elif aqi > 200:
            best_window = "No safe outdoor exercise window (Severe pollution / winter smog)"
            worst_window = "Early morning & late night (Atmospheric inversion smog trap)"
        else:
            best_window = "Morning (06:00 - 09:00)"
            worst_window = "Late afternoon (14:00 - 18:00)"

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


_engine_instance: Optional[IntelligentRecommendationEngine] = None


def get_recommendation_engine() -> IntelligentRecommendationEngine:
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = IntelligentRecommendationEngine()
    return _engine_instance
