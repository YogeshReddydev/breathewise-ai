import React from 'react';
import { PollutantBreakdown } from '../../types/aqi';
import { MetricCard } from '../common/MetricCard';
import { Layers } from 'lucide-react';

interface PollutantGridProps {
  pollutants: PollutantBreakdown;
}

export const PollutantGrid: React.FC<PollutantGridProps> = ({ pollutants }) => {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            Atmospheric Pollutant Spectrum
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          Evaluated against WHO 2021 Clinical Health Benchmarks
        </span>
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
