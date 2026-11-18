import json
import logging
from typing import Any, Dict, List, Optional
from app.core.config import get_settings
from app.models.aqi import AQIReading
from app.models.family import FamilyGroup
from app.models.recommendations import ComprehensiveRecommendation

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """You are BreatheWise AI, an expert environmental epidemiologist, pulmonary health specialist, and urban air quality advisor.
Your mission is to translate multi-spectral atmospheric sensor telemetry into empathetic, actionable, personalized guidance for urban households.

STRICT GROUND-TRUTH & INTEGRITY CONSTRAINTS:
1. NEVER invent fictional monitoring stations, imaginary sensor locations, or fabricated network IDs.
2. NEVER hallucinate or alter any pollutant concentration or AQI figure. All cited measurements must match the verified telemetry provided in the context exactly.
3. Clearly distinguish between measured ambient concentrations and estimated tailpipe/emissions factors.
4. Support Indian CPCB NAQI, US EPA AQI, and European AQI explicitly. NEVER mix their breakpoints or treat them as identical.
5. NEVER provide definitive clinical medical diagnoses or claim that any action guarantees health protection. Always frame guidance as environmental risk reduction.
6. REJECT HARMFUL MYTHS & CONTRADICTORY CLAIMS: If a user suggests that exposure to smog, smoke, or elevated PM2.5 "trains immunity" or "cleanses lungs," scientifically refute the claim. Explain that fine combustion particulates cause alveolar oxidation and systemic inflammation, not immunological adaptation.
"""


