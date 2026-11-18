import React from 'react';
import {
  Leaf,
  Calculator,
  Compass,
  Info,
} from 'lucide-react';
import { TransportMode } from '../../types/sustainability';
import { useSustainableMobility } from '../../hooks/useSustainableMobility';

interface SustainableLivingSectionProps {
  currentAQI: number;
}

export const SustainableLivingSection: React.FC<SustainableLivingSectionProps> = ({ currentAQI }) => {
  const {
    distance,
    setDistance,
    baselineMode,
    setBaselineMode,
    targetMode,
    setTargetMode,
    tripsPerWeek,
    setTripsPerWeek,
    result,
    options,
  } = useSustainableMobility(currentAQI);

  return (
    <div id="sustainable-transit" className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm mt-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
            <Leaf className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Sustainable Mobility &amp; Commute Carbon Intelligence
            </h2>
            <p className="text-xs text-slate-500">
              Correlate personal transit choices with ambient air safety, exhaust PM2.5 avoidance, and greenhouse gas abatement
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          DEFRA / ARAI Emission Factors
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Emissions Calculator */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Calculator className="w-4 h-4 text-emerald-700" />
            <span>Interactive Commute Carbon Calculator</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            
            {/* Baseline Mode */}
            <div>
              <label htmlFor="baseline-mode" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Current Commute Mode
              </label>
              <select
                id="baseline-mode"
                value={baselineMode}
                onChange={(e) => setBaselineMode(e.target.value as TransportMode)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20"
              >
                <option value="petrol_car">Standard Petrol Car (192 g/km)</option>
                <option value="diesel_car">Diesel Car / SUV (238 g/km)</option>
                <option value="two_wheeler">Two-Wheeler / Scooter (103 g/km)</option>
              </select>
            </div>

            {/* Target Mode */}
            <div>
              <label htmlFor="target-mode" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sustainable Target Mode
              </label>
              <select
                id="target-mode"
                value={targetMode}
                onChange={(e) => setTargetMode(e.target.value as TransportMode)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20"
              >
                <option value="metro_train">Electric Metro / Rail (28 g/km)</option>
                <option value="city_bus">City Bus Transit (68 g/km)</option>
                <option value="electric_car">Electric Vehicle (EV) (53 g/km)</option>
                <option value="carpool_2">Carpool (2 Persons) (96 g/km)</option>
                <option value="carpool_3">Carpool (3+ Persons) (64 g/km)</option>
                <option value="walk_cycle">Bicycle / Walking (Zero Emission)</option>
              </select>
            </div>

            {/* Distance Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="distance-slider" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  One-Way Commute Distance
                </label>
                <span className="text-xs font-mono font-bold text-emerald-800">{distance} km</span>
              </div>
              <input
                id="distance-slider"
                type="range"
                min="1"
                max="60"
                value={distance}
                aria-label="One-Way Commute Distance in kilometers"
                aria-valuemin={1}
                aria-valuemax={60}
                aria-valuenow={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
              />
            </div>

            {/* Trips Per Week */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="trips-slider" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Trips Per Week
                </label>
                <span className="text-xs font-mono font-bold text-emerald-800">{tripsPerWeek} trips</span>
              </div>
              <input
                id="trips-slider"
                type="range"
                min="2"
                max="28"
                step="2"
                value={tripsPerWeek}
                aria-label="Commute trips per week"
                aria-valuemin={2}
                aria-valuemax={28}
                aria-valuenow={tripsPerWeek}
                onChange={(e) => setTripsPerWeek(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
              />
            </div>

          </div>

          {/* Results Display */}
          {result && (
            <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Weekly CO2 Saved</span>
                  <span className="text-lg font-black font-mono text-emerald-900 mt-0.5 block">
                    {result.weekly_avoided_kg.toFixed(1)} <span className="text-xs font-normal">kg</span>
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Annual Abatement</span>
                  <span className="text-lg font-black font-mono text-emerald-900 mt-0.5 block">
                    {result.annual_avoided_kg.toFixed(0)} <span className="text-xs font-normal">kg</span>
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Emissions Reduction</span>
                  <span className="text-lg font-black font-mono text-emerald-700 mt-0.5 block">
                    -{result.avoided_percentage.toFixed(0)}%
                  </span>
                </div>
              </div>

              {result.tailpipe_pm2_5_avoided_g > 0 && (
                <div className="text-xs text-emerald-900 flex items-center justify-between px-2 pt-1">
                  <span>Tailpipe fine PM2.5 prevented from urban air:</span>
                  <strong className="font-mono">{result.tailpipe_pm2_5_avoided_g.toFixed(1)} g / week</strong>
                </div>
              )}

              <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-emerald-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>Health Context:</strong> {result.air_safety_context}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Sustainable Modes Matrix correlated with current AQI */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-sm font-bold text-slate-900">
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-700" />
              <span>Today&apos;s Travel Safety Matrix</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Active AQI: {currentAQI}
            </span>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {options.slice(0, 5).map((opt) => (
              <div
                key={opt.mode}
                className={`p-3 rounded-xl border transition-all text-xs flex items-start justify-between gap-3 ${
                  opt.recommended_today
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-slate-50 border-slate-200 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{opt.label}</span>
                    <span className="text-[10px] font-mono text-slate-500 font-medium">
                      ({opt.emissions_per_km} g CO2/km)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    {opt.safety_advisory_for_today}
                  </p>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 border ${
                    opt.recommended_today
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {opt.recommended_today ? 'Recommended' : 'Caution'}
                </span>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 pt-1 leading-tight">
            * Travel safety matrix dynamically evaluates roadside particle exposure during active transit modes vs enclosed cabin filtration.
          </div>
        </div>

      </div>
    </div>
  );
};
