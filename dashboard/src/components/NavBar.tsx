import type { Filters } from "../types.ts";
import { SUBREDDITS } from "../../../lib/subreddits.ts";

interface NavBarProps {
  connected: boolean;
  alertCount: number;
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
}

function ComicHunterLogo() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        textDecoration: "none",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "6px",
          background: "var(--color-primary-container)",
          border: "1px solid rgba(255,45,120,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 12px rgba(255,45,120,0.2)",
          flexShrink: 0,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 2L3 6v5c0 4 3.5 7 7 8 3.5-1 7-4 7-8V6L10 2z"
            fill="rgba(255,45,120,0.3)"
            stroke="#ff2d78"
            strokeWidth="1.2"
          />
          <circle cx="10" cy="10" r="3" fill="#ff2d78" opacity="0.8" />
        </svg>
      </div>
      <span
        style={{
          fontFamily: "Sora, sans-serif",
          fontWeight: 700,
          fontSize: "1.1rem",
          color: "var(--color-primary)",
          textShadow: "0 0 8px var(--color-primary)",
          letterSpacing: "-0.02em",
        }}
      >
        Comic Hunter
      </span>
    </div>
  );
}

const navLinkStyle: React.CSSProperties = {
  fontFamily: "Space Grotesk, sans-serif",
  fontSize: "0.875rem",
  color: "var(--color-on-surface-muted)",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "0.25rem 0",
  borderBottom: "2px solid transparent",
  transition: "color 0.15s, border-color 0.15s",
};

const navLinkActiveStyle: React.CSSProperties = {
  ...navLinkStyle,
  color: "var(--color-on-surface)",
  borderBottomColor: "var(--color-primary)",
};

export default function NavBar({
  connected,
  alertCount,
  filters,
  onFiltersChange,
}: NavBarProps) {
  const update = (key: keyof Filters, value: Filters[keyof Filters]) =>
    onFiltersChange({ ...filters, [key]: value });

  return (
    <nav
      style={{
        background: "var(--color-surface)",
        borderBottom: "1px solid rgba(255,45,120,0.2)",
        position: "sticky",
        top: 0,
        zIndex: 40,
        width: "100%",
      }}
    >
      <div
        style={{
          maxWidth: "1376px",
          margin: "0 auto",
          padding: "0 1.5rem",
          height: "56px",
          display: "flex",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        <ComicHunterLogo />

        {/* Nav links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            flex: 0,
          }}
        >
          <button style={navLinkActiveStyle}>Discover</button>
          <button style={navLinkStyle}>My Collection</button>
          <button style={navLinkStyle}>Swaps</button>
        </div>

        {/* Search / filters */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          {/* Search bar (min score filter) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "var(--color-surface-container)",
              border: "1px solid var(--color-outline-variant)",
              borderRadius: "6px",
              padding: "0 0.75rem",
              flex: 1,
              maxWidth: "460px",
              gap: "0.5rem",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="var(--color-on-surface-muted)"
            >
              <circle
                cx="6.5"
                cy="6.5"
                r="4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <line
                x1="10"
                y1="10"
                x2="14"
                y2="14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <select
              value={filters.subreddit}
              onChange={(e) => update("subreddit", e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                color: filters.subreddit
                  ? "var(--color-on-surface)"
                  : "var(--color-on-surface-muted)",
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "0.8rem",
                outline: "none",
                flex: 1,
                padding: "0.5rem 0",
                cursor: "pointer",
              }}
            >
              <option value="">Search subreddits and authors...</option>
              {SUBREDDITS.map((sub) => (
                <option key={sub} value={sub}>
                  r/{sub}
                </option>
              ))}
            </select>
          </div>

          {/* Min score pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              background: "var(--color-surface-container)",
              border: "1px solid var(--color-outline-variant)",
              borderRadius: "6px",
              padding: "0.375rem 0.625rem",
            }}
          >
            <span
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "0.7rem",
                color: "var(--color-on-surface-muted)",
              }}
            >
              Score ≥
            </span>
            <input
              type="number"
              min={0}
              value={filters.minScore}
              onChange={(e) =>
                update("minScore", parseInt(e.target.value) || 0)
              }
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-on-surface)",
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "0.8rem",
                outline: "none",
                width: "2.5rem",
                textAlign: "center",
              }}
            />
          </div>

          {/* Local only toggle */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              cursor: "pointer",
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "0.75rem",
              color: "var(--color-on-surface-muted)",
            }}
          >
            <input
              type="checkbox"
              checked={filters.localOnly}
              onChange={(e) => update("localOnly", e.target.checked)}
              style={{
                accentColor: "var(--color-primary)",
                width: 14,
                height: 14,
              }}
            />
            Local
          </label>
        </div>

        {/* Right side */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexShrink: 0,
          }}
        >
          {/* Alert count badge */}
          <span
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "0.7rem",
              background: "var(--color-primary-container)",
              color: "var(--color-primary)",
              border: "1px solid rgba(255,45,120,0.4)",
              borderRadius: "4px",
              padding: "0.2rem 0.5rem",
            }}
          >
            {alertCount} alerts
          </span>

          {/* Connection dot */}
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: connected ? "var(--color-secondary)" : "#ff4444",
              display: "inline-block",
              boxShadow: connected
                ? "0 0 6px var(--color-secondary)"
                : "0 0 6px #ff4444",
            }}
            title={connected ? "Connected" : "Disconnected"}
          />

          {/* Avatar */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--color-surface-container-high)",
              border: "1px solid var(--color-outline)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="var(--color-on-surface-muted)"
            >
              <circle cx="8" cy="5" r="3" />
              <path d="M2 13c0-3 2.7-5 6-5s6 2 6 5" strokeLinecap="round" />
            </svg>
          </div>

          <span
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "0.75rem",
              color: "var(--color-on-surface-muted)",
              cursor: "pointer",
            }}
          >
            Sign Out
          </span>
        </div>
      </div>
    </nav>
  );
}
