export default function DirectoryLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Filter bar skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 animate-pulse">
          <div className="flex gap-3">
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex-1" />
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-32" />
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-32" />
          </div>
        </div>
        {/* Person cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
