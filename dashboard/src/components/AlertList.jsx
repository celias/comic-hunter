import { useState } from "react";
import AlertRow from "./AlertRow.jsx";
import AlertDetail from "./AlertDetail.jsx";

export default function AlertList({ alerts, weights }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

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
