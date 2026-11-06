import React from 'react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { Globe, Cpu } from 'lucide-react';

interface HeaderProps {
  activeTab: 'signals' | 'map' | 'market' | 'osint' | 'simulator';
  setActiveTab: (tab: 'signals' | 'map' | 'market' | 'osint' | 'simulator') => void;
  onOpenSimulator: () => void;
  criticalAlertCount: number;
}

const TABS: { id: HeaderProps['activeTab']; label: string }[] = [
  { id: 'signals', label: 'Signals' },
  { id: 'map', label: 'Chokepoints' },
  { id: 'market', label: 'Market' },
  { id: 'osint', label: 'OSINT' },
  { id: 'simulator', label: 'Simulator' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSimulator,
  criticalAlertCount,
}) => {
  return (
    <header className="sticky top-0 z-40 safe-top border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-5 py-2.5">
        <div className="flex items-center gap-2.5 shrink-0 min-w-0">
          <div className="w-7 h-7 rounded-md bg-cyan-950/80 border border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <a
            href="/"
            className="pressable text-sm sm:text-base font-bold tracking-tight text-white whitespace-nowrap truncate"
          >
            WorldMonitor<span className="hidden sm:inline"> Finance</span>
          </a>
        </div>

        <nav
          className="hidden md:flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-900/80 border border-slate-800/80"
          aria-label="Primary"
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pressable relative px-3 py-1.5 text-xs font-medium rounded-md ${
                  active
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'text-slate-400'
                }`}
              >
                {tab.label}
                {tab.id === 'osint' && criticalAlertCount > 0 && (
                  <span className="ml-1.5 text-[10px] font-mono text-amber-400 tabular-nums">
                    {criticalAlertCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSimulator}
            className="pressable hidden sm:inline-flex items-center gap-1.5 rounded-md border border-slate-700/90 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulate</span>
          </button>
          <PWAInstallButton />
        </div>
      </div>

      {/* Mobile tab strip — horizontal scroll, no sticky hover traps */}
      <div className="md:hidden flex gap-1 px-3 pb-2 overflow-x-auto overscroll-x-contain">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pressable shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border ${
                active
                  ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400'
              }`}
            >
              {tab.label}
              {tab.id === 'osint' && criticalAlertCount > 0 ? ` · ${criticalAlertCount}` : ''}
            </button>
          );
        })}
      </div>
    </header>
  );
};
