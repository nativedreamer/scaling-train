"""
Consolidated Signal Builder Engine
Part of WorldMonitor Finance Signal Engine
Synthesizes OSINT intelligence, live technical indicators, and quantitative strategies
into actionable trade setups with transmission chains and lead-lag cross-correlations.
"""

from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import math

@dataclass
class QuantitativeSignal:
    id: str
    ticker: str
    yahoo_symbol: str
    asset_name: str
    action: str  # STRONG BUY, BUY, TACTICAL LONG, HEDGE LONG, NEUTRAL, SELL
    strategy_name: str
    confidence_score: float
    entry_price: float
    target_price: float
    stop_loss: float
    risk_reward_ratio: float
    horizon: str
    kelly_fraction_pct: float
    osint_catalyst_id: str
    catalyst_headline: str
    catalyst_source: str
    chokepoint: Optional[str]
    trade_thesis: str
    transmission_chain: List[Dict[str, str]]
    technical_triggers: List[str]
    lead_lag_relationship: str
    created_at: str

class SignalBuilderEngine:
    def __init__(self, ingestion_engine, market_engine, strategy_engine):
        self.ingestion = ingestion_engine
        self.market = market_engine
        self.strategy = strategy_engine

    def build_signals(self) -> List[Dict[str, Any]]:
        events = self.ingestion.fetch_latest_events()
        quotes = self.market.get_all_quotes()
        quote_map = {q["symbol"]: q for q in quotes}
        
        supply_shocks = self.strategy.evaluate_supply_shocks(events)
        gii = self.strategy.compute_instability_index(events)
        sentiment = self.strategy.analyze_sentiment_divergence(events)

        signals: List[QuantitativeSignal] = []
        now_iso = datetime.now(timezone.utc).isoformat()

        # 1. Supply Shock signals (Energy & Maritime)
        for shock in supply_shocks:
            chain_dicts = [asdict(node) for node in shock.transmission_chain]
            for symbol in shock.affected_assets:
                quote = quote_map.get(symbol)
                if not quote:
                    continue

                cur_p = quote["price"]
                atr = quote["atr_14"]
                vol_z = quote["volatility_zscore"]
                rsi = quote["rsi_14"]

                is_overextended = rsi > 78.0
                action = "BUY" if not is_overextended else "TACTICAL LONG"
                if shock.supply_shock_index >= 80.0 and not is_overextended:
                    action = "STRONG BUY"

                stop_dist = max(atr * 1.5, cur_p * 0.022)
                stop_loss = round(cur_p - stop_dist, 2 if cur_p > 10 else 4)
                target_pct = shock.projected_price_impact_pct / 100.0
                target_gain = max(stop_dist * 2.4, cur_p * target_pct)
                target_price = round(cur_p + target_gain, 2 if cur_p > 10 else 4)

                rr_ratio = round(target_gain / max(0.001, stop_dist), 2)
                confidence = round(min(96.0, shock.supply_shock_index * 0.90 + (10.0 if vol_z > 0.5 else 0.0)), 1)
                kelly = round(max(2.0, min(8.5, (confidence / 100.0 * 2.0 - 1.0) / max(0.5, rr_ratio) * 12.0)), 1)

                signals.append(QuantitativeSignal(
                    id=f"sig-shock-{symbol}-{shock.chokepoint[:4].lower()}",
                    ticker=symbol,
                    yahoo_symbol=quote.get("yahoo_symbol", symbol),
                    asset_name=quote["name"],
                    action=action,
                    strategy_name="SUPPLY_SHOCK_DISRUPTION",
                    confidence_score=confidence,
                    entry_price=cur_p,
                    target_price=target_price,
                    stop_loss=stop_loss,
                    risk_reward_ratio=rr_ratio,
                    horizon="1-3 DAYS" if shock.urgency_tier == "IMMEDIATE" else "SWING 1-2 WEEKS",
                    kelly_fraction_pct=kelly,
                    osint_catalyst_id=shock.chokepoint,
                    catalyst_headline=f"Constriction in {shock.chokepoint}: {shock.estimated_disrupted_volume}",
                    catalyst_source="WorldMonitor Chokepoint Matrix",
                    chokepoint=shock.chokepoint,
                    trade_thesis=shock.thesis,
                    transmission_chain=chain_dicts,
                    technical_triggers=[
                        f"RSI(14) at {rsi}",
                        f"Volatility Z-score: +{vol_z}σ",
                        f"ATR(14): ${atr}",
                        f"Trend: {quote['trend_state']}"
                    ],
                    lead_lag_relationship=f"{sentiment.lead_lag.relationship} ({sentiment.lead_lag.lead_hours}h lag, r={sentiment.lead_lag.pearson_coefficient})",
                    created_at=now_iso
                ))

        # 2. Geopolitical Defensive & Safe-Haven Allocation (Gold, Defense, Treasuries)
        if gii.composite_gii_score > 35.0:
            defensive_candidates = ["GOLD", "LMT", "RTX", "VIX"]
            def_chain = [
                {"node": "Escalation Threat", "impact_type": "Risk Aversion", "logic": "Active theater hostilities drive portfolio rebalancing from high-beta tech to real stores of value"},
                {"node": "Defense Appropriations", "impact_type": "Revenue Backlog", "logic": "DoD supplemental munitions drawdowns accelerate replenishment orders for Lockheed & RTX"},
                {"node": "Volatility Spike", "impact_type": "Tail Hedging", "logic": "CBOE VIX skew widens as options market prices elevated kurtosis"}
            ]

            for sym in defensive_candidates:
                quote = quote_map.get(sym)
                if not quote:
                    continue

                cur_p = quote["price"]
                atr = quote["atr_14"]
                stop_dist = max(atr * 1.6, cur_p * 0.018)
                stop_loss = round(cur_p - stop_dist, 2 if cur_p > 10 else 4)
                target_gain = stop_dist * 2.8
                target_price = round(cur_p + target_gain, 2 if cur_p > 10 else 4)

                confidence = round(min(94.0, gii.composite_gii_score * 0.88 + 12.0), 1)
                signals.append(QuantitativeSignal(
                    id=f"sig-gii-{sym}",
                    ticker=sym,
                    yahoo_symbol=quote.get("yahoo_symbol", sym),
                    asset_name=quote["name"],
                    action="HEDGE LONG",
                    strategy_name="GEOPOLITICAL_INSTABILITY_INDEX",
                    confidence_score=confidence,
                    entry_price=cur_p,
                    target_price=target_price,
                    stop_loss=stop_loss,
                    risk_reward_ratio=2.8,
                    horizon="SWING 1-2 WEEKS",
                    kelly_fraction_pct=round(gii.recommended_safe_haven_allocation / 4.0, 1),
                    osint_catalyst_id="GII-COMPOSITE",
                    catalyst_headline=f"GII Score at {gii.composite_gii_score}/100 [{gii.risk_regime}]",
                    catalyst_source="Conflict & Kinetic Risk Synthesizer",
                    chokepoint=None,
                    trade_thesis=f"Conflict escalation in {', '.join(gii.primary_theaters[:2])} drives institutional flow to physical safe havens and defense industrial primes.",
                    transmission_chain=def_chain,
                    technical_triggers=[
                        f"Risk Regime: {gii.risk_regime}",
                        f"Kinetic Intensity: {gii.kinetic_intensity}/100",
                        f"Tail Risk Weight: {gii.tail_risk_weight}"
                    ],
                    lead_lag_relationship=f"news-leads ({sentiment.lead_lag.lead_hours}h lead, r=0.74)",
                    created_at=now_iso
                ))

        signals.sort(key=lambda s: s.confidence_score, reverse=True)
        return [asdict(s) for s in signals]

    def get_summary_metrics(self) -> Dict[str, Any]:
        events = self.ingestion.fetch_latest_events()
        gii = self.strategy.compute_instability_index(events)
        shocks = self.strategy.evaluate_supply_shocks(events)
        sentiment = self.strategy.analyze_sentiment_divergence(events)
        signals = self.build_signals()

        top_chokepoint = shocks[0].chokepoint if shocks else "None"
        max_shock_score = max((s.supply_shock_index for s in shocks), default=0.0)

        return {
            "gii": asdict(gii),
            "sentiment": asdict(sentiment),
            "active_signal_count": len(signals),
            "critical_shocks_count": sum(1 for s in shocks if s.supply_shock_index > 70.0),
            "highest_risk_chokepoint": top_chokepoint,
            "max_shock_index": max_shock_score,
            "recommended_hedge_pct": gii.recommended_safe_haven_allocation,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
