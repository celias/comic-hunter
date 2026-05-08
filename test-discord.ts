/**
 * test-discord.js
 * ---------------
 * Sends a single test embed to your Discord webhook.
 * Verifies the webhook URL is valid and shows what
 * both a LOCAL and UNKNOWN-LOCATION alert look like.
 *
 * Usage:  node test-discord.js
 */

import { config } from "./lib/config.ts";
import { log } from "./lib/logger.ts";

async function sendTestEmbed(
  label: string,
  isLocal: boolean,
  matchedLocation: string[]
): Promise<void> {
  const locationLabel = isLocal
    ? `📍 South/Central NJ  •  ${matchedLocation.join(", ")}`
    : "🌐 Location unknown";

  const payload = {
    username: "🕵️ Comic Hunter",
    embeds: [
      {
        title: `[TEST] ${label}`,
        url: "https://reddit.com",
        color: isLocal ? 0x57f287 : 0xfee75c,
        description:
          "This is a test alert fired from test-discord.js — not a real post.",
        fields: [
          { name: "🏆 Score", value: "25", inline: true },
          { name: "📌 Subreddit", value: "r/comicswap", inline: true },
          { name: "👤 Author", value: "test_user", inline: true },
          {
            name: "🔑 Matched Keywords",
            value: "free, longbox, cgc",
            inline: false,
          },
          { name: "📍 Location", value: locationLabel, inline: false },
        ],
        footer: { text: "comic_hunter • test" },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const res = await fetch(config.DISCORD_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    log("info", `✅  "${label}" sent successfully`);
  } else {
    log("error", `❌  "${label}" failed — HTTP ${res.status}`);
    const body = await res.text();
    log("error", `    Discord said: ${body}`);
  }
}

log("info", "Sending test embeds to Discord…");

// Send both variants so you can see how each label looks in Discord
await sendTestEmbed("Local post (📍)", true, ["cherry hill", "856"]);

// Small delay so Discord doesn't batch them into one message
await new Promise((r) => setTimeout(r, 1500));

await sendTestEmbed("Unknown location (🌐)", false, []);

log("info", "Done. Check your Discord channel.");
