function scoreColor(score) {
  if (score >= 30) return "bg-red-600 text-white";
  if (score >= 20) return "bg-yellow-500 text-gray-900";
  if (score >= 10) return "bg-green-600 text-white";
  return "bg-gray-700 text-gray-300";
}

export default function ScoreBadge({ score }) {
  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums min-w-[2rem] ${scoreColor(score)}`}
    >
      {score}
    </span>
  );
}
