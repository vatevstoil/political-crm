export default function GroupsLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-32" />
            </div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-72" />
          </div>
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-full w-40" />
        </div>
        {/* Group cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden animate-pulse">
              <div className="h-2 bg-slate-200 dark:bg-slate-700" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                  <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-4" />
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
