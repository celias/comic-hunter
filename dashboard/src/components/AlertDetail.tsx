import ScoreBadge from "./ScoreBadge.tsx";
import type { SerializedAlert, WeightsMap } from "../types.ts";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

function chipStyle(weight: number): React.CSSProperties {
  if (weight >= 8)
    return {
      background: "rgba(255,45,120,0.15)",
      color: "#ff2d78",
      borderColor: "rgba(255,45,120,0.5)",
      fontWeight: 600,
    };
  if (weight >= 5)
    return {
      background: "rgba(255,224,74,0.12)",
      color: "#ffe04a",
      borderColor: "rgba(255,224,74,0.4)",
    };
  return {
    background: "rgba(90,80,104,0.15)",
    color: "var(--color-on-surface-muted)",
    borderColor: "var(--color-outline)",
  };
}

const metaLabelStyle: React.CSSProperties = {
  fontFamily: "Space Grotesk, sans-serif",
  color: "var(--color-on-surface-muted)",
  fontSize: "0.75rem",
};

interface AlertDetailProps {
  alert: SerializedAlert;
  weights: WeightsMap | null;
}

export default function AlertDetail({ alert, weights }: AlertDetailProps) {
  const sortedMatched = [...alert.matched].sort((a, b) => {
    const wa = weights?.[a] ?? 0;
    const wb = weights?.[b] ?? 0;
    return wb - wa;
  });

  const sortedLocation = [...alert.matchedLocation].sort((a, b) => {
    const wa = weights?.[a] ?? 0;
    const wb = weights?.[b] ?? 0;
    return wb - wa;
  });

  return (
    <div className="px-4 pb-4 pt-2 space-y-3 text-sm">
      {alert.imageUrl && (
        <div className="flex justify-center">
          <img
            src={alert.imageUrl}
            alt="Comic preview"
            className="max-w-sm max-h-64 object-contain"
            style={{
              borderRadius: "4px",
              border: "1px solid var(--color-outline)",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {alert.body && (
        <div
          className="rounded p-3 whitespace-pre-wrap break-words max-h-60 overflow-y-auto"
          style={{
            background: "var(--color-bg)",
            color: "var(--color-on-surface)",
            border: "1px solid var(--color-outline-variant)",
          }}
        >
          {alert.body}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs">
        <div>
          <span style={metaLabelStyle}>Score</span>
          <div className="mt-0.5">
            <ScoreBadge score={alert.score} />
          </div>
        </div>
        <div>
          <span style={metaLabelStyle}>Subreddit</span>
          <p className="mt-0.5" style={{ color: "var(--color-on-surface)" }}>
            r/{alert.subreddit}
          </p>
        </div>
        <div>
          <span style={metaLabelStyle}>Author</span>
          <p className="mt-0.5" style={{ color: "var(--color-on-surface)" }}>
            u/{alert.author}
          </p>
        </div>
        <div>
          <span style={metaLabelStyle}>Posted</span>
          <p className="mt-0.5" style={{ color: "var(--color-on-surface)" }}>
            {formatDate(alert.postedAt)}
          </p>
        </div>
        <div>
          <span style={metaLabelStyle}>Seen</span>
          <p className="mt-0.5" style={{ color: "var(--color-on-surface)" }}>
            {formatDate(alert.seenAt)}
          </p>
        </div>
        {alert.imageSource && (
          <div>
            <span style={metaLabelStyle}>Image Source</span>
            <p className="mt-0.5" style={{ color: "var(--color-on-surface)" }}>
              {alert.imageSource}
            </p>
          </div>
        )}
        {alert.isLocal && (
          <div>
            <span style={metaLabelStyle}>Location</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {sortedLocation.map((kw) => (
                <span
                  key={kw}
                  className="text-xs px-2 py-0.5 border"
                  style={{
                    borderRadius: "4px",
                    fontFamily: "Space Grotesk, sans-serif",
                    ...chipStyle(weights?.[kw] ?? 0),
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {alert.matched.length > 0 && (
        <div>
          <span className="text-xs" style={metaLabelStyle}>
            Matched Keywords
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {sortedMatched.map((kw) => {
              const w = weights?.[kw] ?? 0;
              return (
                <span
                  key={kw}
                  className="text-xs px-2 py-0.5 border"
                  style={{
                    borderRadius: "4px",
                    fontFamily: "Space Grotesk, sans-serif",
                    ...chipStyle(w),
                  }}
                >
                  {kw}
                  {weights && w > 0 && (
                    <span className="ml-1 opacity-60">+{w}</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div
        className="pt-2"
        style={{ borderTop: "1px solid var(--color-outline-variant)" }}
      >
        <a
          href={alert.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs underline transition-all"
          style={{
            color: "var(--color-primary)",
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          View on Reddit →
        </a>
      </div>
    </div>
  );
}
