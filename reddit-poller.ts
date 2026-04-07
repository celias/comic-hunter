/**
 * reddit-poller.js
 * ----------------
 * Polls Reddit JSON feeds for free/cheap comics & collectibles.
 * No API key or Reddit account required.
 *
 * Scores posts by keyword, deduplicates with Postgres via Prisma,
 * and fires Discord webhook alerts for anything worth flipping.
 *
 * Usage:  npx tsx reddit-poller.js
 */

import { config } from "./lib/config.ts";
import { prisma } from "./lib/prisma.ts";
import { KEYWORDS } from "./lib/keywords.ts";
import { log } from "./lib/logger.ts";
import { SUBREDDITS } from "./lib/subreddits.ts";

// Stagger: 10s between each sub's loop start = 12 subs spread over 2 min.
// Poll: each sub checked every 5 minutes — well within Reddit's rate limits.
const STAGGER_MS = 10_000;
const POLL_INTERVAL_MS = 5 * 60_000;

// How long to wait before retrying after a 429 rate-limit response.
const RATE_LIMIT_BACKOFF_MS = 2 * 60_000;

// ─── Keyword Scoring ─────────────────────────────────────────────────────────

interface RedditPost {
  id: string;
  title: string;
  body: string;
  url: string;
  author: string;
  createdAt: string;
  subreddit: string;
  imageUrl?: string;
  imageSource?: string;
  imageWidth?: number;
  imageHeight?: number;
  // ComicSwap specific fields
  comicswapData?: {
    isValidFormat: boolean;
    location?: string;
    have?: string;
    want?: string;
  };
}

function scorePost(title = "", body = ""): { score: number; matched: string[] } {
  const text = `${title} ${body}`.toLowerCase();
  let score = 0;
  const matched: string[] = [];
  for (const [kw, pts] of KEYWORDS) {
    if (text.includes(kw)) {
      score += pts;
      matched.push(kw);
    }
  }
  return { score, matched };
}

// ─── ComicSwap Formatting ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Parse and validate r/comicswap post formatting.
 * Required format: [Country/State] [H] Comics you have [W] Comics you want
 * Example: [NY] [H] Swamp Thing N52 TPB Vol 1-3 [W] Wolverine back issues or PayPal
 * 
 * Note: There must be a space after the [Location] before the [H].
 * The Automoderator removes posts that don't follow this exact formatting.
 */
function parseComicSwapFormat(title: string): {
  isValidFormat: boolean;
  location?: string;
  have?: string;
  want?: string;
} {
  // Match pattern: [Location] [H] have content [W] want content
  // Note: requires space after location bracket before [H]
  const comicswapRegex = /^\[([^\]]+)\]\s+\[H\]\s*([^\[]+)\s*\[W\]\s*(.+)$/i;
  const match = title.match(comicswapRegex);
  
  if (!match) {
    return { isValidFormat: false };
  }
  
  const [, location, have, want] = match;
  
  return {
    isValidFormat: true,
    location: location.trim(),
    have: have.trim(),
    want: want.trim()
  };
}

// ─── Location Scoring ─────────────────────────────────────────────────────────
//
// Separate from content scoring so the two can be logged/displayed independently.
//
// Returns:
//   locationScore   — points to add to the post's total score
//   isLocal         — true if ANY location keyword matched
//   matchedLocation — array of matched location keywords (for the Discord embed)

function scoreLocation(subreddit: string, title = "", body = ""): { locationScore: number; isLocal: boolean; matchedLocation: string[] } {
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
  const matchedLocation: string[] = [];

  for (const [kw, pts] of config.LOCATION_KEYWORDS) {
    if (text.includes(kw)) {
      locationScore += pts;
      matchedLocation.push(kw);
    }
  }

  const isLocal = matchedLocation.length > 0;
  return { locationScore, isLocal, matchedLocation };
}

// ─── Image Extraction ─────────────────────────────────────────────────────────

