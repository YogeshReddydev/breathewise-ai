import { useState } from 'react';
import { AQIReading } from '../types/aqi';
import { FamilyGroup } from '../types/family';
import { ChatMessage } from '../types/recommendations';
import { sendChatMessage } from '../services/api';

const INITIAL_GREETING: ChatMessage = {
  id: 'init-1',
  sender: 'assistant',
  text: "Hello! I am BreatheWise AI, your urban environmental intelligence specialist. Ask me anything regarding today's live telemetry, CPCB vs EPA standards, workout safety for family members, or sustainable travel alternatives.",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  source: 'expert_rules_engine',
};

const SUGGESTED_QUESTIONS = [
  'How does Indian CPCB NAQI differ from US EPA AQI?',
  'Is it safe for Leo (pediatric asthma) to play outdoors today?',
  'What HEPA CADR rating do I need for my bedroom during smog?',
  'Compare taking the electric metro vs driving today for emissions & lung safety',
  'Should we open home windows for natural cross-ventilation tonight?',
];

export function useEnvironmentalChat(
  currentAQI: AQIReading | null,
  currentFamily: FamilyGroup | null
) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (messageText: string) => {
    const text = messageText.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage(text, currentAQI, currentFamily);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: response.source,
        model: response.model,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: err instanceof Error ? err.message : 'Unable to complete consultation query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'error',
      };
      setMessages((prev) => [...prev, errorMsg]);
      setError(err instanceof Error ? err.message : 'Failed to consult assistant');
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    loading,
    error,
    suggestedQuestions: SUGGESTED_QUESTIONS,
    sendMessage,
  };
}
