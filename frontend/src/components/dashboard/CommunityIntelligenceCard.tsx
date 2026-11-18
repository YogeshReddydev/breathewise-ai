import React from 'react';
import {
  Building2,
  HeartHandshake,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { AQIReading } from '../../types/aqi';
import { useCommunityPledge } from '../../hooks/useCommunityPledge';
import {
  calculateCombustionRatio,
  evaluateCivicActionProtocol,
} from '../../utils/civicActionEngine';

interface CommunityIntelligenceCardProps {
  reading: AQIReading;
  onOpenChat: () => void;
}

export const CommunityIntelligenceCard: React.FC<CommunityIntelligenceCardProps> = ({
  reading,
  onOpenChat,
}) => {
  const { pledged, pledgeCount, makePledge } = useCommunityPledge();

  const pm25 = reading.pollutants?.pm2_5 ?? 0;
  const pm10 = reading.pollutants?.pm10 ?? 0;
  const { ratio, isCombustionDominant } = calculateCombustionRatio(pm25, pm10);

  // Derive Civic Action / GRAP Stage strictly mapped to thresholds
  const aqiVal = reading.cpcb?.aqi ?? reading.aqi_us;
  const { grapStage, grapColor, schoolStatus, dustMitigation } = evaluateCivicActionProtocol(aqiVal);

  const handlePledge = makePledge;

  return (
    <div id="community" className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm mt-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-800">
            <Building2 className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Community Intelligence &amp; Civic Airshed Governance
            </h2>
            <p className="text-xs text-slate-500">
              Station provenance, source attribution ratio, civic alerts, and collective clean air action
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Civic Directives
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Data Provenance & Civic Alerts */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Station Provenance Details */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Atmospheric Monitoring Provenance
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Telemetry Source</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {reading.source_attribution || reading.provider}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Data Processing Model</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {reading.provider === 'waqi'
                    ? 'Continuous Regulatory Station'
                    : reading.data_type === 'forecast'
                    ? 'Numerical Prediction Model'
                    : 'ECMWF / CAMS Atmospheric Reanalysis'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Airshed Coordinates</span>
                <span className="font-mono text-slate-700">
                  {reading.latitude.toFixed(3)}°N, {reading.longitude.toFixed(3)}°E
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Source Attribution Ratio</span>
                <span className="font-mono text-slate-900 font-bold">
                  PM2.5 / PM10 = {ratio}
                </span>
              </div>
            </div>

            {/* Combustion vs Dust Explanation */}
            <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 flex items-start gap-2">
              <Flame className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <span>
                {isCombustionDominant ? (
                  <><strong>Combustion-Dominant Soot:</strong> High ratio ({ratio} &gt; 0.6) signals emissions from vehicle exhausts, coal power plants, or biomass burning.</>
                ) : (
                  <><strong>Crustal/Dust-Dominant:</strong> Lower ratio ({ratio} &le; 0.6) signals elevated coarse road dust, windblown soil, or construction activity.</>
                )}
              </span>
            </div>
          </div>

          {/* Civic Air Action Status */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Civic Action Directives (GRAP / Clean Air Act)
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${grapColor}`}>
                {grapStage}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                <span><strong>Schools &amp; Playgrounds:</strong> {schoolStatus}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                <span><strong>Civic Dust Mitigation:</strong> {dustMitigation}</span>
              </div>
            </div>

            {onOpenChat && (
              <button
                type="button"
                onClick={onOpenChat}
                className="mt-3 text-xs text-teal-700 font-bold hover:text-teal-900 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Ask AI Assistant about local clean air bylaws</span>
                <span aria-hidden="true">&rarr;</span>
              </button>
            )}
          </div>

        </div>

        {/* Right Column: Community Clean Air Pledge */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-emerald-50/60 rounded-xl p-5 border border-emerald-200">
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-950 font-bold text-sm">
              <HeartHandshake className="w-5 h-5 text-emerald-700" />
              <span>Community Clean Air Pledge</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Urban air quality is a collective resource. Join over 1,400 neighborhood residents committed to proactive respiratory protection and emissions reduction:
            </p>

            <div className="space-y-2 text-xs text-slate-700 mb-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Avoid burning solid waste, dry leaves, or open wood fires</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Choose public metro or shared transit for at least 2 trips/week</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Report localized smoke plumes or illegal open burning to municipal civic authorities</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span>Community Participants:</span>
              <strong className="text-emerald-900 font-mono font-bold text-sm">{pledgeCount.toLocaleString()} Citizens</strong>
            </div>

            <button
              onClick={handlePledge}
              disabled={pledged}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 ${
                pledged
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 cursor-default'
                  : 'bg-emerald-800 hover:bg-emerald-900 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{pledged ? 'Pledged & Active Clean Air Advocate' : 'Take Community Clean Air Pledge'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
