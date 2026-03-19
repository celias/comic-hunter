/**
 * streamer.js
 * -----------
 * Polls Reddit JSON feeds for free/cheap comics & collectibles.
 * No API key or Reddit account required.
 *
 * Scores posts by keyword, deduplicates with Postgres via Prisma,
 * and fires Discord webhook alerts for anything worth flipping.
 *
 * Usage:  node streamer.js
 */

import { config } from "./config.js";
import { prisma } from "./lib/prisma.js";
import { KEYWORDS } from "./lib/keywords.js";

// ─── Subreddits to watch ─────────────────────────────────────────────────────
// Each gets its own JSON feed polled on a staggered schedule.

const SUBREDDITS = [
  "comicswap",
  "comicbooks",
  "phillycollectors",
  "newjersey",
  "free",
  "whatsthiscomicbook",
  "comicbookcollecting",
];

// Stagger: 10s between each sub's loop start = 12 subs spread over 2 min.
// Poll: each sub checked every 5 minutes — well within Reddit's rate limits.
const STAGGER_MS = 10_000;
const POLL_INTERVAL_MS = 5 * 60_000;

// How long to wait before retrying after a 429 rate-limit response.
const RATE_LIMIT_BACKOFF_MS = 2 * 60_000;

// ─── Keyword Scoring ─────────────────────────────────────────────────────────

function scorePost(title = "", body = "") {
  const text = `${title} ${body}`.toLowerCase();
  let score = 0;
  const matched = [];
  for (const [kw, pts] of KEYWORDS) {
    if (text.includes(kw)) {
      score += pts;
      matched.push(kw);
    }
  }
  return { score, matched };
}

// ─── Location Scoring ─────────────────────────────────────────────────────────
//
// Separate from content scoring so the two can be logged/displayed independently.
//
// Returns:
//   locationScore   — points to add to the post's total score
//   isLocal         — true if ANY location keyword matched
//   matchedLocation — array of matched location keywords (for the Discord embed)

function scoreLocation(subreddit, title = "", body = "") {
  // Geo-targeted subs are always considered local — skip keyword scan.
  if (config.GEO_SUBS.includes(subreddit)) {
    return {
      locationScore: 0,
      isLocal: true,
      matchedLocation: [`r/${subreddit}`],
    };
  }

  const text = `${title} ${body}`.toLowerCase();
  let locationScore = 0;
  const matchedLocation = [];

  for (const [kw, pts] of config.LOCATION_KEYWORDS) {
    if (text.includes(kw)) {
      locationScore += pts;
      matchedLocation.push(kw);
    }
  }

  const isLocal = matchedLocation.length > 0;
  return { locationScore, isLocal, matchedLocation };
}

// ─── JSON Fetching & Parsing ──────────────────────────────────────────────────

/**
 * Fetch and parse a subreddit's JSON feed.
 * Returns an array of { id, title, body, url, author, createdAt, subreddit }
 * Throws a RateLimitError on 429 so the caller can back off cleanly.
 */
class RateLimitError extends Error {}

async function fetchPosts(subreddit) {
  const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=25`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": config.USER_AGENT,
      Accept: "application/json",
    },
  });

  if (res.status === 429) throw new RateLimitError("Rate limited");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();
  const posts = json?.data?.children ?? [];

  return posts.map(({ data }) => ({
    id: data.id,
    title: data.title ?? "",
    body: data.selftext ?? "",
    url: `https://reddit.com${data.permalink}`,
    author: data.author ?? "unknown",
    createdAt: new Date(data.created_utc * 1000).toISOString(),
    subreddit,
  }));
}

// ─── Database (Prisma → Neon Postgres) ───────────────────────────────────────

async function alreadySeen(postId) {
  const existing = await prisma.alert.findUnique({ where: { postId } });
  return existing !== null;
}

async function saveAlert(post, score, matched, isLocal, matchedLocation) {
  await prisma.alert.create({
    data: {
      postId: post.id,
      subreddit: post.subreddit,
      title: post.title,
      body: post.body,
      url: post.url,
      author: post.author,
      score,
      matched,
      isLocal,
      matchedLocation,
      postedAt: new Date(post.createdAt),
    },
  });
}

// ─── Discord Alerts ───────────────────────────────────────────────────────────

const COLORS = {
  low: 0x57f287, // green  — score 10–19
  medium: 0xfee75c, // yellow — score 20–29
  high: 0xed4245, // red    — score 30+
};

function scoreColor(score) {
  if (score >= 30) return COLORS.high;
  if (score >= 20) return COLORS.medium;
  return COLORS.low;
}

