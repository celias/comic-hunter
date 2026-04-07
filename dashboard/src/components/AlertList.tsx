import { useState } from "react";
import AlertRow from "./AlertRow.tsx";
import AlertDetail from "./AlertDetail.tsx";
import type { SerializedAlert, WeightsMap } from "../types.ts";

interface AlertListProps {
  alerts: SerializedAlert[];
  weights: WeightsMap | null;
}

export default function AlertList({ alerts, weights }: AlertListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggle = (id: number): void =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div key={alert.id}>
          <AlertRow
            alert={alert}
            isExpanded={expandedId === alert.id}
            onToggle={() => toggle(alert.id)}
          />
          {expandedId === alert.id && (
            <AlertDetail alert={alert} weights={weights} />
          )}
        </div>
      ))}
    </div>
  );
}
