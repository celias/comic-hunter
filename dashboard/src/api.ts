import type { AlertsResponse, SerializedAlert, KeywordsResponse } from "./types.ts";

const BASE = "/api";

export async function fetchAlerts(
  params: Record<string, string | number | boolean> = {},
): Promise<AlertsResponse> {
  const url = new URL(`${BASE}/alerts`, window.location.origin);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<AlertsResponse>;
}

export async function fetchAlert(id: number): Promise<SerializedAlert> {
  const res = await fetch(`${BASE}/alerts/${id}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<SerializedAlert>;
}

export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  const res = await fetch(`${BASE}/health`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<{ status: string; timestamp: string }>;
}

export async function fetchKeywords(): Promise<KeywordsResponse> {
  const res = await fetch(`${BASE}/keywords`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<KeywordsResponse>;
}
