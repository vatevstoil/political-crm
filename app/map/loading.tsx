export default function MapLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-52" />
          </div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-72 ml-8" />
        </div>
        {/* Map area placeholder */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden animate-pulse">
          <div className="h-[500px] bg-slate-200 dark:bg-slate-700 relative">
            {/* Simulated map loading indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="space-y-3 text-center">
                <div className="h-12 w-12 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto" />
                <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-32 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
