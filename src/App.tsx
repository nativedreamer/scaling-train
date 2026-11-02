import React, { useState, useEffect, useCallback } from 'react';
import { signalEngineSingleton, QuantitativeSignal, EngineSummary, MarketAssetQuote, OsintEvent } from './services/signalEngine';
import { Header } from './components/Header';
import { ExecutiveMetrics } from './components/ExecutiveMetrics';
import { ChokepointMap } from './components/ChokepointMap';
import { SignalCard } from './components/SignalCard';
import { MarketMatrix } from './components/MarketMatrix';
import { OsintFeed } from './components/OsintFeed';
import { SimulatorModal } from './components/SimulatorModal';
import { OfflineIndicator } from './pwa/OfflineIndicator';
import { Download, RefreshCw, AlertTriangle, Activity, ChevronRight } from 'lucide-react';

const QUOTES_POLL_MS = 12_000;
const SIGNALS_POLL_MS = 18_000;

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'signals' | 'map' | 'market' | 'osint' | 'simulator'>('signals');
  const [signals, setSignals] = useState<QuantitativeSignal[]>([]);
  const [summary, setSummary] = useState<EngineSummary | null>(null);
  const [quotes, setQuotes] = useState<MarketAssetQuote[]>([]);
  const [events, setEvents] = useState<OsintEvent[]>([]);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [dataSource, setDataSource] = useState<'api' | 'local'>('local');
  const [lastRefresh, setLastRefresh] = useState<string>('');

  const [strategyFilter, setStrategyFilter] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const applyLocalFallback = useCallback(() => {
    setSignals(signalEngineSingleton.generateSignals());
    setSummary(signalEngineSingleton.getSummary());
    setQuotes(signalEngineSingleton.getQuotes());
    setEvents(signalEngineSingleton.getEvents());
    setDataSource('local');
    setLastRefresh(new Date().toISOString());
  }, []);

  const refreshFromApi = useCallback(async () => {
    const [quotesRes, signalsRes, summaryRes, osintRes] = await Promise.all([
      fetchJson<{ quotes: MarketAssetQuote[] }>('/api/market/quotes'),
      fetchJson<{ signals: QuantitativeSignal[] }>('/api/signals'),
      fetchJson<EngineSummary>('/api/signals/summary'),
      fetchJson<{ events: OsintEvent[] }>('/api/osint/feed'),
    ]);

    let usedApi = false;

    if (quotesRes?.quotes?.length) {
      setQuotes(quotesRes.quotes);
      usedApi = true;
    }
    if (signalsRes?.signals?.length) {
      setSignals(signalsRes.signals as QuantitativeSignal[]);
      usedApi = true;
    }
    if (summaryRes && (summaryRes as EngineSummary).gii) {
      setSummary(summaryRes as EngineSummary);
      usedApi = true;
    }
    if (osintRes?.events?.length) {
      setEvents(osintRes.events);
      usedApi = true;
    }

    if (usedApi) {
      setDataSource('api');
      setLastRefresh(new Date().toISOString());
    } else {
      applyLocalFallback();
    }
  }, [applyLocalFallback]);

  useEffect(() => {
    refreshFromApi();
    const quotesTimer = setInterval(() => {
      fetchJson<{ quotes: MarketAssetQuote[] }>('/api/market/quotes').then((res) => {
        if (res?.quotes?.length) {
          setQuotes(res.quotes);
          setDataSource('api');
          setLastRefresh(new Date().toISOString());
        }
      });
    }, QUOTES_POLL_MS);

    const signalsTimer = setInterval(() => {
      refreshFromApi();
    }, SIGNALS_POLL_MS);

    return () => {
      clearInterval(quotesTimer);
      clearInterval(signalsTimer);
    };
  }, [refreshFromApi]);

  const handleSimulateCrisis = (scenario: any) => {
    // Prefer backend simulate when online
    fetch('/api/signals/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenario),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('simulate failed');
        const data = await res.json();
        if (data.updated_signals) setSignals(data.updated_signals);
        if (data.updated_summary) setSummary(data.updated_summary);
        setDataSource('api');
        setLastRefresh(new Date().toISOString());
        // Refresh quotes after inject
        const q = await fetchJson<{ quotes: MarketAssetQuote[] }>('/api/market/quotes');
        if (q?.quotes?.length) setQuotes(q.quotes);
        const e = await fetchJson<{ events: OsintEvent[] }>('/api/osint/feed');
        if (e?.events?.length) setEvents(e.events);
      })
      .catch(() => {
        const res = signalEngineSingleton.simulateScenario(scenario);
        setSignals(res.signals);
        setSummary(res.summary);
        setQuotes(signalEngineSingleton.getQuotes());
        setEvents(signalEngineSingleton.getEvents());
        setDataSource('local');
      });
  };

  const exportSignalsAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(signals, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `worldmonitor_signals_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredSignals = signals.filter((sig) => {
    const matchStrategy = strategyFilter === 'ALL' || sig.strategy_name === strategyFilter;
    const matchSearch =
      !searchFilter ||
      sig.ticker.toLowerCase().includes(searchFilter.toLowerCase()) ||
      sig.asset_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (sig.chokepoint && sig.chokepoint.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchStrategy && matchSearch;
  });

  const criticalCount = events.filter((e) => e.severity === 'CRITICAL').length;
  const goldQuote = quotes.find((q) => q.symbol === 'GOLD');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-cyan-500/20 selection:text-cyan-200">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        criticalAlertCount={criticalCount}
      />

      {summary && <ExecutiveMetrics summary={summary} />}

      <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-200 uppercase tracking-wider font-mono">Feed:</span>
            <span
              className={`px-1.5 py-0.5 rounded border font-mono ${
                dataSource === 'api'
                  ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
                  : 'border-amber-500/40 text-amber-300 bg-amber-500/10'
              }`}
            >
              {dataSource === 'api' ? 'LIVE API' : 'LOCAL FALLBACK'}
            </span>
            {goldQuote && (
              <span className="font-mono text-amber-200">
                GOLD {goldQuote.price.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({goldQuote.change_24h_pct >= 0 ? '+' : ''}
                {goldQuote.change_24h_pct.toFixed(2)}%)
              </span>
            )}
            {lastRefresh && (
              <span className="text-slate-500 font-mono">
                updated {new Date(lastRefresh).toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshFromApi()}
              className="p-1.5 rounded border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Force refresh quotes & signals"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={exportSignalsAsJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-800 bg-slate-900 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Signals JSON</span>
            </button>
          </div>
        </div>

        {activeTab === 'signals' && (
          <div className="space-y-6">
            {summary && (
              <ChokepointMap
                shocks={signalEngineSingleton.calculateSupplyShocks()}
                onSelectChokepoint={(cp) => setSearchFilter(cp)}
              />
            )}

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Consolidated Quantitative Financial Signals</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Entry / target / stop anchored to live Yahoo marks (GC=F, BZ=F, …) via backend
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 p-1 bg-slate-900 rounded border border-slate-800 text-xs font-mono">
                    <button
                      onClick={() => setStrategyFilter('ALL')}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        strategyFilter === 'ALL'
                          ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All Strategies
                    </button>
                    <button
                      onClick={() => setStrategyFilter('SUPPLY_SHOCK_DISRUPTION')}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        strategyFilter === 'SUPPLY_SHOCK_DISRUPTION'
                          ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Supply Shocks
                    </button>
                    <button
                      onClick={() => setStrategyFilter('GEOPOLITICAL_INSTABILITY_INDEX')}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        strategyFilter === 'GEOPOLITICAL_INSTABILITY_INDEX'
                          ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Defensive Hedges
                    </button>
                  </div>

                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filter ticker / chokepoint..."
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSignals.length === 0 ? (
                  <div className="col-span-2 py-12 text-center text-xs text-slate-500 rounded border border-slate-800 bg-slate-900/30">
                    No active quantitative signals match current criteria.
                  </div>
                ) : (
                  filteredSignals.map((sig) => <SignalCard key={sig.id} signal={sig} />)
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
              <MarketMatrix quotes={quotes} />
              <OsintFeed events={events} />
            </div>
          </div>
        )}

        {activeTab === 'map' && summary && (
          <div className="space-y-6">
            <ChokepointMap shocks={signalEngineSingleton.calculateSupplyShocks()} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded border border-slate-800 bg-slate-900/50 p-4">
                <h3 className="text-sm font-bold text-white mb-2">Transit Capacity &amp; Vulnerability Matrix</h3>
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="font-semibold text-cyan-400">Strait of Hormuz (21 Mb/d):</span> 21% of global petroleum consumption transit node.
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="font-semibold text-amber-400">Bab el-Mandeb (8.8 Mb/d):</span> Southern gate to Suez Canal.
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="font-semibold text-purple-400">Taiwan Strait:</span> Core passage for advanced semiconductors and container tonnage.
                  </div>
                </div>
              </div>
              <OsintFeed events={events} />
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-6">
            <MarketMatrix quotes={quotes} />
          </div>
        )}

        {activeTab === 'osint' && (
          <div className="space-y-6">
            <OsintFeed events={events} />
          </div>
        )}

        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="rounded border border-slate-800 bg-slate-900/50 p-6 text-center max-w-2xl mx-auto">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <h2 className="text-base font-bold text-white">Quantitative War Game &amp; Crisis Simulator</h2>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Inject custom kinetic strikes or sanctions. Signals recompute against live market marks.
              </p>
              <button
                onClick={() => setIsSimulatorOpen(true)}
                className="mt-4 px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <span>Launch Interactive Simulator</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>

      <SimulatorModal isOpen={isSimulatorOpen} onClose={() => setIsSimulatorOpen(false)} onSimulate={handleSimulateCrisis} />
      <OfflineIndicator />

      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <div className="flex flex-wrap items-center justify-between gap-4 max-w-[1440px] mx-auto">
          <span>WorldMonitor Finance · Live Yahoo marks · Quotes every {QUOTES_POLL_MS / 1000}s</span>
          <div className="flex items-center gap-4">
            <span>PWA Ready</span>
            <span aria-hidden="true">·</span>
            <span>FastAPI Backend</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
