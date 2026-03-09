export default function PersonProfileLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
              <div className="flex gap-2">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16" />
              </div>
            </div>
          </div>
        </div>
        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 h-96 animate-pulse">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 h-64 animate-pulse">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
