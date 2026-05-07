import type { ViewMode } from "../types.ts";

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="3" width="14" height="2" rx="1" />
      <rect x="1" y="7" width="14" height="2" rx="1" />
      <rect x="1" y="11" width="14" height="2" rx="1" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

export default function ViewToggle({ mode, onChange }: ViewToggleProps) {
  const btnStyle = (active: boolean): React.CSSProperties => ({
    background: "transparent",
    border: `1px solid ${active ? "var(--color-primary)" : "var(--color-outline)"}`,
    borderRadius: "4px",
    color: active ? "var(--color-primary)" : "var(--color-on-surface-muted)",
    padding: "0.3rem 0.5rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition:
      "color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
    boxShadow: active ? "0 0 8px rgba(255, 45, 120, 0.3)" : "none",
  });

  return (
    <div style={{ display: "flex", gap: "0.375rem" }}>
      <button
        style={btnStyle(mode === "list")}
        onClick={() => onChange("list")}
        title="List view"
        aria-label="List view"
      >
        <ListIcon />
      </button>
      <button
        style={btnStyle(mode === "grid")}
        onClick={() => onChange("grid")}
        title="Grid view"
        aria-label="Grid view"
      >
        <GridIcon />
      </button>
    </div>
  );
}
