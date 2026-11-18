import React from 'react';
import { Sparkles, AlertOctagon, Sun, ShieldCheck } from 'lucide-react';
import { AirQualityForecast } from '../../types/aqi';
import { formatTimeHour } from '../../utils/formatters';

interface OptimalWindowCardProps {
  forecast: AirQualityForecast | null;
}

export const OptimalWindowCard: React.FC<OptimalWindowCardProps> = ({ forecast }) => {
  const bestStart = forecast?.best_window_start ? formatTimeHour(forecast.best_window_start) : '06:00 AM';
  const bestEnd = forecast?.best_window_end ? formatTimeHour(forecast.best_window_end) : '09:00 AM';

  const worstStart = forecast?.worst_window_start ? formatTimeHour(forecast.worst_window_start) : '02:00 PM';
  const worstEnd = forecast?.worst_window_end ? formatTimeHour(forecast.worst_window_end) : '06:00 PM';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      
      {/* Best Outdoor Activity Window */}
      <div className="glass-panel p-5 border border-emerald-500/30 relative overflow-hidden bg-gradient-to-br from-emerald-950/20 via-[#0D162B] to-[#0D162B]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Optimal Clean Air Window</h3>
              <p className="text-[11px] text-emerald-400">Safest time for outdoor cardio & play</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Recommended
          </span>
        </div>

        <div className="my-3 flex items-baseline gap-2">
          <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
            {bestStart} &ndash; {bestEnd}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Particulate concentration is forecasted at daily low. Optimal window for endurance running, dog walking, and children&apos;s outdoor playtime.
        </p>
      </div>

      {/* Peak Exposure Window */}
      <div className="glass-panel p-5 border border-orange-500/30 relative overflow-hidden bg-gradient-to-br from-orange-950/20 via-[#0D162B] to-[#0D162B]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Peak Pollution Window</h3>
              <p className="text-[11px] text-orange-400">Ozone & traffic particulate surge</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40">
            Caution
          </span>
        </div>

        <div className="my-3 flex items-baseline gap-2">
          <span className="text-2xl font-black text-orange-400 font-mono tracking-tight">
            {worstStart} &ndash; {worstEnd}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Higher ambient temperatures and traffic emissions trigger photo-chemical ozone formation. Sensitive family members should avoid strenuous outdoor exertion.
        </p>
      </div>

    </div>
  );
};
