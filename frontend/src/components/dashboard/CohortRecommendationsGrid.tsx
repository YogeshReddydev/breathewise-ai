import React from 'react';
import {
  Users,
  Baby,
  GraduationCap,
  Briefcase,
  HardHat,
  Home,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { StructuredRecommendation } from '../../types/recommendations';

interface CohortRecommendationsGridProps {
  cohorts: StructuredRecommendation[] | undefined;
}

export const CohortRecommendationsGrid: React.FC<CohortRecommendationsGridProps> = ({ cohorts }) => {
  if (!cohorts || cohorts.length === 0) return null;

  const getCohortIcon = (cohort: string) => {
    switch (cohort) {
      case 'children':
        return <Baby className="w-5 h-5 text-emerald-400" />;
      case 'older_adults':
        return <Users className="w-5 h-5 text-purple-400" />;
      case 'students':
        return <GraduationCap className="w-5 h-5 text-cyan-400" />;
      case 'daily_commuters':
        return <Briefcase className="w-5 h-5 text-amber-400" />;
      case 'outdoor_workers':
        return <HardHat className="w-5 h-5 text-orange-400" />;
      default:
        return <Home className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            Target Cohort Clinical Directives
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          5-Dimension Structured Evidence &bull; EPA &amp; CPCB Aligned
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cohorts.map((item, idx) => (
          <div
            key={idx}
            className="glass-panel p-5 flex flex-col justify-between border border-white/10 hover:border-white/20 transition-all text-xs"
          >
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/10 mb-3">
                <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
                  {getCohortIcon(item.cohort)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{item.target_group}</h3>
                  <span className="text-[10px] text-cyan-400/90 font-mono">
                    {item.supporting_measurement}
                  </span>
                </div>
              </div>

              {/* Recommended Action */}
              <div className="mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-1">
                  Prescribed Action
                </span>
                <p className="text-slate-100 font-semibold leading-relaxed">
                  {item.recommended_action}
                </p>
              </div>

              {/* Rationale */}
              <div className="mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                  Physiological Reason
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {item.reason}
                </p>
              </div>

              {/* Expected Benefit */}
              <div className="mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 block mb-0.5">
                  Expected Benefit
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {item.expected_benefit}
                </p>
              </div>
            </div>

            {/* Limitations & Caveat */}
            <div className="pt-3 border-t border-white/10 mt-2 bg-slate-900/30 p-2.5 rounded-lg border border-white/5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">
                Practical Limitations &amp; Caveats
              </span>
              <p className="text-slate-400 text-[10px] leading-tight">
                {item.limitations}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
