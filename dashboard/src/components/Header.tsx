import type { ReactNode } from "react";

interface HeaderProps {
  connected: boolean;
  alertCount: number;
  viewToggle?: ReactNode;
}

export default function Header({
  connected,
  alertCount,
  viewToggle,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{
            fontFamily: "Sora, sans-serif",
            color: "var(--color-primary)",
          }}
        >
          Comic Hunter
        </h1>
        <span
          className="inline-block w-2.5 h-2.5 rounded-full transition-colors"
          style={{
            background: connected ? "var(--color-primary)" : "#b91c1c",
          }}
          title={connected ? "Connected" : "Disconnected"}
        />
      </div>
      <div className="flex items-center gap-3">
        {viewToggle}
        <span
          className="text-xs font-medium px-3 py-1 rounded"
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            background: "var(--color-primary-container)",
            color: "var(--color-primary)",
            border: "1px solid rgba(255, 45, 120, 0.5)",
            boxShadow: "inset 0 0 12px rgba(255, 45, 120, 0.1)",
          }}
        >
          {alertCount} alert{alertCount !== 1 ? "s" : ""}
        </span>
      </div>
    </header>
  );
}
