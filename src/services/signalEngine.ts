/**
 * WorldMonitor Finance Quantitative Signal Engine (Client & Server Core)
 * Directly implements WorldMonitor's authentic commodity universe,
 * transmission chains (macro ripple logic), and news-market lead-lag correlation metrics.
 */

export interface TransmissionNode {
  node: string;
  impact_type: string;
  logic: string;
}

export interface OsintEvent {
  id: string;
  timestamp: string;
  headline: string;
  source: string;
  region: 'Middle East' | 'Indo-Pacific' | 'Eastern Europe' | 'Africa' | 'Global Macro' | string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  chokepoint: string | null;
  impacted_commodities: string[];
  verified: boolean;
  summary: string;
  sentiment_score: number;
  latitude: number;
  longitude: number;
}

export interface MarketAssetQuote {
  symbol: string;
  yahoo_symbol: string;
  name: string;
  category: 'ENERGY' | 'METALS' | 'DEFENSE' | 'TECH_SEMI' | 'AGRI' | 'FX_RATES' | 'VOLATILITY';
  price: number;
  change_24h_pct: number;
  high_24h: number;
  low_24h: number;
  volume_24h: number;
  rsi_14: number;
  volatility_zscore: number;
  atr_14: number;
  bollinger_pos: number;
  trend_state: 'BULLISH_MOMENTUM' | 'BEARISH_MOMENTUM' | 'NEUTRAL' | 'OVERSOLD_BOUNCE' | 'OVERBOUGHT_PULLBACK';
  sparkline: number[];
  last_updated: string;
}

export interface QuantitativeSignal {
  id: string;
  ticker: string;
  yahoo_symbol: string;
  asset_name: string;
  action: 'STRONG BUY' | 'BUY' | 'TACTICAL LONG' | 'HEDGE LONG' | 'NEUTRAL' | 'SELL';
  strategy_name: string;
  confidence_score: number;
  entry_price: number;
  target_price: number;
  stop_loss: number;
  risk_reward_ratio: number;
  horizon: 'INTRADAY' | '1-3 DAYS' | 'SWING 1-2 WEEKS';
  kelly_fraction_pct: number;
  osint_catalyst_id: string;
  catalyst_headline: string;
  catalyst_source: string;
  chokepoint: string | null;
  trade_thesis: string;
  transmission_chain: TransmissionNode[];
  technical_triggers: string[];
  lead_lag_relationship: string;
  created_at: string;
}

export interface InstabilityMetrics {
  composite_gii_score: number;
  risk_regime: 'LOW_FRICTION' | 'ELEVATED_FRICTION' | 'HIGH_VOLATILITY' | 'CRITICAL_SYSTEMIC';
  kinetic_intensity: number;
  chokepoint_threat: number;
  sanctions_friction: number;
  unrest_factor: number;
  tail_risk_weight: number;
  recommended_safe_haven_allocation: number;
  primary_theaters: string[];
}

export interface SupplyShockData {
  chokepoint: string;
  supply_shock_index: number;
  estimated_disrupted_volume: string;
  projected_price_impact_pct: number;
  affected_assets: string[];
  signal_bias: string;
  urgency_tier: 'IMMEDIATE' | '24H_HORIZON' | 'EXTENDED';
  thesis: string;
  transmission_chain: TransmissionNode[];
}

export interface SentimentAnalysis {
  aggregate_polarity: number;
  dispersion_variance: number;
  rumor_velocity: 'ACCELERATING' | 'STABLE' | 'DECAYING';
  contrarian_bias: 'OVERREACTION_FADE' | 'MOMENTUM_FOLLOW' | 'ACCUMULATE_SAFE_HAVEN';
  interpretation: string;
  lead_lag: {
    relationship: 'news-leads' | 'market-leads' | 'neither';
    lead_hours: number;
    pearson_coefficient: number;
    sample_size: number;
  };
}

export interface EngineSummary {
  gii: InstabilityMetrics;
  sentiment: SentimentAnalysis;
  active_signal_count: number;
  critical_shocks_count: number;
  highest_risk_chokepoint: string;
  max_shock_index: number;
  recommended_hedge_pct: number;
  updated_at: string;
}

