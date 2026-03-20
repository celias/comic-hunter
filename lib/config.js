import "dotenv/config";

export const config = {
  // ── User Agent ────────────────────────────────────────────────────────────
  // Reddit asks that RSS bots identify themselves. Use any descriptive string.
  USER_AGENT: "comic-hunter-rss-bot/1.0",

  // ── Discord ─────────────────────────────────────────────────────────────
  // Channel Settings → Integrations → Webhooks → New Webhook → Copy URL
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,

  // ── Scoring ─────────────────────────────────────────────────────────────
  // Posts with score >= this value trigger a Discord alert.
  // Start at 10 and raise it if you're getting too much noise.
  SCORE_THRESHOLD: 10,

  // ── Location Filtering ─────────────────────────────────────────────────
  // Subs in this list are already geo-targeted — every post is treated as
  // local automatically, regardless of whether location keywords appear.
  GEO_SUBS: ["phillycollectors", "newjersey", "southjersey"],

  // Weighted keywords for South/Central Jersey location detection.
  // These scores are ADDED to the post's content score.
  // High confidence (+15): specific cities/area codes that are unambiguously local.
  // Medium confidence (+8): state/region names that are usually local but vaguer.
  // Low confidence (+3): weak signals — only nudge the score slightly.
  LOCATION_KEYWORDS: [
    // Area codes — strong signal, rarely appear in non-local context
    ["856", 15],
    ["609", 15],

    // Specific South Jersey cities/towns
    ["south jersey", 15],
    [" sj ", 15],
    ["cherry hill", 15],
    ["voorhees", 15],
    ["marlton", 15],
    ["moorestown", 15],
    ["mount laurel", 15],
    ["mt laurel", 15],
    ["haddonfield", 15],
    ["medford", 15],
    ["evesham", 15],
    ["cinnaminson", 15],
    ["maple shade", 15],
    ["lumberton", 15],
    ["shamong", 15],
    ["southampton", 15],
    ["burlington", 12], // slightly lower — Burlington VT is a false positive risk

    // Specific Central Jersey cities/towns
    ["central jersey", 15],
    ["toms river", 15],
    ["freehold", 15],
    ["lakewood", 12], // slightly lower — other Lakewoods exist
    ["brick", 12],
    ["howell", 15],
    ["jackson nj", 15],
    ["jackson, nj", 15],
    ["trenton", 12],
    ["hamilton nj", 15],
    ["hamilton, nj", 15],
    ["princeton", 12],
    ["ewing", 15],
    ["piscataway", 15],
    ["new brunswick", 12],

    // Shore towns
    ["atlantic city", 15],
    ["ocean city nj", 15],
    ["vineland", 15],
    ["millville", 15],
    ["bridgeton", 15],
    ["wildwood", 12],
    ["cape may", 12],

    // Region / state — medium confidence
    ["new jersey", 8],
    [" nj ", 8], // spaces prevent matching "ninja", "enjoy" etc.
    ["nj pickup", 15], // if someone writes "NJ pickup" it's very intentional
    ["jersey pickup", 12],
    ["south jersey pickup", 15],

    // Philly-adjacent — you're in the orbit, worth a nudge
    ["philly area", 8],
    ["philly", 15],
    ["philadelphia area", 8],
    ["delaware valley", 8],
    ["camden", 8], // Camden County / Camden city

    // Local pickup phrases — not geo-specific but worth noting
    ["local pickup", 3],
    ["local only", 3],
    ["porch pickup", 3],
  ],
};
