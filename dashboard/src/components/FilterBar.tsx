import type { Filters } from "../types.ts";
import { SUBREDDITS } from "../../../lib/subreddits.ts";

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const labelStyle: React.CSSProperties = {
  fontFamily: "Space Grotesk, sans-serif",
  color: "var(--color-on-surface-muted)",
  fontSize: "0.75rem",
};

const inputStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  color: "var(--color-on-surface)",
  border: "none",
  borderBottom: "1px solid var(--color-primary)",
  borderRadius: "4px 4px 0 0",
  padding: "0.375rem 0.75rem",
  outline: "none",
  fontFamily: "Space Grotesk, sans-serif",
  fontSize: "0.875rem",
};

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const update = (key: keyof Filters, value: Filters[keyof Filters]): void =>
    onChange({ ...filters, [key]: value });

  const handleFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    e.currentTarget.style.boxShadow = "0 2px 8px rgba(255, 45, 120, 0.4)";
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div
      className="flex flex-wrap items-end gap-4 mb-6 p-4 rounded"
      style={{
        background: "var(--color-surface-container)",
        border: "1px solid var(--color-outline-variant)",
      }}
    >
      <label className="flex flex-col gap-1" style={labelStyle}>
        Min Score
        <input
          type="number"
          min={0}
          value={filters.minScore}
          onChange={(e) => update("minScore", parseInt(e.target.value) || 0)}
          style={inputStyle}
          className="w-24 transition-shadow"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </label>

      <label className="flex flex-col gap-1" style={labelStyle}>
        Subreddit
        <select
          value={filters.subreddit}
          onChange={(e) => update("subreddit", e.target.value)}
          style={{ ...inputStyle }}
          className="transition-shadow"
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          <option value="">All</option>
          {SUBREDDITS.map((sub) => (
            <option key={sub} value={sub}>
              r/{sub}
            </option>
          ))}
        </select>
      </label>

      <label
        className="flex items-center gap-2 cursor-pointer py-1.5"
        style={labelStyle}
      >
        <input
          type="checkbox"
          checked={filters.localOnly}
          onChange={(e) => update("localOnly", e.target.checked)}
          className="w-4 h-4"
          style={{ accentColor: "var(--color-primary)" }}
        />
        Local only
      </label>
    </div>
  );
}
