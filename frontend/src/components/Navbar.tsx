import React from 'react';
import { Wind, Shield, Users, RefreshCw, MapPin } from 'lucide-react';
import { CityLocation, FamilyMember } from '../types';

interface NavbarProps {
  cities: CityLocation[];
  selectedCity: CityLocation;
  onSelectCity: (city: CityLocation) => void;
  familyMembers: FamilyMember[];
  activeMemberId?: string;
  onSelectMember: (id: string) => void;
  onOpenFamilyModal: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  providerName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  cities,
  selectedCity,
  onSelectCity,
  familyMembers,
  activeMemberId,
  onSelectMember,
  onOpenFamilyModal,
  onRefresh,
  isLoading,
  providerName,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-navy-800/80 bg-navy-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-emerald-500 to-cyan-300 shadow-glow-cyan">
            <Wind className="w-5 h-5 text-navy-950 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-cyan-100 to-emerald-300 bg-clip-text text-transparent">
                BreatheWise<span className="text-cyan-400 font-black">.AI</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                Urban Intel
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="truncate max-w-[150px] sm:max-w-xs">{providerName}</span>
            </div>
          </div>
        </div>

        {/* Center: City Selector */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center bg-navy-900/90 border border-navy-700/80 rounded-xl px-3 py-1.5 shadow-inner">
            <MapPin className="w-4 h-4 text-cyan-400 mr-2 shrink-0" />
            <select
              value={selectedCity.name}
              onChange={(e) => {
                const found = cities.find((c) => c.name === e.target.value);
                if (found) onSelectCity(found);
              }}
              className="bg-transparent text-sm font-medium text-slate-100 outline-none cursor-pointer pr-4 hover:text-cyan-300 transition-colors"
            >
              {cities.map((city) => (
                <option key={city.name} value={city.name} className="bg-navy-900 text-slate-200">
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh Atmospheric Data"
            className="p-2 rounded-xl bg-navy-900/80 border border-navy-700/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-600/50 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Right: Family Persona Switcher */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center bg-navy-900/70 border border-navy-800 p-1 rounded-xl">
            {familyMembers.slice(0, 3).map((member) => (
              <button
                key={member.id}
                onClick={() => onSelectMember(member.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  member.id === activeMemberId
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {member.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenFamilyModal}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-navy-850 hover:bg-navy-800 border border-cyan-800/40 text-cyan-300 hover:text-white transition-all shadow-sm"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Family Matrix</span>
          </button>
        </div>
      </div>
    </header>
  );
};
