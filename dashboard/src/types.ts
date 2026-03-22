/**
 * Alert as received over JSON from the API.
 * Same shape as the Prisma Alert model but with ISO date strings
 * instead of Date objects (JSON serialization).
 */
export interface SerializedAlert {
  id: number;
  postId: string;
  subreddit: string;
  title: string;
  body: string;
  url: string;
  author: string;
  score: number;
  matched: string[];
  isLocal: boolean;
  matchedLocation: string[];
  postedAt: string;
  seenAt: string;
  flipMinSold: number | null;
  flipMaxSold: number | null;
  flipMinListed: number | null;
  flipMaxListed: number | null;
  flipSearchTerm: string | null;
}

/** Filter state used by the FilterBar and useAlerts hook. */
export interface Filters {
  minScore: number;
  localOnly: boolean;
  subreddit: string;
}

/** Shape of the paginated alerts response from GET /api/alerts. */
export interface AlertsResponse {
  alerts: SerializedAlert[];
  total: number;
  page: number;
  pages: number;
}

/** Shape of GET /api/keywords response. */
export interface KeywordsResponse {
  content: Record<string, number>;
  location: Record<string, number>;
}

/** Merged keyword weights map (content + location combined). */
export type WeightsMap = Record<string, number>;
