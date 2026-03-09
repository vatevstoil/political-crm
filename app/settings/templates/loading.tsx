export default function TemplatesLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-36 mb-3" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-96" />
        </div>
        {/* Template cards skeleton */}
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-48" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-64" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-full" />
                <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-5/6" />
                <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
