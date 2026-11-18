import pytest
from app.services.chat_intents import (
    IntentDispatcher,
    MedicalSafetyIntent,
    MythBusterIntent,
    SustainableTransportIntent,
)


def test_medical_safety_intent():
    intent = MedicalSafetyIntent()
    assert intent.matches("should i double my medication dosage?") is True
    assert intent.matches("is it safe to jog?") is False

    resp = intent.generate_response("dosage", None, None)
    assert "Medical Safety Notice" in resp
    assert "NOT prescribe" in resp


def test_myth_buster_intent():
    intent = MythBusterIntent()
    assert intent.matches("does smog build immunity?") is True
    assert intent.matches("how is aqi calculated?") is False

    resp = intent.generate_response("immunity", None, None)
    assert "Scientific Clarification" in resp
    assert "not immunological adaptation" in resp.lower() or "alveolar inflammation" in resp.lower()


def test_intent_dispatcher():
    dispatcher = IntentDispatcher()
    res1 = dispatcher.dispatch("should I stop my prednisone inhaler?", None, None)
    assert "Medical Safety Notice" in res1["reply"]

    res2 = dispatcher.dispatch("how does metro compare to petrol car?", None, None)
    assert "Sustainable Mobility" in res2["reply"] or "Mass Transit" in res2["reply"]

    res3 = dispatcher.dispatch("general query about tomorrow", None, None)
    assert "BreatheWise Environmental Summary" in res3["reply"]
