export default function EmptyState() {
  return (
    <div className="text-center py-16">
      <p
        className="text-lg"
        style={{
          color: "var(--color-on-surface-muted)",
          fontFamily: "Space Grotesk, sans-serif",
        }}
      >
        No alerts found
      </p>
      <p className="text-sm mt-1" style={{ color: "var(--color-outline)" }}>
        Try adjusting your filters or wait for new posts
      </p>
    </div>
  );
}
