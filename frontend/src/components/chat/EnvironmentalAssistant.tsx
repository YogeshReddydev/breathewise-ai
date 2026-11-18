import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, Bot, User, CornerDownLeft, ShieldCheck, Leaf } from 'lucide-react';
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
      text: "Hello! I am BreatheWise AI, your urban environmental intelligence and respiratory health specialist. Ask me anything about today's live telemetry, CPCB vs EPA standards, workout safety, sustainable public transit, or family precautions.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'expert_rules_engine',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'How does CPCB National AQI differ from US EPA AQI?',
    'Is it safe for Leo (asthma) to play soccer today?',
    'Compare taking the metro vs driving today for emissions & lung safety',
    'What indoor exercise alternatives are recommended during high AQI?',
    'Should we open bedroom windows for ventilation tonight?',
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
        text: 'I encountered an issue connecting to the environmental reasoning service. Please check your network or try again.',
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
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-[#091124] border-l border-white/10 shadow-2xl flex flex-col transition-all duration-300"
    >
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0B152E]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5">
            <div className="w-full h-full bg-[#0B132B] rounded-[6px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            </div>
          </div>
          <div>
            <h3 id="assistant-title" className="text-sm font-bold text-white flex items-center gap-1.5">
              BreatheWise Assistant
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Gemini AI
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Context-Aware Environmental Intelligence</p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close environmental assistant"
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Atmospheric Context Header Strip */}
      {currentAQI && (
        <div className="px-4 py-2 bg-slate-900/80 border-b border-white/5 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">
            Location: <strong className="text-slate-200">{currentAQI.location_name}</strong>
          </span>
          <div className="flex items-center gap-2 font-mono">
            {currentAQI.cpcb?.calculable && (
              <span className="text-emerald-400">CPCB {currentAQI.cpcb.aqi}</span>
            )}
            <span className="text-cyan-300">EPA {currentAQI.aqi_us}</span>
          </div>
        </div>
      )}

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" aria-live="polite">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" aria-hidden="true" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-br-none shadow-md'
                    : 'bg-[#101D3D] text-slate-200 border border-white/10 rounded-bl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-white/5 pt-1">
                  <span>{msg.timestamp}</span>
                  {msg.model && (
                    <span className="text-cyan-400/80 ml-2">{msg.model}</span>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" aria-hidden="true" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="bg-[#101D3D] text-slate-300 text-xs px-4 py-2.5 rounded-2xl border border-white/10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Analyzing atmospheric &amp; clinical parameters...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      <div className="p-3 border-t border-white/5 bg-[#080E1F]">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-2">
          Suggested Queries:
        </span>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-white/5 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="p-3 bg-[#0B152E] border-t border-white/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            aria-label="Ask questions about air quality, health guidance, or transport options"
            placeholder="Ask about air safety, transit emissions, Leo's asthma..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-[#070D1E] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus-visible:ring-2 focus-visible:ring-cyan-400"
          />
          <button
            type="submit"
            aria-label="Send message to assistant"
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:brightness-110 disabled:opacity-40 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>
      </div>

    </div>
  );
};