// isLocal    — did location scoring fire?
// matchedLocation — which location keywords matched (or ["r/phillycollectors"] etc.)
async function sendDiscordAlert(
  post,
  score,
  matched,
  isLocal,
  matchedLocation,
) {
  const preview = post.body.slice(0, 300);
  const truncated = post.body.length > 300 ? "…" : "";

  // Location field: pin emoji if local, globe if unknown.
  const locationLabel = isLocal
    ? `📍 South/Central NJ  •  ${matchedLocation.join(", ")}`
    : "🌐 Location unknown";

  const payload = {
    username: "🕵️ Comic Hunter",
    embeds: [
      {
        title: post.title.slice(0, 256),
        url: post.url,
        color: scoreColor(score),
        description: preview + truncated || "*No body text*",
        fields: [
          { name: "🏆 Score", value: String(score), inline: true },
          { name: "📌 Subreddit", value: `r/${post.subreddit}`, inline: true },
          { name: "👤 Author", value: post.author, inline: true },
          {
            name: "🔑 Matched Keywords",
            value: matched.join(", "),
            inline: false,
          },
          {
            name: "📍 Location",
            value: locationLabel,
            inline: false,
          },
        ],
        footer: { text: "comic_hunter • json" },
        timestamp: new Date(post.createdAt).toISOString(),
      },
    ],
  };

  const res = await fetch(config.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Discord HTTP ${res.status}`);
}

// ─── Logging ──────────────────────────────────────────────────────────────────

function log(level, msg) {
  const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
  console.log(`${ts} [${level.toUpperCase().padEnd(5)}] ${msg}`);
}

// ─── Per-subreddit Poll Loop ──────────────────────────────────────────────────

async function pollSubreddit(subreddit, seenOnStartup) {
  let posts;
  try {
    posts = await fetchPosts(subreddit);
  } catch (err) {
    if (err instanceof RateLimitError) {
      log(
        "warn",
        `r/${subreddit} rate limited — backing off ${RATE_LIMIT_BACKOFF_MS / 1000}s`,
      );
      await new Promise((r) => setTimeout(r, RATE_LIMIT_BACKOFF_MS));
      return;
    }
    log("error", `r/${subreddit} fetch error: ${err.message}`);
    return;
  }

  for (const post of posts) {
    if (seenOnStartup.has(post.id)) continue;
    if (await alreadySeen(post.id)) continue;

    const { score: contentScore, matched } = scorePost(post.title, post.body);
    const { locationScore, isLocal, matchedLocation } = scoreLocation(
      post.subreddit,
      post.title,
      post.body,
    );

    const score = contentScore + locationScore;

    if (score >= config.SCORE_THRESHOLD) {
      const localTag = isLocal ? "📍" : "🌐";
      log(
        "info",
        `HIT [${score}] ${localTag} r/${subreddit} — ${post.title.slice(0, 60)}`,
      );
      log("info", `     Keywords: ${matched.join(", ")}`);
      if (matchedLocation.length > 0) {
        log("info", `     Location: ${matchedLocation.join(", ")}`);
      }
      try {
        await sendDiscordAlert(post, score, matched, isLocal, matchedLocation);
      } catch (err) {
        log("error", `Discord failed: ${err.message}`);
      }
    } else {
      log(
        "debug",
        `skip [${score}] r/${subreddit} — ${post.title.slice(0, 40)}`,
      );
    }

    await saveAlert(post, score, matched, isLocal, matchedLocation);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Seed existing post IDs so the first run doesn't flood Discord
  log("info", "Seeding initial post IDs (skipping existing posts)…");
  const seenOnStartup = new Set();

  for (const subreddit of SUBREDDITS) {
    try {
      const posts = await fetchPosts(subreddit);
      posts.forEach((p) => seenOnStartup.add(p.id));
      log("info", `  r/${subreddit} — seeded ${posts.length} posts`);
    } catch (err) {
      log("warn", `  r/${subreddit} — seed failed: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 2_000)); // 2s between seed fetches
  }

  log(
    "info",
    `Seeded ${seenOnStartup.size} posts. Starting staggered poll loops…`,
  );

  // Kick off each subreddit loop with a staggered start
  SUBREDDITS.forEach((subreddit, i) => {
    setTimeout(() => {
      log("info", `Loop started: r/${subreddit}`);
      const loop = async () => {
        await pollSubreddit(subreddit, seenOnStartup);
        setTimeout(loop, POLL_INTERVAL_MS);
      };
      loop();
    }, i * STAGGER_MS);
  });
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