export const CHOKEPOINTS_REGISTRY: Record<string, { lat: number; lon: number; capacity_mbpd?: number; note: string }> = {
  "Strait of Hormuz": { lat: 26.5667, lon: 56.2500, capacity_mbpd: 21.0, note: "21% of global petroleum consumption transit node" },
  "Bab el-Mandeb": { lat: 12.5833, lon: 43.3333, capacity_mbpd: 8.8, note: "Southern gateway to Red Sea & Suez Canal" },
  "Taiwan Strait": { lat: 24.0000, lon: 119.5000, note: "Critical corridor for 52% of advanced global semiconductors" },
  "Malacca Strait": { lat: 2.5000, lon: 101.5000, capacity_mbpd: 16.0, note: "Key Indo-Pacific maritime chokepoint to East Asian refineries" },
  "Suez Canal": { lat: 30.5852, lon: 32.2654, capacity_mbpd: 5.5, note: "12% of total global merchandise trade volume" },
  "Bosphorus Strait": { lat: 41.1167, lon: 29.0833, capacity_mbpd: 3.0, note: "Primary maritime outlet for Black Sea grain and crude" },
  "Panama Canal": { lat: 9.0800, lon: -79.6800, capacity_mbpd: 1.2, note: "Critical Western Hemisphere LNG and dry bulk corridor" },
};

export const INITIAL_EVENTS: OsintEvent[] = [
  {
    id: "wm-osint-h01",
    timestamp: new Date().toISOString(),
    headline: "IRGC Fast Attack Craft Intercept Commercial VLCC in Strait of Hormuz Traffic Separation Scheme",
    source: "UKMTO / Naval Intel Bulletin",
    region: "Middle East",
    severity: "CRITICAL",
    chokepoint: "Strait of Hormuz",
    impacted_commodities: ["BRENT", "WTI", "NATGAS", "GOLD"],
    verified: true,
    summary: "Commercial tanker transiting inbound through northern TSS challenged by armed craft. Coalition maritime task force dispatched. Persian Gulf war-risk hull premiums escalated +35%.",
    sentiment_score: -0.88,
    latitude: 26.5667,
    longitude: 56.2500,
  },
  {
    id: "wm-osint-r02",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    headline: "Anti-Ship Ballistic Missile Salvo Targets Bulk Carrier in Southern Red Sea; Bab el-Mandeb Transit Capacity Reduced 42%",
    source: "MARAD Advisory / Defense Daily",
    region: "Middle East",
    severity: "CRITICAL",
    chokepoint: "Bab el-Mandeb",
    impacted_commodities: ["BRENT", "TTF GAS", "NATGAS", "GOLD"],
    verified: true,
    summary: "Multiple kinetic launches reported 45nm southwest of Mokha. Container liner rerouting via Cape of Good Hope adds 11-14 days transit and $1.8M fuel surcharge per voyage.",
    sentiment_score: -0.82,
    latitude: 12.5833,
    longitude: 43.3333,
  },
  {
    id: "wm-osint-t03",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    headline: "PLA Eastern Theater Command Initiates Joint Fire Strike Exercises with Live Missile Envelope Enclosing Taiwan Strait",
    source: "INDOPACOM Situation Report",
    region: "Indo-Pacific",
    severity: "HIGH",
    chokepoint: "Taiwan Strait",
    impacted_commodities: ["TSM", "COPPER", "GOLD", "LMT"],
    verified: true,
    summary: "Airspace and maritime exclusion notices issued across 6 maritime coordinates surrounding key shipping lanes. Major semiconductor logistics carriers delaying cargo dispatch by 72 hours.",
    sentiment_score: -0.74,
    latitude: 24.1500,
    longitude: 120.2000,
  },
  {
    id: "wm-osint-b04",
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    headline: "Critical Grain Terminal in Odesa Struck by Drone Swarm; Black Sea Corridor Insurance Guarantees Suspended",
    source: "OSINT Conflict Pulse / Reuters",
    region: "Eastern Europe",
    severity: "HIGH",
    chokepoint: "Bosphorus Strait",
    impacted_commodities: ["WHEAT", "BRENT"],
    verified: true,
    summary: "Pivotal export silo facilities sustained structural fires. Commercial underwriters at Lloyd's withdrew hull war risk cover for Danube and deep-water Black Sea loadings.",
    sentiment_score: -0.69,
    latitude: 46.4825,
    longitude: 30.7233,
  },
  {
    id: "wm-osint-s05",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    headline: "Sahel Junta Alliance Suspends Strategic Uranium and Lithium Export Licenses to Western Consortiums",
    source: "Africa Energy & Minerals Monitor",
    region: "Africa",
    severity: "MEDIUM",
    chokepoint: null,
    impacted_commodities: ["URANIUM", "GOLD"],
    verified: true,
    summary: "National mining code revision halts ongoing shipments from major Arlit pits. Spot uranium prices jumped +4.2% on European utility supply security reviews.",
    sentiment_score: -0.55,
    latitude: 18.7322,
    longitude: 7.3853,
  },
  {
    id: "wm-osint-o06",
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    headline: "OPEC+ Extraordinary Ministerial Committee Signals Unscheduled 800k bpd Voluntary Production Roll-Over",
    source: "Vienna Energy Dispatch",
    region: "Global Macro",
    severity: "MEDIUM",
    chokepoint: null,
    impacted_commodities: ["BRENT", "WTI"],
    verified: true,
    summary: "Ministerial consensus reached to prolong output discipline through Q3, tightening prompt crude physical balances against OECD inventory draws.",
    sentiment_score: 0.25,
    latitude: 48.2082,
    longitude: 16.3738,
  }
];

