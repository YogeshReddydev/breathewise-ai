import React from 'react';
import { AQIReading, AQIStandard } from '../../types/aqi';
import { ComprehensiveRecommendation } from '../../types/recommendations';
import { getAQIPercentage } from '../../utils/aqiCalculator';
import { formatDatePretty } from '../../utils/formatters';
import { MapPin, Clock, AlertTriangle, ShieldCheck, Database, Radio, Activity, AlertOctagon } from 'lucide-react';

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
    standardLabel = 'Indian CPCB NAQI';
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
    standardLabel = 'European AQI';
    displayAQI = reading.aqi_eu ?? 30;
    categoryLabel = reading.european?.category || (displayAQI > 50 ? 'Moderate' : 'Good');
    color = reading.european?.color_hex || '#16A34A';
  } else {
    standardLabel = 'US EPA AQI';
    displayAQI = reading.aqi_us;
    categoryLabel = reading.category_label;
    color = reading.color_hex;
  }

  const percent = displayAQI !== null ? getAQIPercentage(displayAQI) : 0;

  // Circular gauge calculations (270-degree arc)
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * (circumference * 0.75);

  const pm25LimitRatio = (reading.pollutants.pm2_5 / 15.0).toFixed(1);

  // UI/UX Pro Max Ambient Glow mapping
  const ambientGlowClass =
    displayAQI === null ? '' :
    displayAQI <= 50 ? 'glow-emerald' :
    displayAQI <= 100 ? 'glow-emerald' :
    displayAQI <= 200 ? 'glow-amber' :
    displayAQI <= 300 ? 'glow-orange' :
    displayAQI <= 400 ? 'glow-rose' : 'glow-purple';

  return (
    <div id="overview" className={`glass-card-elevated p-6 lg:p-8 relative overflow-hidden transition-all duration-300 ${ambientGlowClass}`}>
      
      {/* Top Header Bar: Standard Selector & Telemetry Provenance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-100">
        
        {/* Standard Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl border border-slate-200 text-xs">
          <span className="text-[11px] text-slate-500 px-2 font-semibold">Standard:</span>
          
          <button
            onClick={() => onSelectStandard && onSelectStandard('cpcb')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              standard === 'cpcb'
                ? 'bg-white text-emerald-900 border border-slate-200/90 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            🇮🇳 CPCB NAQI (India)
          </button>

          <button
            onClick={() => onSelectStandard && onSelectStandard('us_epa')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              standard === 'us_epa'
                ? 'bg-white text-teal-900 border border-slate-200/90 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            🇺🇸 US EPA
          </button>

          <button
            onClick={() => onSelectStandard && onSelectStandard('european')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              standard === 'european'
                ? 'bg-white text-purple-900 border border-slate-200/90 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            🇪🇺 European
          </button>
        </div>

        {/* Provenance & Observation Status with Live Telemetry Beacon */}
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/90 text-emerald-800 border border-emerald-200 font-medium shadow-xs">
            <span className="telemetry-beacon text-emerald-600 w-2 h-2 rounded-full mr-0.5" />
            <span>
              {reading.provider === 'waqi'
                ? 'Ground Monitoring Station'
                : reading.data_type === 'forecast'
                ? 'Numerical Forecast Model'
                : 'Atmospheric Reanalysis Model (CAMS)'}
            </span>
          </span>
          <span className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200 font-mono text-[11px]">
            <Database className="w-3 h-3 text-teal-600" />
            <span className="truncate max-w-[200px]">{reading.source_attribution || reading.provider}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Location, Headline & Key Metrics */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                {reading.location_name}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {formatDatePretty(reading.timestamp)}
              </span>
              <span className="text-[11px] font-mono text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 font-semibold">
                Active Benchmark: {standardLabel}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              {recommendations?.headline || `Urban Air Quality in ${reading.location_name}`}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
              {recommendations?.summary ||
                'Continuous multi-pollutant telemetry synthesized with atmospheric dispersion models to evaluate real-time respiratory risk.'}
            </p>

            {/* CPCB Limitation Notice if not calculable */}
            {!isCalculable && limitationNote && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-900 font-semibold mb-0.5">Indian CPCB Calculation Notice</strong>
                  <span>{limitationNote} Please review US EPA AQI for continuous international approximation.</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Primary Metrics Cards with Hover-Lift Micro-interactions */}
          <div className="grid grid-cols-3 gap-3.5 mt-6 pt-5 border-t border-slate-100">
            <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200 hover-lift">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-bold">Dominant Pollutant</span>
              <span className="text-xl font-black text-emerald-900 font-mono mt-0.5 block">{dominantPollutant}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Primary sub-index driver</span>
            </div>

            <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200 hover-lift">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-bold">Fine PM2.5</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-slate-900 font-mono">{reading.pollutants.pm2_5.toFixed(1)}</span>
                <span className="text-[11px] font-semibold text-slate-500 font-mono">µg/m³</span>
              </div>
              <span className="text-[10px] text-rose-700 font-semibold block mt-0.5">
                {Number(pm25LimitRatio) > 1.0 ? `${pm25LimitRatio}× WHO 24h limit` : 'Within WHO Limit'}
              </span>
            </div>

            <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200 hover-lift">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-bold">Coarse PM10</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-slate-900 font-mono">{reading.pollutants.pm10.toFixed(1)}</span>
                <span className="text-[11px] font-semibold text-slate-500 font-mono">µg/m³</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Road dust &amp; pollen</span>
            </div>
          </div>
        </div>

        {/* Right Column: Prominent Radial Arc AQI Gauge */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50/80 rounded-2xl border border-slate-200 relative">
          <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
            {/* SVG Arc Gauge */}
            <svg className="w-full h-full transform -rotate-135" viewBox="0 0 180 180">
              {/* Background track */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="14"
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
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                }}
              />
            </svg>

            {/* Central Numbers & Category Badge */}
            <div className="absolute flex flex-col items-center text-center px-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{standardLabel}</span>
              {displayAQI !== null ? (
                <span
                  className="text-5xl sm:text-6xl font-black font-mono tracking-tight leading-none mt-1"
                  style={{ color }}
                >
                  {displayAQI}
                </span>
              ) : (
                <span className="text-2xl font-bold text-slate-400 mt-2">N/A</span>
              )}
              
              <div
                className="mt-2.5 text-xs font-bold px-3 py-1 rounded-full border shadow-sm"
                style={{
                  backgroundColor: `${color}15`,
                  color: color,
                  borderColor: `${color}40`,
                }}
              >
                {categoryLabel}
              </div>
            </div>
          </div>

          {/* Scale benchmarks */}
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-500 px-4 mt-1">
            <span className="font-semibold text-emerald-700">0 Good</span>
            <span className="font-semibold text-amber-700">100 Mod</span>
            <span className="font-semibold text-orange-700">200 Poor</span>
            <span className="font-semibold text-rose-700">300+ Severe</span>
          </div>

          {/* Risk Score Indicator */}
          <div className="mt-3.5 pt-3 border-t border-slate-200/80 w-full text-xs text-slate-600 flex items-center justify-between px-2">
            <span>Overall Household Risk: <strong className="text-slate-900 font-mono font-bold">{recommendations?.overall_risk_score || 25}/100</strong></span>
            <span className={`font-semibold ${reading.pollutants.pm2_5 <= 15 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {reading.pollutants.pm2_5 <= 15 ? '✓ WHO Target Met' : '⚠ Above WHO Limit'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
