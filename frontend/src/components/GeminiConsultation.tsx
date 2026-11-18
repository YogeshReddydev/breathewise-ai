import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, AlertCircle, User, Loader2 } from 'lucide-react';
import { ChatMessage, ConsultationResponse, FamilyMember } from '../types';
import { consultGeminiAI } from '../services/api';

interface GeminiConsultationProps {
  locationName: string;
  currentAqi: number;
  dominantPollutant: string;
  activeMember?: FamilyMember;
}

export const GeminiConsultation: React.FC<GeminiConsultationProps> = ({
  locationName,
  currentAqi,
  dominantPollutant,
  activeMember,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: `Hello! I am your BreatheWise AI environmental health consultant. I am currently monitoring atmospheric conditions in ${locationName} (AQI: ${currentAqi}, Dominant: ${dominantPollutant}) with personalized focus for ${activeMember?.name || 'your family'}. How can I assist you with protective strategies today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedFollowups, setSuggestedFollowups] = useState<string[]>([
    `Is it safe for ${activeMember?.name || 'the family'} to exercise outside?`,
    'Should I open the windows to ventilate this afternoon?',
    'What fan speed should I set my HEPA air purifier to?',
    'What mask standard is required for today’s commute?',
  ]);
  const [healthAlerts, setHealthAlerts] = useState<string[]>([]);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const newHistory: ChatMessage[] = [...messages, { role: 'user', content: query }];
    setMessages(newHistory);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res: ConsultationResponse = await consultGeminiAI(
        query,
        newHistory,
        locationName,
        currentAqi,
        dominantPollutant,
        activeMember?.id
      );

      setMessages((prev) => [...prev, { role: 'model', content: res.reply }]);
      if (res.suggested_followups && res.suggested_followups.length > 0) {
        setSuggestedFollowups(res.suggested_followups);
      }
      if (res.health_alerts && res.health_alerts.length > 0) {
        setHealthAlerts(res.health_alerts);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: 'Sorry, I encountered an issue connecting to the Gemini intelligence service. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render bold markdown
  const renderFormatted = (text: string) => {
    return text.split('\n').map((line, lIdx) => {
      // Bold replacer
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={lIdx} className="mb-1.5 last:mb-0 leading-relaxed font-normal">
          {parts.map((p, pIdx) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-white">
                  {p.slice(2, -2)}
                </strong>
              );
            }
            return p;
          })}
        </p>
      );
    });
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-navy-800 flex flex-col h-[580px] shadow-2xl relative overflow-hidden">
      {/* Consultation Header */}
      <div className="flex items-center justify-between pb-4 border-b border-navy-800/80 mb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-glow-cyan">
            <Bot className="w-5 h-5 text-navy-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base tracking-tight">
                Gemini Health Consultant
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                AI Powered
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personalized for {activeMember?.name || 'Household'} · {locationName}
            </p>
          </div>
        </div>
      </div>

      {/* Health Alerts if any */}
      {healthAlerts.length > 0 && (
        <div className="mb-3 p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-xs text-amber-200 flex items-start gap-2 shrink-0">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            {healthAlerts.map((alt, idx) => (
              <div key={idx}>{alt}</div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-cyan-600 text-navy-950'
                    : 'bg-navy-800 text-cyan-300 border border-navy-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl p-3.5 ${
                  isUser
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-navy-900/90 text-slate-200 border border-navy-800 rounded-tl-none shadow-md'
                }`}
              >
                {renderFormatted(msg.content)}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-cyan-400 text-xs py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing atmospheric parameters with Gemini...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Followups */}
      {suggestedFollowups.length > 0 && (
        <div className="py-2 flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mr-1" />
          {suggestedFollowups.slice(0, 3).map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-navy-900/80 hover:bg-navy-850 border border-navy-800 text-slate-300 hover:text-cyan-300 transition-all shrink-0 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-2 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask Gemini about air quality, ventilation, or ${activeMember?.name || 'family'} safety...`}
          disabled={isLoading}
          className="flex-1 bg-navy-900/90 border border-navy-700/80 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 outline-none transition-all shadow-inner disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold transition-all shadow-glow-cyan disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
