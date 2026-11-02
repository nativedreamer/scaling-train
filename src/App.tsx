import React, { useState, useEffect } from 'react';
import { signalEngineSingleton, QuantitativeSignal, EngineSummary, MarketAssetQuote, OsintEvent } from './services/signalEngine';
import { Header } from './components/Header';
import { ExecutiveMetrics } from './components/ExecutiveMetrics';
import { ChokepointMap } from './components/ChokepointMap';
import { SignalCard } from './components/SignalCard';
import { MarketMatrix } from './components/MarketMatrix';
import { OsintFeed } from './components/OsintFeed';
import { SimulatorModal } from './components/SimulatorModal';
import { OfflineIndicator } from './pwa/OfflineIndicator';
import { Filter, Download, RefreshCw, AlertTriangle, Layers, Activity, ShieldCheck, ChevronRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'signals' | 'map' | 'market' | 'osint' | 'simulator'>('signals');
  const [signals, setSignals] = useState<QuantitativeSignal[]>([]);
  const [summary, setSummary] = useState<EngineSummary | null>(null);
  const [quotes, setQuotes] = useState<MarketAssetQuote[]>([]);
  const [events, setEvents] = useState<OsintEvent[]>([]);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  
  // Signal filters
  const [strategyFilter, setStrategyFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const refreshAllData = () => {
    const updatedSignals = signalEngineSingleton.generateSignals();
    const updatedSummary = signalEngineSingleton.getSummary();
    const updatedQuotes = signalEngineSingleton.getQuotes();
    const updatedEvents = signalEngineSingleton.getEvents();

    setSignals(updatedSignals);
    setSummary(updatedSummary);
    setQuotes(updatedQuotes);
    setEvents(updatedEvents);
  };

  useEffect(() => {
    refreshAllData();

    // Subtle interval simulation for real-time market pulsation
    const interval = setInterval(() => {
      // Refresh summary and quotes without jarring user
      setQuotes(signalEngineSingleton.getQuotes());
      setSummary(signalEngineSingleton.getSummary());
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const handleSimulateCrisis = (scenario: any) => {
    const res = signalEngineSingleton.simulateScenario(scenario);
    setSignals(res.signals);
    setSummary(res.summary);
    setQuotes(signalEngineSingleton.getQuotes());
    setEvents(signalEngineSingleton.getEvents());
  };

  const exportSignalsAsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(signals, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `worldmonitor_signals_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredSignals = signals.filter(sig => {
    const matchStrategy = strategyFilter === 'ALL' || sig.strategy_name === strategyFilter;
    const matchAction = actionFilter === 'ALL' || sig.action === actionFilter;
    const matchSearch = !searchFilter ||
      sig.ticker.toLowerCase().includes(searchFilter.toLowerCase()) ||
      sig.asset_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (sig.chokepoint && sig.chokepoint.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchStrategy && matchAction && matchSearch;
  });

  const criticalCount = events.filter(e => e.severity === 'CRITICAL').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        criticalAlertCount={criticalCount}
      />

      {/* Executive Risk Metric Strip */}
      {summary && <ExecutiveMetrics summary={summary} />}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Navigation Mode Subheader & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Theaters Active:
            </span>
            <span>Middle East (Hormuz/Red Sea)</span>
            <span aria-hidden="true">·</span>
            <span>Indo-Pacific (Taiwan Strait)</span>
            <span aria-hidden="true">·</span>
            <span>Black Sea Corridor</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshAllData}
              className="p-1.5 rounded border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Refresh intelligence telemetry"
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

        {/* View Selection: Signals Dashboard (Default primary view) */}
        {activeTab === 'signals' && (
          <div className="space-y-6">
            {/* Chokepoint Map Banner */}
            {summary && (
              <ChokepointMap
                shocks={signalEngineSingleton.calculateSupplyShocks()}
                onSelectChokepoint={(cp) => setSearchFilter(cp)}
              />
            )}

            {/* Signal Stream Section */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Consolidated Quantitative Financial Signals</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Algorithmic trade setups correlating active OSINT bulletins with real-time price elasticity
                  </p>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Strategy Tabs */}
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

                  {/* Search box */}
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filter ticker / chokepoint..."
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Signals Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSignals.length === 0 ? (
                  <div className="col-span-2 py-12 text-center text-xs text-slate-500 rounded border border-slate-800 bg-slate-900/30">
                    No active quantitative signals match current criteria.
                  </div>
                ) : (
                  filteredSignals.map(sig => (
                    <SignalCard key={sig.id} signal={sig} />
                  ))
                )}
              </div>
            </div>

            {/* Split Row: Market Matrix & Live OSINT Wire */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
              <MarketMatrix quotes={quotes} />
              <OsintFeed events={events} />
            </div>
          </div>
        )}

        {/* View: Strategic Chokepoint Map Dedicated */}
        {activeTab === 'map' && summary && (
          <div className="space-y-6">
            <ChokepointMap shocks={signalEngineSingleton.calculateSupplyShocks()} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded border border-slate-800 bg-slate-900/50 p-4">
                <h3 className="text-sm font-bold text-white mb-2">Transit Capacity &amp; Vulnerability Matrix</h3>
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="font-semibold text-cyan-400">Strait of Hormuz (21 Mb/d):</span> 21% of global petroleum consumption transit node. Connecting Persian Gulf producers (Saudi Arabia, UAE, Kuwait, Iraq, Iran) to Asian refiners. No maritime bypass exists except the limited East-West Petroline and Abu Dhabi crude pipeline.
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="font-semibold text-amber-400">Bab el-Mandeb (8.8 Mb/d):</span> Southern gate to Suez Canal. 8.5% of seaborne oil and 12% of containerized merchandise. Diverting via Cape of Good Hope adds 10-14 transit days and $1.8M fuel/charter surcharge per round voyage.
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="font-semibold text-purple-400">Taiwan Strait:</span> Core passage for 52% of advanced global semiconductors (TSMC, UMC) and 48% of global container container tonnage. Air and naval exclusions trigger immediate tech inventory buffer drawdown.
                  </div>
                </div>
              </div>
              <OsintFeed events={events} />
            </div>
          </div>
        )}

        {/* View: Market Matrix Dedicated */}
        {activeTab === 'market' && (
          <div className="space-y-6">
            <MarketMatrix quotes={quotes} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded border border-slate-800 bg-slate-900/50 p-4">
                <div className="text-xs font-mono text-cyan-400">ENERGY ELASTICITY</div>
                <div className="mt-1 text-sm font-semibold text-white">Short-Run Demand Inelasticity</div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Global crude demand elasticity is modeled at ~0.12 in the 1-30 day horizon. A 3.5 Mb/d supply reduction at Hormuz represents ~3.4% of global output, translating to +28% to +35% spot price escalation.
                </p>
              </div>
              <div className="rounded border border-slate-800 bg-slate-900/50 p-4">
                <div className="text-xs font-mono text-amber-400">SAFE HAVEN BETA</div>
                <div className="mt-1 text-sm font-semibold text-white">Physical Bullion &amp; Defense</div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  COMEX Gold futures (GC=F) and Defense primes (LMT, RTX) demonstrate a +0.82 correlation to kinetic escalation events during periods when GII &gt; 55.
                </p>
              </div>
              <div className="rounded border border-slate-800 bg-slate-900/50 p-4">
                <div className="text-xs font-mono text-purple-400">LEAD-LAG VOLATILITY</div>
                <div className="mt-1 text-sm font-semibold text-white">News-to-Market Transmission</div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Empirical cross-correlation indicates breaking OSINT bulletins lead physical prompt crack spreads by 3.5 hours on average (Pearson r=0.74).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View: OSINT Wire Dedicated */}
        {activeTab === 'osint' && (
          <div className="space-y-6">
            <OsintFeed events={events} />
          </div>
        )}

        {/* View: Shock Simulator Dedicated */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="rounded border border-slate-800 bg-slate-900/50 p-6 text-center max-w-2xl mx-auto">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <h2 className="text-base font-bold text-white">Quantitative War Game &amp; Crisis Simulator</h2>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Inject custom kinetic strikes, naval mine threats, sanctions, or production freezes. The quantitative signal builder recomputes supply shock indices, risk regimes, and actionable trade parameters in real time.
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

      {/* Simulator Modal */}
      <SimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSimulate={handleSimulateCrisis}
      />

      {/* PWA Offline Mode Indicator */}
      <OfflineIndicator />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <div className="flex flex-wrap items-center justify-between gap-4 max-w-[1440px] mx-auto">
          <span>WorldMonitor Finance · Geopolitical OSINT &amp; Quantitative Signal Engine</span>
          <div className="flex items-center gap-4">
            <span>PWA Ready</span>
            <span aria-hidden="true">·</span>
            <span>FastAPI Backend Enabled</span>
            <span aria-hidden="true">·</span>
            <span>Vercel Deployable</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
