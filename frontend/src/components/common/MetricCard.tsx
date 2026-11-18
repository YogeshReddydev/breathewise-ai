import React from 'react';
import { getWhoThresholdPercentage } from '../../utils/aqiCalculator';

interface MetricCardProps {
  name: string;
  fullName: string;
  value: number | null | undefined;
  unit: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  name,
  fullName,
  value,
  unit,
}) => {
  const isUnmonitored = value === null || value === undefined;

  if (isUnmonitored) {
    return (
      <div className="glass-panel p-4 flex flex-col justify-between border border-dashed border-white/10 opacity-70">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-sm font-bold text-slate-300">{name}</span>
            <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{fullName}</p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-slate-800 text-slate-400 border border-white/5">
            Unmonitored
          </span>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold tracking-tight text-slate-400 font-mono">
              N/A
            </span>
            <span className="text-xs text-slate-500 font-mono">({unit})</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Sensor telemetry not reporting</p>
        </div>

        <div>
          <div className="w-full bg-slate-800/40 rounded-full h-1.5 overflow-hidden">
            <div className="h-full rounded-full bg-slate-700 w-0" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>0</span>
            <span>No data</span>
          </div>
        </div>
      </div>
    );
  }

  const { percent, exceeds, limit } = getWhoThresholdPercentage(name, value);
  const barWidth = Math.min(100, Math.max(5, percent));

  const barColor = exceeds
    ? percent > 200
      ? '#EF4444' // Red
      : '#F97316' // Orange
    : percent > 75
    ? '#F59E0B' // Amber
    : '#10B981'; // Emerald

  return (
    <div className="glass-panel p-4 flex flex-col justify-between transition-all duration-200 glass-panel-hover">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-sm font-bold text-slate-100">{name}</span>
          <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{fullName}</p>
        </div>
        <span
          className="text-[11px] px-2 py-0.5 rounded font-mono font-medium"
          style={{
            backgroundColor: `${barColor}15`,
            color: barColor,
            border: `1px solid ${barColor}30`,
          }}
        >
          {percent}% WHO limit
        </span>
      </div>

      <div className="my-2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold tracking-tight text-white font-mono">
            {value.toFixed(1)}
          </span>
          <span className="text-xs text-slate-400 font-mono">{unit}</span>
        </div>
      </div>

      <div>
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${barWidth}%`, backgroundColor: barColor }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>0</span>
          <span>WHO Guideline: {limit} {unit}</span>
        </div>
      </div>
    </div>
  );
};
