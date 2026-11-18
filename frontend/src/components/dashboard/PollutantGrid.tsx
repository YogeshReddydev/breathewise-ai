import React from 'react';
import { PollutantBreakdown } from '../../types/aqi';
import { MetricCard } from '../common/MetricCard';
import { Layers, Info } from 'lucide-react';

interface PollutantGridProps {
  pollutants: PollutantBreakdown;
}

export const PollutantGrid: React.FC<PollutantGridProps> = ({ pollutants }) => {
  return (
    <div id="pollutants" className="mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-800">
            <Layers className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Atmospheric Pollutant Spectrum
            </h2>
            <p className="text-xs text-slate-500">
              Evaluated against World Health Organization (WHO 2021) Global Air Quality Guidelines
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Real-time mass concentrations</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          name="PM2.5"
          fullName="Fine Inhalable Particles"
          value={pollutants.pm2_5}
          unit="µg/m³"
        />
        <MetricCard
          name="PM10"
          fullName="Coarse Particulate Matter"
          value={pollutants.pm10}
          unit="µg/m³"
        />
        <MetricCard
          name="O3"
          fullName="Ground-Level Ozone"
          value={pollutants.o3}
          unit="µg/m³"
        />
        <MetricCard
          name="NO2"
          fullName="Nitrogen Dioxide"
          value={pollutants.no2}
          unit="µg/m³"
        />
        <MetricCard
          name="SO2"
          fullName="Sulphur Dioxide"
          value={pollutants.so2}
          unit="µg/m³"
        />
        <MetricCard
          name="CO"
          fullName="Carbon Monoxide"
          value={pollutants.co}
          unit="µg/m³"
        />
      </div>
    </div>
  );
};
