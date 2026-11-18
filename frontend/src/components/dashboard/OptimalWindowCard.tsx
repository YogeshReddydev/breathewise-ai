import React from 'react';
import { Sun, AlertOctagon, AlertTriangle, Clock, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { AirQualityForecast } from '../../types/aqi';
import { formatTimeHour } from '../../utils/formatters';

interface OptimalWindowCardProps {
  forecast: AirQualityForecast | null;
}

export const OptimalWindowCard: React.FC<OptimalWindowCardProps> = ({ forecast }) => {
  if (!forecast || !forecast.best_window_start) {
    return (
      <div id="activity-window" className="bg-white border border-slate-200 rounded-2xl p-5 mt-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-teal-600 animate-pulse" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Outdoor Activity Window Analysis</h3>
            <p className="text-xs text-slate-500">Synthesizing 24-hour numerical atmospheric forecast curves...</p>
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
    <div id="activity-window" className="mt-8">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Outdoor Activity &amp; Smog Exposure Planner</span>
        </h2>
        <p className="text-xs text-slate-500">
          Chronological atmospheric risk assessment derived from numerical dispersion trajectories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Best Outdoor Activity Window */}
        <div className={`rounded-2xl p-6 border shadow-sm transition-all ${
          isSevereSmog
            ? 'bg-amber-50/70 border-amber-300'
            : isModerateUnhealthy
            ? 'bg-yellow-50/70 border-yellow-300'
            : 'bg-emerald-50/70 border-emerald-300'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${
                isSevereSmog ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isSevereSmog ? <AlertTriangle className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isSevereSmog ? 'Lowest Exposure Period (Severe Smog)' : 'Optimal Clean Air Window'}
                </h3>
                <p className={`text-xs font-semibold ${isSevereSmog ? 'text-amber-800' : 'text-emerald-800'}`}>
                  {isSevereSmog ? 'Winter Smog Warning: No safe vigorous outdoor cardio' : 'Safest window for outdoor activity & play'}
                </p>
              </div>
            </div>
            <span className={`text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
              isSevereSmog
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
            }`}>
              {isSevereSmog ? 'Restricted' : 'Recommended'}
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
              isSevereSmog ? 'text-amber-900' : 'text-emerald-900'
            }`}>
              {bestStart} &ndash; {bestEnd}
            </span>
            {forecast.best_window_aqi !== null && forecast.best_window_aqi !== undefined && (
              <span className="text-xs text-slate-600 font-mono font-bold">
                (Est. AQI ~{forecast.best_window_aqi})
              </span>
            )}
          </div>

          <p className="text-xs text-slate-700 leading-relaxed mb-4">
            {isSevereSmog
              ? 'Even during this lowest forecasted period, ambient particulate pollution remains severe due to atmospheric boundary layer inversion. High-intensity cardio should be shifted indoors with HEPA air filtration.'
              : 'Ambient fine particulate concentration reaches its minimum diurnal concentration during this window. Optimal interval for aerobic jogging, children playground visits, and rapid house air purging.'}
          </p>

          {/* Activity Suitability Checklist */}
          <div className="pt-3 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              {!isSevereSmog && !isModerateUnhealthy ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="text-slate-700">Vigorous Cardio: <strong>{!isSevereSmog && !isModerateUnhealthy ? 'Allowed' : 'Avoid'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              {!isSevereSmog ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="text-slate-700">Kids Recess: <strong>{!isSevereSmog ? 'Safe' : 'Indoors Only'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-slate-700">Essential Errands: <strong>Permitted</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              {!isSevereSmog ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span className="text-slate-700">Window Airing: <strong>{!isSevereSmog ? '15-30 Min' : 'Keep Sealed'}</strong></span>
            </div>
          </div>
        </div>

        {/* Peak Exposure Window */}
        <div className="bg-rose-50/70 rounded-2xl p-6 border border-rose-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-800">
                <AlertOctagon className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Peak Exposure Window</h3>
                <p className="text-xs font-semibold text-rose-800">Vehicle rush hour &amp; meteorological accumulation</p>
              </div>
            </div>
            <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300">
              High Caution
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-900 font-mono tracking-tight">
              {worstStart} {worstEnd ? `– ${worstEnd}` : ''}
            </span>
            {forecast.worst_window_aqi !== null && forecast.worst_window_aqi !== undefined && (
              <span className="text-xs text-slate-600 font-mono font-bold">
                (Est. AQI ~{forecast.worst_window_aqi})
              </span>
            )}
          </div>

          <p className="text-xs text-slate-700 leading-relaxed mb-4">
            Vehicle tailpipe soot, nocturnal cooling, and atmospheric boundary stagnation cause acute particulate accumulation near breathing zones. Sensitive family members, children, and seniors should avoid all outdoor physical exertion.
          </p>

          {/* Peak Period Precautions */}
          <div className="pt-3 border-t border-rose-200/80 space-y-1.5 text-xs text-slate-700">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Keep residential windows sealed; set HVAC to internal recirculation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Wear snug-fitting N95/FFP2 respirator if roadside walking exceeds 10 minutes</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
