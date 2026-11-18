import React from 'react';
import { FamilyMember } from '../types';
import { Users, HeartPulse, AlertCircle, PlusCircle, CheckCircle2 } from 'lucide-react';
import { getRiskLevelBadge } from '../utils/aqi-theme';

interface FamilyMatrixProps {
  members: FamilyMember[];
  activeMemberId?: string;
  currentAqi: number;
  onSelectMember: (id: string) => void;
  onOpenModal: () => void;
}

export const FamilyMatrix: React.FC<FamilyMatrixProps> = ({
  members,
  activeMemberId,
  currentAqi,
  onSelectMember,
  onOpenModal,
}) => {
  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-navy-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Family Vulnerability Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Personalized atmospheric susceptibility and threshold monitoring
            </p>
          </div>
        </div>
        <button
          onClick={onOpenModal}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 hover:bg-cyan-900/80 transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        {members.map((member) => {
          const isActive = member.id === activeMemberId;
          const isBreached = currentAqi >= member.alert_threshold_aqi;

          return (
            <div
              key={member.id}
              onClick={() => onSelectMember(member.id)}
              className={`rounded-2xl p-4 transition-all cursor-pointer border relative overflow-hidden ${
                isActive
                  ? 'bg-navy-850/90 border-cyan-500/60 shadow-glow-cyan ring-1 ring-cyan-500/50'
                  : 'bg-navy-900/60 border-navy-800 hover:border-navy-700 hover:bg-navy-850/50'
              }`}
            >
              {/* Active Indicator check */}
              {isActive && (
                <div className="absolute top-3 right-3 text-cyan-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}

              <div className="flex items-baseline justify-between mb-1 pr-5">
                <h4 className="font-bold text-white text-base truncate">{member.name}</h4>
                <span className="text-xs text-slate-400 font-medium">{member.age} yrs</span>
              </div>

              <p className="text-xs text-cyan-300 font-medium mb-3">{member.relationship}</p>

              {/* Conditions Badges */}
              <div className="flex flex-wrap gap-1.5 mb-3 min-h-[48px]">
                {member.conditions.length > 0 ? (
                  member.conditions.map((cond, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-navy-800 text-slate-300 border border-navy-700"
                    >
                      {cond.replace('_', ' ')}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-navy-950 text-slate-400">
                    Standard Tolerance
                  </span>
                )}
              </div>

              {/* Threshold Status */}
              <div className="pt-2 border-t border-navy-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Threshold: {member.alert_threshold_aqi}</span>
                {isBreached ? (
                  <span className="flex items-center gap-1 text-rose-400 font-bold">
                    <AlertCircle className="w-3 h-3" />
                    Breached
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium">Safe</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
