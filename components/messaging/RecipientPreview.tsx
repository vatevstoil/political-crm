'use client'

import { Users, Mail, AlertCircle } from 'lucide-react'
import type { RecipientPreviewData } from '@/app/actions/messaging'

interface RecipientPreviewProps {
  data: RecipientPreviewData | null
  loading: boolean
}

export default function RecipientPreview({ data, loading }: RecipientPreviewProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 animate-pulse">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-3" />
        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-48 mb-2" />
        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-40" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-6 text-center">
        <Users className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Изберете сегмент, за да видите получателите</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
        <Users className="h-4 w-4 text-blue-600" />
        Получатели
      </h3>

      <div className="flex gap-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{data.total}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">общо</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-green-700 dark:text-green-400">{data.withEmail}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">с имейл</div>
          </div>
        </div>
      </div>

      {data.total > 0 && data.withEmail === 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 mb-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          Никой от избраните няма имейл адрес
        </div>
      )}

      {data.sample.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Примерни получатели:</p>
          {data.sample.map(p => (
            <div key={p.id} className="flex items-center gap-2 text-sm">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                {p.fullName.charAt(0)}
              </div>
              <span className="text-slate-700 dark:text-slate-300 truncate">{p.fullName}</span>
              {p.email ? (
                <span className="text-xs text-slate-400 dark:text-slate-500 truncate">{p.email}</span>
              ) : (
                <span className="text-xs text-red-400">без имейл</span>
              )}
            </div>
          ))}
          {data.total > 10 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 pl-7">и още {data.total - 10}...</p>
          )}
        </div>
      )}
    </div>
  )
}
