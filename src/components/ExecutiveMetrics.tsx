import React from 'react';
import { EngineSummary } from '../services/signalEngine';
import { Shield, AlertTriangle, TrendingUp, Anchor, Compass } from 'lucide-react';

interface ExecutiveMetricsProps {
  summary: EngineSummary;
}

export const ExecutiveMetrics: React.FC<ExecutiveMetricsProps> = ({ summary }) => {
  const { gii, sentiment, max_shock_index, highest_risk_chokepoint, recommended_hedge_pct, active_signal_count } = summary;

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
    <div className="border-b border-slate-800 bg-slate-900/40 px-5 py-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
        {/* Metric 1: Geopolitical Instability Index */}
        <div className="pt-2 md:pt-0 md:px-3">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Geopolitical Instability Index</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono tabular-nums text-white">
              {gii.composite_gii_score.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
            <span className={`text-xs font-semibold ${getRegimeColor(gii.risk_regime)}`}>
              {gii.risk_regime.replace('_', ' ')}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            <span>Kinetic {gii.kinetic_intensity}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>Chokepoint {gii.chokepoint_threat}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>Sanctions {gii.sanctions_friction}</span>
          </div>
        </div>

        {/* Metric 2: Maritime Supply Shock Alert */}
        <div className="pt-2 md:pt-0 md:px-3">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Anchor className="w-3.5 h-3.5 text-amber-400" />
            <span>Max Supply Shock Index</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono tabular-nums text-amber-300">
              {max_shock_index.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 truncate max-w-[140px]">
              {highest_risk_chokepoint}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            <span>{summary.critical_shocks_count} critical bottlenecks</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>21 mbpd threatened</span>
          </div>
        </div>

        {/* Metric 3: Safe-Haven Hedging Allocation */}
        <div className="pt-2 md:pt-0 md:px-3">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Defensive Allocation Rec</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono tabular-nums text-emerald-400">
              {recommended_hedge_pct.toFixed(0)}%
            </span>
            <span className="text-xs text-slate-400">Portfolio Weight</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            <span>Gold, Treasuries &amp; Defense</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>Kelly bounded</span>
          </div>
        </div>

        {/* Metric 4: OSINT Sentiment & Active Signals */}
        <div className="pt-2 md:pt-0 md:px-3">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            <span>OSINT Tone &amp; Signals</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-xl font-bold font-mono tabular-nums ${sentiment.aggregate_polarity < -0.5 ? 'text-rose-400' : 'text-slate-200'}`}>
              {sentiment.aggregate_polarity > 0 ? `+${sentiment.aggregate_polarity}` : sentiment.aggregate_polarity}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {active_signal_count} active setups
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 truncate">
            <span>Velocity: {sentiment.rumor_velocity}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span className="text-cyan-400/90">{sentiment.contrarian_bias.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
