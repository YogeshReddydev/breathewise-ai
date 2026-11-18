import React, { useState } from 'react';
import { AQIReading } from '../../types/aqi';
import { CloudFog, ShieldAlert, ThermometerSnowflake, Wind, ArrowDownRight, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface WinterSmogShieldProps {
  reading: AQIReading;
}

export const WinterSmogShield: React.FC<WinterSmogShieldProps> = ({ reading }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const pm25 = reading.pollutants.pm2_5;
  const pm10 = reading.pollutants.pm10;
  
  // Calculate Winter Thermal Inversion Risk Index (0 - 100)
  // Higher PM2.5 combined with ratio suggests particulate trapping beneath cold ground inversions
  const inversionRiskScore = Math.min(100, Math.round((pm25 / 180) * 80 + (pm25 > 60 ? 20 : 5)));
  
  const isSevereInversion = inversionRiskScore >= 70;
  const isModerateInversion = inversionRiskScore >= 40 && inversionRiskScore < 70;

  // Estimated atmospheric boundary layer height
  const estimatedBoundaryLayerMeters = isSevereInversion ? 280 : isModerateInversion ? 550 : 1200;

  return (
    <div id="winter-smog" className="glass-card-elevated p-6 mt-8 border-l-4 border-l-cyan-600 relative overflow-hidden transition-all duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-xs">
            <ThermometerSnowflake className="w-5 h-5 text-cyan-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Winter Inversion &amp; Smog Shield
              </h2>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                isSevereInversion
                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                  : isModerateInversion
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}>
                {isSevereInversion ? 'High Smog Trap Risk' : isModerateInversion ? 'Moderate Inversion' : 'Normal Dispersion'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Atmospheric boundary layer compression and thermal ground trap diagnostics
            </p>
          </div>
        </div>

        {/* Inversion Metric Chip */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <CloudFog className="w-4 h-4 text-cyan-700" />
            <span>Boundary Layer: <strong className="font-mono text-slate-900 font-bold">~{estimatedBoundaryLayerMeters}m</strong></span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs font-bold text-cyan-800 hover:text-cyan-950 px-2 py-1 rounded-lg hover:bg-cyan-50 transition-colors"
          >
            <span>{isExpanded ? 'Hide Physics' : 'Smog Physics'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
        
        {/* Metric 1: Inversion Risk Gauge */}
        <div className="bg-slate-50/90 rounded-xl p-4 border border-slate-200 hover-lift">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Inversion Trap Index</span>
            <Wind className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono text-slate-900">{inversionRiskScore}</span>
            <span className="text-xs font-bold text-slate-500 font-mono">/ 100</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2.5">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                isSevereInversion ? 'bg-rose-600' : isModerateInversion ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${inversionRiskScore}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block mt-2">
            {isSevereInversion
              ? 'Severe cold ground layer trapping heavy particulates at breathing level.'
              : 'Moderate nighttime cooling trapping early morning traffic emissions.'}
          </span>
        </div>

        {/* Metric 2: Solar Mixing Window */}
        <div className="bg-slate-50/90 rounded-xl p-4 border border-slate-200 hover-lift">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Thermal Breakthrough</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-emerald-900 mt-1">
            13:00 &ndash; 16:30 hrs
          </div>
          <span className="text-[10px] text-emerald-800 font-semibold block mt-1">
            Solar radiation expands vertical air ceiling
          </span>
          <p className="text-[10px] text-slate-500 mt-2">
            Sun warms the ground, breaking the cold inversion lid and dispersing accumulated surface pollutants.
          </p>
        </div>

        {/* Metric 3: Critical Winter Warning */}
        <div className="bg-slate-50/90 rounded-xl p-4 border border-slate-200 hover-lift">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Morning Inversion Ban</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-lg font-bold text-rose-900 mt-1">
            05:30 &ndash; 09:30 hrs
          </div>
          <span className="text-[10px] text-rose-800 font-semibold block mt-1">
            Peak ground stagnation danger zone
          </span>
          <p className="text-[10px] text-slate-500 mt-2">
            Keep doors and windows sealed. Ground emissions cannot rise; exercising outside forces dense soot into alveoli.
          </p>
        </div>

      </div>

      {/* Expandable Atmospheric Physics Brief */}
      {isExpanded && (
        <div className="mt-4 p-4 rounded-xl bg-cyan-50/60 border border-cyan-200 text-xs text-slate-700 animate-fadeIn space-y-2">
          <div className="font-bold text-cyan-950 flex items-center gap-1.5">
            <CloudFog className="w-4 h-4 text-cyan-700" />
            <span>How Thermal Inversion Magnifies Winter Smog:</span>
          </div>
          <p className="leading-relaxed">
            During winter nights, the Earth’s surface radiates heat rapidly into clear skies, cooling the lowest layer of air faster than the air above. This creates a dense, cold blanket capped by a layer of warmer air—reversing the normal atmospheric temperature lapse rate.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-cyan-200/60">
              <CheckCircle2 className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
              <span><strong>Pre-heat Air Purifier:</strong> Run HEPA units on high speed starting at 22:00 to scrub indoor air before night cooling intensifies infiltration.</span>
            </div>
            <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-cyan-200/60">
              <CheckCircle2 className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
              <span><strong>Vehicle Cabin Recirculate:</strong> Always switch vehicle HVAC to internal recirculation during morning traffic to block soot intake.</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
