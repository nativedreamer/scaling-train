import React, { useState } from 'react';
import { QuantitativeSignal } from '../services/signalEngine';
import { Target, Shield, Clock, TrendingUp, Check, Copy, ExternalLink, Zap, GitCommit, ChevronDown, ChevronUp } from 'lucide-react';

interface SignalCardProps {
  signal: QuantitativeSignal;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal }) => {
  const [copied, setCopied] = useState(false);
  const [showTransmission, setShowTransmission] = useState(false);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'STRONG BUY':
        return 'text-emerald-300 bg-emerald-950/70 border-emerald-500/40';
      case 'BUY':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20';
      case 'HEDGE LONG':
        return 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30';
      case 'TACTICAL LONG':
        return 'text-amber-300 bg-amber-950/50 border-amber-500/30';
      default:
        return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  const copyToClipboard = () => {
    const text = `WorldMonitor Signal: ${signal.action} ${signal.ticker} (${signal.yahoo_symbol}) | Entry: $${signal.entry_price} | Target: $${signal.target_price} | Stop: $${signal.stop_loss} | R:R: 1:${signal.risk_reward_ratio} | Horizon: ${signal.horizon} | Catalyst: ${signal.catalyst_headline}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const upsidePct = (((signal.target_price - signal.entry_price) / signal.entry_price) * 100).toFixed(1);
  const downsidePct = (((signal.entry_price - signal.stop_loss) / signal.entry_price) * 100).toFixed(1);

  return (
    <div className="rounded border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 transition-colors">
      {/* Top Strip: Ticker, Action, Strategy, Confidence */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="text-base font-bold font-mono text-white tracking-wide">
            {signal.ticker}
          </span>
          <span className="text-xs font-mono text-cyan-400/80">
            [{signal.yahoo_symbol}]
          </span>
          <span className="text-xs text-slate-400 truncate max-w-[140px]">
            {signal.asset_name}
          </span>
          <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${getActionBadge(signal.action)}`}>
            {signal.action}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-cyan-400 tabular-nums">
              {signal.confidence_score}%
            </span>
            <span className="text-[10px] text-slate-500 block">Confidence</span>
          </div>
          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Copy signal parameters"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Quantitative Risk & Target Grid */}
      <div className="mt-3 grid grid-cols-4 gap-2 text-center py-2 bg-slate-950/70 rounded border border-slate-800/50">
        <div>
          <span className="text-[10px] text-slate-500 block">Entry Quote</span>
          <span className="text-xs font-mono font-bold text-slate-200 tabular-nums">
            ${signal.entry_price}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">Target (+{upsidePct}%)</span>
          <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
            ${signal.target_price}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">Stop Loss (-{downsidePct}%)</span>
          <span className="text-xs font-mono font-bold text-rose-400 tabular-nums">
            ${signal.stop_loss}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">Risk:Reward / Kelly</span>
          <span className="text-xs font-mono text-cyan-300 tabular-nums">
            1:{signal.risk_reward_ratio} · {signal.kelly_fraction_pct}%
          </span>
        </div>
      </div>

      {/* Trade Thesis & Catalyst Link */}
      <div className="mt-3 space-y-2">
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="text-slate-400 font-medium">Thesis:</span> {signal.trade_thesis}
        </div>

        {/* Catalyst Card */}
        <div className="text-[11px] bg-slate-950/80 p-2.5 rounded border border-slate-800/90 flex items-start gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div className="overflow-hidden w-full">
            <span className="text-slate-300 font-medium line-clamp-1">
              {signal.catalyst_headline}
            </span>
            <div className="mt-0.5 text-[10px] text-slate-500 flex items-center gap-2">
              <span>{signal.catalyst_source}</span>
              {signal.chokepoint && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-cyan-400">{signal.chokepoint}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="font-mono">{signal.horizon}</span>
              <span aria-hidden="true">·</span>
              <span className="text-purple-400 font-mono">{signal.lead_lag_relationship}</span>
            </div>
          </div>
        </div>

        {/* Authentic Transmission Chain Toggle */}
        {signal.transmission_chain && signal.transmission_chain.length > 0 && (
          <div className="pt-1">
            <button
              onClick={() => setShowTransmission(!showTransmission)}
              className="text-[11px] text-cyan-400/90 hover:text-cyan-300 flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <GitCommit className="w-3 h-3" />
              <span>{showTransmission ? 'Hide Macro Transmission Chain' : 'View Macro Transmission Chain (4-Node Ripple)'}</span>
              {showTransmission ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showTransmission && (
              <div className="mt-2 p-3 bg-slate-950 rounded border border-slate-800 space-y-2 text-xs">
                {signal.transmission_chain.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] font-mono flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-200">
                        {step.node} <span className="text-amber-400 font-normal font-mono">[{step.impact_type}]</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {step.logic}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Technical Triggers */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-slate-400 font-mono">
          {signal.technical_triggers.map((trigger, i) => (
            <span key={i} className="bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">
              {trigger}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
