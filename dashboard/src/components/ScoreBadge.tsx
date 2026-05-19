function scoreStyle(score: number): React.CSSProperties {
  if (score >= 30)
    return {
      background:
        "color-mix(in srgb, var(--color-score-high) 15%, transparent)",
      color: "var(--color-score-high)",
      borderColor:
        "color-mix(in srgb, var(--color-score-high) 50%, transparent)",
    };
  if (score >= 20)
    return {
      background: "color-mix(in srgb, var(--color-score-mid) 15%, transparent)",
      color: "var(--color-score-mid)",
      borderColor:
        "color-mix(in srgb, var(--color-score-mid) 50%, transparent)",
    };
  if (score >= 10)
    return {
      background: "color-mix(in srgb, var(--color-score-low) 12%, transparent)",
      color: "var(--color-score-low)",
      borderColor:
        "color-mix(in srgb, var(--color-score-low) 40%, transparent)",
    };
  return {
    background:
      "color-mix(in srgb, var(--color-on-surface-muted) 20%, transparent)",
    color: "var(--color-on-surface-muted)",
    borderColor: "var(--color-outline)",
  };
}

interface ScoreBadgeProps {
  score: number;
}

export default function ScoreBadge({ score }: ScoreBadgeProps) {
  return (
    <span
      className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold tabular-nums min-w-[2rem] border"
      style={{
        borderRadius: "4px",
        fontFamily: "Space Grotesk, sans-serif",
        ...scoreStyle(score),
      }}
    >
      {score}
    </span>
  );
}
