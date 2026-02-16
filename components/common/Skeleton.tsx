'use client'

interface SkeletonProps {
  className?: string
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-sm ${className}`}>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-slate-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
        <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
      </div>
    </div>
  )
}

export function SkeletonTableRow({ className = '' }: SkeletonProps) {
  return (
    <div className={`flex items-center gap-4 p-4 border-b border-slate-100 ${className}`}>
      <div className="w-5 h-5 bg-slate-200 rounded animate-pulse" />
      <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-1/4 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" />
    </div>
  )
}

export function SkeletonText({ lines = 3, className = '' }: SkeletonProps & { lines?: number }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-slate-200 rounded animate-pulse ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export function SkeletonFilterBar({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-md mb-6 p-4 ${className}`}>
      <div className="flex gap-2 items-center">
        <div className="h-12 flex-grow bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-12 w-12 bg-slate-200 rounded-xl animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:flex gap-3 mt-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-slate-200 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 8, className = '' }: SkeletonProps & { count?: number }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
