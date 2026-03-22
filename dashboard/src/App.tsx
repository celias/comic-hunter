import { useState, useEffect } from "react";
import { useAlerts } from "./hooks/useAlerts.ts";
import { fetchKeywords } from "./api.ts";
import Header from "./components/Header.tsx";
import FilterBar from "./components/FilterBar.tsx";
import AlertList from "./components/AlertList.tsx";
import EmptyState from "./components/EmptyState.tsx";
import type { Filters, WeightsMap } from "./types.ts";

const INITIAL_FILTERS: Filters = {
  minScore: 10,
  localOnly: false,
  subreddit: "",
};

export default function App() {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const { alerts, loading, error, connected } = useAlerts(filters);
  const [weights, setWeights] = useState<WeightsMap | null>(null);

  useEffect(() => {
    fetchKeywords()
      .then((data) => setWeights({ ...data.content, ...data.location }))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Header connected={connected} alertCount={alerts.length} />
      <FilterBar filters={filters} onChange={setFilters} />
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <EmptyState />
      ) : (
        <AlertList alerts={alerts} weights={weights} />
      )}
    </div>
  );
}
