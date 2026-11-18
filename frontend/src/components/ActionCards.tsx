import React from 'react';
import { RecommendationResponse, PersonalizedAction } from '../types';
import { getRiskLevelBadge } from '../utils/aqi-theme';
import {
  ShieldAlert,
  Wind,
  Footprints,
  Compass,
  AlertTriangle,
  Info,
  CheckCircle,
  LucideIcon,
} from 'lucide-react';

interface ActionCardsProps {
  recommendations: RecommendationResponse;
}

export const ActionCards: React.FC<ActionCardsProps> = ({ recommendations }) => {
  const riskBadge = getRiskLevelBadge(recommendations.risk_level);

  return (
    <div className="space-y-6">
      {/* Risk Summary Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-navy-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Personalized Risk Analysis
            </span>
            {recommendations.member_name && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                Focus: {recommendations.member_name}
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Vulnerability Level: <span className={riskBadge.text}>{recommendations.risk_level}</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">{recommendations.ai_summary}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-2.5 rounded-2xl bg-navy-900 border border-navy-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Score</span>
            <span className={`text-2xl font-black ${riskBadge.text}`}>
              {recommendations.risk_score}
              <span className="text-xs font-normal text-slate-400">/100</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4 Pillars of Prevention Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Mask Guidance */}
        <div className="glass-panel rounded-2xl p-5 border border-navy-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-cyan-400">
              <ShieldAlert className="w-5 h-5" />
              <h4 className="font-bold text-white text-sm">Respirator / Mask</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {recommendations.mask_recommendation}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-navy-800/80">
            <span className="text-[11px] text-cyan-400 font-semibold uppercase tracking-wider">
              Certification standard: N95 / FFP2
            </span>
          </div>
        </div>

        {/* Pillar 2: Ventilation & Window Opening */}
        <div className="glass-panel rounded-2xl p-5 border border-navy-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <Wind className="w-5 h-5" />
              <h4 className="font-bold text-white text-sm">Window Ventilation</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {recommendations.ventilation.indoor_air_advice}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-navy-800/80">
            <span className="text-[11px] text-emerald-400 font-semibold">
              {recommendations.ventilation.optimal_window_opening_hours || 'Keep sealed'}
            </span>
          </div>
        </div>

        {/* Pillar 3: Air Purifier Mode */}
        <div className="glass-panel rounded-2xl p-5 border border-navy-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-cyan-400">
              <Compass className="w-5 h-5" />
              <h4 className="font-bold text-white text-sm">HEPA Purifier</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Indoor air scrub level recommended for living quarters and bedrooms.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-navy-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Purifier Setting:</span>
            <span className="text-xs font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
              {recommendations.ventilation.purifier_mode}
            </span>
          </div>
        </div>

        {/* Pillar 4: Exercise & Commute */}
        <div className="glass-panel rounded-2xl p-5 border border-navy-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <Footprints className="w-5 h-5" />
              <h4 className="font-bold text-white text-sm">Outdoor Activity</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {recommendations.outdoor_activity.commute_guidance}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-navy-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Max Exertion:</span>
            <span className="text-xs font-bold text-emerald-300">
              {recommendations.outdoor_activity.recommended_duration_max_minutes} min
            </span>
          </div>
        </div>
      </div>

      {/* Discrete Clinical Action Cards */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Prioritized Action Directives
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.actions.map((act) => {
            const isCritical = act.urgency === 'critical';
            const isWarning = act.urgency === 'warning';

            return (
              <div
                key={act.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCritical
                    ? 'bg-rose-950/40 border-rose-800/60 shadow-sm'
                    : isWarning
                    ? 'bg-amber-950/30 border-amber-800/50'
                    : 'bg-navy-900/60 border-navy-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isCritical
                        ? 'bg-rose-900/50 text-rose-300'
                        : isWarning
                        ? 'bg-amber-900/50 text-amber-300'
                        : 'bg-cyan-950 text-cyan-300'
                    }`}
                  >
                    {isCritical ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm tracking-tight">{act.title}</h5>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed font-normal">
                      {act.description}
                    </p>
                    <div className="mt-2 text-[11px] text-slate-400 italic">
                      <span className="font-semibold text-slate-300">Rationale: </span>
                      {act.rationale}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
