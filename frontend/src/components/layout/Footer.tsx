import React from 'react';
import { ShieldCheck, Wind, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Platform Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-white">
                <Wind className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="text-base font-extrabold text-slate-900 tracking-tight">
                BreatheWise AI
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Breathe Smarter. Live Healthier. Build Cleaner Communities. Proactive urban air quality intelligence and clinical respiratory guidance.
            </p>
            <div className="text-[11px] font-mono text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-block">
              Challenge 6 &bull; Urban Air Quality Assistant
            </div>
          </div>

          {/* Col 2: Regulatory Air Quality Standards */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Environmental Standards
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>&bull; Indian CPCB National Air Quality Index (NAQI)</li>
              <li>&bull; United States EPA Clean Air Act Standard</li>
              <li>&bull; European Air Quality Index (Directive 2008/50/EC)</li>
              <li>&bull; WHO 2021 Global Air Quality Clinical Benchmarks</li>
            </ul>
          </div>

          {/* Col 3: Data & AI Provenance */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Data &amp; Model Provenance
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>&bull; Open-Meteo High-Resolution CAMS / ECMWF Models</li>
              <li>&bull; CPCB Continuous Ground Sensor Networks</li>
              <li>&bull; Google Gemini 2.5 Multimodal Reasoning</li>
              <li>&bull; DEFRA &amp; ARAI Commute Emissions Factors</li>
            </ul>
          </div>

          {/* Col 4: Medical Disclaimer & Transparency */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Clinical &amp; Medical Disclaimer
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              BreatheWise AI provides environmental health advisories based on meteorological data and published public health guidelines. It does not provide medical diagnosis or replace consultation with a qualified medical physician.
            </p>
          </div>

        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>&copy; {new Date().getFullYear()} BreatheWise AI &bull; Open Environmental Intelligence</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/YogeshReddydev/breathewise-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-emerald-800 transition-colors"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-300">&bull;</span>
            <span className="flex items-center gap-1">
              <span>Zero-Carbon Hosting</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
