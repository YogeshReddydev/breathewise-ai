import React, { useState } from 'react';
import { X, UserPlus, HeartPulse } from 'lucide-react';
import { FamilyMember } from '../types';

interface FamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: Omit<FamilyMember, 'id'>) => Promise<void>;
}

const AVAILABLE_CONDITIONS = [
  { id: 'asthma', label: 'Asthma / Bronchial Reactivity' },
  { id: 'copd', label: 'COPD / Emphysema' },
  { id: 'cardiovascular', label: 'Cardiovascular / Hypertension' },
  { id: 'allergies', label: 'Seasonal Pollen Allergies' },
  { id: 'pregnancy', label: 'Pregnancy' },
  { id: 'pediatric_vulnerability', label: 'Pediatric (<12 yrs)' },
  { id: 'elderly_vulnerability', label: 'Elderly (>65 yrs)' },
  { id: 'athlete_high_ventilation', label: 'Endurance Athlete' },
];

export const FamilyModal: React.FC<FamilyModalProps> = ({ isOpen, onClose, onAddMember }) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Child');
  const [age, setAge] = useState(10);
  const [sensitivity, setSensitivity] = useState<'low' | 'moderate' | 'high' | 'critical'>('moderate');
  const [conditions, setConditions] = useState<string[]>([]);
  const [alertThreshold, setAlertThreshold] = useState(100);
  const [primaryActivity, setPrimaryActivity] = useState('Daily commute');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleCondition = (id: string) => {
    setConditions((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddMember({
        name,
        relationship,
        age: Number(age),
        sensitivity,
        conditions,
        alert_threshold_aqi: Number(alertThreshold),
        primary_activity: primaryActivity,
        notes,
      });
      onClose();
      // Reset form
      setName('');
      setConditions([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-navy-700 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-navy-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Add Family Profile</h3>
            <p className="text-xs text-slate-400">Configure health vulnerabilities and alert levels</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maya Vance"
                className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Relationship</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
              >
                <option value="Self">Self</option>
                <option value="Child">Child</option>
                <option value="Partner">Partner</option>
                <option value="Parent">Parent</option>
                <option value="Grandparent">Grandparent</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Age</label>
              <input
                type="number"
                min="0"
                max="120"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Sensitivity</label>
              <select
                value={sensitivity}
                onChange={(e) => setSensitivity(e.target.value as any)}
                className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
              >
                <option value="low">Low (Resilient)</option>
                <option value="moderate">Moderate</option>
                <option value="high">High (Sensitive)</option>
                <option value="critical">Critical (Severe risk)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Clinical Vulnerabilities & Activity Factors
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_CONDITIONS.map((cond) => {
                const selected = conditions.includes(cond.id);
                return (
                  <button
                    type="button"
                    key={cond.id}
                    onClick={() => toggleCondition(cond.id)}
                    className={`text-left p-2 rounded-xl border text-[11px] transition-all flex items-center justify-between ${
                      selected
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                        : 'bg-navy-900 border-navy-800 text-slate-400 hover:border-navy-700'
                    }`}
                  >
                    <span>{cond.label}</span>
                    {selected && <HeartPulse className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 font-semibold mb-1">
              <span>Alert Threshold:</span>
              <span className="text-cyan-400 font-bold">AQI {alertThreshold}</span>
            </div>
            <input
              type="range"
              min="50"
              max="250"
              step="5"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-navy-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold transition-all shadow-glow-cyan disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
