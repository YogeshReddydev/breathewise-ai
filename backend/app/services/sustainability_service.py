from typing import List, Optional
from app.models.sustainability import (
    EMISSION_FACTORS,
    MODE_LABELS,
    EmissionsCalculationRequest,
    EmissionsCalculationResult,
    SustainableTransportOption,
    TransportMode,
)


class SustainabilityService:
    """Calculates transport emissions savings and correlates mobility choices with real-time AQI safety."""

    def calculate_emissions(
        self,
        request: EmissionsCalculationRequest,
        current_aqi: int = 50,
    ) -> EmissionsCalculationResult:
        dist = request.distance_km
        base_factor = EMISSION_FACTORS.get(request.baseline_mode, 170.0)
        target_factor = EMISSION_FACTORS.get(request.target_mode, 22.0)

        single_base_kg = (dist * base_factor) / 1000.0
        single_target_kg = (dist * target_factor) / 1000.0
        single_avoided_kg = max(0.0, single_base_kg - single_target_kg)

        weekly_avoided = single_avoided_kg * request.trips_per_week
        annual_avoided = weekly_avoided * 52.0
        avoided_pct = ((single_base_kg - single_target_kg) / single_base_kg * 100.0) if single_base_kg > 0 else 0.0

        # Estimated primary combustion particulate matter (PM2.5) avoided per km (~0.04g / km for conventional car)
        pm_factor = 0.04 if request.baseline_mode in {TransportMode.PETROL_CAR, TransportMode.DIESEL_CAR} else 0.015
        tailpipe_pm = round(dist * pm_factor * (1.0 - (target_factor / max(1.0, base_factor))), 2)

        # Contextual air safety warning
        if current_aqi > 150:
            if request.target_mode == TransportMode.WALK_CYCLE:
                safety_context = (
                    "Air quality is currently elevated/unhealthy. While walking or cycling eliminates tailpipe emissions, "
                    "aerobic respiration near traffic leads to heavy particle inhalation. Consider Metro or Carpool with recirculating AC today."
                )
            else:
                safety_context = (
                    "Excellent choice: using public transit or carpooling reduces vehicle emissions while protecting your lungs inside filtered cabins."
                )
        elif current_aqi <= 75:
            if request.target_mode == TransportMode.WALK_CYCLE:
                safety_context = (
                    "Atmospheric air quality is crisp today! Walking and cycling are 100% emission-free and provide optimal cardiovascular health benefits."
                )
            else:
                safety_context = (
                    "Safe outdoor conditions. Shifting from private vehicles to public transit reduces urban congestion and emissions."
                )
        else:
            safety_context = (
                "Moderate air quality. Metro, electric rail, and carpooling are solid low-emission alternatives to solo driving."
            )

        return EmissionsCalculationResult(
            distance_km=dist,
            baseline_mode_label=MODE_LABELS.get(request.baseline_mode, "Baseline"),
            target_mode_label=MODE_LABELS.get(request.target_mode, "Target"),
            single_trip_baseline_kg=round(single_base_kg, 2),
            single_trip_target_kg=round(single_target_kg, 2),
            single_trip_avoided_kg=round(single_avoided_kg, 2),
            weekly_avoided_kg=round(weekly_avoided, 2),
            annual_avoided_kg=round(annual_avoided, 2),
            avoided_percentage=round(avoided_pct, 1),
            tailpipe_pm2_5_avoided_g=tailpipe_pm,
            air_safety_context=safety_context,
        )

    def get_transport_options_matrix(self, aqi: int) -> List[SustainableTransportOption]:
        options = []
        for mode in TransportMode:
            is_active = (mode == TransportMode.WALK_CYCLE)
            factor = EMISSION_FACTORS[mode]

            if aqi > 150:
                if is_active:
                    advisory = "Caution: Air pollution is high. Shift to enclosed electric metro or carpool."
                    recommended = False
                elif mode in {TransportMode.METRO_TRAIN, TransportMode.CARPOOL_2, TransportMode.CARPOOL_3}:
                    advisory = "Top Recommendation: Enclosed cabins with filtered air reduce direct exposure."
                    recommended = True
                else:
                    advisory = "Moderate emissions profile. Prefer mass transit."
                    recommended = False
            elif aqi <= 75:
                if is_active:
                    advisory = "Ideal: Pristine air makes active travel the highest health and environmental return."
                    recommended = True
                elif mode in {TransportMode.METRO_TRAIN, TransportMode.CITY_BUS, TransportMode.ELECTRIC_CAR}:
                    advisory = "Great option for longer urban distances."
                    recommended = True
                else:
                    advisory = "Higher emissions compared to active and public alternatives."
                    recommended = False
            else:
                if is_active:
                    advisory = "Acceptable for light trips. Wear a mask if commuting along heavy diesel truck corridors."
                    recommended = True
                elif mode in {TransportMode.METRO_TRAIN, TransportMode.CITY_BUS}:
                    advisory = "Recommended sustainable daily commuter option."
                    recommended = True
                else:
                    advisory = "Viable option. Consider carpooling."
                    recommended = False

            options.append(
                SustainableTransportOption(
                    mode=mode,
                    label=MODE_LABELS[mode],
                    emissions_per_km=factor,
                    safety_advisory_for_today=advisory,
                    is_active_travel=is_active,
                    recommended_today=recommended,
                )
            )
        return options


_sustainability_service_instance: Optional[SustainabilityService] = None


def get_sustainability_service() -> SustainabilityService:
    global _sustainability_service_instance
    if _sustainability_service_instance is None:
        _sustainability_service_instance = SustainabilityService()
    return _sustainability_service_instance
