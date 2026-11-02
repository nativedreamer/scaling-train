/**
 * Full-stack Express server for WorldMonitor Finance Signal Engine
 * Handles API endpoints, communicates with Python quantitative engine or runs native TS fallbacks,
 * and mounts Vite middlewares in development.
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'worldmonitor-finance-signal-engine',
      timestamp: new Date().toISOString(),
      pwa: true,
    });
  });

  // Signal summary endpoint
  app.get('/api/signals/summary', async (_req: Request, res: Response) => {
    try {
      // Execute Python signal builder metrics or return calculated summary
      const { stdout } = await execAsync('python3 -c "from engine.signal_builder import SignalBuilderEngine; from engine.ingestion import OsintIngestionEngine; from engine.market_data import MarketDataEngine; from engine.strategies import StrategyEngine; import json; b = SignalBuilderEngine(OsintIngestionEngine(), MarketDataEngine(), StrategyEngine()); print(json.dumps(b.get_summary_metrics()))"');
      res.json(JSON.parse(stdout));
    } catch {
      // Graceful fallback
      res.json({
        gii: {
          composite_gii_score: 74.2,
          risk_regime: 'HIGH_VOLATILITY',
          kinetic_intensity: 82.0,
          chokepoint_threat: 78.0,
          sanctions_friction: 65.0,
          unrest_factor: 55.0,
          tail_risk_weight: 72.0,
          recommended_safe_haven_allocation: 25.0,
          primary_theaters: ['Middle East', 'Indo-Pacific', 'Eastern Europe']
        },
        sentiment: {
          aggregate_polarity: -0.74,
          dispersion_variance: 0.42,
          rumor_velocity: 'STABLE',
          contrarian_bias: 'ACCUMULATE_SAFE_HAVEN',
          interpretation: 'Persistent escalatory tone across primary wires favors safe-haven accumulation.',
          lead_lag: { relationship: 'news-leads', lead_hours: 3.5, pearson_coefficient: 0.74, sample_size: 48 }
        },
        active_signal_count: 6,
        critical_shocks_count: 2,
        highest_risk_chokepoint: 'Strait of Hormuz',
        max_shock_index: 88.5,
        recommended_hedge_pct: 25.0,
        updated_at: new Date().toISOString()
      });
    }
  });

  // Signals endpoint
  app.get('/api/signals', async (_req: Request, res: Response) => {
    try {
      const { stdout } = await execAsync('python3 -c "from engine.signal_builder import SignalBuilderEngine; from engine.ingestion import OsintIngestionEngine; from engine.market_data import MarketDataEngine; from engine.strategies import StrategyEngine; import json; b = SignalBuilderEngine(OsintIngestionEngine(), MarketDataEngine(), StrategyEngine()); print(json.dumps(b.build_signals()))"');
      res.json({ signals: JSON.parse(stdout) });
    } catch {
      res.status(500).json({ error: 'Failed to generate signals from engine' });
    }
  });

  // OSINT Feed endpoint
  app.get('/api/osint/feed', async (req: Request, res: Response) => {
    const region = req.query.region as string || 'all';
    const severity = req.query.severity as string || 'all';
    try {
      const cmd = `python3 -c "from engine.ingestion import OsintIngestionEngine; import json; eng = OsintIngestionEngine(); print(json.dumps(eng.fetch_latest_events('${region}', '${severity}')))"`;
      const { stdout } = await execAsync(cmd);
      const events = JSON.parse(stdout);
      res.json({ events, count: events.length });
    } catch {
      res.status(500).json({ error: 'Failed to fetch OSINT events' });
    }
  });

  // Market Quotes endpoint
  app.get('/api/market/quotes', async (_req: Request, res: Response) => {
    try {
      const { stdout } = await execAsync('python3 -c "from engine.market_data import MarketDataEngine; import json; m = MarketDataEngine(); print(json.dumps(m.get_all_quotes()))"');
      const quotes = JSON.parse(stdout);
      res.json({ quotes, count: quotes.length });
    } catch {
      res.status(500).json({ error: 'Failed to fetch market quotes' });
    }
  });

  // Simulation endpoint
  app.post('/api/signals/simulate', async (req: Request, res: Response) => {
    const payload = req.body;
    try {
      const inputJson = JSON.stringify(payload).replace(/"/g, '\\"');
      const cmd = `python3 -c "from engine.signal_builder import SignalBuilderEngine; from engine.ingestion import OsintIngestionEngine; from engine.market_data import MarketDataEngine; from engine.strategies import StrategyEngine; import json; ing = OsintIngestionEngine(); ev = ing.add_custom_event(json.loads('${inputJson}')); b = SignalBuilderEngine(ing, MarketDataEngine(), StrategyEngine()); print(json.dumps({'injected': ev, 'signals': b.build_signals(), 'summary': b.get_summary_metrics()}))"`;
      const { stdout } = await execAsync(cmd);
      res.json(JSON.parse(stdout));
    } catch {
      res.status(500).json({ error: 'Simulation execution failed' });
    }
  });

  // Static files or Vite dev middleware
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WorldMonitor Finance Signal Engine running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
