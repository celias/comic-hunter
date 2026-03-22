import ScoreBadge from "./ScoreBadge.tsx";
import type { SerializedAlert, WeightsMap } from "../types.ts";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

function weightStyle(weight: number): string {
  if (weight >= 8) return "bg-red-900/60 text-red-200 border-red-700 font-semibold";
  if (weight >= 5) return "bg-yellow-900/40 text-yellow-200 border-yellow-700";
  return "bg-gray-800 text-gray-300 border-gray-700";
}

interface AlertDetailProps {
  alert: SerializedAlert;
  weights: WeightsMap | null;
}

export default function AlertDetail({ alert, weights }: AlertDetailProps) {
  const sortedMatched = [...alert.matched].sort((a, b) => {
    const wa = weights?.[a] ?? 0;
    const wb = weights?.[b] ?? 0;
    return wb - wa;
  });

  const sortedLocation = [...alert.matchedLocation].sort((a, b) => {
    const wa = weights?.[a] ?? 0;
    const wb = weights?.[b] ?? 0;
    return wb - wa;
  });

  return (
    <div className="px-4 pb-4 pt-2 space-y-3 text-sm">
      {alert.body && (
        <div className="bg-gray-950 rounded p-3 text-gray-300 whitespace-pre-wrap break-words max-h-60 overflow-y-auto border border-gray-800">
          {alert.body}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs">
        <div>
          <span className="text-gray-500">Score</span>
          <div className="mt-0.5">
            <ScoreBadge score={alert.score} />
          </div>
        </div>
        <div>
          <span className="text-gray-500">Subreddit</span>
          <p className="text-gray-300 mt-0.5">r/{alert.subreddit}</p>
        </div>
        <div>
          <span className="text-gray-500">Author</span>
          <p className="text-gray-300 mt-0.5">u/{alert.author}</p>
        </div>
        <div>
          <span className="text-gray-500">Posted</span>
          <p className="text-gray-300 mt-0.5">{formatDate(alert.postedAt)}</p>
        </div>
        <div>
          <span className="text-gray-500">Seen</span>
          <p className="text-gray-300 mt-0.5">{formatDate(alert.seenAt)}</p>
        </div>
        {alert.isLocal && (
          <div>
            <span className="text-gray-500">Location</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {sortedLocation.map((kw) => (
                <span
                  key={kw}
                  className={`text-xs px-2 py-0.5 rounded border ${weightStyle(weights?.[kw] ?? 0)}`}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {alert.matched.length > 0 && (
        <div>
          <span className="text-xs text-gray-500">Matched Keywords</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {sortedMatched.map((kw) => {
              const w = weights?.[kw] ?? 0;
              return (
                <span
                  key={kw}
                  className={`text-xs px-2 py-0.5 rounded border ${weightStyle(w)}`}
                >
                  {kw}
                  {weights && w > 0 && (
                    <span className="ml-1 opacity-60">+{w}</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {(alert.flipMinSold != null || alert.flipMinListed != null) && (
        <div className="bg-amber-950/30 border border-amber-800/50 rounded p-3">
          <span className="text-xs text-amber-400 font-medium">
            eBay Flip Data
          </span>
          <div className="grid grid-cols-2 gap-2 mt-1.5 text-xs">
            {alert.flipSearchTerm && (
              <div className="col-span-2">
                <span className="text-gray-500">Search: </span>
                <span className="text-gray-300">{alert.flipSearchTerm}</span>
              </div>
            )}
            {alert.flipMinSold != null && (
              <div>
                <span className="text-gray-500">Sold: </span>
                <span className="text-green-400">
                  ${alert.flipMinSold.toFixed(2)} - $
                  {alert.flipMaxSold?.toFixed(2)}
                </span>
              </div>
            )}
            {alert.flipMinListed != null && (
              <div>
                <span className="text-gray-500">Listed: </span>
                <span className="text-gray-300">
                  ${alert.flipMinListed.toFixed(2)} - $
                  {alert.flipMaxListed?.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <a
        href={alert.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline"
      >
        View on Reddit &rarr;
      </a>
    </div>
  );
}
