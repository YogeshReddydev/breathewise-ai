import React from 'react';
import { getWhoThresholdPercentage } from '../../utils/aqiCalculator';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface MetricCardProps {
  name: string;
  fullName: string;
  value: number | null | undefined;
  unit: string;
}

const POLLUTANT_DESCRIPTIONS: Record<string, { explanation: string; sources: string }> = {
  'PM2.5': {
    explanation: 'Fine respirable particulates that penetrate deep into lung alveoli and enter the bloodstream.',
    sources: 'Vehicle exhaust, biomass burning, coal power generation, industrial combustion',
  },
  'PM10': {
    explanation: 'Inhalable coarse particles causing upper respiratory irritation and bronchial aggravation.',
    sources: 'Road dust, construction sites, mechanical grinding, windblown soil',
  },
  'O3': {
    explanation: 'Photochemical oxidant formed in sunlight that causes acute airway inflammation.',
    sources: 'Secondary pollutant formed from NOx and volatile organic compounds on sunny days',
  },
  'NO2': {
    explanation: 'Pungent combustion gas that inflames bronchial lining and triggers asthma exacerbations.',
    sources: 'Diesel trucks, automotive traffic, gas heating, power plants',
  },
  'SO2': {
    explanation: 'Corrosive sulfur oxide gas causing rapid bronchospasm and burning throat irritation.',
    sources: 'Coal-fired thermal plants, heavy diesel fuel, smelting, refineries',
  },
  'CO': {
    explanation: 'Toxic odorless gas that binds to hemoglobin, reducing systemic oxygen delivery.',
    sources: 'Incomplete combustion in vehicles, idling engines, industrial boilers',
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  name,
  fullName,
  value,
  unit,
}) => {
  const isUnmonitored = value === null || value === undefined;
  const meta = POLLUTANT_DESCRIPTIONS[name] || {
    explanation: 'Ambient air quality parameter measured under standard meteorological conditions.',
    sources: 'Urban combustion and atmospheric sources',
  };

  if (isUnmonitored) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-xl p-4 flex flex-col justify-between opacity-75 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-sm font-bold text-slate-700">{name}</span>
            <p className="text-xs text-slate-500 truncate max-w-[150px]">{fullName}</p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-slate-100 text-slate-500 border border-slate-200">
            Unmonitored
          </span>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold tracking-tight text-slate-400 font-mono">
              N/A
            </span>
            <span className="text-xs text-slate-400 font-mono">({unit})</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Sensor telemetry not reporting</p>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-500 leading-tight">{meta.explanation}</p>
        </div>
      </div>
    );
  }

  const { percent, exceeds, limit } = getWhoThresholdPercentage(name, value);
  const barWidth = Math.min(100, Math.max(5, percent));

  const barColor = exceeds
    ? percent > 200
      ? '#DC2626' // Red
      : '#EA580C' // Orange
    : percent > 75
    ? '#D97706' // Amber
    : '#16A34A'; // Green

  return (
    <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-slate-900">{name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                WHO: {limit} {unit}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-[170px]">{fullName}</p>
          </div>
          <span
            className="text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold border"
            style={{
              backgroundColor: `${barColor}12`,
              color: barColor,
              borderColor: `${barColor}30`,
            }}
          >
            {percent}% limit
          </span>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-2xl font-black tracking-tight font-mono"
              style={{ color: exceeds ? barColor : '#0F172A' }}
            >
              {value.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-500 font-mono">{unit}</span>
            {exceeds ? (
              <span className="ml-auto text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Exceeds WHO
              </span>
            ) : (
              <span className="ml-auto text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Within Limit
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${barWidth}%`, backgroundColor: barColor }}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 leading-snug">
        <p>{meta.explanation}</p>
      </div>
    </div>
  );
};
