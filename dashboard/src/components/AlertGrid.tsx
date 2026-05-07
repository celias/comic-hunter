import AlertCard from "./AlertCard.tsx";
import type { SerializedAlert, WeightsMap } from "../types.ts";

interface AlertGridProps {
  alerts: SerializedAlert[];
  weights: WeightsMap | null;
  onSelect: (id: number) => void;
}

export default function AlertGrid({ alerts, onSelect }: AlertGridProps) {
  return (
    <div style={{ padding: "1.5rem" }}>
      <h2
        style={{
          fontFamily: "Sora, sans-serif",
          fontWeight: 700,
          fontSize: "1.375rem",
          color: "var(--color-on-surface)",
          marginBottom: "1.25rem",
          letterSpacing: "-0.01em",
        }}
      >
        Trending Comics
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
          gap: "0.5rem",
          overflow: "visible",
        }}
      >
        {alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onSelect={() => onSelect(alert.id)}
          />
        ))}
      </div>
    </div>
  );
}
