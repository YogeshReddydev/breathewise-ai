import React, { useState } from 'react';
import { FamilyGroup, FamilyMember } from '../../types/family';
import {
  Users,
  HeartPulse,
  Activity,
  AlertCircle,
  UserPlus,
  RotateCcw,
  Trash2,
  X,
  Info,
  Briefcase,
  GraduationCap,
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
    <div className="mt-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Family Profile &amp; Household Vulnerability Matrix
                {isDemo && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Simulation Demo
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Select a member to inspect tailored clinical risks &amp; activity guidelines
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            aria-label="Add new household member"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          >
            <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add Member</span>
          </button>

          {isDemo ? (
            <button
              onClick={onClearDemo}
              aria-label="Remove fictional demonstration profiles"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-red-950/40 text-slate-300 hover:text-red-300 border border-white/10 hover:border-red-500/30 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              title="Remove fictional demonstration profiles to create your own household"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Clear Demo</span>
            </button>
          ) : (
            <button
              onClick={onResetDemo}
              aria-label="Restore standard 4-generation demonstration profiles"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-white/10 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              title="Restore standard 4-generation demonstration profiles"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* Demonstration Profile Advisory Banner */}
      {isDemo && (
        <div className="mb-4 p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-amber-300">Demonstration Profiles Notice: </span>
            <span>
              Marcus, Elena, Leo, and Sophia are fictional profiles designed to demonstrate multi-generational vulnerability responses (pediatric asthma, senior cardiovascular, commuter, runner). They do not represent real personal data. Click &apos;Clear Demo&apos; to configure your real household.
            </span>
          </div>
        </div>
      )}

      {/* Member Cards Grid */}
      {family.members.length === 0 ? (
        <div className="p-8 text-center glass-panel border border-white/10 rounded-2xl">
          <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No Household Profiles Configured</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            You cleared the demonstration profiles. Click &apos;Add Member&apos; to configure voluntary health conditions and activity preferences for your family.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold"
            >
              + Add Household Member
            </button>
            {onResetDemo && (
              <button
                onClick={onResetDemo}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Restore Demo Profiles
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {family.members.map((member) => {
            const isSelected = member.id === selectedMemberId;
            const isHighRisk = member.vulnerability_tier === 'high_risk';
            const isSensitive = member.vulnerability_tier === 'sensitive';

            return (
              <div
                key={member.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`Select profile for ${member.name}, ${member.relationship}, ${member.vulnerability_tier}`}
                onClick={() => onSelectMember(member.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectMember(member.id);
                  }
                }}
                className={`p-4 rounded-xl text-left transition-all duration-200 border relative group cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                  isSelected
                    ? 'bg-[#0F1A3B] border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                    : 'bg-[#0A1128] border-white/5 hover:bg-[#0F1A3B] hover:border-white/15'
                }`}
              >
                {/* Delete member button on non-demo profiles or demo profiles */}
                {onRemoveMember && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveMember(member.id);
                    }}
                    aria-label={`Remove member ${member.name}`}
                    className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
                    title="Remove member"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}

                {/* Vulnerability pill & relationship */}
                <div className="flex items-center justify-between mb-2 pr-4">
                  <span className="text-xs text-slate-400 font-medium">{member.relationship}</span>
                  {isHighRisk && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                      High Risk
                    </span>
                  )}
                  {isSensitive && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      Sensitive
                    </span>
                  )}
                  {!isHighRisk && !isSensitive && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Standard
                    </span>
                  )}
                </div>

                {/* Name & Age */}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-extrabold text-white truncate">{member.name}</span>
                  <span className="text-xs text-slate-400">({member.age}y)</span>
                  {member.is_demo && (
                    <span className="text-[9px] text-amber-400/80 font-mono">[Demo]</span>
                  )}
                </div>

                {/* Key Health Condition */}
                <div className="mt-2 text-xs flex flex-wrap gap-1 min-h-[24px]">
                  {member.conditions.map((cond, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 capitalize"
                    >
                      {cond === 'asthma' && <HeartPulse className="w-3 h-3 text-red-400" />}
                      {cond === 'allergies' && <AlertCircle className="w-3 h-3 text-orange-400" />}
                      {cond === 'cardiovascular' && <HeartPulse className="w-3 h-3 text-purple-400" />}
                      {cond === 'outdoor_labor' && <Briefcase className="w-3 h-3 text-amber-400" />}
                      {cond === 'student_commute' && <GraduationCap className="w-3 h-3 text-cyan-400" />}
                      {cond === 'none' && <Activity className="w-3 h-3 text-emerald-400" />}
                      {cond.replace('_', ' ')}
                    </span>
                  ))}
                </div>

                {/* Notes */}
                {member.notes && (
                  <p className="mt-2 text-[11px] text-slate-400 italic line-clamp-1 border-t border-white/5 pt-1.5">
                    {member.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Member Modal */}
      {onAddMember && (
        <FamilyMemberModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddMember={onAddMember}
        />
      )}
    </div>
  );
};