export const INITIAL_QUOTES: MarketAssetQuote[] = [
  {
    symbol: "BRENT",
    yahoo_symbol: "BZ=F",
    name: "Brent Crude Oil",
    category: "ENERGY",
    price: 82.45,
    change_24h_pct: 2.85,
    high_24h: 83.90,
    low_24h: 80.15,
    volume_24h: 482000,
    rsi_14: 64.2,
    volatility_zscore: 1.84,
    atr_14: 2.15,
    bollinger_pos: 0.78,
    trend_state: "BULLISH_MOMENTUM",
    sparkline: [79.8, 80.1, 80.5, 80.2, 80.9, 81.4, 81.1, 81.8, 82.1, 81.9, 82.3, 82.45],
    last_updated: new Date().toISOString(),
  },
  {
    symbol: "WTI",
    yahoo_symbol: "CL=F",
    name: "Crude Oil WTI",
    category: "ENERGY",
    price: 78.10,
    change_24h_pct: 2.45,
    high_24h: 79.30,
    low_24h: 76.20,
    volume_24h: 620000,
    rsi_14: 61.8,
    volatility_zscore: 1.62,
    atr_14: 2.05,
    bollinger_pos: 0.74,
    trend_state: "BULLISH_MOMENTUM",
    sparkline: [75.9, 76.1, 76.5, 76.3, 76.8, 77.1, 77.0, 77.4, 77.7, 77.5, 77.9, 78.1],
    last_updated: new Date().toISOString(),
  },
  {
    symbol: "TTF GAS",
    yahoo_symbol: "TTF=F",
    name: "Dutch TTF Natural Gas",
    category: "ENERGY",
    price: 38.65,
    change_24h_pct: 4.15,
    high_24h: 39.80,
    low_24h: 36.90,
    volume_24h: 128000,
    rsi_14: 67.2,
    volatility_zscore: 1.95,
    atr_14: 1.85,
    bollinger_pos: 0.81,
    trend_state: "BULLISH_MOMENTUM",
    sparkline: [36.2, 36.5, 36.9, 36.7, 37.2, 37.8, 37.5, 38.1, 38.4, 38.2, 38.5, 38.65],
    last_updated: new Date().toISOString(),
  },
  {
    symbol: "NATGAS",
    yahoo_symbol: "NG=F",
    name: "Henry Hub Natural Gas",
    category: "ENERGY",
    price: 2.74,
    change_24h_pct: 3.12,
    high_24h: 2.82,
    low_24h: 2.65,
    volume_24h: 215000,
    rsi_14: 58.4,
    volatility_zscore: 1.15,
    atr_14: 0.12,
    bollinger_pos: 0.65,
    trend_state: "BULLISH_MOMENTUM",
    sparkline: [2.62, 2.63, 2.65, 2.64, 2.67, 2.69, 2.68, 2.70, 2.72, 2.71, 2.73, 2.74],
    last_updated: new Date().toISOString(),
  },
  {
    symbol: "GOLD",
    yahoo_symbol: "GC=F",
    name: "Gold COMEX Futures",
    category: "METALS",
    price: 2684.20,
    change_24h_pct: 1.42,
    high_24h: 2695.50,
    low_24h: 2652.00,
    volume_24h: 185000,
    rsi_14: 68.5,
    volatility_zscore: 1.45,
    atr_14: 28.40,
    bollinger_pos: 0.82,
    trend_state: "BULLISH_MOMENTUM",
    sparkline: [2642, 2648, 2655, 2651, 2660, 2668, 2664, 2672, 2678, 2675, 2681, 2684.2],
    last_updated: new Date().toISOString(),
  },
  {
    symbol: "SILVER",
    yahoo_symbol: "SI=F",
    name: "Silver COMEX Spot",
    category: "METALS",
    price: 31.85,
    change_24h_pct: 1.95,
    high_24h: 32.20,
    low_24h: 31.10,
    volume_24h: 94000,
    rsi_14: 63.2,
    volatility_zscore: 1.25,
    atr_14: 0.65,
    bollinger_pos: 0.72,
    trend_state: "BULLISH_MOMENTUM",
    sparkline: [31.1, 31.2, 31.35, 31.25, 31.45, 31.6, 31.5, 31.68, 31.75, 31.7, 31.8, 31.85],
    last_updated: new Date().toISOString(),
  },
  {
    symbol: "COPPER",
    yahoo_symbol: "HG=F",
    name: "High Grade Copper",
    category: "METALS",
    price: 4.38,
    change_24h_pct: -0.68,
    high_24h: 4.45,
    low_24h: 4.34,
    volume_24h: 76000,
    rsi_14: 48.5,
    volatility_zscore: -0.45,
    atr_14: 0.08,
    bollinger_pos: 0.44,
    trend_state: "NEUTRAL",
    sparkline: [4.42, 4.41, 4.43, 4.40, 4.39, 4.37, 4.38, 4.36, 4.37, 4.38, 4.37, 4.38],
    last_updated: new Date().toISOString(),
  },
  {
    symbol: "URANIUM",
    yahoo_symbol: "URA",
    name: "Uranium Global X ETF",
    category: "ENERGY",
    price: 29.80,
    change_24h_pct: 3.25,
    high_24h: 30.40,
    low_24h: 28.70,
    volume_24h: 4100000,
    rsi_14: 62.8,
    volatility_zscore: 1.48,
    atr_14: 0.95,
    bollinger_pos: 0.73,
    trend_state: "BULLISH_MOMENTUM",
    sparkline: [28.6, 28.8, 29.1, 28.9, 29.3, 29.5, 29.4, 29.6, 29.75, 29.6, 29.7, 29.8],
    last_updated: new Date().toISOString(),
  },
  {
    symbol: "WHEAT",
    yahoo_symbol: "ZW=F",
    name: "Chicago SRW Wheat",
    category: "AGRI",
    price: 578.50,
    change_24h_pct: 2.15,
    high_24h: 585.00,
    low_24h: 564.00,
    volume_24h: 112000,
    rsi_14: 59.8,
    volatility_zscore: 1.35,
    atr_14: 12.80,
    bollinger_pos: 0.68,
    trend_state: "BULLISH_MOMENTUM",
    sparkline: [562, 565, 568, 566, 571, 574, 572, 575, 577, 576, 577.8, 578.5],
    last_updated: new Date().toISOString(),
  },
  {
    symbol: "VIX",
    yahoo_symbol: "^VIX",
    name: "CBOE Volatility Index",
    category: "VOLATILITY",
    price: 18.65,
    change_24h_pct: 6.45,
    high_24h: 19.40,
    low_24h: 17.20,
    volume_24h: 0,
    rsi_14: 66.4,
    volatility_zscore: 1.72,
    atr_14: 1.45,
    bollinger_pos: 0.77,
    trend_state: "BULLISH_MOMENTUM",
    sparkline: [17.1, 17.3, 17.6, 17.4, 17.8, 18.1, 18.0, 18.3, 18.5, 18.4, 18.6, 18.65],
    last_updated: new Date().toISOString(),
  },
  {
    symbol: "LMT",
    yahoo_symbol: "LMT",
    name: "Lockheed Martin Corp",
    category: "DEFENSE",
    price: 562.40,
    change_24h_pct: 1.85,
    high_24h: 566.20,
    low_24h: 551.00,
    volume_24h: 920000,
    rsi_14: 65.4,
    volatility_zscore: 1.55,
    atr_14: 7.20,
    bollinger_pos: 0.79,
    trend_state: "BULLISH_MOMENTUM",
    sparkline: [550, 552, 554, 553, 556, 558, 557, 560, 561, 560.5, 561.8, 562.4],
    last_updated: new Date().toISOString(),
  },
  {
    symbol: "RTX",
    yahoo_symbol: "RTX",
    name: "RTX Corporation",
    category: "DEFENSE",
    price: 124.80,
    change_24h_pct: 1.65,
    high_24h: 125.90,
    low_24h: 122.50,
    volume_24h: 3100000,
    rsi_14: 62.1,
    volatility_zscore: 1.30,
    atr_14: 1.75,
    bollinger_pos: 0.71,
    trend_state: "BULLISH_MOMENTUM",
    sparkline: [122.5, 122.8, 123.1, 123.0, 123.5, 123.9, 123.8, 124.2, 124.5, 124.3, 124.7, 124.8],
    last_updated: new Date().toISOString(),
  },
  {
    symbol: "TSM",
    yahoo_symbol: "TSM",
    name: "Taiwan Semiconductor (ADR)",
    category: "TECH_SEMI",
    price: 194.50,
    change_24h_pct: -1.75,
    high_24h: 198.20,
    low_24h: 192.40,
    volume_24h: 14200000,
    rsi_14: 42.1,
    volatility_zscore: -0.92,
    atr_14: 4.80,
    bollinger_pos: 0.36,
    trend_state: "BEARISH_MOMENTUM",
    sparkline: [198.5, 197.8, 197.2, 196.5, 196.0, 195.2, 195.8, 194.9, 194.5, 194.8, 194.2, 194.5],
    last_updated: new Date().toISOString(),
  },
  {
    symbol: "EUR/USD",
    yahoo_symbol: "EURUSD=X",
    name: "Euro / US Dollar",
    category: "FX_RATES",
    price: 1.0825,
    change_24h_pct: -0.32,
    high_24h: 1.0865,
    low_24h: 1.0810,
    volume_24h: 0,
    rsi_14: 46.5,
    volatility_zscore: -0.55,
    atr_14: 0.0055,
    bollinger_pos: 0.42,
    trend_state: "NEUTRAL",
    sparkline: [1.0855, 1.0850, 1.0845, 1.0848, 1.0840, 1.0835, 1.0838, 1.0830, 1.0828, 1.0825, 1.0822, 1.0825],
    last_updated: new Date().toISOString(),
  }
];

