export default function EmptyState() {
  return (
    <div className="text-center py-16">
      <p className="text-gray-500 text-lg">No alerts found</p>
      <p className="text-gray-600 text-sm mt-1">
        Try adjusting your filters or wait for new posts
      </p>
    </div>
  );
}
