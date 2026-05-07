function scoreStyle(score: number): React.CSSProperties {
  if (score >= 30)
    return {
      background: "rgba(255,45,120,0.15)",
      color: "#ff2d78",
      borderColor: "rgba(255,45,120,0.5)",
    };
  if (score >= 20)
    return {
      background: "rgba(255,224,74,0.15)",
      color: "#ffe04a",
      borderColor: "rgba(255,224,74,0.5)",
    };
  if (score >= 10)
    return {
      background: "rgba(0,255,204,0.12)",
      color: "#00ffcc",
      borderColor: "rgba(0,255,204,0.4)",
    };
  return {
    background: "rgba(90,80,104,0.2)",
    color: "#a098b0",
    borderColor: "rgba(90,80,104,0.4)",
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
