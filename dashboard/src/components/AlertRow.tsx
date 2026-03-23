import ScoreBadge from "./ScoreBadge.tsx";
import type { SerializedAlert } from "../types.ts";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface AlertRowProps {
  alert: SerializedAlert;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function AlertRow({ alert, isExpanded, onToggle }: AlertRowProps) {
  return (
    <div
      className={`border rounded-lg transition-colors ${
        isExpanded
          ? "bg-gray-800/70 border-gray-700"
          : "bg-gray-900 border-gray-800 hover:bg-gray-800/50"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer"
      >
        {/* Image thumbnail or placeholder */}
        <div className="w-12 h-12 flex-shrink-0">
          {alert.imageUrl ? (
            <img
              src={alert.imageUrl}
              alt="Comic thumbnail"
              className="w-full h-full object-cover rounded border border-gray-700"
              onError={(e) => {
                // Fallback to placeholder on error
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-gray-800 border border-gray-700 rounded">
                    <svg class="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                    </svg>
                  </div>
                `;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 border border-gray-700 rounded relative">
              <div className="text-center px-1">
                <div className="bg-white rounded-full px-2 py-1 mb-1">
                  <span className="text-xs text-black font-bold">💭</span>
                </div>
                <div className="text-[8px] text-gray-400 leading-tight">
                  Sorry,<br/>no image
                </div>
              </div>
            </div>
          )}
        </div>

        <ScoreBadge score={alert.score} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-100 truncate">
            {alert.title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            r/{alert.subreddit} &middot; {alert.author} &middot;{" "}
            {timeAgo(alert.seenAt)}
          </p>
        </div>
        {alert.isLocal && (
          <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full border border-blue-800 shrink-0">
            Local
          </span>
        )}
      </button>
    </div>
  );
}