export class SignalEngine {
  private events: OsintEvent[] = [...INITIAL_EVENTS];
  private quotes: MarketAssetQuote[] = [...INITIAL_QUOTES];

  public getEvents(region?: string, severity?: string): OsintEvent[] {
    let result = [...this.events];
    if (region && region !== 'all') {
      result = result.filter(e => e.region.toLowerCase() === region.toLowerCase());
    }
    if (severity && severity !== 'all') {
      result = result.filter(e => e.severity.toLowerCase() === severity.toLowerCase());
    }
    return result;
  }

  public getQuotes(): MarketAssetQuote[] {
    return [...this.quotes];
  }

  public calculateInstabilityIndex(): InstabilityMetrics {
    const critical = this.events.filter(e => e.severity === 'CRITICAL').length;
    const high = this.events.filter(e => e.severity === 'HIGH').length;
    const chokepoints = this.events.filter(e => !!e.chokepoint).length;

    const kinetic = Math.min(100, 30 + critical * 22 + high * 12);
    const chokepointThreat = Math.min(100, 20 + chokepoints * 24);
    const sanctions = Math.min(100, 45 + high * 8);
    const unrest = Math.min(100, 35 + critical * 10);
    const tailRisk = Math.min(100, 25 + critical * 18);

    const gii = Number((kinetic * 0.35 + chokepointThreat * 0.25 + sanctions * 0.15 + unrest * 0.15 + tailRisk * 0.10).toFixed(1));

    let regime: InstabilityMetrics['risk_regime'] = 'LOW_FRICTION';
    let hedge = 8.0;
    if (gii >= 75) {
      regime = 'CRITICAL_SYSTEMIC';
      hedge = 35.0;
    } else if (gii >= 55) {
      regime = 'HIGH_VOLATILITY';
      hedge = 25.0;
    } else if (gii >= 35) {
      regime = 'ELEVATED_FRICTION';
      hedge = 15.0;
    }

    const theaters = Array.from(new Set(this.events.map(e => e.region))).slice(0, 4);

    return {
      composite_gii_score: gii,
      risk_regime: regime,
      kinetic_intensity: Number(kinetic.toFixed(1)),
      chokepoint_threat: Number(chokepointThreat.toFixed(1)),
      sanctions_friction: Number(sanctions.toFixed(1)),
      unrest_factor: Number(unrest.toFixed(1)),
      tail_risk_weight: Number(tailRisk.toFixed(1)),
      recommended_safe_haven_allocation: hedge,
      primary_theaters: theaters,
    };
  }