function extractImageFromRedditPost(data: any): { imageUrl?: string; imageSource?: string; imageWidth?: number; imageHeight?: number } {
  // Priority 1: Direct image URL from post URL (i.redd.it — works everywhere including Discord)
  if (data.url && isDirectImageUrl(data.url)) {
    return {
      imageUrl: data.url,
      imageSource: 'reddit_direct',
      imageWidth: data.preview?.images?.[0]?.source?.width,
      imageHeight: data.preview?.images?.[0]?.source?.height,
    };
  }

  // Priority 2: Gallery — prefer i.redd.it URL constructed from media ID
  if (data.gallery_data?.items?.length > 0 && data.media_metadata) {
    const firstItem = data.gallery_data.items[0];
    const mediaId = firstItem.media_id;
    const media = data.media_metadata[mediaId];
    if (media?.status === 'valid' || media?.s) {
      // Build direct i.redd.it URL from media ID + mime type
      const ext = media.m?.split('/')?.[1] || 'jpg'; // e.g. "image/jpg" -> "jpg"
      const directUrl = `https://i.redd.it/${mediaId}.${ext}`;
      return {
        imageUrl: directUrl,
        imageSource: 'reddit_gallery',
        imageWidth: media.s?.x,
        imageHeight: media.s?.y,
      };
    }
  }

  // Priority 3: Preview image (preview.redd.it — works in browsers but may not render in Discord)
  if (data.preview?.images?.length > 0) {
    const preview = data.preview.images[0];
    if (preview.source?.url) {
      const url = preview.source.url.replace(/&amp;/g, '&');
      if (isValidImageUrl(url)) {
        return {
          imageUrl: url,
          imageSource: 'reddit_preview',
          imageWidth: preview.source.width,
          imageHeight: preview.source.height
        };
      }
    }
  }

  // Priority 4: Thumbnail only if valid and not placeholder
  if (data.thumbnail) {
    const thumb = data.thumbnail;
    if (isValidImageUrl(thumb) && !isPlaceholderThumbnail(thumb)) {
      return {
        imageUrl: thumb,
        imageSource: 'reddit_thumb'
      };
    }
  }

  // Priority 5: No valid image found
  return { imageSource: 'none' };
}

function isDirectImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return /^https?:\/\/i\.redd\.it\/.+/i.test(url) ||
         /^https?:\/\/i\.imgur\.com\/.+/i.test(url) ||
         /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
}

function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

function isPlaceholderThumbnail(thumb: string): boolean {
  const placeholders = ['self', 'default', 'nsfw', 'spoiler', ''];
  return placeholders.includes(thumb);
}

// ─── JSON Fetching & Parsing ──────────────────────────────────────────────────

/**
 * Fetch and parse a subreddit's JSON feed.
 * Returns an array of { id, title, body, url, author, createdAt, subreddit }
 * Throws a RateLimitError on 429 so the caller can back off cleanly.
 */
class RateLimitError extends Error {}

async function fetchPosts(subreddit: string): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=25`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": config.USER_AGENT,
      Accept: "application/json",
    },
  });

  if (res.status === 429) throw new RateLimitError("Rate limited");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json: any = await res.json();
  const posts = json?.data?.children ?? [];

  return posts.map(({ data }) => {
    const imageData = extractImageFromRedditPost(data);
    const title = data.title ?? "";
    
    // Parse ComicSwap formatting if this is from r/comicswap
    const comicswapData = subreddit === 'comicswap' 
      ? parseComicSwapFormat(title)
      : undefined;
    
    return {
      id: data.id,
      title,
      body: data.selftext ?? "",
      url: `https://reddit.com${data.permalink}`,
      author: data.author ?? "unknown",
      createdAt: new Date(data.created_utc * 1000).toISOString(),
      subreddit,
      ...imageData,
      comicswapData,
    };
  });
}

// ─── Database (Prisma → Neon Postgres) ───────────────────────────────────────

async function alreadySeen(postId: string): Promise<boolean> {
  const existing = await prisma.alert.findUnique({ where: { postId } });
  return existing !== null;
}

async function saveAlert(post: RedditPost, score: number, matched: string[], isLocal: boolean, matchedLocation: string[]): Promise<void> {
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
      imageUrl: post.imageUrl,
      imageSource: post.imageSource,
      imageWidth: post.imageWidth,
      imageHeight: post.imageHeight,
      imageFetchedAt: post.imageUrl ? new Date() : null,
      imageConfidence: post.imageUrl ? 1.0 : null, // Phase 1: Reddit images have full confidence
      // ComicSwap fields
      comicswapIsValidFormat: post.comicswapData?.isValidFormat,
      comicswapLocation: post.comicswapData?.location,
      comicswapHave: post.comicswapData?.have,
      comicswapWant: post.comicswapData?.want,
    },
  });
}

// ─── Discord Alerts ───────────────────────────────────────────────────────────

const COLORS = {
  low: 0x57f287, // green  — score 10–19
  medium: 0xfee75c, // yellow — score 20–29
  high: 0xed4245, // red    — score 30+
};

function scoreColor(score: number): number {
  if (score >= 30) return COLORS.high;
  if (score >= 20) return COLORS.medium;
  return COLORS.low;
}

