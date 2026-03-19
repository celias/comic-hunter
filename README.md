# 🕵️ Comic Hunter — Reddit Streamer (Node.js)

Polls Reddit JSON feeds for free/cheap comics and collectibles.  
No Reddit account or API key needed — uses Reddit's public JSON endpoint.  
Alerts you via Discord when something worth flipping shows up.

---

## Setup (5 minutes)

### 1. Install dependencies

```bash
npm install
```

### 2. Get a Discord webhook URL

1. Open any Discord channel
2. Channel Settings → **Integrations** → **Webhooks** → **New Webhook**
3. Copy the URL

### 3. Configure

```bash
cp config.example.js config.js
# Paste your Discord webhook URL — that's the only required field
```

### 4. Run

```bash
npm start
```

---

## Tuning signal-to-noise

Edit `SCORE_THRESHOLD` in `config.js`:

| Threshold | What you get            |
| --------- | ----------------------- |
| `5`       | Everything — very noisy |
| `10`      | Good starting point ✅  |
| `15`      | Only strong matches     |
| `20+`     | Quiet — only clear wins |

To add keywords, edit the `KEYWORDS` array in `streamer.js`:

```js
["your keyword", pointValue],
```

---

## Viewing what's been logged

```bash
npm run view        # top 20 hits by score
npm run view:hot    # score >= 20 only
npm run view:all    # everything
```

Or with custom args:

```bash
node viewer.js --min 15 --limit 50
```

---

## Running it 24/7

**tmux (simplest):**

```bash
tmux new -s comics
npm start
# Ctrl+B then D to detach
```

**PM2 (recommended for Node):**

```bash
npm install -g pm2
pm2 start streamer.js --name comic-hunter
pm2 save
pm2 startup   # auto-restart on reboot
```

---

## Next steps

- **Facebook Marketplace** — Playwright scraper
- **Buy Nothing App** — API reverse engineering
- **eBay price lookup** — auto-estimate flip value per alert
