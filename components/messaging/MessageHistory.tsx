'use client'

import { useState, useEffect } from 'react'
import { History, Mail, Check, AlertTriangle, XCircle } from 'lucide-react'
import { getMessageHistory, type MessageLogEntry } from '@/app/actions/messaging'

const statusConfig: Record<string, { label: string; icon: typeof Check; color: string; bg: string }> = {
  sent: { label: 'Изпратено', icon: Check, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
  partial: { label: 'Частично', icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
  failed: { label: 'Грешка', icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },
}

export default function MessageHistory() {
  const [logs, setLogs] = useState<MessageLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMessageHistory().then(setLogs).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded-xl" />
        ))}
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8">
        <History className="h-10 w-10 text-slate-200 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-sm text-slate-400 dark:text-slate-500">Няма изпратени съобщения</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {logs.map(log => {
        const cfg = statusConfig[log.status] || statusConfig.sent
        const StatusIcon = cfg.icon
        return (
          <div key={log.id} className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-3 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {log.subject || 'Без тема'}
                  </h4>
                  {log.templateName && (
                    <p className="text-xs text-slate-400 dark:text-slate-500">Шаблон: {log.templateName}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>{log.recipientCount} получател{log.recipientCount !== 1 ? 'я' : ''}</span>
                    <span>{new Date(log.sentAt).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.color} flex-shrink-0`}>
                <StatusIcon className="h-3 w-3" />
                {cfg.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
