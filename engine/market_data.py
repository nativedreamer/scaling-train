"""
Market Data & Technical Filter Engine
Live Yahoo Finance quotes (chart API) with short TTL cache.
Falls back to last good price if a symbol fails — never invents random levels from stale bases.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timezone
import math
import time
import random

try:
    import requests
except ImportError:  # pragma: no cover
    requests = None  # type: ignore


@dataclass
class MarketAssetQuote:
    symbol: str
    yahoo_symbol: str
    name: str
    category: str
    price: float
    change_24h_pct: float
    high_24h: float
    low_24h: float
    volume_24h: float
    rsi_14: float
    volatility_zscore: float
    atr_14: float
    bollinger_pos: float
    trend_state: str
    sparkline: List[float]
    last_updated: str
    source: str = "yahoo"


class MarketDataEngine:
    """Live pricing for geopolitically sensitive assets."""

    # Seed = last known realistic levels (Nov 2026); only used until first successful Yahoo pull
    CORE_UNIVERSE = [
        {"symbol": "BRENT", "yahoo_symbol": "BZ=F", "name": "Brent Crude Oil", "category": "ENERGY", "base_price": 110.45, "volatility": 0.024},
        {"symbol": "WTI", "yahoo_symbol": "CL=F", "name": "Crude Oil WTI", "category": "ENERGY", "base_price": 100.95, "volatility": 0.026},
        {"symbol": "TTF GAS", "yahoo_symbol": "TTF=F", "name": "Dutch TTF Natural Gas", "category": "ENERGY", "base_price": 38.65, "volatility": 0.042},
        {"symbol": "NATGAS", "yahoo_symbol": "NG=F", "name": "Henry Hub Natural Gas", "category": "ENERGY", "base_price": 2.90, "volatility": 0.038},
        {"symbol": "GOLD", "yahoo_symbol": "GC=F", "name": "Gold COMEX Futures", "category": "METALS", "base_price": 3909.10, "volatility": 0.012},
        {"symbol": "SILVER", "yahoo_symbol": "SI=F", "name": "Silver COMEX Spot", "category": "METALS", "base_price": 50.26, "volatility": 0.022},
        {"symbol": "COPPER", "yahoo_symbol": "HG=F", "name": "High Grade Copper", "category": "METALS", "base_price": 6.51, "volatility": 0.019},
        {"symbol": "URANIUM", "yahoo_symbol": "URA", "name": "Uranium Global X ETF", "category": "ENERGY", "base_price": 33.73, "volatility": 0.025},
        {"symbol": "WHEAT", "yahoo_symbol": "ZW=F", "name": "Chicago SRW Wheat", "category": "AGRI", "base_price": 602.0, "volatility": 0.025},
        {"symbol": "VIX", "yahoo_symbol": "^VIX", "name": "CBOE Volatility Index", "category": "VOLATILITY", "base_price": 19.42, "volatility": 0.065},
        {"symbol": "LMT", "yahoo_symbol": "LMT", "name": "Lockheed Martin Corp", "category": "DEFENSE", "base_price": 636.95, "volatility": 0.014},
        {"symbol": "RTX", "yahoo_symbol": "RTX", "name": "RTX Corporation", "category": "DEFENSE", "base_price": 199.80, "volatility": 0.015},
        {"symbol": "TSM", "yahoo_symbol": "TSM", "name": "Taiwan Semiconductor (ADR)", "category": "TECH_SEMI", "base_price": 406.13, "volatility": 0.028},
        {"symbol": "EUR/USD", "yahoo_symbol": "EURUSD=X", "name": "Euro / US Dollar", "category": "FX_RATES", "base_price": 1.1198, "volatility": 0.005},
        {"symbol": "USD/JPY", "yahoo_symbol": "USDJPY=X", "name": "US Dollar / Japanese Yen", "category": "FX_RATES", "base_price": 157.72, "volatility": 0.007},
    ]

    CACHE_TTL_SEC = 30  # re-hit Yahoo at most every 30s per cold start instance

    def __init__(self) -> None:
        self.quotes_cache: Dict[str, MarketAssetQuote] = {}
        self._last_refresh_mono: float = 0.0
        self.refresh_quotes(force=True)

    def _yahoo_chart(self, yahoo_symbol: str) -> Optional[Dict[str, Any]]:
        if requests is None:
            return None
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{yahoo_symbol}"
        params = {"interval": "1d", "range": "1mo"}
        headers = {
            "User-Agent": "Mozilla/5.0 (compatible; WorldMonitorFinance/1.0)",
            "Accept": "application/json",
        }
        try:
            resp = requests.get(url, params=params, headers=headers, timeout=8)
            if resp.status_code != 200:
                return None
            data = resp.json()
            result = (data.get("chart") or {}).get("result") or []
            if not result:
                return None
            return result[0]
        except Exception:
            return None

    def _parse_yahoo(self, chart: Dict[str, Any]) -> Tuple[float, float, float, float, float, List[float]]:
        meta = chart.get("meta") or {}
        price = float(meta.get("regularMarketPrice") or meta.get("previousClose") or 0.0)
        prev = float(meta.get("chartPreviousClose") or meta.get("previousClose") or price or 1.0)

        indicators = (chart.get("indicators") or {}).get("quote") or [{}]
        q0 = indicators[0] if indicators else {}
        closes = [c for c in (q0.get("close") or []) if c is not None]
        highs = [h for h in (q0.get("high") or []) if h is not None]
        lows = [lo for lo in (q0.get("low") or []) if lo is not None]
        vols = [v for v in (q0.get("volume") or []) if v is not None]

        if closes and price <= 0:
            price = float(closes[-1])

        high_24h = float(highs[-1]) if highs else price
        low_24h = float(lows[-1]) if lows else price
        volume = float(vols[-1]) if vols else 0.0

        # Prefer session high/low from meta when present
        if meta.get("regularMarketDayHigh"):
            high_24h = float(meta["regularMarketDayHigh"])
        if meta.get("regularMarketDayLow"):
            low_24h = float(meta["regularMarketDayLow"])
        if meta.get("regularMarketVolume"):
            volume = float(meta["regularMarketVolume"])

        change_pct = 0.0
        if prev > 0:
            change_pct = ((price - prev) / prev) * 100.0

        spark = closes[-14:] if len(closes) >= 2 else [price]
        if not spark:
            spark = [price]
        if abs(spark[-1] - price) > 1e-9:
            spark = list(spark) + [price]

        return price, change_pct, high_24h, low_24h, volume, [float(x) for x in spark]

    def _rsi(self, closes: List[float], period: int = 14) -> float:
        if len(closes) < period + 1:
            return 50.0
        gains, losses = [], []
        for i in range(-period, 0):
            d = closes[i] - closes[i - 1]
            gains.append(max(d, 0.0))
            losses.append(max(-d, 0.0))
        avg_gain = sum(gains) / period
        avg_loss = sum(losses) / period
        if avg_loss < 1e-12:
            return 80.0 if avg_gain > 0 else 50.0
        rs = avg_gain / avg_loss
        return max(5.0, min(95.0, 100.0 - (100.0 / (1.0 + rs))))

    def _atr(self, spark: List[float], price: float, vol: float) -> float:
        if len(spark) < 3:
            return max(price * vol * 1.2, price * 0.01)
        trs = [abs(spark[i] - spark[i - 1]) for i in range(1, len(spark))]
        return max(sum(trs[-14:]) / max(1, min(14, len(trs))), price * 0.008)

    def _build_quote(
        self,
        asset: Dict[str, Any],
        price: float,
        change_pct: float,
        high_24h: float,
        low_24h: float,
        volume: float,
        sparkline: List[float],
        source: str,
    ) -> MarketAssetQuote:
        vol = float(asset["volatility"])
        rsi = round(self._rsi(sparkline), 1)
        atr = round(self._atr(sparkline, price, vol), 4 if price < 10 else 2)
        vol_z = round((change_pct / max(0.01, vol * 100.0)), 2)
        bollinger = round(max(0.05, min(0.95, 0.5 + vol_z * 0.15)), 2)

        if rsi > 70 and change_pct > 1.0:
            trend = "OVERBOUGHT_PULLBACK"
        elif rsi < 30 and change_pct < -1.0:
            trend = "OVERSOLD_BOUNCE"
        elif change_pct > 0.5:
            trend = "BULLISH_MOMENTUM"
        elif change_pct < -0.5:
            trend = "BEARISH_MOMENTUM"
        else:
            trend = "NEUTRAL"

        return MarketAssetQuote(
            symbol=asset["symbol"],
            yahoo_symbol=asset["yahoo_symbol"],
            name=asset["name"],
            category=asset["category"],
            price=round(price, 4 if price < 10 else 2),
            change_24h_pct=round(change_pct, 2),
            high_24h=round(high_24h, 4 if high_24h < 10 else 2),
            low_24h=round(low_24h, 4 if low_24h < 10 else 2),
            volume_24h=float(volume or 0),
            rsi_14=rsi,
            volatility_zscore=vol_z,
            atr_14=atr,
            bollinger_pos=bollinger,
            trend_state=trend,
            sparkline=[round(x, 4 if price < 10 else 2) for x in sparkline[-14:]],
            last_updated=datetime.now(timezone.utc).isoformat(),
            source=source,
        )

    def refresh_quotes(self, force: bool = False) -> Dict[str, MarketAssetQuote]:
        now = time.monotonic()
        if (
            not force
            and self.quotes_cache
            and (now - self._last_refresh_mono) < self.CACHE_TTL_SEC
        ):
            return self.quotes_cache

        for asset in self.CORE_UNIVERSE:
            symbol = asset["symbol"]
            yahoo_sym = asset["yahoo_symbol"]
            chart = self._yahoo_chart(yahoo_sym)

            if chart:
                try:
                    price, change_pct, high_24h, low_24h, volume, spark = self._parse_yahoo(chart)
                    if price > 0:
                        self.quotes_cache[symbol] = self._build_quote(
                            asset, price, change_pct, high_24h, low_24h, volume, spark, "yahoo"
                        )
                        continue
                except Exception:
                    pass

            # Keep last good live quote if present
            if symbol in self.quotes_cache and self.quotes_cache[symbol].source == "yahoo":
                prev = self.quotes_cache[symbol]
                self.quotes_cache[symbol] = MarketAssetQuote(
                    **{**asdict(prev), "last_updated": datetime.now(timezone.utc).isoformat()}
                )
                continue

            # First-load fallback: seed base (current market order of magnitude), not random walk from 2024 gold
            base = float(asset["base_price"])
            self.quotes_cache[symbol] = self._build_quote(
                asset,
                base,
                0.0,
                base * 1.005,
                base * 0.995,
                0.0,
                [base] * 8 + [base],
                "seed",
            )

        self._last_refresh_mono = time.monotonic()
        return self.quotes_cache

    def get_all_quotes(self) -> List[Dict[str, Any]]:
        self.refresh_quotes(force=False)
        return [asdict(q) for q in self.quotes_cache.values()]

    def get_quote(self, symbol: str) -> Optional[Dict[str, Any]]:
        self.refresh_quotes(force=False)
        q = self.quotes_cache.get(symbol.upper())
        return asdict(q) if q else None
