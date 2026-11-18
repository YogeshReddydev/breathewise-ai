import React from 'react';
import { AirQualityForecast, AQIStandard } from '../../types/aqi';
import { formatTimeHour } from '../../utils/formatters';
import { Calendar, TrendingUp, Clock, Layers } from 'lucide-react';

interface HourlyForecastTimelineProps {
  forecast: AirQualityForecast | null;
  standard: AQIStandard;
  forecastHours: number;
  onSelectHours: (hours: number) => void;
}

export const HourlyForecastTimeline: React.FC<HourlyForecastTimelineProps> = ({
  forecast,
  standard,
  forecastHours,
  onSelectHours,
}) => {
  if (!forecast || !forecast.hourly || forecast.hourly.length === 0) {
    return null;
  }

  const items = forecast.hourly.slice(0, forecastHours);
  const isCPCB = standard === 'cpcb';
  
  const maxVal = Math.max(
    ...items.map((i) => (isCPCB && i.cpcb_aqi ? i.cpcb_aqi : i.aqi_us)),
    100
  );

  return (
    <div className="glass-panel p-6 mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Hourly Atmospheric Forecast Trajectory
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Predictive Numerical Simulation &bull; Standard: <strong className="text-cyan-300 font-mono">{isCPCB ? 'CPCB NAQI (India)' : standard === 'european' ? 'European AQI' : 'US EPA AQI'}</strong>
          </p>
        </div>

        {/* 24h vs 48h Toggle Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#050B14] p-1 rounded-xl border border-white/10 text-xs" role="group" aria-label="Forecast timeframe selector">
            <button
              onClick={() => onSelectHours(24)}
              aria-label="24-Hour Horizon"
              aria-pressed={forecastHours === 24}
              className={`px-3 py-1 rounded-lg font-bold transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                forecastHours === 24
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              24-Hour Horizon
            </button>
            <button
              onClick={() => onSelectHours(48)}
              aria-label="48-Hour Extended Horizon"
              aria-pressed={forecastHours === 48}
              className={`px-3 py-1 rounded-lg font-bold transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                forecastHours === 48
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              48-Hour Extended
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal timeline bar graph */}
      <div className="overflow-x-auto pb-4">
        <div className="flex items-end gap-1.5 min-w-[700px] h-48 pt-6 px-2">
          {items.map((item, idx) => {
            const aqiValue = isCPCB && item.cpcb_aqi !== null && item.cpcb_aqi !== undefined ? item.cpcb_aqi : item.aqi_us;
            const barColor = isCPCB && item.cpcb_color ? item.cpcb_color : item.color_hex;
            const heightPercent = Math.max(12, Math.round((aqiValue / maxVal) * 100));
            const formattedTime = formatTimeHour(item.time);

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center group relative h-full justify-end"
              >
                {/* Tooltip on Hover */}
                <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-white/20 text-white text-[10px] font-mono py-1 px-2.5 rounded-lg shadow-xl pointer-events-none z-20 whitespace-nowrap">
                  <div className="font-bold text-cyan-300">{item.time}</div>
                  <div>AQI: <strong>{aqiValue}</strong> ({isCPCB ? item.cpcb_category || item.category_label : item.category_label})</div>
                  <div>PM2.5: {item.pm2_5.toFixed(1)} µg/m³</div>
                </div>

                {/* AQI Value Label */}
                <span className="text-[10px] font-mono text-slate-400 mb-1 opacity-75 group-hover:opacity-100 group-hover:text-white">
                  {aqiValue}
                </span>

                {/* Bar */}
                <div
                  className="w-full rounded-t-md transition-all duration-300 group-hover:brightness-125 cursor-pointer relative"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: barColor,
                    boxShadow: `0 0 10px ${barColor}25`,
                  }}
                />

                {/* Hour Label */}
                <span className="text-[9px] font-mono text-slate-400 mt-2 truncate w-full text-center">
                  {formattedTime}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 border-t border-white/5 pt-3 gap-2">
        <span className="flex items-center gap-1.5 text-slate-300">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          Average {forecastHours}h Projected AQI: <strong className="text-white font-mono">{forecast.avg_next_24h_aqi}</strong>
        </span>
        <span className="text-slate-500 text-[11px]">
          Numerical atmosphere prediction model &bull; Re-computed every 60 minutes
        </span>
      </div>
    </div>
  );
};
