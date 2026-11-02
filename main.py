"""
FastAPI Backend Entrypoint for WorldMonitor Finance Signal Engine
Compatible with Vercel Serverless Functions and standalone execution.

Vercel requires a top-level ASGI app named `app` (or a `handler`).
"""

from __future__ import annotations

import json
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Core engines (import after FastAPI so the handler is always visible)
# ---------------------------------------------------------------------------
from engine.ingestion import OsintIngestionEngine
from engine.market_data import MarketDataEngine
from engine.strategies import StrategyEngine
from engine.signal_builder import SignalBuilderEngine

ingestion_engine = OsintIngestionEngine()
market_engine = MarketDataEngine()
strategy_engine = StrategyEngine()
signal_builder = SignalBuilderEngine(ingestion_engine, market_engine, strategy_engine)

# ---------------------------------------------------------------------------
# Top-level ASGI application — required by Vercel @vercel/python
# ---------------------------------------------------------------------------
app = FastAPI(
    title="WorldMonitor Finance Signal Engine API",
    description="Geopolitical OSINT correlation and quantitative signal generator",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SimulationRequest(BaseModel):
    headline: str
    region: str = "Middle East"
    severity: str = "HIGH"
    chokepoint: Optional[str] = None
    impacted_commodities: List[str] = Field(default_factory=lambda: ["BRENT", "GOLD"])
    sentiment_score: float = -0.75
    summary: Optional[str] = None
    latitude: float = 26.5
    longitude: float = 56.2


@app.get("/api/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "service": "wm-finance-signal-engine"}


@app.get("/api/signals")
def get_signals() -> Dict[str, Any]:
    return {"signals": signal_builder.build_signals()}


@app.get("/api/signals/summary")
def get_summary() -> Dict[str, Any]:
    return signal_builder.get_summary_metrics()


@app.get("/api/osint/feed")
def get_osint_feed(
    region: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
) -> Dict[str, Any]:
    events = ingestion_engine.fetch_latest_events(
        region_filter=region, severity_filter=severity
    )
    return {"events": events, "count": len(events)}


@app.get("/api/market/quotes")
def get_market_quotes() -> Dict[str, Any]:
    quotes = market_engine.get_all_quotes()
    return {"quotes": quotes, "count": len(quotes)}


@app.post("/api/signals/simulate")
def simulate_event(req: SimulationRequest) -> Dict[str, Any]:
    new_event = ingestion_engine.add_custom_event(req.model_dump())
    signals = signal_builder.build_signals()
    summary = signal_builder.get_summary_metrics()
    return {
        "injected_event": new_event,
        "updated_signals": signals,
        "updated_summary": summary,
    }


# Also expose root health for platform probes
@app.get("/")
def root() -> Dict[str, str]:
    return {"status": "ok", "service": "wm-finance-signal-engine"}


if __name__ == "__main__":
    import sys

    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass

    print(f"Starting WorldMonitor Finance Signal Engine on port {port}...")
    try:
        import uvicorn

        uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
    except Exception:
        # Minimal fallback without uvicorn
        from http.server import BaseHTTPRequestHandler, HTTPServer
        import urllib.parse

        class SimpleEngineHandler(BaseHTTPRequestHandler):
            def _send_json(self, data, status=200):
                self.send_response(status)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(data).encode("utf-8"))

            def do_GET(self):
                parsed = urllib.parse.urlparse(self.path)
                path = parsed.path
                if path in ("/", "/api/health"):
                    self._send_json({"status": "ok", "service": "wm-finance-signal-engine"})
                elif path == "/api/signals":
                    self._send_json({"signals": signal_builder.build_signals()})
                elif path == "/api/signals/summary":
                    self._send_json(signal_builder.get_summary_metrics())
                elif path == "/api/osint/feed":
                    events = ingestion_engine.fetch_latest_events()
                    self._send_json({"events": events, "count": len(events)})
                elif path == "/api/market/quotes":
                    quotes = market_engine.get_all_quotes()
                    self._send_json({"quotes": quotes, "count": len(quotes)})
                else:
                    self._send_json({"error": "Not found", "path": path}, status=404)

        server = HTTPServer(("0.0.0.0", port), SimpleEngineHandler)
        print(f"Running standalone HTTP server on port {port}")
        server.serve_forever()
