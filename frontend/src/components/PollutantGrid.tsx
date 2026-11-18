import React from 'react';
import { PollutantsBreakdown } from '../types';
import { getAQITheme } from '../utils/aqi-theme';
import { Activity } from 'lucide-react';

interface PollutantGridProps {
  pollutants: PollutantsBreakdown;
}

interface PollutantConfig {
  key: keyof PollutantsBreakdown;
  label: string;
  name: string;
  maxHealthy: number; // reference guide
  description: string;
}

const POLLUTANTS: PollutantConfig[] = [
  {
    key: 'pm2_5',
    label: 'PM2.5',
    name: 'Fine Particulates',
    maxHealthy: 35.4,
    description: 'Inhales deep into alveoli and bloodstream',
  },
  {
    key: 'pm10',
    label: 'PM10',
    name: 'Coarse Dust & Pollen',
    maxHealthy: 154.0,
    description: 'Irritates upper respiratory tract and trachea',
  },
  {
    key: 'no2',
    label: 'NO2',
    name: 'Nitrogen Dioxide',
    maxHealthy: 188.0,
    description: 'Traffic emission; triggers bronchial spasms',
  },
  {
    key: 'o3',
    label: 'O3',
    name: 'Ground-level Ozone',
    maxHealthy: 140.0,
    description: 'Summer smog component; causes oxidative stress',
  },
  {
    key: 'co',
    label: 'CO',
    name: 'Carbon Monoxide',
    maxHealthy: 9.4,
    description: 'Displaces oxygen in hemoglobin',
  },
  {
    key: 'so2',
    label: 'SO2',
    name: 'Sulfur Dioxide',
    maxHealthy: 196.0,
    description: 'Industrial combustion by-product; bronchial irritant',
  },
];

export const PollutantGrid: React.FC<PollutantGridProps> = ({ pollutants }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">Pollutant Breakdown</h3>
        </div>
        <span className="text-xs text-slate-400">EPA Standard Breakpoint Analysis</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {POLLUTANTS.map((item) => {
          const data = pollutants[item.key];
          if (!data) return null;

          const theme = getAQITheme(data.category);
          const ratio = Math.min(100, (data.value / (item.maxHealthy * 1.5)) * 100);

          return (
            <div
              key={item.key}
              className="glass-panel rounded-2xl p-4.5 border border-navy-800 hover:border-navy-700 transition-all hover:translate-y-[-2px] group"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-extrabold text-white text-base tracking-wide flex items-center gap-1.5">
                    {item.label}
                    <span className="text-xs font-normal text-slate-400">({item.name})</span>
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.badgeBg}`}
                >
                  {data.category}
                </span>
              </div>

              {/* Value and Sub-Index */}
              <div className="flex items-baseline justify-between my-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">{data.value}</span>
                  <span className="text-xs text-slate-400 font-medium">{data.unit}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400">Sub-Index: </span>
                  <span className="text-sm font-bold text-cyan-300">{data.sub_index}</span>
                </div>
              </div>

              {/* Threshold Meter Bar */}
              <div className="w-full bg-navy-950/80 rounded-full h-2 overflow-hidden border border-navy-800">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.max(5, ratio)}%`,
                    backgroundColor: theme.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
