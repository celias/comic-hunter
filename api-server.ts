/**
 * api-server.js
 * -------------
 * Express API — serves Comic Hunter alerts to the React dashboard.
 *
 * Usage:  npx tsx api-server.js
 *         npm run server
 *
 * Endpoints:
 *   GET /api/health            — liveness check
 *   GET /api/alerts            — paginated alert list with filters
 *   GET /api/alerts/:id        — single alert by DB id
 *   GET /api/keywords          — keyword weight maps for dashboard display
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.ts";
import { KEYWORDS } from "./lib/keywords.ts";
import { config } from "./lib/config.ts";

const PORT = process.env.PORT ?? 3001;

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow the Vite dev server and any override set in the environment.

const CORS_ORIGINS = [
  "http://localhost:5173",
  ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : []),
];

const app = express();
app.use(cors({ origin: CORS_ORIGINS }));
app.use(express.json());

// ─── Logging helper ───────────────────────────────────────────────────────────

function log(level: string, msg: string): void {
  const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
  console.log(`${ts} [${level.toUpperCase().padEnd(5)}] ${msg}`);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// GET /api/alerts
//
// Query params:
//   page       — page number (default: 1)
//   limit      — results per page (default: 20, max: 100)
//   minScore   — minimum score (default: 0)
//   localOnly  — "true" to filter isLocal = true
//   subreddit  — filter by subreddit name
//   since      — ISO timestamp; only alerts with seenAt > since (for live polling)
app.get("/api/alerts", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const minScore = parseInt(req.query.minScore as string) || 0;
    const localOnly = req.query.localOnly === "true";
    const subreddit = (req.query.subreddit as string)?.trim() || undefined;
    const since = req.query.since ? new Date(req.query.since as string) : undefined;

    const where = {
      ...(minScore > 0 && { score: { gte: minScore } }),
      ...(localOnly && { isLocal: true }),
      ...(subreddit && { subreddit }),
      ...(since && { seenAt: { gt: since } }),
    };

    const [total, alerts] = await Promise.all([
      prisma.alert.count({ where }),
      prisma.alert.findMany({
        where,
        orderBy: { seenAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({
      alerts,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err: unknown) {
    log("error", `GET /api/alerts — ${err instanceof Error ? err.message : String(err)}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/alerts/:id
app.get("/api/alerts/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  try {
    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert) return res.status(404).json({ error: "Not found" });
    res.json(alert);
  } catch (err: unknown) {
    log("error", `GET /api/alerts/${id} — ${err instanceof Error ? err.message : String(err)}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/keywords
// Returns keyword-to-weight maps for content and location keywords.
// Used by the dashboard to sort/emphasize matched keywords by weight.
app.get("/api/keywords", (_req, res) => {
  const content = Object.fromEntries(KEYWORDS);
  const location = Object.fromEntries(config.LOCATION_KEYWORDS);
  res.json({ content, location });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  log("info", `API server listening on :${PORT}`);
});
