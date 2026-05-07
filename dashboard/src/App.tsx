import { useState, useEffect, useCallback } from "react";
import { useAlerts } from "./hooks/useAlerts.ts";
import { fetchKeywords } from "./api.ts";
import Header from "./components/Header.tsx";
import NavBar from "./components/NavBar.tsx";
import FilterBar from "./components/FilterBar.tsx";
import AlertList from "./components/AlertList.tsx";
import AlertGrid from "./components/AlertGrid.tsx";
import AlertDetail from "./components/AlertDetail.tsx";
import EmptyState from "./components/EmptyState.tsx";
import ViewToggle from "./components/ViewToggle.tsx";
import type { Filters, WeightsMap, ViewMode } from "./types.ts";

const INITIAL_FILTERS: Filters = {
  minScore: 10,
  localOnly: false,
  subreddit: "",
};

const VIEW_MODE_KEY = "comic-hunter-view-mode";

function loadViewMode(): ViewMode {
  try {
    const stored = localStorage.getItem(VIEW_MODE_KEY);
    return stored === "grid" ? "grid" : "list";
  } catch {
    return "list";
  }
}

export default function App() {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const { alerts, loading, error, connected } = useAlerts(filters);
  const [weights, setWeights] = useState<WeightsMap | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(loadViewMode);
  const [gridSelectedId, setGridSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetchKeywords()
      .then((data) => setWeights({ ...data.content, ...data.location }))
      .catch(() => {});
  }, []);

  const handleViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    setGridSelectedId(null);
    try {
      localStorage.setItem(VIEW_MODE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, []);

  const gridSelectedAlert =
    gridSelectedId != null
      ? (alerts.find((a) => a.id === gridSelectedId) ?? null)
      : null;

  if (viewMode === "grid") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
        <NavBar
          connected={connected}
          alertCount={alerts.length}
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* View toggle + error */}
        <div
          style={{
            maxWidth: "1376px",
            margin: "0 auto",
            padding: "0.75rem 1.5rem 0",
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <ViewToggle mode={viewMode} onChange={handleViewMode} />
          </div>
          {error && (
            <div
              className="border px-4 py-3 rounded mt-2"
              style={{
                background: "rgba(255,68,68,0.1)",
                borderColor: "#ff4444",
                color: "#ffa0a0",
              }}
            >
              {error}
            </div>
          )}
        </div>

        {loading ? (
          <div
            className="text-center py-12"
            style={{ color: "var(--color-on-surface-muted)" }}
          >
            Loading alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div
            style={{
              maxWidth: "1376px",
              margin: "0 auto",
              padding: "0 1.5rem",
            }}
          >
            <EmptyState />
          </div>
        ) : (
          <div style={{ maxWidth: "1376px", margin: "0 auto" }}>
            <AlertGrid
              alerts={alerts}
              weights={weights}
              onSelect={setGridSelectedId}
            />
          </div>
        )}

        {/* Quick View modal */}
        {gridSelectedAlert && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(10,10,18,0.88)",
              backdropFilter: "blur(6px)",
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
            onClick={() => setGridSelectedId(null)}
          >
            <div
              style={{
                background: "var(--color-surface-container)",
                border: "1px solid rgba(255,45,120,0.4)",
                borderRadius: "6px",
                boxShadow: "0 0 48px rgba(255,45,120,0.15)",
                maxWidth: "640px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{
                  borderBottom: "1px solid var(--color-outline-variant)",
                }}
              >
                <h2
                  className="text-sm font-semibold truncate pr-4"
                  style={{
                    color: "var(--color-on-surface)",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {gridSelectedAlert.title}
                </h2>
                <button
                  onClick={() => setGridSelectedId(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--color-on-surface-muted)",
                    cursor: "pointer",
                    fontSize: "1.25rem",
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <AlertDetail alert={gridSelectedAlert} weights={weights} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // List mode — compact layout
  return (
    <div
      className="max-w-5xl mx-auto px-4 py-6 min-h-screen"
      style={{ background: "var(--color-bg)" }}
    >
      <Header
        connected={connected}
        alertCount={alerts.length}
        viewToggle={<ViewToggle mode={viewMode} onChange={handleViewMode} />}
      />
      <FilterBar filters={filters} onChange={setFilters} />

      {error && (
        <div
          className="border px-4 py-3 rounded mb-4"
          style={{
            background: "rgba(255,68,68,0.1)",
            borderColor: "#ff4444",
            color: "#ffa0a0",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          className="text-center py-12"
          style={{ color: "var(--color-on-surface-muted)" }}
        >
          Loading alerts...
        </div>
      ) : alerts.length === 0 ? (
        <EmptyState />
      ) : (
        <AlertList alerts={alerts} weights={weights} />
      )}
    </div>
  );
}
