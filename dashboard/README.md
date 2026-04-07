# Comic Hunter Dashboard

React dashboard for monitoring comic alerts collected by the Comic Hunter poller.

## What it does

- Displays alerts scored and saved by `reddit-poller.ts` in real time
- Polls `/api/alerts` every 5 seconds for new alerts using an incremental `since` cursor
- Filters by subreddit, minimum score, and local-only (Philly/NJ geo subs)
- Shows per-alert score badge, image (or placeholder), eBay flip value when available
- Sidebar displays keyword weight maps from `/api/keywords`

## Running locally

The dashboard depends on the API server running on port 3001.

```bash
# From the repo root — starts both API server and dashboard
npm run dev:manual

# Or start just the dashboard (requires API server already running)
cd dashboard
npm run dev
```

Dashboard runs at http://localhost:5173. API is proxied through Vite to http://localhost:3001.

## Build

```bash
cd dashboard
npm run build
```

Output goes to `dashboard/dist/`.

## Key components

| Component | Purpose |
|-----------|---------|
| `App.tsx` | Root — fetches alerts and keywords, owns filter state |
| `FilterBar.tsx` | Subreddit / score / local-only filters |
| `AlertCard.tsx` | Single alert row with score badge and image |
| `ScoreBadge.tsx` | Color-coded score indicator |
| `KeywordPanel.tsx` | Sidebar keyword weight display |
