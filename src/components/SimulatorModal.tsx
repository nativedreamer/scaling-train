import React, { useState } from 'react';
import { X, Play, RefreshCw, Zap, ShieldAlert } from 'lucide-react';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulate: (scenario: {
    headline: string;
    region: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    chokepoint: string | null;
    impacted_commodities: string[];
    sentiment_score: number;
    summary: string;
    latitude: number;
    longitude: number;
  }) => void;
}

export const SimulatorModal: React.FC<SimulatorModalProps> = ({
  isOpen,
  onClose,
  onSimulate,
}) => {
  const PRESET_SCENARIOS = [
    {
      title: "Hormuz Strait Mine Threat & Tanker Impoundment",
      headline: "Naval Mines Discovered in Strait of Hormuz Northern Channel; 3 VLCC Supertankers Halt Transit",
      region: "Middle East",
      severity: "CRITICAL" as const,
      chokepoint: "Strait of Hormuz",
      impacted_commodities: ["BRENT", "WTI", "LNG", "GOLD"],
      sentiment_score: -0.92,
      summary: "Commercial shipping halts across Persian Gulf exit lanes following reported mine sightings. War-risk insurance cancelled. Brent crude prompt crack spreads spike +18%.",
      latitude: 26.5667,
      longitude: 56.2500,
    },
    {
      title: "Taiwan Strait Air Defense Identification Enclosure",
      headline: "PLA Imposes 72-Hour No-Fly and Maritime Exclusion Perimeter Across Taiwan Strait Logistics Corridors",
      region: "Indo-Pacific",
      severity: "HIGH" as const,
      chokepoint: "Taiwan Strait",
      impacted_commodities: ["TSM", "COPPER", "GOLD", "DXY"],
      sentiment_score: -0.85,
      summary: "Major container lines and air freighters divert away from northern Taiwan corridors. Global tech supply chains alert on potential wafer delivery delays.",
      latitude: 24.0000,
      longitude: 119.5000,
    },
    {
      title: "Red Sea Submarine Cable Severance & Missile Salvo",
      headline: "Three Red Sea Undersea Telecomm Cables Severed Amid Coastal Missile Launches",
      region: "Middle East",
      severity: "CRITICAL" as const,
      chokepoint: "Bab el-Mandeb",
      impacted_commodities: ["BRENT", "LNG", "GOLD"],
      sentiment_score: -0.88,
      summary: "Combined maritime kinetic strikes and critical subsea cable sabotage cut 25% of Asia-to-Europe data bandwidth and push tanker freight rates to 18-month highs.",
      latitude: 12.5833,
      longitude: 43.3333,
    },
    {
      title: "OPEC+ Sudden 1.5M bpd Quota Curtailment",
      headline: "OPEC+ Extraordinary Summit Announces Unscheduled 1.5M bpd Production Roll-Back Through Q4",
      region: "Global Macro",
      severity: "HIGH" as const,
      chokepoint: null,
      impacted_commodities: ["BRENT", "WTI", "NATGAS"],
      sentiment_score: -0.65,
      summary: "Surprise ministerial intervention tightens prompt physical supplies ahead of winter heating demand, drawing down OECD strategic petroleum reserves.",
      latitude: 48.2082,
      longitude: 16.3738,
    },
  ];

  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [headline, setHeadline] = useState(PRESET_SCENARIOS[0].headline);
  const [region, setRegion] = useState(PRESET_SCENARIOS[0].region);
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>(PRESET_SCENARIOS[0].severity);
  const [chokepoint, setChokepoint] = useState<string | null>(PRESET_SCENARIOS[0].chokepoint);
  const [commoditiesStr, setCommoditiesStr] = useState(PRESET_SCENARIOS[0].impacted_commodities.join(', '));
  const [summaryText, setSummaryText] = useState(PRESET_SCENARIOS[0].summary);

  if (!isOpen) return null;

  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    const p = PRESET_SCENARIOS[index];
    setHeadline(p.headline);
    setRegion(p.region);
    setSeverity(p.severity);
    setChokepoint(p.chokepoint);
    setCommoditiesStr(p.impacted_commodities.join(', '));
    setSummaryText(p.summary);
  };

  const handleRun = () => {
    const commodities = commoditiesStr.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    const preset = PRESET_SCENARIOS[selectedPresetIndex];
    onSimulate({
      headline,
      region,
      severity,
      chokepoint: chokepoint || null,
      impacted_commodities: commodities.length > 0 ? commodities : ['BRENT', 'GOLD'],
      sentiment_score: severity === 'CRITICAL' ? -0.88 : severity === 'HIGH' ? -0.72 : -0.45,
      summary: summaryText,
      latitude: preset?.latitude || 26.5,
      longitude: preset?.longitude || 56.2,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-lg bg-slate-900 border border-slate-700 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Geopolitical Shock &amp; Crisis Simulator</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Preset Buttons */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1.5">
              WAR GAME CRISIS PRESETS
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_SCENARIOS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(idx)}
                  className={`text-left p-2.5 rounded border transition-colors cursor-pointer ${
                    selectedPresetIndex === idx
                      ? 'bg-cyan-950/80 border-cyan-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="font-semibold text-slate-200">{p.title}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {p.region} · {p.severity} {p.chokepoint ? `· ${p.chokepoint}` : ''}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Incident Parameters Form */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                OSINT HEADLINE DISPATCH
              </label>
              <input
                type="text"
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  THEATER / REGION
                </label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Middle East">Middle East</option>
                  <option value="Indo-Pacific">Indo-Pacific</option>
                  <option value="Eastern Europe">Eastern Europe</option>
                  <option value="Africa">Africa</option>
                  <option value="Global Macro">Global Macro</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  SEVERITY TIER
                </label>
                <select
                  value={severity}
                  onChange={e => setSeverity(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  CHOKEPOINT
                </label>
                <select
                  value={chokepoint || ''}
                  onChange={e => setChokepoint(e.target.value || null)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">None / Regional</option>
                  <option value="Strait of Hormuz">Strait of Hormuz</option>
                  <option value="Bab el-Mandeb">Bab el-Mandeb</option>
                  <option value="Taiwan Strait">Taiwan Strait</option>
                  <option value="Malacca Strait">Malacca Strait</option>
                  <option value="Suez Canal">Suez Canal</option>
                  <option value="Bosphorus Strait">Bosphorus Strait</option>
                  <option value="Panama Canal">Panama Canal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                IMPACTED ASSETS (COMMA-SEPARATED)
              </label>
              <input
                type="text"
                value={commoditiesStr}
                onChange={e => setCommoditiesStr(e.target.value)}
                placeholder="BRENT, WTI, LNG, GOLD, TSM"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                INTELLIGENCE SITREP &amp; SUPPLY SHOCK CONTEXT
              </label>
              <textarea
                rows={3}
                value={summaryText}
                onChange={e => setSummaryText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950">
          <span className="text-[11px] text-slate-500">
            Injects event into the signal builder and triggers live elasticity updates.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleRun}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute Simulation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
