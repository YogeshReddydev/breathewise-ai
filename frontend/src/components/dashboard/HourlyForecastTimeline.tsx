import React, { useState } from 'react';
import { AirQualityForecast, AQIStandard } from '../../types/aqi';
import { formatTimeHour } from '../../utils/formatters';
import { Calendar, Clock, BarChart3, Radio, Info } from 'lucide-react';

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
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (!forecast || !forecast.hourly || forecast.hourly.length === 0) {
    return null;
  }

  const items = forecast.hourly.slice(0, forecastHours);
  const isCPCB = standard === 'cpcb';
  
  const maxVal = Math.max(
    ...items.map((i) => (isCPCB && i.cpcb_aqi ? i.cpcb_aqi : i.aqi_us)),
    120
  );

  const activeIndex = selectedIdx !== null ? selectedIdx : hoveredIdx;
  const activeItem = activeIndex !== null ? items[activeIndex] : null;
  const activeAQI = activeItem
    ? isCPCB && activeItem.cpcb_aqi !== null && activeItem.cpcb_aqi !== undefined
      ? activeItem.cpcb_aqi
      : activeItem.aqi_us
    : null;
  const activeColor = activeItem
    ? isCPCB && activeItem.cpcb_color
      ? activeItem.cpcb_color
      : activeItem.color_hex
    : '#10B981';
  const activeCategory = activeItem
    ? isCPCB
      ? activeItem.cpcb_category || activeItem.category_label
      : activeItem.category_label
    : '';

  return (
    <div id="forecast" className="glass-card-elevated p-6 mt-8 relative overflow-hidden">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 shadow-xs">
              <Calendar className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Atmospheric Air Quality Forecast Trajectory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Hourly numerical simulation &bull; Standard:{' '}
                <strong className="text-emerald-900 font-mono">
                  {isCPCB ? 'Indian CPCB NAQI' : standard === 'european' ? 'European AQI' : 'US EPA AQI'}
                </strong>
              </p>
            </div>
          </div>
        </div>

        {/* 24h vs 48h Toggle Buttons & Model Provenance */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            <Radio className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            CAMS/ECMWF Model
          </span>

          <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200 text-xs shadow-xs" role="group" aria-label="Forecast timeframe selector">
            <button
              onClick={() => { onSelectHours(24); setSelectedIdx(null); }}
              aria-label="24-Hour Forecast Horizon"
              aria-pressed={forecastHours === 24}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                forecastHours === 24
                  ? 'bg-white text-emerald-900 shadow-sm border border-slate-200/90'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              24-Hour Horizon
            </button>
            <button
              onClick={() => { onSelectHours(48); setSelectedIdx(null); }}
              aria-label="48-Hour Extended Horizon"
              aria-pressed={forecastHours === 48}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                forecastHours === 48
                  ? 'bg-white text-emerald-900 shadow-sm border border-slate-200/90'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              48-Hour Extended
            </button>
          </div>
        </div>
      </div>

      {/* Selected / Hovered Hour Inspection Panel */}
      {activeItem && activeAQI !== null && (
        <div className="mb-4 p-4 rounded-xl bg-slate-50/90 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-fadeIn transition-all">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg text-white shadow-sm shrink-0"
              style={{ backgroundColor: activeColor }}
            >
              {activeAQI}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  Inspection at {formatTimeHour(activeItem.time)} ({activeItem.time.split('T')[0]})
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${activeColor}15`,
                    color: activeColor,
                    borderColor: `${activeColor}40`,
                  }}
                >
                  {activeCategory}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                PM2.5: <strong className="font-mono">{activeItem.pm2_5.toFixed(1)} µg/m³</strong> &bull; PM10: <strong className="font-mono">{activeItem.pm10.toFixed(1)} µg/m³</strong> &bull;{' '}
                {activeAQI <= 100
                  ? 'Suitable for standard outdoor routines and natural aeration.'
                  : activeAQI <= 200
                  ? 'Sensitive cohorts should restrict prolonged outdoor exercise.'
                  : 'High particulate load; mandatory N95 protection for outdoor exposure.'}
              </p>
            </div>
          </div>
          {selectedIdx !== null && (
            <button
              onClick={() => setSelectedIdx(null)}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-medium self-end md:self-center"
            >
              Reset to Live
            </button>
          )}
        </div>
      )}

      {/* Distinction Badge */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            <span className="text-[11px]">Clean / Moderate (&le;100)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
            <span className="text-[11px]">Unhealthy (101-200)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
            <span className="text-[11px]">Severe (&gt;200)</span>
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
          Hover over bars for hourly details
        </span>
      </div>

      {/* Timeline Chart Container */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 overflow-x-auto">
        <div className="flex items-end gap-1.5 min-w-[720px] h-48 pt-6 px-2">
          {items.map((item, idx) => {
            const aqiValue = isCPCB && item.cpcb_aqi !== null && item.cpcb_aqi !== undefined ? item.cpcb_aqi : item.aqi_us;
            const barColor = isCPCB && item.cpcb_color ? item.cpcb_color : item.color_hex;
            const heightPercent = Math.max(12, Math.round((aqiValue / maxVal) * 100));
            const formattedTime = formatTimeHour(item.time);
            const isHovered = hoveredIdx === idx;
            const isSelected = selectedIdx === idx;
            const isFirst = idx === 0;

            return (
              <div
                key={idx}
                onClick={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer"
              >
                {/* Floating Tooltip */}
                {isHovered && !selectedIdx && (
                  <div className="absolute -top-16 bg-slate-900 text-white text-[10px] font-mono py-1.5 px-3 rounded-lg shadow-xl z-30 pointer-events-none whitespace-nowrap border border-slate-700">
                    <div className="font-bold text-emerald-300">{formattedTime} &bull; {item.time.split('T')[0]}</div>
                    <div>AQI: <strong>{aqiValue}</strong> ({isCPCB ? item.cpcb_category || item.category_label : item.category_label})</div>
                    <div>PM2.5: {item.pm2_5.toFixed(1)} µg/m³ &bull; PM10: {item.pm10.toFixed(1)} µg/m³</div>
                  </div>
                )}

                {/* AQI Numeric Label */}
                <span className={`text-[10px] font-mono mb-1 font-bold ${
                  isSelected ? 'text-emerald-900 font-black scale-125' : isHovered ? 'text-slate-900 scale-110' : 'text-slate-500'
                }`}>
                  {aqiValue}
                </span>

                {/* Interactive Bar */}
                <div
                  className={`w-full rounded-t-md transition-all duration-200 relative ${
                    isSelected
                      ? 'ring-3 ring-emerald-600 shadow-lg scale-y-105'
                      : isHovered
                      ? 'ring-2 ring-slate-900 shadow-md'
                      : 'opacity-90 hover:opacity-100'
                  }`}
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: barColor,
                  }}
                >
                  {isFirst && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-900 rounded-full" title="Current Hour" />
                  )}
                  {isSelected && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-600 rounded-full ring-2 ring-white" />
                  )}
                </div>

                {/* Hour Label */}
                <span className={`text-[9px] font-mono mt-2 truncate w-full text-center ${
                  isFirst ? 'font-bold text-emerald-900' : 'text-slate-500'
                }`}>
                  {isFirst ? 'Now' : formattedTime}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Timeline indicates forecast from current local time across next {forecastHours} hours.</span>
        </span>
        <span className="font-mono text-[11px] text-slate-600 font-semibold">
          24h Average AQI: {forecast.avg_next_24h_aqi}
        </span>
      </div>

    </div>
  );
};
