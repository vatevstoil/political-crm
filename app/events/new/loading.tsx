export default function NewEventLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back button placeholder */}
        <div className="animate-pulse">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-24" />
        </div>
        {/* Form card skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6" />
          <div className="space-y-5">
            {/* Title field */}
            <div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2" />
              <div className="h-11 bg-slate-100 dark:bg-slate-700/50 rounded-xl" />
            </div>
            {/* Date fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-2" />
                <div className="h-11 bg-slate-100 dark:bg-slate-700/50 rounded-xl" />
              </div>
              <div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-2" />
                <div className="h-11 bg-slate-100 dark:bg-slate-700/50 rounded-xl" />
              </div>
            </div>
            {/* Location field */}
            <div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-2" />
              <div className="h-11 bg-slate-100 dark:bg-slate-700/50 rounded-xl" />
            </div>
            {/* Description field */}
            <div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2" />
              <div className="h-28 bg-slate-100 dark:bg-slate-700/50 rounded-xl" />
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex gap-3 mt-6">
            <div className="flex-1 h-11 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="flex-1 h-11 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
