'use client'

import { useState, useEffect } from 'react'
import { History, ArrowRight, Clock } from 'lucide-react'
import { getPersonChangeLogs, type ChangeLogEntry } from '@/app/actions/changelog'

const FIELD_LABELS: Record<string, string> = {
  fullName: 'Име', email: 'Имейл', phone: 'Телефон', city: 'Град',
  address: 'Адрес', role: 'Роля', status: 'Статус', profession: 'Професия',
  skills: 'Умения', employer: 'Работодател', university: 'Университет',
  specialty: 'Специалност', region: 'Регион', votingSection: 'Секция',
  gender: 'Пол', birthDate: 'Рожд. дата', membershipCardId: 'Карта №',
  photoUrl: 'Снимка', socialFb: 'Facebook', socialInstagram: 'Instagram',
  socialLinkedin: 'LinkedIn', telegram: 'Telegram',
  votingMobile: 'Телефон за гласуване', pensioner: 'Пенсионер',
  disability: 'Инвалидност',
}

function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] || field
}

interface ChangeHistoryProps {
  personId: number
}

export default function ChangeHistory({ personId }: ChangeHistoryProps) {
  const [logs, setLogs] = useState<ChangeLogEntry[]>([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    getPersonChangeLogs(personId).then(setLogs)
  }, [personId])

  if (logs.length === 0) return null

  const displayLogs = expanded ? logs : logs.slice(0, 5)

  return (
    <div className="glass-panel p-4 sm:p-5 bg-white/60 dark:bg-slate-800/60">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-700">
        <History className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        <h3 className="font-bold text-slate-800 dark:text-slate-200">История на промените</h3>
        <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">({logs.length})</span>
      </div>

      <div className="space-y-2">
        {displayLogs.map(log => (
          <div key={log.id} className="flex items-start gap-2 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-2 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-medium text-slate-700 dark:text-slate-300">{getFieldLabel(log.field)}</span>
                {log.oldValue && (
                  <span className="text-red-500 dark:text-red-400 line-through text-xs truncate max-w-[100px]" title={log.oldValue}>
                    {log.oldValue}
                  </span>
                )}
                <ArrowRight className="h-3 w-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <span className="text-green-600 dark:text-green-400 text-xs truncate max-w-[100px]" title={log.newValue || ''}>
                  {log.newValue || '(изтрито)'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                <Clock className="h-3 w-3" />
                {new Date(log.changedAt).toLocaleDateString('bg-BG', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {logs.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mt-3 py-1"
        >
          {expanded ? 'Покажи по-малко' : `Покажи всички (${logs.length})`}
        </button>
      )}
    </div>
  )
}
