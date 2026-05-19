import { useState } from "react";
import ScoreBadge from "./ScoreBadge.tsx";
import type { SerializedAlert } from "../types.ts";

interface AlertCardProps {
  alert: SerializedAlert;
  onSelect: () => void;
}

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

export default function AlertCard({ alert, onSelect }: AlertCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const hasImage = !!alert.imageUrl && !imgError;

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        aspectRatio: "2 / 3",
        background: "var(--color-surface-container)",
        border: `1px solid ${hovered ? "var(--color-primary)" : "rgba(255,45,120,0.25)"}`,
        borderRadius: "4px",
        overflow: "visible",
        cursor: "pointer",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        boxShadow: hovered ? "0 0 18px rgba(255,45,120,0.25)" : "none",
        zIndex: hovered ? 10 : 1,
      }}
    >
      {/* Cover image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        {hasImage ? (
          <img
            src={alert.imageUrl!}
            alt={alert.title}
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.5rem",
              gap: "0.25rem",
              background: "var(--color-surface-container)",
            }}
          >
            <span style={{ fontSize: "1.25rem" }}>💭</span>
            <p
              style={{
                color: "var(--color-on-surface-muted)",
                fontSize: "0.6rem",
                fontFamily: "Space Grotesk, sans-serif",
                textAlign: "center",
                lineHeight: 1.3,
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {alert.title}
            </p>
          </div>
        )}
      </div>

      {/* Always-visible Quick View label at top */}
      <div
        style={{
          position: "absolute",
          top: "0.35rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          background: "rgba(10,10,18,0.75)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "20px",
          padding: "0.15rem 0.45rem",
          zIndex: 2,
          whiteSpace: "nowrap",
        }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 16 16"
          fill="rgba(255,255,255,0.6)"
        >
          <path d="M8 3C4 3 1 8 1 8s3 5 7 5 7-5 7-5-3-5-7-5z" />
          <circle cx="8" cy="8" r="2.5" fill="rgba(10,10,18,0.9)" />
        </svg>
        <span
          style={{
            fontSize: "0.55rem",
            color: "rgba(255,255,255,0.6)",
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          Quick View
        </span>
      </div>

      {/* Hover detail overlay — appears to the right (or below if near right edge) */}
      {hovered && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            bottom: 0,
            left: "105%",
            minWidth: "180px",
            background: "var(--color-surface-container-highest)",
            border: "1px solid rgba(255,45,120,0.4)",
            borderRadius: "6px",
            padding: "0.75rem",
            zIndex: 20,
            boxShadow:
              "0 4px 24px rgba(0,0,0,0.6), 0 0 16px rgba(255,45,120,0.1)",
            pointerEvents: "none",
          }}
        >
          {/* Stars + score */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              marginBottom: "0.35rem",
            }}
          >
            <span
              style={{
                color: "#ffe04a",
                fontSize: "0.65rem",
                letterSpacing: "1px",
              }}
            >
              ★★★★★
            </span>
            <span
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "0.7rem",
                color: "var(--color-primary)",
                fontWeight: 600,
              }}
            >
              {alert.score}/10
            </span>
          </div>

          {/* Title */}
          <p
            style={{
              fontFamily: "Sora, sans-serif",
              fontWeight: 700,
              fontSize: "0.8rem",
              color: "var(--color-on-surface)",
              lineHeight: 1.2,
              marginBottom: "0.2rem",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {alert.title}
          </p>

          {/* Subreddit */}
          <p
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "0.65rem",
              color: "var(--color-on-surface-muted)",
              marginBottom: "0.35rem",
            }}
          >
            r/{alert.subreddit}
          </p>

          {/* Score badge + time */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <ScoreBadge score={alert.score} />
            <span
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "0.6rem",
                color: "var(--color-on-surface-muted)",
              }}
            >
              {timeAgo(alert.seenAt)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
