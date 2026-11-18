import React, { useState, useEffect } from 'react';
import {
  Leaf,
  Calculator,
  Compass,
  ArrowRight,
  TrendingDown,
  AlertTriangle,
  Info,
  CheckCircle2,
  Bike,
  Train,
  Car,
  Bus,
} from 'lucide-react';
import {
  EmissionsCalculationRequest,
  EmissionsCalculationResult,
  SustainableTransportOption,
  TransportMode,
} from '../../types/sustainability';
import { calculateEmissions, fetchSustainableTransportOptions } from '../../services/api';

interface SustainableLivingSectionProps {
  currentAQI: number;
}

export const SustainableLivingSection: React.FC<SustainableLivingSectionProps> = ({ currentAQI }) => {
  const [distance, setDistance] = useState<number>(15);
  const [baselineMode, setBaselineMode] = useState<TransportMode>('petrol_car');
  const [targetMode, setTargetMode] = useState<TransportMode>('metro_train');
  const [tripsPerWeek, setTripsPerWeek] = useState<number>(10);
  const [result, setResult] = useState<EmissionsCalculationResult | null>(null);
  const [options, setOptions] = useState<SustainableTransportOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadOptions() {
      try {
        const opts = await fetchSustainableTransportOptions(currentAQI);
        setOptions(opts);
      } catch (err) {
        console.error('Failed to load transport options', err);
      }
    }
    loadOptions();
  }, [currentAQI]);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await calculateEmissions(
        {
          distance_km: Number(distance),
          baseline_mode: baselineMode,
          target_mode: targetMode,
          trips_per_week: Number(tripsPerWeek),
        },
        currentAQI
      );
      setResult(res);
    } catch (err) {
      console.error('Failed to calculate emissions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCalculate();
  }, [distance, baselineMode, targetMode, tripsPerWeek, currentAQI]);

  return (
    <div className="glass-panel p-6 mt-8 border border-emerald-500/20 bg-gradient-to-br from-emerald-950/15 via-[#0A1128] to-[#0A1128]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Sustainable Living &amp; Green Commuting Intelligence
            </h2>
            <p className="text-xs text-slate-400">
              Correlate personal mobility with ambient air safety &amp; greenhouse gas abatement
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          DEFRA / ARAI Emission Benchmarks
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* Left: Interactive Emissions Calculator */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span>Interactive Commuter Emissions Calculator</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            
            {/* Baseline Vehicle */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
              <label className="block text-slate-400 font-semibold mb-1">Baseline Transport (Current)</label>
              <select
                value={baselineMode}
                onChange={(e) => setBaselineMode(e.target.value as TransportMode)}
                className="w-full bg-[#050B14] border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="petrol_car">Solo Petrol Car (170 g/km)</option>
                <option value="diesel_car">Solo Diesel Car (155 g/km)</option>
                <option value="two_wheeler">Motorcycle / Scooter (75 g/km)</option>
                <option value="hybrid_car">Hybrid Car (100 g/km)</option>
              </select>
            </div>

            {/* Target Clean Mode */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
              <label className="block text-slate-400 font-semibold mb-1">Green Shift Target</label>
              <select
                value={targetMode}
                onChange={(e) => setTargetMode(e.target.value as TransportMode)}
                className="w-full bg-[#050B14] border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="metro_train">Electric Metro / Rail (22 g/km)</option>
                <option value="city_bus">Public City Bus (35 g/km)</option>
                <option value="carpool_2">Carpooling 2 Occupants (85 g/km)</option>
                <option value="carpool_3">Carpooling 3+ Occupants (57 g/km)</option>
                <option value="electric_car">Electric Vehicle (50 g/km)</option>
                <option value="walk_cycle">Walking / Cycling (0 g/km)</option>
              </select>
            </div>

            {/* Distance Slider / Input */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400 font-semibold">One-Way Distance:</span>
                <span className="text-white font-mono font-bold">{distance} km</span>
              </div>
              <input
                type="range"
                min={1}
                max={60}
                value={distance}
                aria-label="One-Way Commute Distance in Kilometers"
                aria-valuenow={distance}
                aria-valuemin={1}
                aria-valuemax={60}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full accent-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              />
            </div>

            {/* Trips per week */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400 font-semibold">Trips per Week:</span>
                <span className="text-white font-mono font-bold">{tripsPerWeek} trips</span>
              </div>
              <input
                type="range"
                min={2}
                max={20}
                value={tripsPerWeek}
                aria-label="Commute Trips Per Week"
                aria-valuenow={tripsPerWeek}
                aria-valuemin={2}
                aria-valuemax={20}
                onChange={(e) => setTripsPerWeek(Number(e.target.value))}
                className="w-full accent-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              />
            </div>

          </div>

          {/* Calculator Results Display */}
          {result && (
            <div className="bg-slate-900/80 rounded-xl p-4 border border-white/10 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">Single Trip Savings</span>
                  <span className="text-xl font-extrabold text-emerald-300 font-mono">
                    {result.single_trip_avoided_kg} <span className="text-xs">kg CO₂</span>
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">-{result.avoided_percentage}%</span>
                </div>

                <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-bold">Weekly Abatement</span>
                  <span className="text-xl font-extrabold text-cyan-300 font-mono">
                    {result.weekly_avoided_kg} <span className="text-xs">kg CO₂</span>
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{tripsPerWeek} commutes</span>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">Annual Impact</span>
                  <span className="text-xl font-extrabold text-white font-mono">
                    {result.annual_avoided_kg} <span className="text-xs">kg CO₂</span>
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">~{(result.annual_avoided_kg / 1000).toFixed(2)} metric tons</span>
                </div>
              </div>

              {/* Tailpipe PM2.5 avoidance */}
              <div className="flex items-center justify-between text-xs bg-[#050B14] px-3.5 py-2 rounded-lg border border-white/5">
                <span className="text-slate-400">Direct Roadway Exhaust Avoidance:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {result.tailpipe_pm2_5_avoided_g} grams of combustion PM2.5 saved
                </span>
              </div>

              {/* Ambient Air Safety Guidance */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-800/50 border border-white/5 text-xs">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 leading-relaxed">
                  <strong>Health Context:</strong> {result.air_safety_context}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Sustainable Modes Matrix correlated with current AQI */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-sm font-bold text-white">
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Today&apos;s Travel Safety Matrix</span>
            </div>
            <span className="text-xs font-mono text-slate-400">AQI: {currentAQI}</span>
          </div>

          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {options.slice(0, 5).map((opt) => (
              <div
                key={opt.mode}
                className={`p-3 rounded-xl border transition-all text-xs flex items-start justify-between gap-3 ${
                  opt.recommended_today
                    ? 'bg-slate-900/60 border-emerald-500/30'
                    : 'bg-slate-900/30 border-white/5 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{opt.label}</span>
                    <span className="font-mono text-[10px] text-slate-400">({opt.emissions_per_km} g/km)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-tight">
                    {opt.safety_advisory_for_today}
                  </p>
                </div>

                <div className="shrink-0 mt-0.5">
                  {opt.recommended_today ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      Recommended
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40">
                      Caution
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 leading-tight pt-2 border-t border-white/5">
            <strong>Methodology Note:</strong> {result?.methodology_note || 'Calculated using vehicle life-cycle emission factors.'}
          </div>
        </div>

      </div>

    </div>
  );
};