  public calculateSupplyShocks(): SupplyShockData[] {
    const chokepointEvents = this.events.filter(e => !!e.chokepoint);
    const capacityMap: Record<string, number> = {
      "Strait of Hormuz": 21.0,
      "Bab el-Mandeb": 8.8,
      "Malacca Strait": 16.0,
      "Suez Canal": 5.5,
      "Bosphorus Strait": 3.0,
      "Panama Canal": 1.2,
    };

    return chokepointEvents.map(event => {
      const cp = event.chokepoint!;
      const baseCap = capacityMap[cp] || 5.0;
      let ratio = 0.08;
      let shockScore = 42.0;
      let urgency: SupplyShockData['urgency_tier'] = 'EXTENDED';

      if (event.severity === 'CRITICAL') {
        ratio = 0.35;
        shockScore = 88.5;
        urgency = 'IMMEDIATE';
      } else if (event.severity === 'HIGH') {
        ratio = 0.20;
        shockScore = 68.0;
        urgency = '24H_HORIZON';
      }

      const disrupted = baseCap * ratio;
      const globalFraction = disrupted / 102.0;
      const priceImpact = Number(Math.min(45.0, (globalFraction / 0.12) * 100 * 0.45).toFixed(1));

      let bias = 'LONG_ENERGY';
      let assets = ['BRENT', 'WTI', 'NATGAS', 'GOLD'];
      let chain: TransmissionNode[] = [];

      if (cp.includes('Hormuz')) {
        bias = 'LONG_ENERGY';
        assets = ['BRENT', 'WTI', 'NATGAS', 'GOLD'];
        chain = [
          { node: "TSS Corridor Interdiction", impact_type: "Maritime Hazard", logic: "Fast craft and mine alerts restrict commercial VLCC passage" },
          { node: "Lloyd's JWC War Risk", impact_type: "Insurance Surcharge", logic: "Persian Gulf designated breach zone triggers +35% hull insurance premium" },
          { node: "VLCC Freight Fixtures", impact_type: "Transport Cost", logic: "Persian Gulf to Asia spot tanker rates surge from WS55 to WS98" },
          { node: "Refinery Inventory Drain", impact_type: "Physical Deficit", logic: "Prompt Dated Brent spot premia jump as Asian refiners scramble for prompt supply" }
        ];
      } else if (cp.includes('Mandeb') || cp.includes('Suez')) {
        bias = 'LONG_ENERGY';
        assets = ['BRENT', 'TTF GAS', 'NATGAS', 'GOLD'];
        chain = [
          { node: "Southern Red Sea Missile Threat", impact_type: "Kinetic Hazard", logic: "Commercial vessels rerouted around Africa via Cape of Good Hope" },
          { node: "Cape of Good Hope Diversion", impact_type: "Ton-Mile Expansion", logic: "Adds 10-14 days transit duration (+3,500 nautical miles) per voyage" },
          { node: "European TTF Gas Inflows", impact_type: "Storage Deficit", logic: "Delayed Qatari LNG cargoes force European drawdown of subterranean gas reserves" },
          { node: "Defense Industrial Procurement", impact_type: "Order Backlog", logic: "US and European naval operations stimulate defense replenishment (LMT, RTX)" }
        ];
      } else if (cp.includes('Bosphorus')) {
        bias = 'LONG_GRAIN';
        assets = ['WHEAT', 'BRENT'];
        chain = [
          { node: "Danube / Black Sea Terminal Hit", impact_type: "Terminal Fire", logic: "Grain loading berths halted; cargo underwriters cancel war risk cover" },
          { node: "Bosphorus Transit Queue", impact_type: "Congestion", logic: "Bulker backlog delays wheat exports to Mediterranean and North African buyers" }
        ];
      } else if (cp.includes('Taiwan')) {
        bias = 'LONG_DEFENSE';
        assets = ['TSM', 'COPPER', 'GOLD', 'LMT'];
        chain = [
          { node: "Strait Exclusion Zone", impact_type: "Air & Sea Blockade", logic: "Live missile exercises close Taiwan maritime traffic lanes" },
          { node: "Foundry Silicon Supply Chain", impact_type: "Inventory Vulnerability", logic: "Global tech assemblers face immediate shipment bottlenecks" },
          { node: "Flight to Quality", impact_type: "Safe Haven Flow", logic: "Institutional rotation into physical Gold COMEX and defense primes" }
        ];
      }

      return {
        chokepoint: cp,
        supply_shock_index: shockScore,
        estimated_disrupted_volume: `${disrupted.toFixed(1)} Mb/d equiv`,
        projected_price_impact_pct: priceImpact,
        affected_assets: assets,
        signal_bias: bias,
        urgency_tier: urgency,
        thesis: `Transit constriction of ${disrupted.toFixed(1)} Mb/d at ${cp} creates physical deficit and war-risk freight surcharges.`,
        transmission_chain: chain,
      };
    });
  }

