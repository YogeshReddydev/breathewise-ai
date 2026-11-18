import React from 'react';
import { ForecastAQIResponse } from '../types';
import { getAQITheme } from '../utils/aqi-theme';
import { Clock, TrendingUp, Sparkles, Sun } from 'lucide-react';

interface ForecastChartProps {
  forecast: ForecastAQIResponse;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ forecast }) => {
  const points = forecast.hourly.slice(0, 24); // Focus on next 24 hours

  // Format hour label
  const formatHour = (isoOrStr: string, hr: number) => {
    if (isoOrStr.includes('T')) {
      const part = isoOrStr.split('T')[1];
      return part.slice(0, 5);
    }
    return `${hr.toString().padStart(2, '0')}:00`;
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-navy-800 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              24-Hour Atmospheric Trajectory
            </h3>
            <p className="text-xs text-slate-400">
              Diurnal boundary layer dispersion and traffic-induced particulate peaks
            </p>
          </div>
        </div>

        {/* Peak & Cleanest Highlights */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-950/60 border border-rose-800/40 text-rose-300">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Peak Hazard: <strong>AQI {forecast.peak_aqi}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cleanest Window: <strong>AQI {forecast.cleanest_aqi}</strong></span>
          </div>
        </div>
      </div>

      {/* Hourly Timeline Columns */}
      <div className="relative overflow-x-auto pb-2 pt-4">
        <div className="flex items-end gap-2.5 min-w-[700px] h-44 px-2">
          {points.map((pt, idx) => {
            const theme = getAQITheme(pt.category);
            const heightPercent = Math.max(12, Math.min(100, (pt.aqi / 300) * 100));
            const isPeak = pt.aqi === forecast.peak_aqi;
            const isCleanest = pt.aqi === forecast.cleanest_aqi;

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center group relative cursor-pointer"
              >
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-navy-900 border border-navy-700 px-2 py-1 rounded shadow-lg text-[10px] whitespace-nowrap text-white pointer-events-none">
                  <div>{pt.timestamp}</div>
                  <div>AQI: {pt.aqi} ({pt.category})</div>
                  <div>PM2.5: {pt.pm2_5} µg/m³</div>
                </div>

                {/* Peak / Clean Indicator badge */}
                {isPeak && (
                  <span className="text-[9px] font-bold text-rose-400 mb-1 animate-pulse">
                    PEAK
                  </span>
                )}
                {isCleanest && !isPeak && (
                  <span className="text-[9px] font-bold text-emerald-400 mb-1">
                    CLEAN
                  </span>
                )}
                {!isPeak && !isCleanest && <div className="h-4" />}

                {/* Bar */}
                <div className="w-full relative flex items-end justify-center">
                  <div
                    className="w-full max-w-[28px] rounded-t-lg transition-all duration-500 group-hover:brightness-125"
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: theme.color,
                      opacity: isPeak ? 1 : 0.8,
                    }}
                  />
                </div>

                {/* AQI text */}
                <span className="text-[11px] font-bold text-slate-200 mt-2">
                  {pt.aqi}
                </span>

                {/* Hour label */}
                <span className="text-[10px] text-slate-400 font-medium">
                  {formatHour(pt.timestamp, pt.hour)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
