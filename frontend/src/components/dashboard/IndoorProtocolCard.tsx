import React, { useState } from 'react';
import { Shield, Wind, Fan, CheckCircle2, Flame, AlertCircle, Sparkles, CheckSquare, Square } from 'lucide-react';
import { IndoorProtocol } from '../../types/recommendations';

interface IndoorProtocolCardProps {
  protocol: IndoorProtocol | null | undefined;
}

export const IndoorProtocolCard: React.FC<IndoorProtocolCardProps> = ({ protocol }) => {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    purifier: true,
    windows: false,
    cooking: true,
    plants: true,
  });

  if (!protocol) return null;

  const toggleCheck = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev [key] }));
  };

  return (
    <div id="indoor-air" className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm mt-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-800">
            <Shield className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Indoor Clean Air &amp; Haven Protocol
            </h2>
            <p className="text-xs text-slate-500">
              WHO clinical residential guidelines to protect indoor breathing spaces from atmospheric ingress
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          WHO Indoor Guidance
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Natural Ventilation Guidance */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl shrink-0 ${
            protocol.windows_open
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500">
              Natural Ventilation
            </span>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              Windows:{' '}
              <span className={protocol.windows_open ? 'text-emerald-700' : 'text-amber-800'}>
                {protocol.windows_open ? 'Open for Fresh Air Cross-Ventilation' : 'Keep Closed & Gasket-Sealed'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {protocol.ventilation_guide}
            </p>
          </div>
        </div>

        {/* HEPA Filtration Setting */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-teal-100 text-teal-800 shrink-0">
            <Fan className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500">
              True HEPA Air Filtration
            </span>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              Recommended Setting:{' '}
              <span className="text-teal-800 font-mono font-bold">{protocol.purifier_setting}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Maintain continuous air scrubbing (CADR &ge; 250 m³/h) in bedrooms and living rooms to achieve &gt;80% sub-micron reduction.
            </p>
          </div>
        </div>

      </div>

      {/* Cooking & Combustion Precautions Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200 flex items-start gap-3">
          <Flame className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <strong className="block text-slate-900 font-semibold mb-0.5">Cooking &amp; Indoor Combustion Precautions</strong>
            Always operate exhaust hood at high speed when using gas burners. Avoid dry frying, roasting spices, burning incense, or lighting candles during outdoor pollution alerts.
          </div>
        </div>

        {/* Household Clean-Air Checklist */}
        <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200">
          <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Household Clean-Air Checklist</span>
          </h4>
          <div className="space-y-1.5 text-xs text-slate-700">
            <button
              onClick={() => toggleCheck('purifier')}
              className="flex items-center gap-2 text-left hover:text-emerald-900 w-full"
            >
              {checklist.purifier ? (
                <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span className={checklist.purifier ? 'line-through text-slate-500' : 'font-medium'}>
                HEPA Purifier powered on &amp; filter checked
              </span>
            </button>
            <button
              onClick={() => toggleCheck('windows')}
              className="flex items-center gap-2 text-left hover:text-emerald-900 w-full"
            >
              {checklist.windows ? (
                <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span className={checklist.windows ? 'line-through text-slate-500' : 'font-medium'}>
                Window frame draft seals and weatherstripping intact
              </span>
            </button>
            <button
              onClick={() => toggleCheck('cooking')}
              className="flex items-center gap-2 text-left hover:text-emerald-900 w-full"
            >
              {checklist.cooking ? (
                <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span className={checklist.cooking ? 'line-through text-slate-500' : 'font-medium'}>
                Kitchen range hood exhaust vented externally
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Action Banner */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex items-center gap-3 mt-4">
        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
        <span className="text-xs text-slate-700">
          <strong className="text-slate-900 font-semibold">Priority Action:</strong> {protocol.recommended_action}
        </span>
      </div>

    </div>
  );
};