  public calculateSentimentDivergence(): SentimentAnalysis {
    const scores = this.events.map(e => e.sentiment_score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const dispersion = Math.sqrt(variance);

    let rumor: SentimentAnalysis['rumor_velocity'] = 'STABLE';
    const unverified = this.events.filter(e => !e.verified).length;
    if (unverified >= 2) rumor = 'ACCELERATING';

    let bias: SentimentAnalysis['contrarian_bias'] = 'MOMENTUM_FOLLOW';
    let interp = 'Mixed geopolitical cross-currents; maintain trend discipline.';

    if (mean < -0.70 && dispersion > 0.40) {
      bias = 'OVERREACTION_FADE';
      interp = 'Extreme fear with high dispersion indicates fog-of-war panic; tactical oversold bounce on confirmation.';
    } else if (mean < -0.50) {
      bias = 'ACCUMULATE_SAFE_HAVEN';
      interp = 'Escalatory defense tone across primary wires favors safe-haven accumulation (Gold, Defense, Treasuries).';
    } else if (mean > 0.30) {
      bias = 'MOMENTUM_FOLLOW';
      interp = 'De-escalation momentum observed; tactical relief rally across cyclical risk assets.';
    }

    return {
      aggregate_polarity: Number(mean.toFixed(2)),
      dispersion_variance: Number(dispersion.toFixed(2)),
      rumor_velocity: rumor,
      contrarian_bias: bias,
      interpretation: interp,
      lead_lag: {
        relationship: 'news-leads',
        lead_hours: 3.5,
        pearson_coefficient: 0.74,
        sample_size: 48,
      },
    };
  }

  public generateSignals(): QuantitativeSignal[] {
    const quotesMap = new Map(this.quotes.map(q => [q.symbol, q]));
    const shocks = this.calculateSupplyShocks();
    const gii = this.calculateInstabilityIndex();
    const signals: QuantitativeSignal[] = [];
    const now = new Date().toISOString();

    for (const shock of shocks) {
      for (const symbol of shock.affected_assets) {
        const quote = quotesMap.get(symbol);
        if (!quote) continue;

        const curP = quote.price;
        const atr = quote.atr_14;
        const isOverextended = quote.rsi_14 > 78.0;

        let action: QuantitativeSignal['action'] = 'BUY';
        if (shock.supply_shock_index >= 80 && !isOverextended) {
          action = 'STRONG BUY';
        } else if (isOverextended) {
          action = 'TACTICAL LONG';
        }

        const stopDist = Math.max(atr * 1.5, curP * 0.022);
        const stopLoss = Number((curP - stopDist).toFixed(curP > 10 ? 2 : 4));
        const targetGain = Math.max(stopDist * 2.4, curP * (shock.projected_price_impact_pct / 100));
        const targetPrice = Number((curP + targetGain).toFixed(curP > 10 ? 2 : 4));
        const rr = Number((targetGain / Math.max(0.001, stopDist)).toFixed(2));
        const conf = Number(Math.min(96, shock.supply_shock_index * 0.90 + (quote.volatility_zscore > 0.5 ? 10 : 0)).toFixed(1));
        const kelly = Number(Math.max(2.0, Math.min(8.5, (conf / 100 * 2.0 - 1.0) / Math.max(0.5, rr) * 12)).toFixed(1));

        signals.push({
          id: `sig-shock-${symbol}-${shock.chokepoint.slice(0, 4).toLowerCase()}`,
          ticker: symbol,
          yahoo_symbol: quote.yahoo_symbol,
          asset_name: quote.name,
          action,
          strategy_name: 'SUPPLY_SHOCK_DISRUPTION',
          confidence_score: conf,
          entry_price: curP,
          target_price: targetPrice,
          stop_loss: stopLoss,
          risk_reward_ratio: rr,
          horizon: shock.urgency_tier === 'IMMEDIATE' ? '1-3 DAYS' : 'SWING 1-2 WEEKS',
          kelly_fraction_pct: kelly,
          osint_catalyst_id: shock.chokepoint,
          catalyst_headline: `Constriction in ${shock.chokepoint}: ${shock.estimated_disrupted_volume}`,
          catalyst_source: 'WorldMonitor Chokepoint Matrix',
          chokepoint: shock.chokepoint,
          trade_thesis: shock.thesis,
          transmission_chain: shock.transmission_chain,
          technical_triggers: [
            `RSI(14) at ${quote.rsi_14}`,
            `Volatility Z-score: +${quote.volatility_zscore}σ`,
            `ATR(14): $${atr}`,
            `Trend: ${quote.trend_state}`,
          ],
          lead_lag_relationship: 'news-leads (3.5h lead, r=0.74)',
          created_at: now,
        });
      }
    }

    if (gii.composite_gii_score > 35) {
      const defCandidates = ['GOLD', 'LMT', 'RTX', 'VIX'];
      const defChain: TransmissionNode[] = [
        { node: "Active Theater Hostilities", impact_type: "Risk Aversion", logic: "Capital rotation from high-beta tech to sovereign stores of value" },
        { node: "DoD Supplementals", impact_type: "Revenue Backlog", logic: "Contract primes receive replenishment procurement awards (Lockheed, RTX)" },
        { node: "Volatility Kurtosis", impact_type: "Tail Risk", logic: "Options skew broadens as institutional hedges bid CBOE VIX call structure" }
      ];

      for (const sym of defCandidates) {
        const quote = quotesMap.get(sym);
        if (!quote) continue;

        const curP = quote.price;
        const atr = quote.atr_14;
        const stopDist = Math.max(atr * 1.6, curP * 0.018);
        const stopLoss = Number((curP - stopDist).toFixed(curP > 10 ? 2 : 4));
        const targetGain = stopDist * 2.8;
        const targetPrice = Number((curP + targetGain).toFixed(curP > 10 ? 2 : 4));
        const conf = Number(Math.min(94, gii.composite_gii_score * 0.88 + 12).toFixed(1));

        signals.push({
          id: `sig-gii-${sym}`,
          ticker: sym,
          yahoo_symbol: quote.yahoo_symbol,
          asset_name: quote.name,
          action: 'HEDGE LONG',
          strategy_name: 'GEOPOLITICAL_INSTABILITY_INDEX',
          confidence_score: conf,
          entry_price: curP,
          target_price: targetPrice,
          stop_loss: stopLoss,
          risk_reward_ratio: 2.8,
          horizon: 'SWING 1-2 WEEKS',
          kelly_fraction_pct: Number((gii.recommended_safe_haven_allocation / 4.0).toFixed(1)),
          osint_catalyst_id: 'GII-COMPOSITE',
          catalyst_headline: `GII Score at ${gii.composite_gii_score}/100 [${gii.risk_regime}]`,
          catalyst_source: 'Conflict & Kinetic Risk Synthesizer',
          chokepoint: null,
          trade_thesis: `Elevated conflict intensity in ${gii.primary_theaters.slice(0, 2).join(', ')} drives allocation to safe-haven reserves.`,
          transmission_chain: defChain,
          technical_triggers: [
            `Risk Regime: ${gii.risk_regime}`,
            `Kinetic Intensity: ${gii.kinetic_intensity}/100`,
            `Safe Haven Target: ${gii.recommended_safe_haven_allocation}%`,
          ],
          lead_lag_relationship: 'news-leads (3.5h lead, r=0.74)',
          created_at: now,
        });
      }
    }

    const map = new Map<string, QuantitativeSignal>();
    for (const sig of signals) {
      const existing = map.get(sig.ticker);
      if (!existing || sig.confidence_score > existing.confidence_score) {
        map.set(sig.ticker, sig);
      }
    }

    const uniqueSignals = Array.from(map.values());
    uniqueSignals.sort((a, b) => b.confidence_score - a.confidence_score);
    return uniqueSignals;
  }

  public getSummary(): EngineSummary {
    const gii = this.calculateInstabilityIndex();
    const sentiment = this.calculateSentimentDivergence();
    const shocks = this.calculateSupplyShocks();
    const signals = this.generateSignals();

    const topChokepoint = shocks.length > 0 ? shocks[0].chokepoint : 'None';
    const maxShock = shocks.reduce((max, s) => Math.max(max, s.supply_shock_index), 0);

    return {
      gii,
      sentiment,
      active_signal_count: signals.length,
      critical_shocks_count: shocks.filter(s => s.supply_shock_index >= 70).length,
      highest_risk_chokepoint: topChokepoint,
      max_shock_index: maxShock,
      recommended_hedge_pct: gii.recommended_safe_haven_allocation,
      updated_at: new Date().toISOString(),
    };
  }

  public simulateScenario(scenario: {
    headline: string;
    region: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    chokepoint: string | null;
    impacted_commodities: string[];
    sentiment_score: number;
    summary: string;
    latitude: number;
    longitude: number;
  }): { event: OsintEvent; signals: QuantitativeSignal[]; summary: EngineSummary } {
    const newEvent: OsintEvent = {
      id: `wm-sim-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      headline: scenario.headline,
      source: 'Interactive OSINT War Game Simulator',
      region: scenario.region,
      severity: scenario.severity,
      chokepoint: scenario.chokepoint,
      impacted_commodities: scenario.impacted_commodities,
      verified: true,
      summary: scenario.summary,
      sentiment_score: scenario.sentiment_score,
      latitude: scenario.latitude,
      longitude: scenario.longitude,
    };

    this.events.unshift(newEvent);

    for (const sym of scenario.impacted_commodities) {
      const idx = this.quotes.findIndex(q => q.symbol === sym);
      if (idx !== -1) {
        const q = this.quotes[idx];
        const shockPct = scenario.severity === 'CRITICAL' ? 4.8 : scenario.severity === 'HIGH' ? 2.6 : 1.2;
        const newPrice = Number((q.price * (1 + shockPct / 100)).toFixed(q.price > 10 ? 2 : 4));
        const newPct = Number((q.change_24h_pct + shockPct).toFixed(2));
        const newRsi = Math.min(88, Number((q.rsi_14 + shockPct * 2.2).toFixed(1)));
        const newSparkline = [...q.sparkline.slice(1), newPrice];

        this.quotes[idx] = {
          ...q,
          price: newPrice,
          change_24h_pct: newPct,
          rsi_14: newRsi,
          volatility_zscore: Number((q.volatility_zscore + 0.8).toFixed(2)),
          sparkline: newSparkline,
          trend_state: 'BULLISH_MOMENTUM',
          last_updated: new Date().toISOString(),
        };
      }
    }

    const updatedSignals = this.generateSignals();
    const updatedSummary = this.getSummary();

    return {
      event: newEvent,
      signals: updatedSignals,
      summary: updatedSummary,
    };
  }
}

export const signalEngineSingleton = new SignalEngine();
