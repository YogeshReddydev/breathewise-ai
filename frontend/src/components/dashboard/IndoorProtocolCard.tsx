import React from 'react';
import { Shield, Wind, Fan, CheckCircle2 } from 'lucide-react';
import { IndoorProtocol } from '../../types/recommendations';

interface IndoorProtocolCardProps {
  protocol: IndoorProtocol | null | undefined;
}

export const IndoorProtocolCard: React.FC<IndoorProtocolCardProps> = ({ protocol }) => {
  if (!protocol) return null;

  return (
    <div className="glass-panel p-6 mt-8 border border-cyan-500/20 bg-gradient-to-br from-cyan-950/15 via-[#0A1128] to-[#0A1128]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            Indoor Air Quality &amp; Clean Haven Protocol
          </h2>
        </div>
        <span className="text-xs font-mono text-cyan-400/90 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
          WHO Indoor Guidance Standard
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        
        {/* Windows Status */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-white/5 flex items-start gap-3">
          <div className={`p-2.5 rounded-lg shrink-0 ${
            protocol.windows_open
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-orange-500/20 text-orange-400'
          }`}>
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Natural Ventilation
            </span>
            <div className="text-base font-bold text-white mt-0.5">
              Windows: <span className={protocol.windows_open ? 'text-emerald-400' : 'text-orange-400'}>
                {protocol.windows_open ? 'Open for Fresh Air' : 'Keep Closed & Sealed'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {protocol.ventilation_guide}
            </p>
          </div>
        </div>

        {/* Air Purifier Mode */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-white/5 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
            <Fan className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              HEPA Filtration
            </span>
            <div className="text-base font-bold text-white mt-0.5">
              Purifier Setting: <span className="text-cyan-300 font-mono">{protocol.purifier_setting}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Run continuous filtration in sleeping quarters and common living rooms.
            </p>
          </div>
        </div>

      </div>

      <div className="bg-slate-900/40 rounded-xl p-3.5 border border-white/5 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <span className="text-xs text-slate-200">
          <strong>Key Action:</strong> {protocol.recommended_action}
        </span>
      </div>
    </div>
  );
};
