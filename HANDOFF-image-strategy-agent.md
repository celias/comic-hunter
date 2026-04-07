# Handoff: Image Strategy Implementation

## Target Agent

- Preferred: architect

## Why This Exists

We want reliable images for alerts in the dashboard and Discord context when possible.
The current pipeline stores Reddit post text metadata but no image metadata.

## Product Direction To Preserve

1. Phase 1 ships first:

- Extract image data from Reddit payload when available.
- If no image exists, show a clean empty image state.
- Image output is required in both destinations that exist today: Dashboard and Discord alerts.

2. Phase 2 is optional and gated:

- Add asynchronous fallback enrichment for high-value posts only.
- Only use image providers with explicit commercial-use permission for this app.
- If confidence is low, keep empty state instead of attaching a potentially wrong image.

3. Preserve existing roadmap behavior from plan.md:

- Do not regress live dashboard polling semantics (initial load + 5s incremental updates via since).
- Do not break keyword weight display flow (/api/keywords content + location maps).
- Keep existing scoring, local filtering, and eBay flip-field rendering behavior intact.

## Current State (confirmed)

- Ingestion: reddit-poller.ts saves title/body/url/author/score/location but no image fields.
- Data model: prisma/schema.prisma Alert model has no image columns.
- API: api-server.ts returns alert rows directly from Prisma.
- UI list/detail: dashboard components render text-only alert cards.
- Empty state component exists and can be reused as image fallback behavior.
- Multi-source ingestion is planned in roadmap (reddit, facebook marketplace, buy nothing) but not active yet.

## Decision Rules For Reddit Image Extraction

Use this strict priority order:

1. Gallery media metadata image (best quality if gallery post)
2. Preview image (preview.images[0].source.url)
3. Direct image URL from post URL if image-type post
4. Thumbnail only if it is a valid URL and not known placeholder values
5. Else mark as none

Validation requirements:

- URL must be http/https
- Reject placeholder markers like self/default/nsfw/spoiler
- Prefer width >= 300 when dimensions are available
- Capture source label for traceability

## Proposed Data Contract Changes

Add these fields to Alert model:

- imageUrl String?
- imageSource String? // reddit_gallery | reddit_preview | reddit_direct | reddit_thumb | provider_fallback | none
- imageWidth Int?
- imageHeight Int?
- imageFetchedAt DateTime?
- imageConfidence Float? // 0.0 to 1.0, useful for enrichment phase

Optional future field for licensing auditability:

- imageAttribution String?

Roadmap compatibility note:

- Keep image contract source-agnostic so it works if Alert.source is introduced later.
- Do not assume postId is globally unique across all future sources without namespacing.

## API Contract Expectations

- Keep existing endpoints stable.
- Include new image fields in /api/alerts and /api/alerts/:id responses.
- Do not break dashboard types; update them consistently.
- Preserve /api/keywords response shape used for keyword-weight emphasis in detail view.
- Maintain compatibility with current query behavior on /api/alerts (page, limit, minScore, localOnly, subreddit, since).

## UI/UX Expectations

List row behavior:

- If imageUrl exists, show thumbnail with object-fit cover.
- If missing, show visual placeholder block (intentional empty state, not broken image icon).

Detail behavior:

- Render larger preview when available.
- If image missing, show informative empty state panel: No image available from source.

Failure behavior:

- Never render broken image icon as final state.
- Add onError fallback from image element to empty placeholder state.

Dashboard compatibility notes:

- Keep current list expansion UX (AlertRow + AlertDetail) and only add image affordances.
- Do not remove or regress existing metadata chips, score badge, or flip data blocks.

## Discord Expectations

- If imageUrl exists, include it in Discord alert embed output (image or thumbnail field based on best fit).
- Keep current Discord alert structure, score color coding, and keyword/location fields intact.
- If no image is available, Discord alert should still send normally without image.
- Image failures must not block Discord alert delivery.

## Commercial-Use Guardrails

- Build provider fallback behind a feature flag (for example IMAGE_ENRICHMENT_ENABLED).
- Keep provider selection configurable so legal-approved source can be swapped without schema changes.
- Log provider, match reason, and confidence for auditability.

## Enrichment Phase (Phase 2) Requirements

- Trigger only when Reddit image is missing.
- Trigger only for selected alerts (for example score threshold, local-only, or user-prioritized).
- Use async queue/worker pattern so polling latency is unaffected.
- Add rate limiting and retries with backoff for any external API.
- Ensure enrichment work does not block reddit poller loops or API responsiveness.

## Matching Quality Rules (Fallback Provider)

- Normalize title by removing sale noise words and price fragments.
- Extract likely issue number and year clues.
- Require strong confidence before attaching image.
- If multiple candidates tie or confidence is low, store none.

Confidence guideline:

- > = 0.85: auto-attach
- 0.60 to 0.84: hold for manual review path (future)
- < 0.60: no attachment

## Observability Requirements

Track counters:

- alerts_total
- alerts_with_reddit_image
- alerts_with_placeholder
- enrichment_attempted
- enrichment_succeeded
- enrichment_skipped_low_confidence

Track logs per alert:

- imageSource chosen
- validation reject reason (if any)
- provider and confidence (if enriched)

## Acceptance Criteria

1. New alerts store image metadata when Reddit provides image info.
2. Alerts without source image display a clean placeholder in list and detail views.
3. No broken image icons appear in normal usage.
4. API and dashboard type contracts stay in sync.
5. Existing filters, polling, scoring, and Discord alerts continue to work.
6. Optional enrichment path is disabled by default and can be enabled safely.
7. Existing dashboard keyword-weight behavior and /api/keywords output remain unchanged.
8. Approach remains compatible with planned future multi-source alerts.
9. Discord alerts include image when available and still deliver when image is missing or invalid.

## Non-Goals

- No attempt to scrape arbitrary web pages linked by Reddit posts in Phase 1.
- No broad fuzzy matching that risks wrong covers in Phase 1.
- No legal assumptions about third-party image rights.

## Suggested Execution Order

1. Schema update and migration plan
2. Ingestion extraction logic in reddit-poller.ts
3. API type propagation
4. Dashboard list/detail placeholders and image rendering
5. Basic metrics/logging
6. Feature-flagged enrichment scaffolding (no provider hard dependency initially)
7. Validation pass focused on poller cadence and incremental dashboard update behavior

## Open Questions For Product Owner

1. Should NSFW-tagged Reddit images be excluded entirely?
2. Preferred placeholder style: neutral block, comic icon, or gradient card?
3. For Discord, should we prefer embed image (large) or embed thumbnail (compact) by default?
4. What exact commercial image provider is approved for fallback?
