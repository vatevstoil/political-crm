export default function MessagingLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="space-y-2">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-44" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-64" />
            </div>
          </div>
        </div>
        {/* Steps indicator skeleton */}
        <div className="flex items-center gap-2 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded" />}
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-full w-28" />
            </div>
          ))}
        </div>
        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6" />
              {/* Filter/group buttons */}
              <div className="mb-6">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-3" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-9 bg-slate-100 dark:bg-slate-700/50 rounded-xl w-28" />
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-3" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-9 bg-slate-100 dark:bg-slate-700/50 rounded-xl w-32" />
                  ))}
                </div>
              </div>
              {/* Continue button */}
              <div className="flex justify-end mt-4">
                <div className="h-11 bg-slate-200 dark:bg-slate-700 rounded-xl w-36" />
              </div>
            </div>
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-36 mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-10" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-3" />
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700/50 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
