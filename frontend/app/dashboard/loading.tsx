export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-frank-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Initializing Authorization Matrix...</p>
      </div>
    </div>
  );
}
