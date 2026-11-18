import React, { useState } from 'react';
import { FamilyGroup, FamilyMember } from '../../types/family';
import {
  Users,
  HeartPulse,
  Activity,
  AlertCircle,
  UserPlus,
  Trash2,
  Info,
  CheckCircle2,
  Baby,
} from 'lucide-react';
import { FamilyMemberModal } from './FamilyMemberModal';

interface ProfileSelectorProps {
  family: FamilyGroup | null;
  selectedMemberId: string | null;
  onSelectMember: (id: string) => void;
  onAddMember?: (member: FamilyMember) => void;
  onOpenAddModal?: () => void;
  onResetDemo?: () => void;
  onClearDemo?: () => void;
  onRemoveMember?: (id: string) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  family,
  selectedMemberId,
  onSelectMember,
  onAddMember,
  onOpenAddModal,
  onResetDemo,
  onClearDemo,
  onRemoveMember,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!family) return null;

  const isDemo = family.is_demo;

  const handleOpenAdd = () => {
    if (onOpenAddModal) {
      onOpenAddModal();
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <div id="family-profiles" className="mt-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
              <Users className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Family Health &amp; Vulnerability Profiles</span>
                {isDemo && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    Fictional Demo
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">
                Personalized multi-generational respiratory health advisories tailored to age, asthma, and cardio history
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            aria-label="Add new household member"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition-all shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add Member</span>
          </button>

          {isDemo ? (
            <button
              onClick={onClearDemo}
              aria-label="Remove fictional demonstration profiles"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-800 border border-slate-200 text-xs font-semibold transition-all"
              title="Remove fictional demonstration profiles to create your own household"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Clear Demo</span>
            </button>
          ) : (
            <button
              onClick={onResetDemo}
              aria-label="Restore standard 4-generation demonstration profiles"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-all"
            >
              <span>Reset Demo Profiles</span>
            </button>
          )}
        </div>
      </div>

      {/* Demo Profile Disclosure Banner */}
      {isDemo && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs flex items-center gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="leading-relaxed">
            <strong>Demonstration Roster:</strong> Marcus, Elena, Leo, and Sophia are fictional profiles designed to showcase clinical sensitivity (pediatric asthma, senior cardiovascular risk, outdoor running, commute). They do not represent real personal data. Click &apos;Clear Demo&apos; to configure your household.
          </span>
        </div>
      )}

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {family.members.map((member) => {
          const isSelected = member.id === selectedMemberId;
          const isHighRisk = member.vulnerability_tier === 'high_risk';
          const isSensitive = member.vulnerability_tier === 'sensitive';

          return (
            <div
              key={member.id}
              onClick={() => onSelectMember(member.id)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-50/70 border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{member.name}</span>
                    <span className="text-[11px] text-slate-500 font-medium">({member.relationship})</span>
                  </div>
                  {onRemoveMember && !isDemo && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveMember(member.id);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remove profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-slate-600">Age: <strong>{member.age}</strong></span>
                  <span className="text-slate-300">&bull;</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isHighRisk
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : isSensitive
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {member.vulnerability_tier.replace('_', ' ')}
                  </span>
                </div>

                {/* Health Conditions Pills */}
                {member.conditions.length > 0 && member.conditions[0] !== 'none' && (
                  <div className="flex flex-wrap gap-1 my-2">
                    {member.conditions.map((cond) => (
                      <span
                        key={cond}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize border border-slate-200"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                  {member.notes || 'Routine daily schedule'}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px] capitalize">
                  {member.activity_preference.replace('_', ' ')}
                </span>
                <span className={`text-[11px] font-bold ${isSelected ? 'text-emerald-800' : 'text-slate-500'}`}>
                  {isSelected ? '✓ Active Profile' : 'Inspect Advisories →'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Internal Modal */}
      {isModalOpen && onAddMember && (
        <FamilyMemberModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddMember={onAddMember}
        />
      )}
    </div>
  );
};
