import React, { useState } from 'react';
import { MarketAssetQuote } from '../services/signalEngine';
import { TrendingUp, TrendingDown, Activity, Filter, BarChart2 } from 'lucide-react';

interface MarketMatrixProps {
  quotes: MarketAssetQuote[];
  onSelectAsset?: (symbol: string) => void;
}

export const MarketMatrix: React.FC<MarketMatrixProps> = ({ quotes, onSelectAsset }) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const categories = ['ALL', 'ENERGY', 'METALS', 'DEFENSE', 'TECH_SEMI', 'AGRI', 'FX_RATES', 'CRYPTO'];

  const filteredQuotes = categoryFilter === 'ALL'
    ? quotes
    : quotes.filter(q => q.category === categoryFilter);

  const renderSparkline = (sparkline: number[], isPositive: boolean) => {
    if (!sparkline || sparkline.length < 2) return null;
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;
    const width = 80;
    const height = 24;

    const points = sparkline
      .map((val, idx) => {
        const x = (idx / (sparkline.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    const strokeColor = isPositive ? '#34d399' : '#f87171';

    return (
      <svg width={width} height={height} className="overflow-visible inline-block">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="rounded border border-slate-800 bg-slate-900/50 p-4">
      {/* Table Header and Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <span>Geopolitical Commodity &amp; Financial Asset Matrix</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Streaming price action, RSI(14), Volatility Z-scores, and ATR indicators
          </p>
        </div>

        {/* Filter Segmented Buttons (Anti-slop compliant) */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded border border-slate-800/80 overflow-x-auto max-w-full">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat.replace('_', '/')}
            </button>
          ))}
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-mono">
              <th className="py-2.5 px-3">ASSET</th>
              <th className="py-2.5 px-3 text-right">LAST</th>
              <th className="py-2.5 px-3 text-right">24H CHG</th>
              <th className="py-2.5 px-3 text-center">INTRADAY</th>
              <th className="py-2.5 px-3 text-right">RSI (14)</th>
              <th className="py-2.5 px-3 text-right">VOL Z-SCORE</th>
              <th className="py-2.5 px-3 text-right">ATR (14)</th>
              <th className="py-2.5 px-3">TECHNICAL REGIME</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredQuotes.map(quote => {
              const isPositive = quote.change_24h_pct >= 0;
              const isOverbought = quote.rsi_14 >= 70;
              const isOversold = quote.rsi_14 <= 30;

              return (
                <tr
                  key={quote.symbol}
                  onClick={() => onSelectAsset && onSelectAsset(quote.symbol)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  {/* Asset & Name */}
                  <td className="py-2 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {quote.symbol}
                      </span>
                      <span className="text-[11px] text-slate-500 font-sans truncate max-w-[130px]">
                        {quote.name}
                      </span>
                    </div>
                  </td>

                  {/* Last Price */}
                  <td className="py-2 px-3 text-right font-bold text-slate-100 tabular-nums">
                    ${quote.price.toLocaleString(undefined, { minimumFractionDigits: quote.price > 10 ? 2 : 4 })}
                  </td>

                  {/* 24h Change */}
                  <td className={`py-2 px-3 text-right font-semibold tabular-nums ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? `+${quote.change_24h_pct}%` : `${quote.change_24h_pct}%`}
                  </td>

                  {/* Intraday Sparkline */}
                  <td className="py-2 px-3 text-center">
                    {renderSparkline(quote.sparkline, isPositive)}
                  </td>

                  {/* RSI (14) */}
                  <td className="py-2 px-3 text-right tabular-nums">
                    <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                      isOverbought
                        ? 'text-amber-300 bg-amber-950/60'
                        : isOversold
                        ? 'text-emerald-300 bg-emerald-950/60'
                        : 'text-slate-300'
                    }`}>
                      {quote.rsi_14}
                    </span>
                  </td>

                  {/* Volatility Z-score */}
                  <td className="py-2 px-3 text-right tabular-nums text-slate-300">
                    {quote.volatility_zscore > 0 ? `+${quote.volatility_zscore}σ` : `${quote.volatility_zscore}σ`}
                  </td>

                  {/* ATR (14) */}
                  <td className="py-2 px-3 text-right tabular-nums text-slate-400">
                    ${quote.atr_14}
                  </td>

                  {/* Trend state */}
                  <td className="py-2 px-3 text-[11px] text-slate-400">
                    <span className="font-sans text-slate-300">
                      {quote.trend_state.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
