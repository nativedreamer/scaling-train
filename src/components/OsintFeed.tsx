import React, { useState } from 'react';
import { OsintEvent } from '../services/signalEngine';
import { Radio, Search, AlertCircle, CheckCircle2, ShieldAlert, MapPin, Zap } from 'lucide-react';

interface OsintFeedProps {
  events: OsintEvent[];
  onSelectEvent?: (event: OsintEvent) => void;
}

export const OsintFeed: React.FC<OsintFeedProps> = ({ events, onSelectEvent }) => {
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const regions = ['all', 'Middle East', 'Indo-Pacific', 'Eastern Europe', 'Africa', 'Global Macro'];
  const severities = ['all', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  const filteredEvents = events.filter(e => {
    const matchesRegion = regionFilter === 'all' || e.region.toLowerCase() === regionFilter.toLowerCase();
    const matchesSeverity = severityFilter === 'all' || e.severity === severityFilter;
    const matchesSearch = !searchQuery ||
      e.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.chokepoint && e.chokepoint.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRegion && matchesSeverity && matchesSearch;
  });

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'text-rose-400 font-bold';
      case 'HIGH':
        return 'text-amber-400 font-semibold';
      case 'MEDIUM':
        return 'text-cyan-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="rounded border border-slate-800 bg-slate-900/50 p-4">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>Geopolitical OSINT &amp; Conflict Ingestion Feed</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Normalized military wires, UKMTO bulletins, sanctions designations, and chokepoint alerts
          </p>
        </div>

        {/* Search input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search intelligence..."
            className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Region & Severity Filter Controls */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1">
          {regions.map(r => (
            <button
              key={r}
              onClick={() => setRegionFilter(r)}
              className={`px-2 py-0.5 text-xs font-mono rounded transition-colors whitespace-nowrap cursor-pointer ${
                regionFilter === r
                  ? 'bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r === 'all' ? 'All Theaters' : r}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {severities.map(s => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-2 py-0.5 text-xs font-mono rounded transition-colors cursor-pointer ${
                severityFilter === s
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="mt-3 divide-y divide-slate-800/60 max-h-[520px] overflow-y-auto pr-1">
        {filteredEvents.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No intelligence items matching current filter criteria.
          </div>
        ) : (
          filteredEvents.map(event => (
            <div
              key={event.id}
              onClick={() => onSelectEvent && onSelectEvent(event)}
              className="py-3 hover:bg-slate-800/30 px-2 rounded transition-colors cursor-pointer"
            >
              <div className="flex items-baseline justify-between gap-2">
                {/* Headline */}
                <h3 className="text-xs font-semibold text-slate-100 hover:text-cyan-300 transition-colors leading-snug">
                  {event.headline}
                </h3>
              </div>

              {/* Unboxed Metadata (Frontend Design Rule §1.A: Zero-Pill discipline) */}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                <span className={getSeverityColor(event.severity)}>{event.severity}</span>
                <span aria-hidden="true">·</span>
                <span>{event.region}</span>
                <span aria-hidden="true">·</span>
                <span>{event.source}</span>
                {event.chokepoint && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-cyan-400/90">{event.chokepoint}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span>{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {/* Summary */}
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                {event.summary}
              </p>

              {/* Commodities Footprint */}
              <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                <span>Impacted:</span>
                <span className="text-slate-300">
                  {event.impacted_commodities.join(' · ')}
                </span>
                <span className="ml-auto text-[10px] text-slate-500">
                  Sentiment {event.sentiment_score}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
