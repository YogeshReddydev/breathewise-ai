from typing import List
from app.models.aqi import AQIStandard
from app.models.recommendations import StructuredRecommendation


class CohortAdvisoryService:
    """Generates structured, 5-point clinical guidance for the 6 core vulnerable cohorts."""

    @classmethod
    def generate_cohort_recommendations(
        cls,
        aqi: int,
        dominant_pollutant: str,
        pm2_5: float,
        standard: AQIStandard,
    ) -> List[StructuredRecommendation]:
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
                    limitations="Asthmatic children should review their physician-prescribed asthma action plan with their doctor before intense physical activity.",
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