class GeminiService:
    """Enterprise Gemini API integration service with built-in resilient fallback."""

    def __init__(self):
        self.settings = get_settings()
        self.api_key = self.settings.GEMINI_API_KEY
        self.model_name = self.settings.GEMINI_MODEL or "gemini-2.5-flash"
        self._client = None
        self._init_client()

    def _init_client(self):
        if not self.api_key:
            logger.info("GEMINI_API_KEY not configured. Running in expert rule-engine fallback mode.")
            return

        try:
            from google import genai
            self._client = genai.Client(api_key=self.api_key)
            logger.info(f"Initialized Google GenAI Client with model: {self.model_name}")
        except Exception as e:
            logger.warning(f"Could not initialize google.genai: {e}. Fallback enabled.")
            self._client = None

    @property
    def is_configured(self) -> bool:
        return self._client is not None

    async def enrich_recommendation(
        self,
        aqi_reading: AQIReading,
        family: FamilyGroup,
        base_rec: ComprehensiveRecommendation,
    ) -> ComprehensiveRecommendation:
        """Enrich rule-engine recommendations with Gemini 2.5 Flash contextual intelligence."""
        if not self.is_configured:
            return base_rec

        cpcb_info = ""
        if aqi_reading.cpcb and aqi_reading.cpcb.calculable and aqi_reading.cpcb.aqi is not None:
            cpcb_info = f"Indian CPCB NAQI: {aqi_reading.cpcb.aqi} ({aqi_reading.cpcb.category})"

        prompt = f"""Analyze the following real-time atmospheric measurements and family roster:
Location: {aqi_reading.location_name}
US EPA AQI: {aqi_reading.aqi_us} ({aqi_reading.category_label})
{cpcb_info}
European AQI: {aqi_reading.aqi_eu or 'N/A'}
Dominant Pollutant: {aqi_reading.dominant_pollutant}
Verified Concentrations:
- PM2.5: {aqi_reading.pollutants.pm2_5:.1f} µg/m³
- PM10: {aqi_reading.pollutants.pm10:.1f} µg/m³
- O3: {aqi_reading.pollutants.o3 or 'N/A'} µg/m³
- NO2: {aqi_reading.pollutants.no2 or 'N/A'} µg/m³
Source: {aqi_reading.source_attribution}

Household: {family.family_name} (Demo Profile: {family.is_demo})
Members:
{json.dumps([{ 'name': m.name, 'age': m.age, 'conditions': [c.value for c in m.conditions], 'activity': m.activity_preference.value, 'tier': m.vulnerability_tier.value, 'is_demo': m.is_demo } for m in family.members], indent=2)}

Please provide:
1. A concise, authoritative headline for today's briefing.
2. A 2-sentence executive summary emphasizing specific risks for the vulnerable members.
3. Indoor air quality protocol (windows open/closed, purifier level, key action).

Respond strictly in valid JSON format with keys:
"headline": string,
"summary": string,
"indoor_protocol_action": string,
"indoor_purifier_setting": string
"""

        try:
            response = self._client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config={
                    "system_instruction": SYSTEM_PROMPT,
                    "response_mime_type": "application/json",
                },
            )
            data = json.loads(response.text)
            
            # Enrich fields safely
            base_rec.headline = data.get("headline", base_rec.headline)
            base_rec.summary = data.get("summary", base_rec.summary)
            if "indoor_protocol_action" in data:
                base_rec.indoor_protocol.recommended_action = data["indoor_protocol_action"]
            if "indoor_purifier_setting" in data:
                base_rec.indoor_protocol.purifier_setting = data["indoor_purifier_setting"]
            base_rec.engine_source = self.model_name
            return base_rec
        except Exception as e:
            logger.warning(f"Gemini enrichment failed: {e}. Preserving expert-rule recommendation.")
            return base_rec

    async def chat(
        self,
        message: str,
        context_aqi: Optional[AQIReading] = None,
        context_family: Optional[FamilyGroup] = None,
        chat_history: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        """Conversational assistance answering questions about air quality, family safety, transport, and mitigation."""
        if self.is_configured:
            try:
                context_str = ""
                if context_aqi:
                    cpcb_str = f" | CPCB NAQI: {context_aqi.cpcb.aqi} ({context_aqi.cpcb.category})" if context_aqi.cpcb and context_aqi.cpcb.calculable else ""
                    context_str += (
                        f"\nVerified Atmospheric Telemetry:\n"
                        f"- Location: {context_aqi.location_name}\n"
                        f"- US EPA AQI: {context_aqi.aqi_us} ({context_aqi.category_label}){cpcb_str}\n"
                        f"- Dominant Pollutant: {context_aqi.dominant_pollutant}\n"
                        f"- Fine PM2.5: {context_aqi.pollutants.pm2_5:.1f} µg/m³ | Coarse PM10: {context_aqi.pollutants.pm10:.1f} µg/m³\n"
                        f"- Data Provider: {context_aqi.source_attribution}\n"
                    )
                if context_family:
                    members_desc = ", ".join([f"{m.name} ({m.age}y, conditions={','.join([c.value for c in m.conditions])}, cohort={m.cohort.value})" for m in context_family.members])
                    context_str += f"- Household Roster: {context_family.family_name} with members: {members_desc}\n"

                full_prompt = f"{context_str}\nUser Question: {message}\nProvide scientifically grounded, practical guidance."
                response = self._client.models.generate_content(
                    model=self.model_name,
                    contents=full_prompt,
                    config={"system_instruction": SYSTEM_PROMPT},
                )
                return {
                    "reply": response.text,
                    "model": self.model_name,
                    "source": "gemini",
                }
            except Exception as e:
                logger.warning(f"Gemini chat failed ({e}), falling back to deterministic expert response.")

        # Deterministic Expert Rule Engine Fallback
        return self._generate_expert_chat_fallback(message, context_aqi, context_family)

    def _generate_expert_chat_fallback(
        self,
        message: str,
        aqi_reading: Optional[AQIReading],
        family: Optional[FamilyGroup],
    ) -> Dict[str, Any]:
        msg_lower = message.lower()
        aqi_val = aqi_reading.aqi_us if aqi_reading else 65
        loc_name = aqi_reading.location_name if aqi_reading else "your area"
        pm2_5_val = aqi_reading.pollutants.pm2_5 if aqi_reading else 18.0

        # 0. Contradictory health myths or dangerous instructions
        if any(w in msg_lower for w in ["immunity", "strengthen lungs", "build resistance", "good for lungs", "healthy to breathe smog", "healthy to breathe smoke", "deep breath in smog"]):
            reply = (
                f"Scientific Clarification: Inhaling airborne particulate matter (PM2.5/PM10) or photochemical smog does NOT build immunity or strengthen lung capacity. "
                f"Unlike biological antigens, particulate matter consists of microscopic combustion products, heavy metals, and aerosols that trigger alveolar inflammation, oxidative stress, and vascular endothelial damage. "
                f"In current conditions ({loc_name}, AQI {aqi_val}), deep breathing outdoors should be avoided; prioritize clean indoor air with active HEPA filtration."
            )
            return {
                "reply": reply,
                "model": "breathewise-expert-rules",
                "source": "expert_rules_engine",
            }

        # 1. Sustainable transport / commuting queries
        if any(w in msg_lower for w in ["transit", "commute", "metro", "bus", "carpool", "emission", "transport", "bike", "cycle"]):
            if aqi_val <= 100:
                reply = (
                    f"Sustainable Mobility Guide for {loc_name} (AQI {aqi_val}):\n\n"
                    f"1. Active Travel (Walking / Cycling): Safe and encouraged today. Produces 0 g CO2/km and avoids ~170 g CO2/km compared to solo petrol driving.\n"
                    f"2. Mass Transit: Taking the city bus (~35 g CO2/p-km) or electric metro (~22 g CO2/p-km) cuts greenhouse emissions by 80-87%.\n"
                    f"3. Environmental Benefit: Every 10 km shifted from a car to metro prevents ~1.5 kg of CO2 and eliminates 0.4 g of direct tailpipe PM2.5."
                )
            else:
                reply = (
                    f"Commuting & Exposure Advisory for {loc_name} (AQI {aqi_val} - Elevated):\n\n"
                    f"1. Air Quality Precaution: While cycling and walking are carbon-neutral, vigorous respiration in heavy traffic causes deep particulate deposition in lungs. Today, prefer electric rail / metro.\n"
                    f"2. Public Transit: Metro cabins provide filtered air, shielding you from roadside diesel exhaust while keeping emissions low (22 g CO2/p-km).\n"
                    f"3. If Driving: Switch your vehicle HVAC to 'Internal Recirculation' mode and consider carpooling to avoid adding unnecessary traffic emissions."
                )

        # 2. Workout / running / exercise queries
        elif any(w in msg_lower for w in ["run", "jog", "workout", "exercise", "marathon", "fitness", "gym"]):
            if aqi_val <= 50:
                reply = f"In {loc_name}, the AQI is currently {aqi_val} (Good). Outdoor workouts, marathon training, and recreational sports are unrestricted for all household members."
            elif aqi_val <= 100:
                reply = f"The AQI in {loc_name} is {aqi_val} (Moderate, PM2.5: {pm2_5_val:.1f} µg/m³). Outdoor running is acceptable for healthy individuals. Sensitive members should opt for shaded parks and schedule sessions before afternoon traffic builds."
            else:
                reply = (
                    f"The AQI in {loc_name} is {aqi_val} (Elevated). Aerobic running increases pulmonary ventilation rate 5-10 fold, drawing particles deep into alveoli. "
                    f"We strongly recommend shifting workouts indoors: treadmill cardio, stationary cycling, or bodyweight circuit training in a room with active HEPA filtration."
                )

        # 3. Mask recommendations
        elif any(w in msg_lower for w in ["mask", "n95", "kn95", "face mask", "respirator", "ffp2"]):
            if aqi_val <= 100:
                reply = f"With an AQI of {aqi_val}, respirators are not universally required for healthy adults. However, family members with asthma or dust sensitivity benefit from a KN95 mask near busy construction or traffic corridors."
            else:
                reply = (
                    f"Because current AQI is {aqi_val} with fine PM2.5 at {pm2_5_val:.1f} µg/m³, standard cloth or surgical masks provide minimal protection against sub-micron particles. "
                    f"We recommend a NIOSH-certified N95, KN95, or FFP2 respirator with an airtight facial seal for any outdoor exposure exceeding 15 minutes."
                )

        # 4. Windows & indoor ventilation
        elif any(w in msg_lower for w in ["window", "windows", "ventilation", "fresh air", "air purifier", "hepa"]):
            if aqi_val <= 50:
                reply = f"The outdoor air in {loc_name} is crisp (AQI {aqi_val}). Yes, open your windows for 30-45 minutes to create cross-ventilation and purge indoor VOCs, CO2, and allergens."
            else:
                reply = (
                    f"With outdoor AQI at {aqi_val} (PM2.5: {pm2_5_val:.1f} µg/m³), outdoor pollution exceeds WHO safe limits. Keep windows closed and sealed. "
                    f"Run your indoor HEPA air purifier on medium or auto mode in bedrooms and living spaces, and avoid burning incense or frying food without an exhaust hood."
                )

        # 5. Cohort queries: children, students, asthma, seniors
        elif any(w in msg_lower for w in ["asthma", "child", "children", "kid", "school", "recess", "student", "senior", "elderly"]):
            reply = (
                f"Vulnerable Cohort Advisory for {loc_name} (AQI {aqi_val}):\n\n"
                f"- Children & Students: Due to developing airways and higher ventilation per kilogram, children absorb more particulate matter. Keep quick-relief inhalers accessible and shift playground games indoors if AQI exceeds 100.\n"
                f"- Older Adults: Particulate exposure increases vascular resistance and blood pressure. Limit outdoor physical exertion and stay in air-filtered spaces.\n"
                f"- Precaution: This guidance is preventive; please consult your pediatrician or physician for individualized clinical action plans."
            )

        # 6. CPCB vs US EPA comparison
        elif any(w in msg_lower for w in ["cpcb", "epa", "standard", "breakpoint", "difference"]):
            cpcb_status = f"{aqi_reading.cpcb.aqi} ({aqi_reading.cpcb.category})" if (aqi_reading and aqi_reading.cpcb and aqi_reading.cpcb.calculable) else "requires at least 3 monitored pollutants"
            reply = (
                f"AQI Standard Architecture Comparison in BreatheWise AI:\n\n"
                f"1. Indian CPCB NAQI: Evaluates 8 pollutants (PM10, PM2.5, NO2, SO2, CO, O3, NH3, Pb). Breakpoints: 0-50 Good, 51-100 Satisfactory, 101-200 Moderate, 201-300 Poor, 301-400 Very Poor, 401-500 Severe. Requires at least 3 monitored pollutants with either PM10 or PM2.5. Current CPCB status: {cpcb_status}.\n"
                f"2. US EPA AQI: Focuses on 5 criteria pollutants with standard 0-500 scale: 0-50 Good, 51-100 Moderate, 101-150 Unhealthy for Sensitive Groups, 151-200 Unhealthy, 201-300 Very Unhealthy, 301-500 Hazardous.\n"
                f"3. European AQI: Evaluates 1-5 index based on CAQI/EAQI thresholds.\n\n"
                f"BreatheWise never mixes or equates these scales—each is calculated and labeled independently."
            )

        else:
            cpcb_val = f" | CPCB: {aqi_reading.cpcb.aqi}" if (aqi_reading and aqi_reading.cpcb and aqi_reading.cpcb.calculable) else ""
            reply = (
                f"BreatheWise Environmental Summary for {loc_name}: Current US EPA AQI is {aqi_val}{cpcb_val} with primary pollutant {aqi_reading.dominant_pollutant if aqi_reading else 'PM2.5'} at {pm2_5_val:.1f} µg/m³. "
                f"All telemetry is sourced live from Open-Meteo numerical atmospheric models. Check the 24h/48h forecast curve and tailored family recommendations before planning prolonged outdoor exposures."
            )

        return {
            "reply": reply,
            "model": "breathewise-expert-rules",
            "source": "expert_rules_engine",
        }


_gemini_service_instance: Optional[GeminiService] = None


def get_gemini_service() -> GeminiService:
    global _gemini_service_instance
    if _gemini_service_instance is None:
        _gemini_service_instance = GeminiService()
    return _gemini_service_instance
