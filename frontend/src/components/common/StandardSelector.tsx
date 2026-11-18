import React from 'react';
import { AQIStandard } from '../../types/aqi';

interface StandardSelectorProps {
  standard: AQIStandard;
  onSelectStandard: (std: AQIStandard) => void;
  size?: 'sm' | 'md';
}

export const StandardSelector: React.FC<StandardSelectorProps> = ({
  standard,
  onSelectStandard,
  size = 'md',
}) => {
  const padding = size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs';

  return (
    <div
      role="group"
      aria-label="AQI Standard Selector"
      className="flex items-center gap-1.5 p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl border border-slate-200 text-xs"
    >
      <span className="text-[11px] text-slate-500 px-2 font-semibold hidden sm:inline">
        Standard:
      </span>

      <button
        type="button"
        aria-pressed={standard === 'cpcb'}
        onClick={() => onSelectStandard('cpcb')}
        className={`${padding} rounded-lg font-bold transition-all cursor-pointer ${
          standard === 'cpcb'
            ? 'bg-white text-emerald-900 border border-slate-200/90 shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        }`}
      >
        🇮🇳 CPCB NAQI (India)
      </button>

      <button
        type="button"
        aria-pressed={standard === 'us_epa'}
        onClick={() => onSelectStandard('us_epa')}
        className={`${padding} rounded-lg font-bold transition-all cursor-pointer ${
          standard === 'us_epa'
            ? 'bg-white text-teal-900 border border-slate-200/90 shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        }`}
      >
        🇺🇸 US EPA
      </button>

      <button
        type="button"
        aria-pressed={standard === 'european'}
        onClick={() => onSelectStandard('european')}
        className={`${padding} rounded-lg font-bold transition-all cursor-pointer ${
          standard === 'european'
            ? 'bg-white text-purple-900 border border-slate-200/90 shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        }`}
      >
        🇪🇺 European
      </button>
    </div>
  );
};
