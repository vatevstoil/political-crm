'use client'

import Link from 'next/link'
import { UserPlus, CalendarPlus, Send, FileSpreadsheet, Users, Bell } from 'lucide-react'

const actions = [
  {
    label: 'Нов човек',
    href: '/directory/new',
    icon: UserPlus,
    color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    hoverColor: 'hover:bg-blue-500/20 dark:hover:bg-blue-500/30',
  },
  {
    label: 'Ново събитие',
    href: '/events?new=1',
    icon: CalendarPlus,
    color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
    hoverColor: 'hover:bg-purple-500/20 dark:hover:bg-purple-500/30',
  },
  {
    label: 'Съобщение',
    href: '/messaging',
    icon: Send,
    color: 'bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400',
    hoverColor: 'hover:bg-teal-500/20 dark:hover:bg-teal-500/30',
  },
  {
    label: 'Групи',
    href: '/groups',
    icon: Users,
    color: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
    hoverColor: 'hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30',
  },
  {
    label: 'Експорт',
    href: '/directory',
    icon: FileSpreadsheet,
    color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    hoverColor: 'hover:bg-emerald-500/20 dark:hover:bg-emerald-500/30',
  },
  {
    label: 'Напомняния',
    href: '/#reminders',
    icon: Bell,
    color: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    hoverColor: 'hover:bg-amber-500/20 dark:hover:bg-amber-500/30',
  },
]

export default function QuickActions() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 ${action.color} ${action.hoverColor} group`}
        >
          <action.icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center leading-tight">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  )
}
