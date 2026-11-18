import React from 'react';
import { AQIReading, AQIStandard } from '../../types/aqi';
import { ComprehensiveRecommendation } from '../../types/recommendations';
import { StatusBadge } from '../common/StatusBadge';
import { getAQIPercentage } from '../../utils/aqiCalculator';
import { formatDatePretty } from '../../utils/formatters';
import { MapPin, Clock, AlertTriangle, ShieldCheck, Database, Radio, Info } from 'lucide-react';

interface AQIGaugeHeroProps {
  reading: AQIReading;
  recommendations: ComprehensiveRecommendation | null;
  standard?: AQIStandard;
  onSelectStandard?: (std: AQIStandard) => void;
  isStale?: boolean;
}

export const AQIGaugeHero: React.FC<AQIGaugeHeroProps> = ({
  reading,
  recommendations,
  standard = 'cpcb',
  onSelectStandard,
  isStale = false,
}) => {
  // Determine standard-specific values
  let displayAQI: number | null = reading.aqi_us;
  let standardLabel = 'US EPA AQI';
  let categoryLabel = reading.category_label;
  let color = reading.color_hex;
  let isCalculable = true;
  let limitationNote: string | null = null;
  let dominantPollutant = reading.dominant_pollutant;

  if (standard === 'cpcb') {
    standardLabel = 'Indian CPCB National AQI';
    if (reading.cpcb && reading.cpcb.calculable && reading.cpcb.aqi !== null && reading.cpcb.aqi !== undefined) {
      displayAQI = reading.cpcb.aqi;
      categoryLabel = reading.cpcb.category;
      color = reading.cpcb.color_hex;
      dominantPollutant = reading.cpcb.dominant_pollutant || reading.dominant_pollutant;
    } else {
      isCalculable = false;
      displayAQI = null;
      categoryLabel = reading.cpcb?.category || 'Insufficient Input Data';
      color = '#64748B';
      limitationNote =
        reading.cpcb?.limitation_note ||
        'Indian CPCB criteria strictly require at least 3 monitored pollutants including PM2.5 or PM10.';
    }
  } else if (standard === 'european') {
    standardLabel = 'European Air Quality Index';
    displayAQI = reading.aqi_eu ?? 30;
    categoryLabel = reading.european?.category || (displayAQI > 50 ? 'Moderate' : 'Good');
    color = reading.european?.color_hex || '#10B981';
  } else {
    standardLabel = 'US EPA AQI';
    displayAQI = reading.aqi_us;
    categoryLabel = reading.category_label;
    color = reading.color_hex;
  }

  const percent = displayAQI !== null ? getAQIPercentage(displayAQI) : 0;

  // Circular gauge calculations (270-degree arc)
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * (circumference * 0.75);

  return (
    <div className="glass-panel p-6 lg:p-8 relative overflow-hidden breeze-shimmer border border-white/10 shadow-2xl">
      {/* Background ambient glow */}
      <div
        className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: color }}
      />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none bg-cyan-500" />

      {/* Top Bar: Standard Selector & Provenance Attribution */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-white/10 relative z-20">
        
        {/* Standard Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-white/10 text-xs">
          <span className="text-[11px] text-slate-400 px-2 font-semibold">Standard:</span>
          
          <button
            onClick={() => onSelectStandard && onSelectStandard('cpcb')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              standard === 'cpcb'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🇮🇳 Indian CPCB
          </button>

          <button
            onClick={() => onSelectStandard && onSelectStandard('us_epa')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              standard === 'us_epa'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🇺🇸 US EPA
          </button>

          <button
            onClick={() => onSelectStandard && onSelectStandard('european')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              standard === 'european'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🇪🇺 European AQI
          </button>
        </div>

        {/* Provenance Badge */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>{reading.data_type === 'forecast' ? 'Forecast Model' : 'Live Observation'}</span>
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-white/5 font-mono">
            <Database className="w-3 h-3 text-cyan-400" />
            <span className="truncate max-w-[220px]">{reading.source_attribution || reading.provider}</span>
          </span>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Location & Executive Headline */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <MapPin className="w-3.5 h-3.5" />
                {reading.location_name}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-white/5">
                <Clock className="w-3.5 h-3.5" />
                {formatDatePretty(reading.timestamp)}
              </span>
              <span className="text-[11px] font-mono text-cyan-400/80 bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/20">
                Active: {standardLabel}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              {recommendations?.headline || `Real-Time Air Quality in ${reading.location_name}`}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              {recommendations?.summary ||
                'Fine particulate and pollutant telemetry is actively streamed. Check personalized advisories for sensitive family members.'}
            </p>

            {/* CPCB Limitation Notice if not calculable */}
            {!isCalculable && limitationNote && (
              <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-300 font-semibold mb-0.5">Indian CPCB Notice</strong>
                  <span>{limitationNote} Please review US EPA AQI for continuous international approximation.</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10">
            <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Dominant Pollutant</span>
              <span className="text-lg font-bold text-cyan-300 font-mono">{dominantPollutant}</span>
              <span className="text-[10px] text-slate-500 block">Primary sub-index driver</span>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Fine PM2.5</span>
              <span className="text-lg font-bold text-white font-mono">{reading.pollutants.pm2_5.toFixed(1)} <span className="text-xs font-normal text-slate-400">µg/m³</span></span>
              <span className="text-[10px] text-emerald-400 block">Inhalable respirable fraction</span>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Coarse PM10</span>
              <span className="text-lg font-bold text-white font-mono">{reading.pollutants.pm10.toFixed(1)} <span className="text-xs font-normal text-slate-400">µg/m³</span></span>
              <span className="text-[10px] text-slate-400 block">Pollen &amp; road dust</span>
            </div>
          </div>
        </div>

        {/* Right Column: Radial Circular Gauge */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-900/40 rounded-2xl border border-white/10 relative">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
            {/* SVG Arc Gauge */}
            <svg className="w-full h-full transform -rotate-135" viewBox="0 0 180 180">
              {/* Background track */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="12"
                strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
                strokeLinecap="round"
              />
              {/* Progress Arc */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease',
                  filter: `drop-shadow(0 0 10px ${color}80)`,
                }}
              />
            </svg>

            {/* Central Numbers */}
            <div className="absolute flex flex-col items-center text-center px-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{standardLabel}</span>
              {displayAQI !== null ? (
                <span
                  className="text-5xl sm:text-6xl font-black font-mono tracking-tight leading-none mt-1"
                  style={{ color }}
                >
                  {displayAQI}
                </span>
              ) : (
                <span className="text-xl font-bold text-slate-400 mt-2">N/A</span>
              )}
              
              <div
                className="mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-sm"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                  borderColor: `${color}40`,
                }}
              >
                {categoryLabel}
              </div>
            </div>
          </div>

          {/* Scale benchmarks */}
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 px-4 mt-2">
            <span>0 Good</span>
            <span className="text-amber-400">100 Mod</span>
            <span className="text-orange-400">200 Poor</span>
            <span className="text-red-400">300+</span>
          </div>

          <div className="mt-3 text-xs text-slate-400 flex items-center justify-center gap-2">
            <span>Overall Risk Index: <strong className="text-cyan-300 font-mono">{recommendations?.overall_risk_score || 20}/100</strong></span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-emerald-400 font-semibold">{reading.pollutants.pm2_5 <= 15 ? 'WHO Target Met' : 'Above WHO Limit'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
