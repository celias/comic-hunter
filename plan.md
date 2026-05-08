# Comic Hunter — Project Plan

## What This Is

A Node.js app that polls Reddit for free/cheap comics and collectibles, scores posts by keyword and location, saves alerts to Postgres, and fires Discord webhook alerts. Being built for public scale from the start.

---

## Stack

| Layer           | Tech                             |
| --------------- | -------------------------------- |
| Runtime         | Node 24                          |
| Runner          | `tsx` — `npx tsx <file>`         |
| Database (dev)  | Neon (cloud Postgres)            |
| Database (prod) | AWS RDS                          |
| ORM             | Prisma v7 + `@prisma/adapter-pg` |
| Frontend        | React 19 + Vite 6 + Tailwind v4  |
| Backend         | Express.js → EC2/ECS             |
| Auth            | AWS Cognito                      |
| Real-time       | REST polling (5s)                |

---

## File Structure

```
reddit-poller.ts     — Reddit poller, scorer, Discord alerter, Prisma writes
api-server.ts        — Express API (port 3001), serves alerts + keywords to the dashboard
lib/config.ts        — GEO_SUBS, LOCATION_KEYWORDS (40+ weighted), SCORE_THRESHOLD, DISCORD_WEBHOOK_URL
lib/prisma.ts        — Shared Prisma client singleton (imported by poller + server)
lib/keywords.ts      — Shared content keyword weights (imported by poller + server)
test-discord.ts      — Webhook smoke test utility
prisma/schema.prisma — Alert model (pushed to Neon); User/UserSettings/UserSeenAlert planned
prisma.config.ts     — Prisma v7 config, reads DATABASE_URL from .env
generated/prisma/    — Prisma generated client (do not edit)
.env                 — DATABASE_URL, DISCORD_WEBHOOK_URL

dashboard/           — React + Vite + Tailwind CSS frontend
  vite.config.js     — Vite 6, React plugin, Tailwind v4 plugin, dev proxy /api → localhost:3001
  index.html         — Dark-themed shell
  src/
    main.tsx         — React entry point
    App.tsx          — Filter state, keyword weight fetch, layout orchestration
    index.css        — Tailwind import (@import "tailwindcss")
    api.ts           — Fetch wrapper: fetchAlerts, fetchAlert, checkHealth, fetchKeywords
    hooks/
      useAlerts.ts   — Polling hook: initial load → 5s incremental poll via `since` param
    components/
      Header.tsx     — Title + green/red connection dot + alert count
      FilterBar.tsx  — Min score input, subreddit select, localOnly checkbox
      AlertList.tsx  — Renders AlertRow list, manages expandedId state, passes weights
      AlertRow.tsx   — Collapsed row: ScoreBadge, title, subreddit, timeAgo, Local badge
      AlertDetail.tsx— Expanded: body, metadata, keywords sorted/emphasized by weight, Reddit link
      ScoreBadge.tsx — Color-coded score pill (green 10-19, yellow 20-29, red 30+)
      EmptyState.tsx — "No alerts found" message
```

---

## Prisma Client — v7 instantiation (must follow this pattern)

```ts
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
```

Shared via `lib/prisma.ts` — both `reddit-poller.ts` and `api-server.ts` import from there.

---

## Prisma Schema

### Live (pushed to Neon)

```prisma
model Alert {
  id              Int      @id @default(autoincrement())
  postId          String   @unique
  subreddit       String
  title           String
  body            String
  url             String
  author          String
  score           Int
  matched         String[]
  isLocal         Boolean
  matchedLocation String[]
  postedAt        DateTime
  seenAt          DateTime @default(now())

}
```

### Planned (not yet added)

```prisma
model User {
  // linked to Cognito via cognitoId
}

model UserSettings {
  // per-user: location keywords, geo subs, score threshold, Discord webhook, email prefs
}

model UserSeenAlert {
  // join table: tracks seen/dismissed state per user per alert
}
```

---

## Express API — `api-server.ts`

Runs as a separate process from the poller on port 3001 (or `PORT` env var).

| Method | Path              | Description                                          |
| ------ | ----------------- | ---------------------------------------------------- |
| GET    | `/api/health`     | `{ status: "ok", timestamp }`                        |
| GET    | `/api/alerts`     | Paginated alert list with filters                    |
| GET    | `/api/alerts/:id` | Single alert by DB id                                |
| GET    | `/api/keywords`   | Content + location keyword weight maps for dashboard |

**Query params for `GET /api/alerts`:**

| Param       | Default | Description                                                           |
| ----------- | ------- | --------------------------------------------------------------------- |
| `page`      | 1       | Page number                                                           |
| `limit`     | 20      | Results per page (max 100)                                            |
| `minScore`  | 0       | Minimum score filter                                                  |
| `localOnly` | false   | `"true"` to filter `isLocal = true`                                   |
| `subreddit` | —       | Filter by subreddit name                                              |
| `since`     | —       | ISO timestamp — returns alerts with `seenAt > since` (for 5s polling) |

**Response for `GET /api/keywords`:**

```json
{
  "content": { "free": 10, "cgc": 8, "lot": 4, ... },
  "location": { "cherry hill": 15, "new jersey": 8, ... }
}
```

**CORS:** `http://localhost:5173` (Vite default) + `CORS_ORIGIN` env var override.

---

## Dashboard — `dashboard/`

React 19 + Vite 6 + Tailwind CSS v4 single-page app. Lives in its own directory with its own `package.json`.

### Key behaviors

