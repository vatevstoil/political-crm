'use client'

import Link from 'next/link'
import { Bell, Phone, Mail, Users, RotateCcw, Calendar } from 'lucide-react'
import type { ReminderWithPerson } from '@/app/actions/reminders'

const typeIcons: Record<string, typeof Bell> = {
  follow_up: RotateCcw,
  call: Phone,
  meeting: Users,
  email: Mail,
  other: Bell,
}

function isOverdue(date: Date): boolean {
  return new Date(date) < new Date()
}

interface UpcomingRemindersProps {
  reminders: ReminderWithPerson[]
}

export default function UpcomingReminders({ reminders }: UpcomingRemindersProps) {
  if (reminders.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-amber-500" />
          Напомняния
        </h3>
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">Няма предстоящи напомняния</p>
      </div>
    )
  }

  const overdueCount = reminders.filter(r => isOverdue(r.dueDate)).length

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5 text-amber-500" />
        Напомняния
        {overdueCount > 0 && (
          <span className="ml-auto text-xs font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
            {overdueCount} просрочени
          </span>
        )}
      </h3>
      <div className="space-y-2">
        {reminders.map(r => {
          const overdue = isOverdue(r.dueDate)
          const Icon = typeIcons[r.type] || Bell
          return (
            <Link
              key={r.id}
              href={`/directory/${r.personId}`}
              className={`block p-3 rounded-xl transition-colors ${
                overdue
                  ? 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20'
                  : 'bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 flex-shrink-0 ${overdue ? 'text-red-500' : 'text-amber-500'}`} />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate flex-1">{r.title}</span>
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="truncate">{r.person.fullName}</span>
                <span className={`flex items-center gap-1 ${overdue ? 'text-red-600 dark:text-red-400 font-semibold' : ''}`}>
                  <Calendar className="h-3 w-3" />
                  {new Date(r.dueDate).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
