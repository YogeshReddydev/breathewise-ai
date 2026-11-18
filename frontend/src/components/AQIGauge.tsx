import React from 'react';
import { CurrentAQIResponse } from '../types';
import { getAQITheme } from '../utils/aqi-theme';
import { Thermometer, Droplets, Wind, Compass, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AQIGaugeProps {
  aqiData: CurrentAQIResponse;
}

export const AQIGauge: React.FC<AQIGaugeProps> = ({ aqiData }) => {
  const theme = getAQITheme(aqiData.category);
  const aqi = aqiData.aqi;

  // Arc calculation for SVG circular gauge
  // Circumference for radius 80: 2 * PI * 80 ≈ 502.65
  // We will display a 260-degree arc
  const radius = 78;
  const strokeWidth = 14;
  const arcLength = 2 * Math.PI * radius * (260 / 360); // approx 353
  const maxAQI = 400;
  const progressPercent = Math.min(1, Math.max(0, aqi / maxAQI));
  const strokeDashoffset = arcLength - progressPercent * arcLength;

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl transition-all border border-navy-800">
      {/* Background atmospheric gradient blur */}
      <div
        className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-15 filter blur-3xl pointer-events-none"
        style={{ backgroundColor: theme.color }}
      />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-cyan-600/10 filter blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Radial Meter */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-56 h-56 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-[220deg]" viewBox="0 0 200 200">
              {/* Background Arc Track */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#14224A"
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} 600`}
                strokeLinecap="round"
              />
              {/* Live Colored Value Arc */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={theme.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} 600`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Central Numerical Readout */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-0.5">
                US AQI
              </span>
              <span className="text-6xl font-extrabold tracking-tighter text-white font-sans">
                {aqi}
              </span>
              <div
                className={`mt-2 px-3 py-1 rounded-full text-xs font-bold border tracking-wide shadow-sm ${theme.badgeBg}`}
              >
                {theme.label}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span>Dominant Pollutant:</span>
            <span className="px-2 py-0.5 rounded bg-navy-800 text-cyan-300 font-bold border border-navy-700">
              {aqiData.dominant_pollutant}
            </span>
          </div>
        </div>

        {/* Right Column: Health Context & Atmospheric Telemetry */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-6">
          {/* Headline & Warning */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {aqi <= 50 ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              )}
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {aqiData.health_headline}
              </h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-normal bg-navy-900/60 p-3.5 rounded-2xl border border-navy-800/80">
              {aqiData.cautionary_statement}
            </p>
          </div>

          {/* Atmospheric Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-navy-900/70 border border-navy-800 rounded-2xl p-3 flex flex-col">
              <div className="flex items-center text-xs text-slate-400 mb-1">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
                <span>Ambient Temp</span>
              </div>
              <span className="text-lg font-bold text-white">
                {aqiData.atmospheric.temperature_c ?? '--'}°C
              </span>
            </div>

            <div className="bg-navy-900/70 border border-navy-800 rounded-2xl p-3 flex flex-col">
              <div className="flex items-center text-xs text-slate-400 mb-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
                <span>Rel. Humidity</span>
              </div>
              <span className="text-lg font-bold text-white">
                {aqiData.atmospheric.relative_humidity_percent ?? '--'}%
              </span>
            </div>

            <div className="bg-navy-900/70 border border-navy-800 rounded-2xl p-3 flex flex-col">
              <div className="flex items-center text-xs text-slate-400 mb-1">
                <Wind className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                <span>Wind Speed</span>
              </div>
              <span className="text-lg font-bold text-white">
                {aqiData.atmospheric.wind_speed_kmh ?? '--'} km/h
              </span>
            </div>

            <div className="bg-navy-900/70 border border-navy-800 rounded-2xl p-3 flex flex-col">
              <div className="flex items-center text-xs text-slate-400 mb-1">
                <Compass className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                <span>Wind Bearing</span>
              </div>
              <span className="text-lg font-bold text-white">
                {aqiData.atmospheric.wind_direction_deg ?? '--'}°
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
