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
  HelpCircle,
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
    advisory.risk_score >= 75
      ? '#EF4444' // Red
      : advisory.risk_score >= 50
      ? '#F97316' // Orange
      : advisory.risk_score >= 25
      ? '#F59E0B' // Amber
      : '#10B981'; // Emerald

  return (
    <div className="glass-panel p-6 mt-4 border border-white/10">
      
      {/* Header with Risk Meter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-white">
              {selectedMember.name}&apos;s Personalized Health Guidance
            </span>
            <span
              className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full border"
              style={{
                backgroundColor: `${riskColor}15`,
                color: riskColor,
                borderColor: `${riskColor}30`,
              }}
            >
              {advisory.activity_safety} Activity Safety
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {selectedMember.relationship} &bull; {selectedMember.age} years old &bull; Profile Notes:{' '}
            {selectedMember.notes || 'Standard daily routine'}
          </p>
        </div>

        {/* Risk Score Pill */}
        <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-xl border border-white/5">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
              Vulnerability Risk Score
            </span>
            <span className="text-xs text-slate-300 font-mono">Normalized 0-100</span>
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
      <div className="my-5 p-4 rounded-xl bg-slate-900/60 border border-white/10 flex items-start gap-3">
        <HeartHandshake className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Clinical Health Directive
          </h4>
          <p className="text-sm font-semibold text-white mt-0.5 leading-snug">
            {advisory.key_recommendation}
          </p>
        </div>
      </div>

      {/* 5-Dimension Structured Evidence Grid */}
      {(advisory.recommended_action || advisory.reason) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5 p-4 rounded-xl bg-slate-900/40 border border-white/5 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-0.5">
              1. Recommended Action
            </span>
            <p className="text-slate-200">{advisory.recommended_action || advisory.key_recommendation}</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
              2. Physiological Rationale
            </span>
            <p className="text-slate-300">{advisory.reason || 'Calculated based on elevated ambient fine particulates.'}</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block mb-0.5">
              3. Supporting Telemetry Measurement
            </span>
            <p className="text-slate-300 font-mono text-[11px]">{advisory.supporting_measurement || 'Sourced live from Open-Meteo atmospheric sensors.'}</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block mb-0.5">
              4. Expected Practical Benefit
            </span>
            <p className="text-slate-300">{advisory.expected_benefit || 'Reduces respiratory alveolar deposition and airway resistance.'}</p>
          </div>

          <div className="md:col-span-2 pt-2 border-t border-white/5">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-0.5">
              5. Relevant Practical Limitations
            </span>
            <p className="text-slate-400 text-[11px]">{advisory.limitations || 'Advisory guidance based on environmental standards; individual hyper-reactivity may vary.'}</p>
          </div>
        </div>
      )}

      {/* Two Column Directives: Actions & Symptoms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Recommended Action Checklist */}
        <div className="bg-slate-900/40 rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Prescribed Activity &amp; Mask Protocol
            </h4>
          </div>

          <div className="space-y-2.5">
            {/* Outdoor exercise permit */}
            <div className="flex items-center gap-2 text-xs">
              {advisory.outdoor_exercise_allowed ? (
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                  <X className="w-3.5 h-3.5" />
                </div>
              )}
              <span className="text-slate-300">
                Outdoor Vigorous Cardio:{' '}
                <strong className={advisory.outdoor_exercise_allowed ? 'text-emerald-400' : 'text-red-400'}>
                  {advisory.outdoor_exercise_allowed ? 'Permitted & Safe' : 'Restricted / Reschedule Indoors'}
                </strong>
              </span>
            </div>

            {/* Mask requirement */}
            <div className="flex items-center gap-2 text-xs">
              {advisory.mask_recommended ? (
                <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
              <span className="text-slate-300">
                Particulate Mask:{' '}
                <strong className="text-slate-100">
                  {advisory.mask_recommended
                    ? advisory.mask_type || 'N95 / KN95 Respirator Required'
                    : 'Not required today'}
                </strong>
              </span>
            </div>

            {advisory.actions.map((action, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Symptoms to Monitor */}
        <div className="bg-slate-900/40 rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-orange-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Symptoms to Monitor
            </h4>
          </div>

          <p className="text-xs text-slate-400 mb-3">
            Be alert for early onset signs of respiratory distress or cardiovascular strain:
          </p>

          <div className="flex flex-wrap gap-2">
            {advisory.symptoms_to_watch.map((symptom, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-300 border border-orange-500/20"
              >
                {symptom}
              </span>
            ))}
          </div>

          {selectedMember.conditions.includes('asthma' as any) && (
            <div className="mt-4 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Ensure quick-relief Albuterol inhaler is within immediate reach at school or workplace.</span>
            </div>
          )}
        </div>

      </div>

      {/* Prominent Medical Disclaimer */}
      <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-slate-400 flex items-start gap-2.5 bg-slate-900/30 p-3 rounded-xl border border-white/5">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          <strong>Medical Notice:</strong> {recommendations.medical_disclaimer || 'BreatheWise AI guidance is advisory and educational based on EPA and CPCB environmental guidelines. It does not replace clinical diagnosis. Consult medical providers for health emergencies.'}
        </span>
      </div>

    </div>
  );
};
