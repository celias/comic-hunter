# Comic Hunter — Reddit Poller (Node.js)

Polls Reddit JSON feeds for free/cheap comics and collectibles.
No Reddit account or API key needed — uses Reddit's public JSON endpoint.
Scores posts by keyword and location, saves to Postgres, and fires Discord webhook alerts.

---

## Setup

### 1. Install dependencies

This project uses **npm workspaces** for monorepo management. A single install command handles everything:

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

**For development (recommended):**

```bash
# Single command runs both API server + dashboard in parallel
npm run dev:all
```

**Individual processes:**

```bash
# Reddit poller (saves alerts to database)
npm start

# API server only (port 3001)
npm run server

# Dashboard only (port 5173)
npm run dashboard

# Alternative parallel method
npm run dev:manual
```

Verify the API is up:

```bash
curl http://localhost:3001/api/health
```

**Production build:**

```bash
npm run build
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

## Comic Vine API Integration

The project includes Comic Vine API integration for extracting character, series, and publisher keywords to enhance comic detection.

### One-Time Keyword Extraction

Extract high-value keywords from Comic Vine's database:

```bash
# Set up Comic Vine API key
echo "COMIC_VINE_API_KEY=your_api_key_here" >> .env

# Full extraction (respects rate limits)
node extract-comic-vine-keywords.js

# Testing modes (no duplicate API calls)
node extract-comic-vine-keywords.js --test characters --limit 10
node extract-comic-vine-keywords.js --dry-run
node extract-comic-vine-keywords.js --cache-only

# Show all options
node extract-comic-vine-keywords.js --help
```

**Features:**

- **Automatic caching** - Stores responses to avoid duplicate API calls
- **Rate limit compliance** - 20-second delays between requests (200/hour limit)
- **Testing modes** - Dry run, cache-only, endpoint testing
- **ES module output** - Generates `comic-vine-keywords.js` for integration

### VS Code Copilot Customizations

The project includes specialized Copilot customizations for Comic Vine API development:

**🤖 Comic Vine API Agent** (`@comic-vine-api`)

- Expert guidance on Comic Vine endpoints, rate limits, authentication
- Project-aware responses using existing code patterns
- Usage: `@comic-vine-api How do I search for characters by popularity?`

**⚙️ Automatic API Patterns**

- Auto-applied to any file matching `*{api,vine,comic}*.{js,ts,mjs}`
- Enforces rate limiting, error handling, authentication patterns

**🧪 API Testing Prompt** (`/test-comic-vine-api`)

- Generates test scripts for any Comic Vine endpoint
- Includes proper rate limiting and error handling
- Usage: `/test-comic-vine-api` → specify endpoint and parameters

---

Edit `SCORE_THRESHOLD` in `lib/config.js`:

| Threshold | What you get            |
| --------- | ----------------------- |
| `5`       | Everything — very noisy |
| `10`      | Good starting point     |
| `15`      | Only strong matches     |
| `20+`     | Quiet — only clear wins |

To add content keywords, edit the `KEYWORDS` array in `lib/keywords.js`:

```js
["your keyword", pointValue],
```

**Comic Vine Integration**: Import extracted keywords from Comic Vine extraction:

```js
import { COMIC_VINE_KEYWORDS } from "./comic-vine-keywords.js";
// Merge high-value keywords into main KEYWORDS array
```

To add location keywords (South/Central NJ area), edit `LOCATION_KEYWORDS` in `lib/config.js`.

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
pm2 start reddit-poller.js --name comic-hunter-poller
pm2 start api-server.js --name comic-hunter-api
pm2 save
pm2 startup
```

**Using Turborepo for production:**

```bash
# Build optimized assets
npm run build

# Deploy built dashboard to S3/CloudFront
# Run API server on EC2/ECS
```

---

## What's next

- AWS Cognito auth — per-user settings and seen state
- eBay flip value — price lookup on local posts once API key arrives
- Facebook Marketplace — Playwright scraper, geo-targeted listings
- Buy Nothing — Facebook Buy Nothing group scraper (same session as Marketplace)

---

## VS Code Development

This project includes custom VS Code Copilot configurations:

| File                                             | Purpose                                        |
| ------------------------------------------------ | ---------------------------------------------- |
| `.github/agents/comic-vine-api.agent.md`         | Comic Vine API specialist agent                |
| `.github/copilot-instructions.md`                | Workspace-wide Comic Vine rate limit awareness |
| `.github/instructions/api-files.instructions.md` | Auto-applied patterns for API files            |
| `.github/prompts/test-comic-vine-api.prompt.md`  | API testing prompt                             |

Use `@comic-vine-api` for Comic Vine API questions or `/test-comic-vine-api` to generate test scripts.
