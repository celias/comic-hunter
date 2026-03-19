const BASE = "/api";

export async function fetchAlerts(params = {}) {
  const url = new URL(`${BASE}/alerts`, window.location.origin);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchAlert(id) {
  const res = await fetch(`${BASE}/alerts/${id}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function checkHealth() {
  const res = await fetch(`${BASE}/health`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchKeywords() {
  const res = await fetch(`${BASE}/keywords`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