- **Live polling**: fetches `GET /api/alerts` every 5s using the `since` param for incremental updates
- **Filters**: min score (default 10, matching `SCORE_THRESHOLD`), subreddit dropdown, local-only toggle
- **Score color-coding**: green 10-19, yellow 20-29, red 30+ (matches Discord alert colors)
- **Keyword weight emphasis**: matched keywords sorted by weight (highest first), color-coded by tier (red 8+, yellow 5-7, gray <5), point values shown inline
- **Expanded row detail**: click any alert to see body, metadata grid, keyword chips, Reddit link
- **Connection indicator**: green/red dot in header showing API reachability
- **Vite dev proxy**: `/api` requests forwarded to `localhost:3001`, no hardcoded URLs

### Architecture

- `useAlerts` hook manages initial load + incremental polling + deduplication
- Keyword weights fetched once on mount via `GET /api/keywords`, merged into a single weight map, passed through to `AlertDetail`
- No routing library, no state management library — plain `useState`/`useEffect`/`useRef`
- Seen/dismiss feature deferred until User/Auth models are built

---

## Shared Modules

### `lib/keywords.ts`

Content keyword weights as `[keyword, points]` tuples. Imported by:

- `reddit-poller.ts` — for scoring posts
- `api-server.ts` — for the `GET /api/keywords` endpoint

Location keyword weights live in `lib/config.ts` (which also holds `GEO_SUBS`, `SCORE_THRESHOLD`, `DISCORD_WEBHOOK_URL`).

---

## Subreddits Watched

`comicswap`, `comicbooks`, `phillycollectors`, `newjersey`, `free`, `whatsthiscomicbook`, `comicbookcollecting`

---

## Planned Sources

### Facebook Marketplace — `fb-marketplace.ts`

- No public API — requires a **Playwright** scraper running a logged-in Facebook session
- Geo-targeted by default (FB Marketplace is always location-filtered)
- Anti-bot measures are aggressive; expect session management, fingerprinting, and rate limiting
- Run on a separate poll interval from Reddit (less frequent to avoid account bans)
- **Schema impact:** `Alert` needs a `source` field (`reddit` | `facebook_marketplace` | `buy_nothing`) and the `postId` uniqueness constraint will need namespacing (e.g. `fb:{listingId}`) to avoid collisions across sources

### Buy Nothing — `buy-nothing.ts`

- No public API
- Two flavors of Buy Nothing groups exist:
  - **Facebook-based groups** — scrapeable via the same Playwright FB session as Marketplace
  - **Buy Nothing App** — separate platform, no documented API; would require session intercept or mobile browser automation
- Start with Facebook Buy Nothing groups (lower friction, same tooling as Marketplace)
- All posts are inherently local (groups are hyperlocal by zip/neighborhood)

### Schema changes required before adding new sources

```prisma
model Alert {
  // add:
  source  String  @default("reddit")  // "reddit" | "facebook_marketplace" | "buy_nothing"

  // postId will need to be namespaced, e.g. "reddit:abc123", "fb:987654"
  // to keep the @unique constraint valid across sources
}
```

---

## Build Order

- [x] Prisma schema + push to Neon
- [x] `reddit-poller.ts` → Postgres via Prisma — confirmed working
- [x] `lib/prisma.ts` — shared client singleton
- [x] `lib/keywords.ts` — shared content keyword weights
- [x] `lib/config.ts` — tracked app config (location keywords, scoring, geo subs)
- [x] `api-server.ts` — Express API (`/api/alerts`, `/api/alerts/:id`, `/api/health`, `/api/keywords`)
- [x] React dashboard — live feed, filters, keyword weight emphasis
- [ ] `User` / `UserSettings` / `UserSeenAlert` schema + migration
- [ ] Auth — AWS Cognito integration (frontend + API middleware)
- [ ] Seen/dismiss feature in dashboard (requires auth)
- [ ] Deploy — EC2/ECS (backend), S3 + CloudFront (frontend), RDS (Postgres)
- [ ] `Alert.source` field + `postId` namespacing migration (prerequisite for multi-source)
- [ ] `fb-marketplace.ts` — Playwright scraper for Facebook Marketplace
- [ ] `buy-nothing.ts` — Facebook Buy Nothing group scraper (same session as Marketplace)

---

## Running Locally

**Development (parallel execution with Turborepo):**

```bash
# Both API server + dashboard
npm run dev:all

# Individual processes
npm start               # Reddit poller
npm run server          # API server only
npm run dashboard       # Dashboard only
npm run dev:manual      # Parallel with concurrently (fallback)
```

**Production:**

```bash
# Build optimized dashboard
npm run build

# Test Discord webhook
npm run test:api
```

Verify API: `curl http://localhost:3001/api/health`

---

## Monorepo Structure

This project uses **npm workspaces** + **Turborepo** for optimal dependency management and build orchestration:

- **Root**: Backend services (poller, API, shared lib)
- **dashboard/**: React + Vite frontend (workspace package)
- **Single `npm install`**: Hoisted shared dependencies
- **Intelligent caching**: Turborepo only rebuilds what changed
- **Parallel execution**: Multiple services run simultaneously

## Notes

- Node engine warnings from Prisma 7.5 (`^22.12` required) — resolved by running Node 24 (matches CI)
- Dashboard uses Vite 6 (not 8) for Node v20 compatibility
- The poller saves ALL posts to the database regardless of score; the dashboard defaults minScore to 10 to filter noise
- Turborepo provides build caching and task orchestration for efficient development
