import { useState } from "react";
import ScoreBadge from "./ScoreBadge.tsx";
import type { SerializedAlert } from "../types.ts";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface AlertRowProps {
  alert: SerializedAlert;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function AlertRow({
  alert,
  isExpanded,
  onToggle,
}: AlertRowProps) {
  const [hovered, setHovered] = useState(false);

  const rowStyle: React.CSSProperties = {
    background: isExpanded
      ? "var(--color-surface-container-high)"
      : "var(--color-surface-container)",
    border: `1px solid ${hovered || isExpanded ? "var(--color-primary)" : "rgba(255, 45, 120, 0.3)"}`,
    borderRadius: "4px",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxShadow:
      hovered || isExpanded ? "0 0 12px rgba(255, 45, 120, 0.15)" : "none",
  };

  return (
    <div
      style={rowStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer"
      >
        {/* Image thumbnail or placeholder */}
        <div className="w-12 h-12 flex-shrink-0">
          {alert.imageUrl ? (
            <img
              src={alert.imageUrl}
              alt="Comic thumbnail"
              className="w-full h-full object-cover"
              style={{
                borderRadius: "4px",
                border: "1px solid var(--color-outline)",
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.parentElement!.innerHTML = `
                  <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--color-surface);border:1px solid var(--color-outline);border-radius:4px">
                    <svg width="20" height="20" fill="var(--color-outline)" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                    </svg>
                  </div>
                `;
              }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-outline)",
                borderRadius: "4px",
              }}
            >
              <span style={{ fontSize: "18px" }}>💭</span>
            </div>
          )}
        </div>

        <ScoreBadge score={alert.score} />

        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium truncate"
            style={{ color: "var(--color-on-surface)" }}
          >
            {alert.title}
          </p>
          <p
            className="text-xs mt-0.5"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              color: "var(--color-on-surface-muted)",
            }}
          >
            r/{alert.subreddit} &middot; {alert.author} &middot;{" "}
            {timeAgo(alert.seenAt)}
          </p>
        </div>

        {alert.isLocal && (
          <span
            className="text-xs px-2 py-0.5 shrink-0"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              background: "var(--color-primary-container)",
              color: "var(--color-primary)",
              border: "1px solid var(--color-outline)",
              borderRadius: "4px",
            }}
          >
            Local
          </span>
        )}
      </button>
    </div>
  );
}
