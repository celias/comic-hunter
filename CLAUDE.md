# Comic Hunter — Claude Code Instructions

## Project Overview

Comic Hunter monitors Reddit for free and cheap comic deals, scores posts by keyword relevance, stores alerts in Postgres, and delivers Discord webhook notifications. A React dashboard provides real-time browsing and filtering of alerts.

## Tech Stack

- **Runtime:** Node.js with `tsx` (TypeScript execution, no build step for backend)
- **Language:** TypeScript (strict mode throughout)
- **Database:** Postgres via Prisma ORM (`lib/prisma.ts`)
- **Backend:** Express API server (`api-server.ts`)
- **Frontend:** React 19 + Vite + Tailwind CSS (`dashboard/`)
- **Monorepo:** npm workspaces + Turborepo

## Architecture — 3 Processes

| Process       | File               | Port | Purpose                                                              |
| ------------- | ------------------ | ---- | -------------------------------------------------------------------- |
| Reddit Poller | `reddit-poller.ts` | —    | Polls subreddits, scores posts, saves alerts, fires Discord webhooks |
| API Server    | `api-server.ts`    | 3001 | Express — serves alerts and keyword data to the dashboard            |
| Dashboard     | `dashboard/`       | 5173 | React — real-time alert browser with filters                         |

## Common Commands

```bash
# Start API server
npm run server

# Start Reddit poller
npm run start

# Start both API + dashboard (recommended for local dev)
npm run dev:manual

# Start everything via Turborepo
npm run dev:all

# Build dashboard
npm run dashboard:build

# Regenerate Prisma client after schema changes
npx prisma generate

# Run DB migrations
npx prisma migrate dev
```

## Key Files

- `reddit-poller.ts` — main polling loop, scoring logic, Discord alerts
- `api-server.ts` — Express routes for `/api/alerts`, `/api/keywords`, `/api/health`
- `lib/config.ts` — scoring weights, geo subreddits, Discord config
- `lib/keywords.ts` — keyword arrays with weights
- `lib/subreddits.ts` — canonical subreddit list (shared by poller and dashboard)
- `lib/logger.ts` — shared log() utility
- `prisma/schema.prisma` — data model

## Coding Conventions

- All source files use `.ts` / `.tsx` — no `.js` source files
- Import with explicit `.ts` extensions (e.g. `import { x } from "./lib/x.ts"`)
- Shared backend utilities live in `lib/` — import them rather than duplicating
- TypeScript strict mode is enforced — no implicit `any`
- Prisma is the only DB access layer — no raw SQL
- Console output goes through `log()` from `lib/logger.ts` in backend files

## Linear

When creating or updating Linear issues for this repository, always use:

- **Project:** Comic Hunter (`7da38bc9-679b-4e98-8069-7cb8cceae25f`)
- **Team:** Gab's Personal Workspace (`6cca568a-1989-4c36-bbbf-d31e6e6ca53e`)

Never assign issues to the Personal Website project unless explicitly asked.
