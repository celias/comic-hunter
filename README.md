# Comic Hunter — Reddit Streamer (Node.js)

Polls Reddit JSON feeds for free/cheap comics and collectibles.
No Reddit account or API key needed — uses Reddit's public JSON endpoint.
Scores posts by keyword and location, saves to Postgres, and fires Discord webhook alerts.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```
DATABASE_URL=your_neon_postgres_connection_string
DISCORD_WEBHOOK_URL=your_discord_webhook_url
```

**Database:** The app uses [Neon](https://neon.tech) (cloud Postgres) in development and AWS RDS in production. Run `npx prisma db push` after setting `DATABASE_URL` to create the schema.

**Discord webhook:**

1. Open any Discord channel
2. Channel Settings → Integrations → Webhooks → New Webhook
3. Copy the URL

### 3. Run

Two separate processes — start both:

```bash
# Terminal 1 — Reddit poller
npm start

# Terminal 2 — API server (port 3001)
npm run server
```

Verify the API is up:

```bash
curl http://localhost:3001/api/health
```

---

## API

The Express server exposes three endpoints:

| Method | Path              | Description                       |
| ------ | ----------------- | --------------------------------- |
| GET    | `/api/health`     | Liveness check                    |
| GET    | `/api/alerts`     | Paginated alert list with filters |
| GET    | `/api/alerts/:id` | Single alert by id                |

**`GET /api/alerts` query params:**

| Param       | Default | Description                                                    |
| ----------- | ------- | -------------------------------------------------------------- |
| `page`      | 1       | Page number                                                    |
| `limit`     | 20      | Results per page (max 100)                                     |
| `minScore`  | 0       | Minimum score filter                                           |
| `localOnly` | false   | `"true"` to show only local posts                              |
| `subreddit` | —       | Filter by subreddit name                                       |
| `since`     | —       | ISO timestamp — only alerts newer than this (for live polling) |

---

## Tuning signal-to-noise

Edit `SCORE_THRESHOLD` in `config.js`:

| Threshold | What you get            |
| --------- | ----------------------- |
| `5`       | Everything — very noisy |
| `10`      | Good starting point     |
| `15`      | Only strong matches     |
| `20+`     | Quiet — only clear wins |

To add content keywords, edit the `KEYWORDS` array in `streamer.js`:

```js
["your keyword", pointValue],
```

To add location keywords (South/Central NJ area), edit `LOCATION_KEYWORDS` in `config.js`.

---

## Running 24/7

**tmux (simplest):**

```bash
tmux new -s comics
npm start
# Ctrl+B then D to detach

tmux new -s api
npm run server
# Ctrl+B then D to detach
```

**PM2 (recommended):**

```bash
npm install -g pm2
pm2 start streamer.js --name comic-hunter-poller
pm2 start server.js --name comic-hunter-api
pm2 save
pm2 startup
```

---

## What's next

- React dashboard — live alert feed, local filter, seen/dismiss
- AWS Cognito auth — per-user settings and seen state
- eBay flip value (`ebay.js`) — price lookup on local posts once API key arrives
- Facebook Marketplace (`fb-marketplace.js`) — Playwright scraper, geo-targeted listings
- Buy Nothing (`buy-nothing.js`) — Facebook Buy Nothing group scraper (same session as Marketplace)
