import React from 'react';
import { FamilyMember } from '../../types/family';
import { ComprehensiveRecommendation, MemberAdvisory } from '../../types/recommendations';
import {
  ShieldAlert,
  Check,
  X,
  AlertTriangle,
  Eye,
  Activity,
  HeartHandshake,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface MemberHealthAdvisoriesProps {
  selectedMember: FamilyMember | undefined;
  recommendations: ComprehensiveRecommendation | null;
}

export const MemberHealthAdvisories: React.FC<MemberHealthAdvisoriesProps> = ({
  selectedMember,
  recommendations,
}) => {
  if (!selectedMember || !recommendations) return null;

  const advisory: MemberAdvisory | undefined =
    recommendations.member_advisories.find(
      (adv) =>
        adv.member_id === selectedMember.id ||
        adv.member_name.toLowerCase().includes(selectedMember.name.toLowerCase()) ||
        selectedMember.name.toLowerCase().includes(adv.member_name.toLowerCase())
    ) || recommendations.member_advisories[0];

  if (!advisory) return null;

  const riskColor =
    advisory.risk_score >= 70
      ? '#DC2626' // Red
      : advisory.risk_score >= 50
      ? '#EA580C' // Orange
      : advisory.risk_score >= 25
      ? '#D97706' // Amber
      : '#16A34A'; // Green

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm mt-4">
      
      {/* Header with Risk Meter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-extrabold text-slate-900">
              {selectedMember.name}&apos;s Personalized Health Advisory
            </span>
            <span
              className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${riskColor}12`,
                color: riskColor,
                borderColor: `${riskColor}40`,
              }}
            >
              {advisory.activity_safety} Activity Safety
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {selectedMember.relationship} &bull; {selectedMember.age} years old &bull; Profile Notes:{' '}
            {selectedMember.notes || 'Standard daily routine'}
          </p>
        </div>

        {/* Risk Score Pill */}
        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
              Vulnerability Risk Score
            </span>
            <span className="text-xs text-slate-600 font-mono">Clinical 0-100</span>
          </div>
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center font-mono font-black text-2xl border"
            style={{
              backgroundColor: `${riskColor}15`,
              color: riskColor,
              borderColor: `${riskColor}40`,
            }}
          >
            {advisory.risk_score}
          </div>
        </div>
      </div>

      {/* Primary Key Recommendation Callout */}
      <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
        <HeartHandshake className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Environmental Health Advisory
          </h4>
          <p className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
            {advisory.key_recommendation}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            {advisory.recommended_action}
          </p>
        </div>
      </div>

      {/* Grid of Clinical Guidance Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        
        {/* Physiological Mechanism & Reason */}
        <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-emerald-700" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Physiological Mechanism
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {advisory.reason}
          </p>
          <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-500">
            {advisory.supporting_measurement}
          </div>
        </div>

        {/* Expected Benefit & Limitations */}
        <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-teal-700" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Anticipated Health Protection
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {advisory.expected_benefit}
          </p>
          <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-500 leading-tight">
            <strong>Clinical Boundary:</strong> {advisory.limitations}
          </div>
        </div>

      </div>

      {/* Action Items & Symptoms to Monitor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        
        {/* Action Items */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>Recommended Protective Action Items</span>
          </h4>

          {/* Outdoor Vigorous Cardio Indicator */}
          <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-slate-50 border border-slate-200">
            {advisory.outdoor_exercise_allowed ? (
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                <X className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="text-slate-800">
              Outdoor Vigorous Cardio:{' '}
              <strong className={advisory.outdoor_exercise_allowed ? 'text-emerald-700' : 'text-rose-700'}>
                {advisory.outdoor_exercise_allowed ? 'Permitted & Safe' : 'Restricted / Reschedule Indoors'}
              </strong>
            </span>
          </div>

          {/* Mask Requirement Indicator */}
          <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-slate-50 border border-slate-200">
            {advisory.mask_recommended ? (
              <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="text-slate-800">
              Particulate Mask:{' '}
              <strong className="text-slate-900">
                {advisory.mask_recommended
                  ? advisory.mask_type || 'N95 / KN95 Respirator Required'
                  : 'Not required today'}
              </strong>
            </span>
          </div>

          {advisory.actions.map((action, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
              <span>{action}</span>
            </div>
          ))}
        </div>

        {/* Symptoms Watchlist */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-teal-700" />
            <span>Symptoms Watchlist for {selectedMember.name}</span>
          </h4>
          <p className="text-[11px] text-slate-500 mb-2">
            Be alert for early onset signs of respiratory distress or pulmonary strain:
          </p>
          <div className="space-y-1.5">
            {advisory.symptoms_to_watch.map((symp, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{symp}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Clinical Disclaimer Guardrail */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-start gap-2 leading-relaxed">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <strong>Medical Disclaimer:</strong> BreatheWise AI provides environmental health risk estimates derived from ambient atmospheric telemetry and published clinical guidelines (WHO/EPA). It does not substitute for licensed medical examination. Consult a qualified physician for clinical treatment or if persistent breathing difficulties occur.
        </span>
      </div>

    </div>
  );
};
