import React from 'react';
import {
  Users,
  Baby,
  GraduationCap,
  Briefcase,
  HardHat,
  Home,
  Shield,
  ArrowRight,
  Info,
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
        return <Baby className="w-5 h-5 text-emerald-700" />;
      case 'older_adults':
        return <Users className="w-5 h-5 text-purple-700" />;
      case 'students':
        return <GraduationCap className="w-5 h-5 text-teal-700" />;
      case 'daily_commuters':
        return <Briefcase className="w-5 h-5 text-amber-700" />;
      case 'outdoor_workers':
        return <HardHat className="w-5 h-5 text-orange-700" />;
      default:
        return <Home className="w-5 h-5 text-emerald-700" />;
    }
  };

  return (
    <div id="cohort-guidance" className="mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
            <Shield className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Cohort-Specific Clinical Directives
            </h2>
            <p className="text-xs text-slate-500">
              5-dimension structured recommendations aligned with US EPA, CPCB, and WHO clinical thresholds
            </p>
          </div>
        </div>
        <span className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
          Tailored demographic exposure guidance
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cohorts.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-sm hover:shadow text-xs"
          >
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-3">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  {getCohortIcon(item.cohort)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{item.target_group}</h3>
                  <span className="text-[10px] text-teal-700 font-mono font-medium">
                    {item.supporting_measurement}
                  </span>
                </div>
              </div>

              {/* Recommended Action */}
              <div className="mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block mb-1">
                  Prescribed Action
                </span>
                <p className="text-slate-900 font-semibold leading-relaxed">
                  {item.recommended_action}
                </p>
              </div>

              {/* Physiological Reason */}
              <div className="mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">
                  Physiological Mechanism
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {item.reason}
                </p>
              </div>

              {/* Expected Benefit */}
              <div className="mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700 block mb-0.5">
                  Expected Benefit
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {item.expected_benefit}
                </p>
              </div>
            </div>

            {/* Practical Limitations & Caveats */}
            <div className="pt-3 border-t border-slate-100 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">
                Practical Caveat
              </span>
              <p className="text-slate-600 text-[10px] leading-tight">
                {item.limitations}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
