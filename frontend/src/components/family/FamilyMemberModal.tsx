import React, { useState, useEffect } from 'react';
import { X, UserPlus, Heart, Activity } from 'lucide-react';
import {
  ActivityPreference,
  FamilyMember,
  HealthCondition,
  TargetCohort,
  VulnerabilityTier,
} from '../../types/family';

interface FamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: FamilyMember) => void;
}

export const FamilyMemberModal: React.FC<FamilyMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
}) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Family Member');
  const [age, setAge] = useState<number>(28);
  const [conditions, setConditions] = useState<HealthCondition[]>(['none']);
  const [activity, setActivity] = useState<ActivityPreference>('light_walking');
  const [cohort, setCohort] = useState<TargetCohort>('general_household');
  const [notes, setNotes] = useState('');

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleCondition = (cond: HealthCondition) => {
    if (cond === 'none') {
      setConditions(['none']);
      return;
    }
    const filtered = conditions.filter((c) => c !== 'none');
    if (filtered.includes(cond)) {
      const updated = filtered.filter((c) => c !== cond);
      setConditions(updated.length > 0 ? updated : ['none']);
    } else {
      setConditions([...filtered, cond]);
    }
  };

  const calculateTier = (): VulnerabilityTier => {
    if (
      conditions.includes('asthma') ||
      conditions.includes('cardiovascular') ||
      conditions.includes('copd') ||
      age < 10 ||
      age >= 65
    ) {
      return 'high_risk';
    }
    if (
      conditions.includes('allergies') ||
      conditions.includes('pregnancy') ||
      conditions.includes('outdoor_labor') ||
      (age >= 10 && age < 18)
    ) {
      return 'sensitive';
    }
    return 'standard';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: FamilyMember = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      relationship,
      age: Number(age),
      conditions,
      activity_preference: activity,
      vulnerability_tier: calculateTier(),
      cohort,
      notes: notes.trim() || undefined,
      is_demo: false,
    };

    onAddMember(newMember);
    onClose();
  };

  const availableConditions: { key: HealthCondition; label: string }[] = [
    { key: 'none', label: 'None / Standard Respiratory' },
    { key: 'asthma', label: 'Asthma / Reactive Airway' },
    { key: 'allergies', label: 'Seasonal Pollen / Dust Allergies' },
    { key: 'cardiovascular', label: 'Cardiovascular / Hypertension' },
    { key: 'copd', label: 'COPD / Chronic Bronchitis' },
    { key: 'pregnancy', label: 'Pregnancy' },
    { key: 'outdoor_labor', label: 'Outdoor Labor / Prolonged Exposure' },
    { key: 'student_commute', label: 'Student / Daily Commute' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-member-title"
    >
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
              <UserPlus className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            </div>
            <div>
              <h3 id="modal-member-title" className="text-base font-bold text-slate-900">Add Household Member</h3>
              <p className="text-xs text-slate-500">Configure voluntary vulnerability &amp; activity profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close add member dialog"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="member-name" className="block text-slate-700 font-semibold mb-1">Full / Preferred Name</label>
              <input
                id="member-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label htmlFor="member-rel" className="block text-slate-700 font-semibold mb-1">Relationship</label>
              <input
                id="member-rel"
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g. Daughter, Self, Father"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="member-age" className="block text-slate-700 font-semibold mb-1">Age (Years)</label>
              <input
                id="member-age"
                type="number"
                min={0}
                max={120}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 font-mono"
              />
            </div>
            <div>
              <label htmlFor="member-cohort" className="block text-slate-700 font-semibold mb-1">Household Target Cohort</label>
              <select
                id="member-cohort"
                value={cohort}
                onChange={(e) => setCohort(e.target.value as TargetCohort)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
              >
                <option value="general_household">General Household</option>
                <option value="children">Family with Children</option>
                <option value="older_adults">Older Adult (65+)</option>
                <option value="students">Student / Campus Commuter</option>
                <option value="daily_commuters">Daily Commuter</option>
                <option value="outdoor_workers">Outdoor Laborer / Worker</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="member-activity" className="block text-slate-700 font-semibold mb-1">Primary Activity Preference</label>
            <select
              id="member-activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value as ActivityPreference)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
            >
              <option value="light_walking">Light Walking / Casual</option>
              <option value="outdoor_running">Outdoor Running / Endurance Cardio</option>
              <option value="cycling">Cycling / Active Commute</option>
              <option value="public_transit">Public Transit Commute</option>
              <option value="commuting">Motorized Roadway Commute</option>
              <option value="outdoor_work">Outdoor Manual Labor</option>
              <option value="indoor_only">Predominantly Indoor Only</option>
            </select>
          </div>

          {/* Voluntary Vulnerability Badges */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Health Sensitivity Categories (Select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Voluntary Health Sensitivity Categories">
              {availableConditions.map((item) => {
                const checked = conditions.includes(item.key);
                return (
                  <button
                    key={item.key}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    aria-label={item.label}
                    onClick={() => toggleCondition(item.key)}
                    className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                      checked
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{item.label}</span>
                    {checked && <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 ml-1" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="member-notes" className="block text-slate-700 font-semibold mb-1">Personal Notes (Optional)</label>
            <input
              id="member-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Has asthma action plan; runs early morning"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-sm transition-all"
            >
              Save Member
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
