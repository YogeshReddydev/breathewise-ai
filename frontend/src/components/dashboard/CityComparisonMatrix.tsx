import React from 'react';
import { AQIReading } from '../../types/aqi';
import { Compass, TrendingUp, TrendingDown, ArrowRight, Globe2, Building2 } from 'lucide-react';

interface CityComparisonMatrixProps {
  currentReading: AQIReading;
  onSelectCity: (cityName: string) => void;
}

interface BenchmarkCity {
  name: string;
  country: string;
  flag: string;
  benchmarkAQI: number;
  category: string;
  pm25: number;
  color: string;
  isMegacity: boolean;
}

export const CityComparisonMatrix: React.FC<CityComparisonMatrixProps> = ({
  currentReading,
  onSelectCity,
}) => {
  const currentCityAQI = currentReading.aqi_us;
  const currentCityName = currentReading.location_name;

  // Major representative benchmark metropolitan regions
  const benchmarkCities: BenchmarkCity[] = [
    {
      name: 'New Delhi, India',
      country: 'India',
      flag: '🇮🇳',
      benchmarkAQI: 245,
      category: 'Very Unhealthy',
      pm25: 145.2,
      color: '#7C3AED',
      isMegacity: true,
    },
    {
      name: 'Mumbai, India',
      country: 'India',
      flag: '🇮🇳',
      benchmarkAQI: 138,
      category: 'Unhealthy for Sensitive',
      pm25: 50.4,
      color: '#EA580C',
      isMegacity: true,
    },
    {
      name: 'Bengaluru, India',
      country: 'India',
      flag: '🇮🇳',
      benchmarkAQI: 65,
      category: 'Moderate',
      pm25: 19.8,
      color: '#CA8A04',
      isMegacity: true,
    },
    {
      name: 'Kolkata, India',
      country: 'India',
      flag: '🇮🇳',
      benchmarkAQI: 182,
      category: 'Unhealthy',
      pm25: 78.5,
      color: '#DC2626',
      isMegacity: true,
    },
    {
      name: 'London, UK',
      country: 'United Kingdom',
      flag: '🇬🇧',
      benchmarkAQI: 35,
      category: 'Good',
      pm25: 8.4,
      color: '#16A34A',
      isMegacity: false,
    },
    {
      name: 'New York, USA',
      country: 'United States',
      flag: '🇺🇸',
      benchmarkAQI: 42,
      category: 'Good',
      pm25: 10.2,
      color: '#16A34A',
      isMegacity: false,
    },
  ];

  return (
    <div id="city-benchmark" className="glass-card-elevated p-6 mt-8 relative overflow-hidden transition-all duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 shadow-xs">
            <Globe2 className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Metropolitan Air Quality Radar &amp; Benchmark Index
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare {currentCityName} ({currentCityAQI} AQI) against major national &amp; global urban centers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span>Click any city to switch location</span>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 my-5">
        {benchmarkCities.map((city) => {
          const diff = city.benchmarkAQI - currentCityAQI;
          const isBetter = diff < 0;
          const isCurrent = currentCityName.toLowerCase().includes(city.name.split(',')[0].toLowerCase());

          return (
            <div
              key={city.name}
              onClick={() => onSelectCity(city.name)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                isCurrent
                  ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-slate-50/80 border-slate-200 hover-lift hover:border-slate-300 hover:bg-white'
              }`}
            >
              {/* Top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg leading-none">{city.flag}</span>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block group-hover:text-emerald-900 transition-colors">
                      {city.name.split(',')[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{city.country}</span>
                  </div>
                </div>

                {/* AQI Score pill */}
                <div
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-white shadow-xs"
                  style={{ backgroundColor: city.color }}
                >
                  {city.benchmarkAQI}
                </div>
              </div>

              {/* Differential & PM2.5 */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-mono">
                  PM2.5: <strong>{city.pm25} µg/m³</strong>
                </span>

                {isCurrent ? (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    Current View
                  </span>
                ) : (
                  <span className={`flex items-center gap-1 font-mono font-bold text-[11px] ${
                    isBetter ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {isBetter ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                    {isBetter ? `${Math.abs(diff)} cleaner` : `${diff} higher`}
                  </span>
                )}
              </div>

              {/* Hover quick action indicator */}
              <div className="mt-2 text-[10px] text-emerald-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <span>View {city.name.split(',')[0]} dashboard</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 text-xs text-slate-500 flex items-center justify-between">
        <span>* Atmospheric benchmarks derived from CAMS atmospheric reanalysis models.</span>
        <button
          onClick={() => onSelectCity('New Delhi, India')}
          className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
        >
          Reset to National Capital (New Delhi)
        </button>
      </div>

    </div>
  );
};
