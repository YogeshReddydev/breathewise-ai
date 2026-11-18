import json
import logging
from typing import Any, Dict, List, Optional
from app.core.config import get_settings
from app.models.aqi import AQIReading
from app.models.family import FamilyGroup
from app.models.recommendations import ComprehensiveRecommendation
from app.services.chat_intents import IntentDispatcher

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
7. STRICT MEDICAL CLINICAL GUARDRAIL: NEVER prescribe medications, recommend specific drug dosages, or advise users to stop or alter prescribed inhalers or therapies. Direct medical dosage or prescription inquiries to licensed healthcare professionals immediately.
"""


class GeminiService:
    """Enterprise Gemini API integration service with built-in resilient fallback."""

    def __init__(self):
        self.settings = get_settings()
        self.api_key = self.settings.GEMINI_API_KEY
        self.model_name = self.settings.GEMINI_MODEL or "gemini-2.5-flash"
        self._client = None
        self._dispatcher = IntentDispatcher()
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
        """Dispatches conversational query to prioritized, deterministic environmental health intents."""
        return self._dispatcher.dispatch(message, aqi_reading, family)


_gemini_service_instance: Optional[GeminiService] = None


def get_gemini_service() -> GeminiService:
    global _gemini_service_instance
    if _gemini_service_instance is None:
        _gemini_service_instance = GeminiService()
    return _gemini_service_instance
