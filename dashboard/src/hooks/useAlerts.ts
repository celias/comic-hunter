import { useState, useEffect, useRef, useCallback } from "react";
import { fetchAlerts } from "../api.ts";
import type { Filters, SerializedAlert } from "../types.ts";

const POLL_INTERVAL = 5000;

export function useAlerts(filters: Filters) {
  const [alerts, setAlerts] = useState<SerializedAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const latestSeenAt = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const buildParams = useCallback(
    (since: string | null) => {
      const params: Record<string, string | number> = { limit: 100 };
      if (filters.minScore > 0) params.minScore = filters.minScore;
      if (filters.localOnly) params.localOnly = "true";
      if (filters.subreddit) params.subreddit = filters.subreddit;
      if (since) params.since = since;
      return params;
    },
    [filters.minScore, filters.localOnly, filters.subreddit]
  );

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAlerts(buildParams(null));
      setAlerts(data.alerts);
      setConnected(true);
      if (data.alerts.length > 0) {
        latestSeenAt.current = data.alerts[0].seenAt;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  const pollNew = useCallback(async () => {
    if (!latestSeenAt.current) return;
    try {
      const data = await fetchAlerts(buildParams(latestSeenAt.current));
      if (data.alerts.length > 0) {
        setAlerts((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const newAlerts = data.alerts.filter((a) => !existingIds.has(a.id));
          return [...newAlerts, ...prev];
        });
        latestSeenAt.current = data.alerts[0].seenAt;
      }
      setConnected(true);
    } catch {
      setConnected(false);
    }
  }, [buildParams]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    intervalRef.current = setInterval(pollNew, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current!);
  }, [pollNew]);

  return { alerts, loading, error, connected };
}
