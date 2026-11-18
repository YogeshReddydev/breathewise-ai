import React from 'react';
import { AlertOctagon, Sun, ShieldAlert, Clock, AlertTriangle } from 'lucide-react';
import { AirQualityForecast } from '../../types/aqi';
import { formatTimeHour } from '../../utils/formatters';

interface OptimalWindowCardProps {
  forecast: AirQualityForecast | null;
}

export const OptimalWindowCard: React.FC<OptimalWindowCardProps> = ({ forecast }) => {
  if (!forecast || !forecast.best_window_start) {
    return (
      <div className="glass-panel p-5 mt-8 border border-white/10 bg-[#0D162B] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <h3 className="text-sm font-bold text-white">Outdoor Activity Window Analysis</h3>
            <p className="text-xs text-slate-400">Synthesizing 24-hour numerical atmospheric forecast curves...</p>
          </div>
        </div>
      </div>
    );
  }

  const isSevereSmog = (forecast.best_window_aqi && forecast.best_window_aqi > 200) || forecast.avg_next_24h_aqi > 200;
  const isModerateUnhealthy = (forecast.best_window_aqi && forecast.best_window_aqi > 150) || forecast.avg_next_24h_aqi > 150;

  const bestStart = formatTimeHour(forecast.best_window_start);
  const bestEnd = forecast.best_window_end ? formatTimeHour(forecast.best_window_end) : bestStart;

  const worstStart = forecast.worst_window_start ? formatTimeHour(forecast.worst_window_start) : 'Peak Hours';
  const worstEnd = forecast.worst_window_end ? formatTimeHour(forecast.worst_window_end) : '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      
      {/* Best Outdoor Activity Window */}
      <div className={`glass-panel p-5 border relative overflow-hidden transition-all ${
        isSevereSmog
          ? 'border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-[#0D162B] to-[#0D162B]'
          : isModerateUnhealthy
          ? 'border-yellow-500/30 bg-gradient-to-br from-yellow-950/20 via-[#0D162B] to-[#0D162B]'
          : 'border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-[#0D162B] to-[#0D162B]'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              isSevereSmog ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {isSevereSmog ? <AlertTriangle className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {isSevereSmog ? 'Lowest Exposure Interval' : 'Optimal Clean Air Window'}
              </h3>
              <p className={`text-[11px] ${isSevereSmog ? 'text-amber-400' : 'text-emerald-400'}`}>
                {isSevereSmog ? 'Severe Smog: No safe cardio window' : 'Safest window for outdoor activity & play'}
              </p>
            </div>
          </div>
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
            isSevereSmog
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
          }`}>
            {isSevereSmog ? 'Restricted' : 'Recommended'}
          </span>
        </div>

        <div className="my-3 flex items-baseline gap-2">
          <span className={`text-2xl font-black font-mono tracking-tight ${
            isSevereSmog ? 'text-amber-300' : 'text-emerald-400'
          }`}>
            {bestStart} &ndash; {bestEnd}
          </span>
          {forecast.best_window_aqi !== null && forecast.best_window_aqi !== undefined && (
            <span className="text-xs text-slate-400 font-mono">
              (Est. AQI ~{forecast.best_window_aqi})
            </span>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {isSevereSmog
            ? 'Even during the cleanest forecasted interval, fine particulate levels remain elevated due to winter inversion. High-intensity cardio should be relocated indoors with HEPA filtration.'
            : 'Particulate concentration is forecasted at its daily minimum. Optimal interval for outdoor walking, running, and children\'s playtime.'}
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
              <p className="text-[11px] text-orange-400">Traffic &amp; particulate accumulation</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40">
            Caution
          </span>
        </div>

        <div className="my-3 flex items-baseline gap-2">
          <span className="text-2xl font-black text-orange-400 font-mono tracking-tight">
            {worstStart} {worstEnd ? `– ${worstEnd}` : ''}
          </span>
          {forecast.worst_window_aqi !== null && forecast.worst_window_aqi !== undefined && (
            <span className="text-xs text-slate-400 font-mono">
              (Est. AQI ~{forecast.worst_window_aqi})
            </span>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Traffic emissions and meteorological stagnation concentrate fine particles near ground level. Sensitive family members and older adults should strictly avoid strenuous exertion.
        </p>
      </div>

    </div>
  );
};
