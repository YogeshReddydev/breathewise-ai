from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from app.models.aqi import AQIReading
from app.models.family import FamilyGroup


class ChatIntent(ABC):
    """Abstract base class for deterministic environmental health conversational intents."""

    @abstractmethod
    def matches(self, message_lower: str) -> bool:
        pass

    @abstractmethod
    def generate_response(
        self,
        message_lower: str,
        aqi_reading: Optional[AQIReading],
        family: Optional[FamilyGroup],
    ) -> str:
        pass


class MedicalSafetyIntent(ChatIntent):
    KEYWORDS = [
        "dosage", "dose", "prescribe", "prescription", "medication",
        "medicine", "pill", "steroid", "prednisone", "stop taking",
        "stop inhaler", "diagnose", "diagnosis",
    ]

    def matches(self, message_lower: str) -> bool:
        return any(w in message_lower for w in self.KEYWORDS)

    def generate_response(
        self,
        message_lower: str,
        aqi_reading: Optional[AQIReading],
        family: Optional[FamilyGroup],
    ) -> str:
        return (
            "Medical Safety Notice: BreatheWise AI provides environmental risk reduction guidance based on ambient air pollution standards (CPCB and US EPA). "
            "We do NOT prescribe medications, adjust drug dosages, or provide clinical medical diagnoses. "
            "Never alter or discontinue prescribed asthma, cardiovascular, or respiratory therapies without direct guidance from your licensed physician or healthcare specialist. "
            "If experiencing acute respiratory distress, severe wheezing, or chest pain, seek immediate emergency medical care."
        )


class MythBusterIntent(ChatIntent):
    KEYWORDS = [
        "immunity", "strengthen lungs", "build resistance", "good for lungs",
        "healthy to breathe smog", "healthy to breathe smoke", "deep breath in smog",
    ]

    def matches(self, message_lower: str) -> bool:
        return any(w in message_lower for w in self.KEYWORDS)

    def generate_response(
        self,
        message_lower: str,
        aqi_reading: Optional[AQIReading],
        family: Optional[FamilyGroup],
    ) -> str:
        loc_name = aqi_reading.location_name if aqi_reading else "your area"
        aqi_val = aqi_reading.aqi_us if aqi_reading else 65
        return (
            f"Scientific Clarification: Inhaling airborne particulate matter (PM2.5/PM10) or photochemical smog does NOT build immunity or strengthen lung capacity. "
            f"Unlike biological antigens, particulate matter consists of microscopic combustion products, heavy metals, and aerosols that trigger alveolar inflammation, oxidative stress, and vascular endothelial damage. "
            f"In current conditions ({loc_name}, AQI {aqi_val}), deep breathing outdoors should be avoided; prioritize clean indoor air with active HEPA filtration."
        )


class SustainableTransportIntent(ChatIntent):
    KEYWORDS = ["transit", "commute", "metro", "bus", "carpool", "emission", "transport", "bike", "cycle"]

    def matches(self, message_lower: str) -> bool:
        return any(w in message_lower for w in self.KEYWORDS)

    def generate_response(
        self,
        message_lower: str,
        aqi_reading: Optional[AQIReading],
        family: Optional[FamilyGroup],
    ) -> str:
        loc_name = aqi_reading.location_name if aqi_reading else "your area"
        aqi_val = aqi_reading.aqi_us if aqi_reading else 65

        if aqi_val <= 100:
            return (
                f"Sustainable Mobility Guide for {loc_name} (AQI {aqi_val}):\n\n"
                f"1. Active Travel (Walking / Cycling): Safe and encouraged today. Produces 0 g CO2/km and avoids ~170 g CO2/km compared to solo petrol driving.\n"
                f"2. Mass Transit: Taking the city bus (~35 g CO2/p-km) or electric metro (~22 g CO2/p-km) cuts greenhouse emissions by 80-87%.\n"
                f"3. Environmental Benefit: Every 10 km shifted from a car to metro prevents ~1.5 kg of CO2 and eliminates 0.4 g of direct tailpipe PM2.5."
            )
        else:
            return (
                f"Commuting & Exposure Advisory for {loc_name} (AQI {aqi_val} - Elevated):\n\n"
                f"1. Air Quality Precaution: While cycling and walking are carbon-neutral, vigorous respiration in heavy traffic causes deep particulate deposition in lungs. Today, prefer electric rail / metro.\n"
                f"2. Public Transit: Metro cabins provide filtered air, shielding you from roadside diesel exhaust while keeping emissions low (22 g CO2/p-km).\n"
                f"3. If Driving: Switch your vehicle HVAC to 'Internal Recirculation' mode and consider carpooling to avoid adding unnecessary traffic emissions."
            )


