import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, Bot, User, CornerDownLeft, ShieldCheck, Leaf, Info } from 'lucide-react';
import { AQIReading } from '../../types/aqi';
import { FamilyGroup } from '../../types/family';
import { ChatMessage } from '../../types/recommendations';
import { sendChatMessage } from '../../services/api';

interface EnvironmentalAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentAQI: AQIReading | null;
  currentFamily: FamilyGroup | null;
}

export const EnvironmentalAssistant: React.FC<EnvironmentalAssistantProps> = ({
  isOpen,
  onClose,
  currentAQI,
  currentFamily,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Hello! I am BreatheWise AI, your urban environmental intelligence specialist. Ask me anything regarding today's live telemetry, CPCB vs EPA standards, workout safety for family members, or sustainable travel alternatives.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'expert_rules_engine',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'How does Indian CPCB NAQI differ from US EPA AQI?',
    'Is it safe for Leo (pediatric asthma) to play outdoors today?',
    'What HEPA CADR rating do I need for my bedroom during smog?',
    'Compare taking the electric metro vs driving today for emissions & lung safety',
    'Should we open home windows for natural cross-ventilation tonight?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Close assistant on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSend = async (messageText: string) => {
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
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: 'I encountered an issue connecting to the environmental reasoning service. Please check your network connection or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'error',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="assistant-title"
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-all duration-300"
    >
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-700 p-0.5 shadow-sm">
            <div className="w-full h-full bg-emerald-900 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-300" aria-hidden="true" />
            </div>
          </div>
          <div>
            <h3 id="assistant-title" className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>BreatheWise AI Consultant</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
                Gemini 2.5
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Environmental Intelligence Specialist</p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close assistant"
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Atmospheric Context Header Strip */}
      {currentAQI && (
        <div className="px-4 py-2 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium truncate max-w-[220px]">
            Location: <strong className="text-slate-900">{currentAQI.location_name}</strong>
          </span>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            {currentAQI.cpcb?.calculable && (
              <span className="text-emerald-900 font-bold">CPCB {currentAQI.cpcb.aqi}</span>
            )}
            <span className="text-teal-900 font-semibold">EPA {currentAQI.aqi_us}</span>
          </div>
        </div>
      )}

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40" aria-live="polite">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" aria-hidden="true" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-emerald-800 text-white rounded-br-none shadow-sm'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-100 pt-1">
                  <span>{msg.timestamp}</span>
                  {msg.model && (
                    <span className="text-emerald-700 ml-2 font-semibold">{msg.model}</span>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" aria-hidden="true" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-2.5 justify-start items-center">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="bg-white text-slate-600 text-xs px-4 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span>Analyzing atmospheric &amp; clinical parameters with Gemini...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
          Suggested Consultation Questions:
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about air quality, running safety, HEPA purifiers..."
            aria-label="Ask about air quality, running safety, or purifiers"
            disabled={loading}
            className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl disabled:opacity-50 transition-all shadow-sm"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-center gap-1.5 text-center">
          <Info className="w-3 h-3 text-slate-400 shrink-0" />
          <span>Environmental advisory only. Consult healthcare providers for acute medical symptoms.</span>
        </div>
      </div>

    </div>
  );
};
