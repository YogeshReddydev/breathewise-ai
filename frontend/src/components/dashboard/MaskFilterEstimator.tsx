import React, { useState } from 'react';
import { AQIReading } from '../../types/aqi';
import { Shield, Sparkles, AlertCircle, Clock, Check, RefreshCw } from 'lucide-react';

interface MaskFilterEstimatorProps {
  reading: AQIReading;
}

type MaskType = 'n95' | 'n99' | 'kf94' | 'surgical';

export const MaskFilterEstimator: React.FC<MaskFilterEstimatorProps> = ({ reading }) => {
  const [maskType, setMaskType] = useState<MaskType>('n95');
  const [exposureHours, setExposureHours] = useState<number>(2);

  const pm25 = reading.pollutants.pm2_5;

  // Filtration efficiency specifications
  const maskSpecs: Record<MaskType, { name: string; efficiency: number; maxLifeHours: number; description: string }> = {
    n95: {
      name: 'N95 Respirator',
      efficiency: 0.95,
      maxLifeHours: 40,
      description: 'NIOSH certified; filters ≥95% of non-oil particulates down to 0.3 microns with proper facial seal.',
    },
    n99: {
      name: 'N99 / FFP3 Respirator',
      efficiency: 0.99,
      maxLifeHours: 35,
      description: 'High-grade electrostatic filter; blocks ≥99% of fine aerosols. Higher breathing resistance.',
    },
    kf94: {
      name: 'KF94 (Korean Standard)',
      efficiency: 0.94,
      maxLifeHours: 30,
      description: 'Foldable 3-panel design with adjustable nose bridge; filters ≥94% of particulate matter.',
    },
    surgical: {
      name: 'Standard 3-Ply Surgical Mask',
      efficiency: 0.35,
      maxLifeHours: 8,
      description: 'Fluid resistant but loose facial fit; allows significant perimeter particulate leakage (effective ~30-40%).',
    },
  };

  const selectedSpec = maskSpecs[maskType];

  // Respiration volume: Average adult breaths ~0.5 m³ of air per hour at light exertion
  const hourlyAirVolumeM3 = 0.55;
  const dailyInhaledAirM3 = hourlyAirVolumeM3 * exposureHours;

  // Inhaled particulate mass without mask: Volume * PM2.5 (µg/m³)
  const unmaskedExposureUg = dailyInhaledAirM3 * pm25;
  
  // Particulate mass blocked by mask:
  const blockedExposureUg = unmaskedExposureUg * selectedSpec.efficiency;
  
  // Particulate mass penetrating into lungs:
  const lungPenetrationUg = unmaskedExposureUg - blockedExposureUg;

  // Estimated filter life reduction: High PM2.5 degrades electrostatic media faster
  const degradationMultiplier = pm25 > 150 ? 2.0 : pm25 > 80 ? 1.4 : 1.0;
  const estimatedUsefulHours = Math.round(selectedSpec.maxLifeHours / degradationMultiplier);
  const remainingDays = Math.max(1, Math.round(estimatedUsefulHours / Math.max(1, exposureHours)));

  return (
    <div id="respirators" className="glass-card-elevated p-6 mt-8 relative overflow-hidden transition-all duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 shadow-xs">
            <Shield className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Respiratory Protection &amp; Filter Saturation Calculator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Quantify aerosol pulmonary shielding and calculate filter replacement thresholds based on current PM2.5
            </p>
          </div>
        </div>

        {/* Protection Efficiency Pill */}
        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs">
          <Sparkles className="w-4 h-4 text-emerald-700" />
          <span>Filtration Rating: <strong className="font-mono text-emerald-950 font-bold">{(selectedSpec.efficiency * 100).toFixed(0)}%</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-center">
        
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Mask Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Selected Respirator Grade:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(maskSpecs) as MaskType[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setMaskType(key)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    maskType === key
                      ? 'bg-teal-50 border-teal-300 text-teal-950 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{maskSpecs[key].name}</span>
                    {maskType === key && <Check className="w-3.5 h-3.5 text-teal-700 shrink-0" />}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                    {(maskSpecs[key].efficiency * 100).toFixed(0)}% efficiency
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              {selectedSpec.description}
            </p>
          </div>

          {/* Daily Exposure Slider */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Daily Outdoor Exposure:</span>
              <span className="font-mono text-teal-900 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                {exposureHours} hr{exposureHours > 1 ? 's' : ''}/day
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="8"
              step="0.5"
              value={exposureHours}
              onChange={(e) => setExposureHours(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-700"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>30m (commute)</span>
              <span>4h (outdoor work)</span>
              <span>8h (full shift)</span>
            </div>
          </div>

        </div>

        {/* Results Visualizer Column */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card 1: Particulate Blocked */}
          <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200 hover-lift">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Daily PM2.5 Blocked
            </span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-3xl font-black font-mono text-emerald-700">
                {blockedExposureUg.toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-slate-500 font-mono">µg avoided</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
              Stops micro-particulates from crossing alveolar capillary barriers into blood circulation.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between font-mono">
              <span>Without mask: {unmaskedExposureUg.toFixed(1)} µg</span>
              <span className="text-rose-600 font-bold">Lungs absorb: {lungPenetrationUg.toFixed(1)} µg</span>
            </div>
          </div>

          {/* Card 2: Estimated Useful Life */}
          <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200 hover-lift">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Estimated Service Life
              </span>
              <Clock className="w-4 h-4 text-teal-600" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-3xl font-black font-mono text-slate-900">
                ~{remainingDays}
              </span>
              <span className="text-xs font-semibold text-slate-500 font-mono">day{remainingDays > 1 ? 's' : ''} ({estimatedUsefulHours}h)</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
              Based on {pm25.toFixed(0)} µg/m³ ambient soot load. Replace immediately if breathing resistance increases or mask becomes damp.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-200 text-[10px] flex items-center gap-1.5 font-bold">
              {pm25 > 150 ? (
                <span className="text-rose-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> High soot: Discard every 2-3 days
                </span>
              ) : (
                <span className="text-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Normal saturation rate
                </span>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