class ExerciseWorkoutIntent(ChatIntent):
    KEYWORDS = ["run", "jog", "workout", "exercise", "marathon", "fitness", "gym"]

    def matches(self, message_lower: str) -> bool:
        return any(w in message_lower for w in self.KEYWORDS)

    def generate_response(
        self,
        message_lower: str,
        aqi_reading: Optional[AQIReading],
        family: Optional[FamilyGroup],
    ) -> str:
        loc_name = aqi_reading.location_name if aqi_reading else "your area"
        aqi_val = aqi_reading.aqi_us if aqi_reading else 65
        pm2_5_val = aqi_reading.pollutants.pm2_5 if aqi_reading else 18.0

        if aqi_val <= 50:
            return f"In {loc_name}, the AQI is currently {aqi_val} (Good). Outdoor workouts, marathon training, and recreational sports are unrestricted for all household members."
        elif aqi_val <= 100:
            return f"The AQI in {loc_name} is {aqi_val} (Moderate, PM2.5: {pm2_5_val:.1f} µg/m³). Outdoor running is acceptable for healthy individuals. Sensitive members should opt for shaded parks and schedule sessions before afternoon traffic builds."
        else:
            return (
                f"The AQI in {loc_name} is {aqi_val} (Elevated). Aerobic running increases pulmonary ventilation rate 5-10 fold, drawing particles deep into alveoli. "
                f"We strongly recommend shifting workouts indoors: treadmill cardio, stationary cycling, or bodyweight circuit training in a room with active HEPA filtration."
            )


class MaskRespiratorIntent(ChatIntent):
    KEYWORDS = ["mask", "n95", "kn95", "face mask", "respirator", "ffp2"]

    def matches(self, message_lower: str) -> bool:
        return any(w in message_lower for w in self.KEYWORDS)

    def generate_response(
        self,
        message_lower: str,
        aqi_reading: Optional[AQIReading],
        family: Optional[FamilyGroup],
    ) -> str:
        aqi_val = aqi_reading.aqi_us if aqi_reading else 65
        pm2_5_val = aqi_reading.pollutants.pm2_5 if aqi_reading else 18.0

        if aqi_val <= 100:
            return f"With an AQI of {aqi_val}, respirators are not universally required for healthy adults. However, family members with asthma or dust sensitivity benefit from a KN95 mask near busy construction or traffic corridors."
        else:
            return (
                f"Because current AQI is {aqi_val} with fine PM2.5 at {pm2_5_val:.1f} µg/m³, standard cloth or surgical masks provide minimal protection against sub-micron particles. "
                f"We recommend a NIOSH-certified N95, KN95, or FFP2 respirator with an airtight facial seal for any outdoor exposure exceeding 15 minutes."
            )


class IndoorVentilationIntent(ChatIntent):
    KEYWORDS = ["window", "windows", "ventilation", "fresh air", "air purifier", "hepa"]

    def matches(self, message_lower: str) -> bool:
        return any(w in message_lower for w in self.KEYWORDS)

    def generate_response(
        self,
        message_lower: str,
        aqi_reading: Optional[AQIReading],
        family: Optional[FamilyGroup],
    ) -> str:
        loc_name = aqi_reading.location_name if aqi_reading else "your area"
        aqi_val = aqi_reading.aqi_us if aqi_reading else 65
        pm2_5_val = aqi_reading.pollutants.pm2_5 if aqi_reading else 18.0

        if aqi_val <= 50:
            return f"The outdoor air in {loc_name} is crisp (AQI {aqi_val}). Yes, open your windows for 30-45 minutes to create cross-ventilation and purge indoor VOCs, CO2, and allergens."
        else:
            return (
                f"With outdoor AQI at {aqi_val} (PM2.5: {pm2_5_val:.1f} µg/m³), outdoor pollution exceeds WHO safe limits. Keep windows closed and sealed. "
                f"Run your indoor HEPA air purifier on medium or auto mode in bedrooms and living spaces, and avoid burning incense or frying food without an exhaust hood."
            )


