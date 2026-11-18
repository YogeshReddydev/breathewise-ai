import logging
from typing import List, Optional, Dict, Any
from app.config import settings
from app.models.consultation import ChatMessage, ConsultationRequest, ConsultationResponse
from app.models.family import FamilyMember

logger = logging.getLogger(__name__)


class GeminiService:
    """
    Google Gemini Multimodal AI Service for BreatheWise AI.
    Provides conversational environmental health consultations, personalized risk explanations,
    and adaptive preventative guidance.
    """

    SYSTEM_INSTRUCTION = """
You are BreatheWise AI, the world's leading urban environmental health intelligence and air quality consultant.
Your mission is to empower families, sensitive individuals, and urban citizens with preventative, clinically grounded, and actionable environmental guidance.

CORE PRINCIPLES:
1. Medical Disclaimer: Provide preventive environmental health guidance and protective strategies, but explicitly advise consulting healthcare professionals for diagnosis or acute treatment adjustments.
2. Atmospheric Precision: Explain the biological impact of specific pollutants (PM2.5 deep alveolar penetration, PM10 upper respiratory irritation, NO2 bronchial hyperresponsiveness, O3 oxidative lung stress).
3. Personalization: Dynamically adapt advice to the specific family member's age, preexisting conditions (asthma, COPD, cardiovascular vulnerability), and activity profile.
4. Actionable Protocols: Always recommend tangible actions (HEPA fan speeds, air seal strategies, optimal transit times, certified N95/FFP2 respirator fit).
5. Tone: Calm, authoritative, compassionate, and crystal clear. Avoid alarmism while treating hazardous levels with appropriate seriousness.
"""

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self._client = None

        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
                logger.info("Google GenAI client initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize Google GenAI client: {e}")

    async def consult(
        self,
        request: ConsultationRequest,
        member: Optional[FamilyMember] = None,
    ) -> ConsultationResponse:
        """
        Conducts a multi-turn environmental consultation using Gemini, or provides an expert
        deterministic response if no API key is supplied.
        """
        # Build contextual prompt preamble
        context_lines = []
        if request.location_name:
            context_lines.append(f"Location: {request.location_name}")
        if request.current_aqi is not None:
            context_lines.append(f"Current AQI: {request.current_aqi}")
        if request.dominant_pollutant:
            context_lines.append(f"Dominant Pollutant: {request.dominant_pollutant}")
        if member:
            conditions_str = ", ".join([c.value for c in member.conditions]) or "None"
            context_lines.append(
                f"Subject: {member.name} (Age: {member.age}, Relationship: {member.relationship}, "
                f"Sensitivity: {member.sensitivity.value}, Known Conditions: {conditions_str}, "
                f"Primary Activity: {member.primary_activity})"
            )

        context_prompt = "\n".join(context_lines)

        # If live Gemini client is ready and configured
        if self._client and self.api_key:
            try:
                contents = []
                # Add historical messages
                for msg in request.history[-settings.MAX_CONSULTATION_HISTORY:]:
                    contents.append(f"{msg.role.upper()}: {msg.content}")

                current_query = (
                    f"[Current Context]\n{context_prompt}\n\n"
                    f"User Query: {request.message}"
                )
                contents.append(f"USER: {current_query}")
                full_prompt = "\n\n".join(contents)

                response = self._client.models.generate_content(
                    model=self.model_name,
                    contents=full_prompt,
                    config={
                        "system_instruction": self.SYSTEM_INSTRUCTION,
                        "temperature": 0.4,
                    },
                )
                reply_text = response.text or "I am currently unable to process your request."
                return self._enrich_response(reply_text, request, member)
            except Exception as e:
                logger.error(f"Gemini API call failed: {e}. Falling back to rule-based engine.")

        # Fallback intelligent consultation engine
        return self._generate_expert_fallback_reply(request, member, context_prompt)

    def _enrich_response(
        self, reply: str, request: ConsultationRequest, member: Optional[FamilyMember]
    ) -> ConsultationResponse:
        followups = self._generate_followups(request, member)
        alerts = []
        if request.current_aqi and request.current_aqi > 150:
            alerts.append("Unhealthy AQI threshold breached (>150). Wear N95 respirator outdoors.")
        if member and any(c.value in ["asthma", "copd"] for c in member.conditions):
            alerts.append(f"Respiratory precaution active for {member.name}: Keep rescue inhaler on hand.")

        return ConsultationResponse(
            reply=reply,
            suggested_followups=followups,
            health_alerts=alerts,
            ai_engine="Google Gemini 2.5 Flash",
        )

    def _generate_expert_fallback_reply(
        self, request: ConsultationRequest, member: Optional[FamilyMember], context_prompt: str
    ) -> ConsultationResponse:
        aqi = request.current_aqi if request.current_aqi is not None else 85
        name = member.name if member else "your family"
        query_lower = request.message.lower()

        # Context-aware rule-based clinical response
        if "walk" in query_lower or "exercise" in query_lower or "run" in query_lower or "outdoor" in query_lower:
            if aqi <= 50:
                text = (
                    f"Air quality in {request.location_name} is currently **Good (AQI {aqi})**. "
                    f"Outdoor exercise and walks are completely safe for {name}. Enjoy your time outside!"
                )
            elif aqi <= 100:
                text = (
                    f"Current AQI is **Moderate ({aqi})** in {request.location_name}. "
                    f"While healthy adults can safely exercise outside, {name} should observe how they feel. "
                    f"If exercising outdoors, the early afternoon (1:00 PM - 4:00 PM) offers the lowest particulate concentration."
                )
            elif aqi <= 150:
                text = (
                    f"Air quality is **Unhealthy for Sensitive Groups (AQI {aqi})**. "
                    f"Outdoor workouts or prolonged walks are **not advised** for {name}. "
                    f"Switch to indoor treadmill or bodyweight exercises in a room with an active HEPA filter."
                )
            else:
                text = (
                    f"**Urgent Alert**: AQI is currently **{aqi}** (Unhealthy/Hazardous). "
                    f"All outdoor exercise must be suspended immediately for {name}. Deep respiration under these conditions "
                    f"transports billions of PM2.5 particles deep into alveolar capillaries."
                )
        elif "window" in query_lower or "ventilat" in query_lower or "air" in query_lower:
            if aqi <= 50:
                text = (
                    f"With AQI at {aqi}, you should open windows for cross-ventilation to flush out indoor carbon dioxide and VOCs."
                )
            elif aqi <= 100:
                text = (
                    f"AQI is Moderate ({aqi}). Keep windows mostly closed, but a brief 10-15 minute cross-ventilation "
                    f"during the early afternoon is acceptable if indoor air feels stale."
                )
            else:
                text = (
                    f"**Keep all exterior windows and doors tightly sealed.** Ambient AQI is {aqi}. "
                    f"Turn your HEPA air purifier to medium or high speed, and ensure vehicle AC is set to internal recirculation."
                )
        elif "mask" in query_lower or "n95" in query_lower or "protect" in query_lower:
            if aqi <= 100:
                text = "Standard cloth or surgical masks offer little PM2.5 protection, but at current levels (AQI ≤ 100), masks are optional unless especially sensitive."
            else:
                text = (
                    f"At AQI {aqi}, a certified **N95 or FFP2 respirator** is strongly advised. "
                    f"Make sure the mask forms a tight perimeter seal over the bridge of the nose and chin with no air leaks."
                )
        else:
            text = (
                f"Based on current atmospheric readings for {request.location_name} (AQI: {aqi}, dominant: {request.dominant_pollutant or 'PM2.5'}), "
                f"here are key precautions for {name}:\n\n"
                f"1. **Indoor Air Management**: Keep exterior doors closed and run HEPA filtration.\n"
                f"2. **Commute Strategy**: Avoid open-air transportation during morning temperature inversions (8:00 AM - 10:30 AM).\n"
                f"3. **Health Monitoring**: Check that any prescribed rescue inhalers or allergy antihistamines are within reach."
            )

        followups = self._generate_followups(request, member)
        alerts = []
        if aqi > 100:
            alerts.append(f"Elevated pollution level ({aqi} AQI). Keep windows closed.")

        return ConsultationResponse(
            reply=text,
            suggested_followups=followups,
            health_alerts=alerts,
            ai_engine="BreatheWise Expert AI Engine",
        )

    def _generate_followups(
        self, request: ConsultationRequest, member: Optional[FamilyMember]
    ) -> List[str]:
        name = member.name if member else "my family"
        return [
            f"What is the best time today for {name} to commute?",
            f"Should I run my HEPA purifier on turbo tonight?",
            f"What specific symptoms should I watch for in {name}?",
            "How does today's wind speed affect particulate dispersion?",
        ]


gemini_service = GeminiService()
