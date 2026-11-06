import React from 'react';
import { EngineSummary } from '../services/signalEngine';
import { Shield, TrendingUp, Anchor, Compass } from 'lucide-react';

interface ExecutiveMetricsProps {
  summary: EngineSummary;
}

export const ExecutiveMetrics: React.FC<ExecutiveMetricsProps> = ({ summary }) => {
  const {
    gii,
    sentiment,
    max_shock_index,
    highest_risk_chokepoint,
    recommended_hedge_pct,
    active_signal_count,
  } = summary;

  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'CRITICAL_SYSTEMIC':
        return 'text-rose-400';
      case 'HIGH_VOLATILITY':
        return 'text-amber-400';
      case 'ELEVATED_FRICTION':
        return 'text-cyan-400';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="border-b border-slate-800/90 bg-slate-900/35 px-4 sm:px-5 py-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-0 lg:divide-x divide-slate-800/80">
        <div className="lg:px-3">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>GII</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-bold font-mono tabular-nums text-white tracking-tight">
              {gii.composite_gii_score.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-mono">/100</span>
            <span className={`text-[11px] font-semibold ${getRegimeColor(gii.risk_regime)}`}>
              {gii.risk_regime.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 tabular-nums">
            Kinetic {gii.kinetic_intensity} · Chokepoint {gii.chokepoint_threat} · Sanctions{' '}
            {gii.sanctions_friction}
          </div>
        </div>

        <div className="lg:px-3">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Anchor className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Max supply shock</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-bold font-mono tabular-nums text-amber-300 tracking-tight">
              {max_shock_index.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 truncate max-w-[140px]">{highest_risk_chokepoint}</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 tabular-nums">
            {summary.critical_shocks_count} critical bottlenecks
          </div>
        </div>

        <div className="lg:px-3">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Defensive allocation</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono tabular-nums text-emerald-400 tracking-tight">
              {recommended_hedge_pct.toFixed(0)}%
            </span>
            <span className="text-xs text-slate-400">portfolio</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Gold, Treasuries &amp; Defense</div>
        </div>

        <div className="lg:px-3">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>OSINT tone</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2 flex-wrap">
            <span
              className={`text-xl font-bold font-mono tabular-nums tracking-tight ${
                sentiment.aggregate_polarity < -0.5 ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              {sentiment.aggregate_polarity > 0
                ? `+${sentiment.aggregate_polarity}`
                : sentiment.aggregate_polarity}
            </span>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {active_signal_count} setups
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 truncate">
            {sentiment.rumor_velocity} ·{' '}
            <span className="text-cyan-400/90">{sentiment.contrarian_bias.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
