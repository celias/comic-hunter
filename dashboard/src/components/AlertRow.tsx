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
