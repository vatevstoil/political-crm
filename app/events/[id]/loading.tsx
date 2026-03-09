export default function EventDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back button + title */}
        <div className="animate-pulse">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-24 mb-4" />
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64" />
        </div>
        {/* Event detail card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
          </div>
          <div className="space-y-4">
            {/* Info rows */}
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded flex-shrink-0" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
              </div>
            ))}
          </div>
          {/* Description placeholder */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-28 mb-3" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            </div>
          </div>
        </div>
        {/* Attendees section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                </div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
