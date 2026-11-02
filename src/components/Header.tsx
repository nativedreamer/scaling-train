import React from 'react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { Globe, Radio, Bell, ShieldAlert, Cpu } from 'lucide-react';

interface HeaderProps {
  activeTab: 'signals' | 'map' | 'market' | 'osint' | 'simulator';
  setActiveTab: (tab: 'signals' | 'map' | 'market' | 'osint' | 'simulator') => void;
  onOpenSimulator: () => void;
  criticalAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSimulator,
  criticalAlertCount,
}) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-5 py-3 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-7 h-7 rounded bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
          <Globe className="w-4 h-4" />
        </div>
        <a
          href="/"
          className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-cyan-400 transition-colors"
        >
          WorldMonitor Finance
        </a>
      </div>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('signals')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'signals' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Signals
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'map' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Chokepoints
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'market' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Market Matrix
        </button>
        <button
          onClick={() => setActiveTab('osint')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'osint' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          <span>OSINT Wire</span>
          {criticalAlertCount > 0 && (
            <span className="text-[10px] text-amber-400 font-mono">({criticalAlertCount})</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'simulator' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Shock Simulator
        </button>
      </nav>

      {/* Zone 3: 1 primary action & PWA installer */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenSimulator}
          className="hidden sm:flex items-center gap-1.5 rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Simulate Crisis</span>
        </button>
        <PWAInstallButton />
      </div>
    </header>
  );
};
