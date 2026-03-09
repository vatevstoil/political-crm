export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="space-y-2">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-40" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-64" />
            </div>
          </div>
        </div>
        {/* Settings cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 animate-pulse">
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4" />
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
            </div>
          ))}
        </div>
        {/* Info section skeleton */}
        <div className="animate-pulse">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-28 mb-4" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-5 flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-44" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