class VulnerableCohortIntent(ChatIntent):
    KEYWORDS = ["asthma", "child", "children", "kid", "school", "recess", "student", "senior", "elderly"]

    def matches(self, message_lower: str) -> bool:
        return any(w in message_lower for w in self.KEYWORDS)

    def generate_response(
        self,
        message_lower: str,
        aqi_reading: Optional[AQIReading],
        family: Optional[FamilyGroup],
    ) -> str:
        loc_name = aqi_reading.location_name if aqi_reading else "your area"
        aqi_val = aqi_reading.aqi_us if aqi_reading else 65
        return (
            f"Vulnerable Cohort Advisory for {loc_name} (AQI {aqi_val}):\n\n"
            f"- Children & Students: Due to developing airways and higher ventilation per kilogram, children absorb more particulate matter. Keep physician-prescribed rescue inhalers or asthma action plans accessible as directed, and shift playground games indoors if AQI exceeds 100.\n"
            f"- Older Adults: Particulate exposure increases vascular resistance and blood pressure. Limit outdoor physical exertion and stay in air-filtered spaces.\n"
            f"- Precaution: This guidance is preventive; please consult your pediatrician or physician for individualized clinical action plans."
        )


class StandardsComparisonIntent(ChatIntent):
    KEYWORDS = ["cpcb", "epa", "standard", "breakpoint", "difference"]

    def matches(self, message_lower: str) -> bool:
        return any(w in message_lower for w in self.KEYWORDS)

    def generate_response(
        self,
        message_lower: str,
        aqi_reading: Optional[AQIReading],
        family: Optional[FamilyGroup],
    ) -> str:
        cpcb_status = (
            f"{aqi_reading.cpcb.aqi} ({aqi_reading.cpcb.category})"
            if (aqi_reading and aqi_reading.cpcb and aqi_reading.cpcb.calculable)
            else "requires at least 3 monitored pollutants"
        )
        return (
            f"AQI Standard Architecture Comparison in BreatheWise AI:\n\n"
            f"1. Indian CPCB NAQI: Evaluates 8 pollutants (PM10, PM2.5, NO2, SO2, CO, O3, NH3, Pb). Breakpoints: 0-50 Good, 51-100 Satisfactory, 101-200 Moderate, 201-300 Poor, 301-400 Very Poor, 401-500 Severe. Requires at least 3 monitored pollutants with either PM10 or PM2.5. Current CPCB status: {cpcb_status}.\n"
            f"2. US EPA AQI: Focuses on 5 criteria pollutants with standard 0-500 scale: 0-50 Good, 51-100 Moderate, 101-150 Unhealthy for Sensitive Groups, 151-200 Unhealthy, 201-300 Very Unhealthy, 301-500 Hazardous.\n"
            f"3. European AQI: Evaluates 1-5 index based on CAQI/EAQI thresholds.\n\n"
            f"BreatheWise never mixes or equates these scales—each is calculated and labeled independently."
        )


class IntentDispatcher:
    """Dispatches conversational queries to prioritized intent handlers."""

    def __init__(self):
        self.intents: List[ChatIntent] = [
            MedicalSafetyIntent(),
            MythBusterIntent(),
            SustainableTransportIntent(),
            ExerciseWorkoutIntent(),
            MaskRespiratorIntent(),
            IndoorVentilationIntent(),
            VulnerableCohortIntent(),
            StandardsComparisonIntent(),
        ]

    def dispatch(
        self,
        message: str,
        aqi_reading: Optional[AQIReading],
        family: Optional[FamilyGroup],
    ) -> Dict[str, Any]:
        msg_lower = message.lower()

        for intent in self.intents:
            if intent.matches(msg_lower):
                reply = intent.generate_response(msg_lower, aqi_reading, family)
                return {
                    "reply": reply,
                    "model": "breathewise-expert-rules",
                    "source": "expert_rules_engine",
                }

        # Default fallback
        loc_name = aqi_reading.location_name if aqi_reading else "your area"
        aqi_val = aqi_reading.aqi_us if aqi_reading else 65
        pm2_5_val = aqi_reading.pollutants.pm2_5 if aqi_reading else 18.0
        cpcb_val = (
            f" | CPCB: {aqi_reading.cpcb.aqi}"
            if (aqi_reading and aqi_reading.cpcb and aqi_reading.cpcb.calculable)
            else ""
        )
        reply = (
            f"BreatheWise Environmental Summary for {loc_name}: Current US EPA AQI is {aqi_val}{cpcb_val} with primary pollutant {aqi_reading.dominant_pollutant if aqi_reading else 'PM2.5'} at {pm2_5_val:.1f} µg/m³. "
            f"All telemetry is sourced live from Open-Meteo numerical atmospheric models. Check the 24h/48h forecast curve and tailored family recommendations before planning prolonged outdoor exposures."
        )
        return {
            "reply": reply,
            "model": "breathewise-expert-rules",
            "source": "expert_rules_engine",
        }