// isLocal    — did location scoring fire?
// matchedLocation — which location keywords matched (or ["r/phillycollectors"] etc.)
async function sendDiscordAlert(
  post: RedditPost,
  score: number,
  matched: string[],
  isLocal: boolean,
  matchedLocation: string[],
): Promise<void> {
  const preview = post.body.slice(0, 300);
  const truncated = post.body.length > 300 ? "…" : "";

  // Location field: pin emoji if local, globe if unknown.
  const locationLabel = isLocal
    ? `📍 South/Central NJ  •  ${matchedLocation.join(", ")}`
    : "🌐 Location unknown";

  const embed: any = {
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
  };

  // Add ComicSwap formatting info if applicable
  if (post.comicswapData?.isValidFormat) {
    embed.fields.push({
      name: "🔄 ComicSwap Format",
      value: `**Location:** ${post.comicswapData.location}\n**Have:** ${post.comicswapData.have.slice(0, 100)}${post.comicswapData.have.length > 100 ? "..." : ""}\n**Want:** ${post.comicswapData.want.slice(0, 100)}${post.comicswapData.want.length > 100 ? "..." : ""}`,
      inline: false,
    });
  } else if (post.subreddit === 'comicswap' && post.comicswapData) {
    embed.fields.push({
      name: "⚠️ ComicSwap Format",
      value: "**Invalid formatting** - This post may be removed by Automoderator.\nRequired: `[Location] [H] Items [W] Items`",
      inline: false,
    });
  }

  // Add image as large embed image if available
  if (post.imageUrl) {
    embed.image = {
      url: post.imageUrl,
    };
  }

  const payload = {
    username: "🕵️ Comic Hunter",
    embeds: [embed],
  };

  const res = await fetch(config.DISCORD_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Discord HTTP ${res.status}`);
}

// ─── Per-subreddit Poll Loop ──────────────────────────────────────────────────

async function pollSubreddit(subreddit: string, seenOnStartup: Set<string>): Promise<void> {
  let posts: RedditPost[];
  try {
    posts = await fetchPosts(subreddit);
  } catch (err: unknown) {
    if (err instanceof RateLimitError) {
      log(
        "warn",
        `r/${subreddit} rate limited — backing off ${RATE_LIMIT_BACKOFF_MS / 1000}s`,
      );
      await new Promise((r) => setTimeout(r, RATE_LIMIT_BACKOFF_MS));
      return;
    }
    log("error", `r/${subreddit} fetch error: ${err instanceof Error ? err.message : String(err)}`);
    return;
  }

  for (const post of posts) {
    if (seenOnStartup.has(post.id)) continue;
    if (await alreadySeen(post.id)) continue;

    // Check ComicSwap formatting if applicable
    let formatPenalty = 0;
    let formatWarning = "";
    if (post.subreddit === 'comicswap' && post.comicswapData) {
      if (!post.comicswapData.isValidFormat) {
        formatPenalty = -5; // Penalty for invalid formatting (likely to be removed)
        formatWarning = " [INVALID FORMAT - likely to be removed by Automoderator]";
      }
    }

    const { score: contentScore, matched } = scorePost(post.title, post.body);
    const { locationScore, isLocal, matchedLocation } = scoreLocation(
      post.subreddit,
      post.title,
      post.body,
    );

    const score = contentScore + locationScore + formatPenalty;

    if (score >= config.SCORE_THRESHOLD) {
      const localTag = isLocal ? "📍" : "🌐";
      const imageTag = post.imageUrl ? "🖼️" : "📝";
      log(
        "info",
        `HIT [${score}] ${localTag}${imageTag} r/${subreddit} — ${post.title.slice(0, 60)}${formatWarning}`,
      );
      log("info", `     Keywords: ${matched.join(", ")}`);
      if (matchedLocation.length > 0) {
        log("info", `     Location: ${matchedLocation.join(", ")}`);
      }
      if (post.imageSource) {
        log("info", `     Image: ${post.imageSource}${post.imageUrl ? ` (${post.imageWidth}x${post.imageHeight})` : ""}`);
      }
      if (post.comicswapData?.isValidFormat) {
        log("info", `     ComicSwap: [${post.comicswapData.location}] H: ${post.comicswapData.have.slice(0, 30)}... W: ${post.comicswapData.want.slice(0, 30)}...`);
      }
      try {
        await sendDiscordAlert(post, score, matched, isLocal, matchedLocation);
      } catch (err: unknown) {
        log("error", `Discord failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    } else {
      log(
        "debug",
        `skip [${score}] r/${subreddit} — ${post.title.slice(0, 40)}${formatWarning}`,
      );
    }

    await saveAlert(post, score, matched, isLocal, matchedLocation);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Seed existing post IDs so the first run doesn't flood Discord
  log("info", "Seeding initial post IDs (skipping existing posts)…");
  const seenOnStartup = new Set<string>();

  for (const subreddit of SUBREDDITS) {
    try {
      const posts = await fetchPosts(subreddit);
      posts.forEach((p) => seenOnStartup.add(p.id));
      log("info", `  r/${subreddit} — seeded ${posts.length} posts`);
    } catch (err: unknown) {
      log("warn", `  r/${subreddit} — seed failed: ${err instanceof Error ? err.message : String(err)}`);
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
