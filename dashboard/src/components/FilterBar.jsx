const SUBREDDITS = [
  "comicswap",
  "comicbooks",
  "phillycollectors",
  "newjersey",
  "free",
  "whatsthiscomicbook",
  "comicbookcollecting",
];

export default function FilterBar({ filters, onChange }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
      <label className="flex flex-col gap-1 text-sm text-gray-400">
        Min Score
        <input
          type="number"
          min={0}
          value={filters.minScore}
          onChange={(e) => update("minScore", parseInt(e.target.value) || 0)}
          className="w-24 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-gray-100 focus:outline-none focus:border-blue-500"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-400">
        Subreddit
        <select
          value={filters.subreddit}
          onChange={(e) => update("subreddit", e.target.value)}
          className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-gray-100 focus:outline-none focus:border-blue-500"
        >
          <option value="">All</option>
          {SUBREDDITS.map((sub) => (
            <option key={sub} value={sub}>
              r/{sub}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer py-1.5">
        <input
          type="checkbox"
          checked={filters.localOnly}
          onChange={(e) => update("localOnly", e.target.checked)}
          className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
        />
        Local only
      </label>
    </div>
  );
}
