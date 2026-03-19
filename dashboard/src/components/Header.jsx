export default function Header({ connected, alertCount }) {
  return (
    <header className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Comic Hunter</h1>
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full ${
            connected ? "bg-green-500" : "bg-red-500"
          }`}
          title={connected ? "Connected" : "Disconnected"}
        />
      </div>
      <span className="text-sm text-gray-400">
        {alertCount} alert{alertCount !== 1 ? "s" : ""}
      </span>
    </header>
  );
}
