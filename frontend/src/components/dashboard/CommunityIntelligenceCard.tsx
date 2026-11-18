import React, { useState, useEffect } from 'react';
import { AQIReading } from '../../types/aqi';
import {
  Users,
  Radio,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Flame,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';

interface CommunityIntelligenceCardProps {
  reading: AQIReading;
  onOpenChat?: () => void;
}

export const CommunityIntelligenceCard: React.FC<CommunityIntelligenceCardProps> = ({
  reading,
  onOpenChat,
}) => {
  const [pledged, setPledged] = useState<boolean>(() => {
    try {
      return localStorage.getItem('breathewise_community_pledge') === 'true';
    } catch {
      return false;
    }
  });

  const [pledgeCount, setPledgeCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('breathewise_pledge_count');
      return stored ? parseInt(stored, 10) : 1248;
    } catch {
      return 1248;
    }
  });

  const handleTogglePledge = () => {
    const nextState = !pledged;
    setPledged(nextState);
    const nextCount = nextState ? pledgeCount + 1 : pledgeCount - 1;
    setPledgeCount(nextCount);
    try {
      localStorage.setItem('breathewise_community_pledge', String(nextState));
      localStorage.setItem('breathewise_pledge_count', String(nextCount));
    } catch {
      // Ignore localStorage write failure in restricted sandbox
    }
  };

  // Derive relative timestamp string
  const formatTimeAgo = (isoString: string): string => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return 'Live Telemetry';
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours}h ago`;
    } catch {
      return 'Live Telemetry';
    }
  };

  const pm25 = reading.pollutants?.pm2_5 ?? 0;
  const pm10 = reading.pollutants?.pm10 ?? 0;
  const ratio = pm10 > 0 ? (pm25 / pm10).toFixed(2) : 'N/A';
  const isCombustionDominant = pm10 > 0 && pm25 / pm10 > 0.6;

  // Derive Civic Action / GRAP Stage
  const aqiVal = reading.cpcb?.aqi ?? reading.aqi_us;
  let grapStage = 'Normal / Baseline';
  let grapColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  let schoolStatus = 'Normal Outdoor Activities';
  let schoolBadge = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  let dustMitigation = 'Standard Road Sweeping';

  if (aqiVal > 450) {
    grapStage = 'GRAP Stage IV (Severe+)';
    grapColor = 'text-red-400 border-red-500/40 bg-red-500/20';
    schoolStatus = 'Mandatory Closure / Remote Learning';
    schoolBadge = 'text-red-400 bg-red-500/20 border-red-500/40';
    dustMitigation = 'Total Construction Ban & Anti-Smog Guns Active';
  } else if (aqiVal > 400) {
    grapStage = 'GRAP Stage III (Severe)';
    grapColor = 'text-red-400 border-red-500/30 bg-red-500/10';
    schoolStatus = 'Primary Schools Shift Indoors (No PE)';
    schoolBadge = 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    dustMitigation = 'Non-essential Construction Suspended';
  } else if (aqiVal > 300) {
    grapStage = 'GRAP Stage II (Very Poor)';
    grapColor = 'text-orange-400 border-orange-500/30 bg-orange-500/10';
    schoolStatus = 'Outdoor Sports Restricted to Low Exertion';
    schoolBadge = 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    dustMitigation = 'Mechanical Sweeping & Water Sprinkling';
  } else if (aqiVal > 200) {
    grapStage = 'GRAP Stage I (Poor)';
    grapColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    schoolStatus = 'Sensitive Children Monitored during Recess';
    schoolBadge = 'text-amber-300 bg-amber-500/10 border-amber-500/20';
    dustMitigation = 'Construction Dust Screens Enforced';
  }

  return (
    <div className="glass-panel p-6 mt-6 border border-cyan-500/20 bg-gradient-to-br from-cyan-950/15 via-[#0A1128] to-[#0A1128]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Community Intelligence &amp; Civic Airshed Defense
            </h2>
            <p className="text-xs text-slate-400">
              Neighborhood-scale air monitoring provenance, civic alerts &amp; collective exposure mitigation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            Station Telemetry Active
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* Left 7 Columns: Station Provenance & Civic Alerts */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Station Provenance Box */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Reporting Station &amp; Sensor Grid
              </span>
              <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                {formatTimeAgo(reading.timestamp)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded-lg bg-[#050B14] border border-white/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Station / Provider</span>
                <span className="text-xs font-bold text-white block truncate" title={reading.source_attribution || reading.provider}>
                  {reading.source_attribution || reading.provider || 'Open-Meteo European Sensor Grid'}
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Verified Atmospheric Model</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#050B14] border border-white/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Spatial Coordinates</span>
                <span className="text-xs font-mono font-bold text-cyan-300 block">
                  {reading.latitude.toFixed(4)}° N, {reading.longitude.toFixed(4)}° E
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Anchored to {reading.location_name}</span>
              </div>
            </div>
          </div>

          {/* Civic Emergency & GRAP Status Box */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                Civic Air Action Directives (GRAP / EPA)
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${grapColor}`}>
                {grapStage}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#050B14] border border-white/5 flex items-center justify-between gap-2">
                <span className="text-slate-400">School &amp; Child Sports Protocol:</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${schoolBadge}`}>
                  {schoolStatus}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#050B14] border border-white/5 flex items-center justify-between gap-2">
                <span className="text-slate-400">Civic Dust &amp; Construction Mitigation:</span>
                <span className="text-[11px] font-medium text-slate-200">
                  {dustMitigation}
                </span>
              </div>
            </div>
          </div>

          {/* Aerosol Ratio Diagnostic */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5 flex items-start gap-3 text-xs">
            <Flame className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Aerosol Fingerprint (PM2.5 / PM10 Ratio):</span>
                <span className="font-mono text-cyan-300 font-bold">{ratio}</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                {isCombustionDominant
                  ? 'High fine-particulate ratio (>0.60) reflects predominant combustion aerosols (vehicular exhaust, biomass burning, and winter smog inversion). Standard masks are recommended for all outdoor transit.'
                  : 'Lower fine-particulate ratio indicates mineral dust, road re-suspension, or coarse particulate loading. Eye protection and nasal rinsing are beneficial.'}
              </p>
            </div>
          </div>

        </div>

        {/* Right 5 Columns: Neighborhood Clean Haven & Mutual Aid Pledge */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Clean Haven Household Card */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Household Clean Haven Readiness</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              When neighborhood air reaches unhealthful concentrations, sealed indoor clean-air sanctuaries offer critical physiological recovery for vulnerable lungs.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>HEPA Filtration sealed sanctuary protocol</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Door/window perimeter micro-draft insulation</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Positive-pressure indoor air circulation</span>
              </div>
            </div>

            {onOpenChat && (
              <button
                type="button"
                onClick={onOpenChat}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              >
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ask AI: Neighborhood Defense Plan</span>
              </button>
            )}
          </div>

          {/* Citizen Clean Air Pledge Card */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Citizen Clean Air Pledge</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {pledgeCount.toLocaleString()} Pledged
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Commit to zero open waste burning, carpooling or public transit during severe smog days, and reporting neighborhood combustion plumes.
            </p>

            <button
              type="button"
              onClick={handleTogglePledge}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                pledged
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{pledged ? 'Pledge Active: Thank You!' : 'Join the Clean Air Action Pledge'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

