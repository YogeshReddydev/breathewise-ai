import React from 'react';
import { ShieldCheck, Heart, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-white/5 bg-[#050914] py-8 px-4 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-medium text-slate-400">
            BreatheWise AI &bull; Urban Environmental Intelligence Platform
          </span>
        </div>

        <div className="flex items-center gap-6 text-[11px]">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            US EPA AQI Standard & WHO 2021 Guidelines
          </span>
          <span>Open-Meteo Air Quality Telemetry</span>
          <span>Google Gemini AI Reasoning</span>
        </div>

        <div className="text-[11px] text-slate-600">
          Designed for Challenge 6 &bull; Dedicated to proactive respiratory wellness
        </div>
      </div>
    </footer>
  );
};
