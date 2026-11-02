import React, { useState } from 'react';
import { CHOKEPOINTS_REGISTRY, SupplyShockData } from '../services/signalEngine';
import { Navigation, AlertOctagon, TrendingUp, ShieldAlert, Crosshair } from 'lucide-react';

interface ChokepointMapProps {
  shocks: SupplyShockData[];
  onSelectChokepoint?: (chokepoint: string) => void;
}

export const ChokepointMap: React.FC<ChokepointMapProps> = ({ shocks, onSelectChokepoint }) => {
  const [selectedNode, setSelectedNode] = useState<string>('Strait of Hormuz');

  const shockMap = new Map(shocks.map(s => [s.chokepoint, s]));

  // Simplified projection mapping coordinates (lat/lon to 900x450 SVG space)
  const project = (lat: number, lon: number) => {
    const x = ((lon + 180) / 360) * 880 + 10;
    const y = ((90 - lat) / 180) * 430 + 10;
    return { x, y };
  };

  const chokepointList = Object.entries(CHOKEPOINTS_REGISTRY).map(([name, data]) => {
    const pos = project(data.lat, data.lon);
    const shock = shockMap.get(name);
    return {
      name,
      ...data,
      x: pos.x,
      y: pos.y,
      shock,
    };
  });

  const activeShock = shockMap.get(selectedNode);
  const activeNodeData = CHOKEPOINTS_REGISTRY[selectedNode];

  return (
    <div className="rounded border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <span>Strategic Maritime Chokepoint &amp; Supply Chain Radar</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time transit surveillance across 7 critical global energy and container bottlenecks
          </p>
        </div>

        {/* Chokepoint Selector Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {Object.keys(CHOKEPOINTS_REGISTRY).map(name => {
            const hasShock = shockMap.has(name);
            return (
              <button
                key={name}
                onClick={() => {
                  setSelectedNode(name);
                  if (onSelectChokepoint) onSelectChokepoint(name);
                }}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                  selectedNode === name
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : hasShock
                    ? 'bg-slate-800 text-amber-300 border border-amber-500/30 hover:bg-slate-700'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {name.replace(' Strait', '').replace(' Canal', '')}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Interactive Tactical SVG Map Viewport */}
        <div className="lg:col-span-3 relative rounded bg-slate-950 border border-slate-800/80 overflow-hidden h-[340px] flex items-center justify-center">
          <svg
            viewBox="0 0 900 450"
            className="w-full h-full select-none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <pattern id="gridPattern" width="45" height="45" patternUnits="userSpaceOnUse">
                <path d="M 45 0 L 0 0 0 45" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
            </defs>

            {/* Tactical Grid Background */}
            <rect width="900" height="450" fill="#090d16" />
            <rect width="900" height="450" fill="url(#gridPattern)" />

            {/* Latitude / Longitude Baseline Axes */}
            <line x1="0" y1="225" x2="900" y2="225" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="450" y1="0" x2="450" y2="450" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />

            {/* World Continents Schematic Contours (Tactical simplified polygon wireframes) */}
            <g fill="#0f172a" stroke="#1e293b" strokeWidth="1" opacity="0.8">
              {/* North America */}
              <path d="M 120 70 L 260 70 L 280 120 L 250 160 L 210 190 L 170 210 L 150 170 L 110 120 Z" />
              {/* South America */}
              <path d="M 230 220 L 290 240 L 320 280 L 290 380 L 250 390 L 230 300 Z" />
              {/* Europe & Africa */}
              <path d="M 420 80 L 510 80 L 520 150 L 480 160 L 450 140 L 420 110 Z" />
              <path d="M 440 170 L 530 180 L 560 250 L 520 360 L 470 340 L 430 230 Z" />
              {/* Asia */}
              <path d="M 530 70 L 760 70 L 780 150 L 700 230 L 640 210 L 570 170 Z" />
              {/* Australia */}
              <path d="M 720 280 L 800 280 L 810 350 L 730 350 Z" />
            </g>

            {/* Chokepoint Nodes and Threat Radii */}
            {chokepointList.map(node => {
              const isSelected = selectedNode === node.name;
              const hasAlert = !!node.shock;
              const shockScore = node.shock ? node.shock.supply_shock_index : 0;

              return (
                <g
                  key={node.name}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedNode(node.name);
                    if (onSelectChokepoint) onSelectChokepoint(node.name);
                  }}
                >
                  {/* Alert radar ring if under supply shock */}
                  {hasAlert && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={shockScore > 70 ? 22 : 14}
                      fill="none"
                      stroke={shockScore > 70 ? "#ef4444" : "#f59e0b"}
                      strokeWidth="1.5"
                      opacity="0.6"
                      strokeDasharray="2 4"
                    />
                  )}

                  {/* Selected target ring */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="16"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2"
                    />
                  )}

                  {/* Core node dot */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 6 : 4}
                    fill={hasAlert ? (shockScore > 70 ? "#ef4444" : "#f59e0b") : "#38bdf8"}
                  />

                  {/* Node Label */}
                  <text
                    x={node.x}
                    y={node.y - 10}
                    textAnchor="middle"
                    fill={isSelected ? "#38bdf8" : hasAlert ? "#fcd34d" : "#94a3b8"}
                    fontSize={isSelected ? "11" : "9"}
                    fontFamily="monospace"
                    fontWeight={isSelected ? "bold" : "normal"}
                  >
                    {node.name.replace(' Strait', '').replace(' Canal', '')}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Coordinate watermark / status overlay */}
          <div className="absolute bottom-2 left-3 text-[10px] text-slate-500 font-mono">
            GEO-REF: WGS-84 · 7 MONITORED NODES
          </div>
        </div>

        {/* Selected Chokepoint Deep-Dive Panel */}
        <div className="rounded bg-slate-950/80 border border-slate-800 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono text-cyan-400">CHOKEPOINT INTEL</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {activeNodeData?.lat.toFixed(2)}°N {activeNodeData?.lon.toFixed(2)}°E
              </span>
            </div>

            <div className="mt-3">
              <h3 className="text-sm font-bold text-white">{selectedNode}</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                {activeNodeData?.note}
              </p>
            </div>

            {activeShock ? (
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Supply Shock Index:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {activeShock.supply_shock_index} / 100
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Disrupted Capacity:</span>
                  <span className="font-mono text-rose-300 font-semibold">
                    {activeShock.estimated_disrupted_volume}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Price Impact Est:</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    +{activeShock.projected_price_impact_pct}%
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400 bg-slate-900/90 p-2 rounded border border-slate-800">
                  <span className="text-amber-400 font-medium">Impacted Assets:</span>{' '}
                  <span className="font-mono text-slate-200">{activeShock.affected_assets.join(', ')}</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="text-xs text-slate-500">
                  Status: <span className="text-slate-300 font-medium">Nominal transit operations</span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  No active kinetic blockades reported at this node in current telemetry window.
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Click any node on the radar to evaluate commodity flow elasticity.
          </div>
        </div>
      </div>
    </div>
  );
};
