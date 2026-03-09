export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-40" />
            </div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-64" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-28" />
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-full w-44" />
          </div>
        </div>
        {/* Calendar / event cards skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-40" />
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
          {/* Calendar grid header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
            ))}
          </div>
          {/* Calendar grid cells */}
          {[...Array(5)].map((_, row) => (
            <div key={row} className="grid grid-cols-7 gap-2 mb-2">
              {[...Array(7)].map((_, col) => (
                <div key={col} className="h-20 bg-slate-100 dark:bg-slate-700/50 rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
