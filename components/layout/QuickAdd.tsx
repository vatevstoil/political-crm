'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, UserPlus, CalendarPlus, Bell } from 'lucide-react'

export default function QuickAdd() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  const actions = [
    {
      label: 'Нов човек',
      icon: UserPlus,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      onClick: () => { router.push('/directory/new'); setIsOpen(false) },
    },
    {
      label: 'Ново събитие',
      icon: CalendarPlus,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      onClick: () => { router.push('/events?new=1'); setIsOpen(false) },
    },
    {
      label: 'Напомняне',
      icon: Bell,
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
      onClick: () => { router.push('/directory?reminder=1'); setIsOpen(false) },
    },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded-lg transition-all ${
          isOpen
            ? 'bg-purple-100 text-purple-600 rotate-45 dark:bg-purple-500/20 dark:text-purple-200'
            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/5'
        }`}
        title="Бързо добавяне"
      >
        <Plus className="h-5 w-5 transition-transform duration-200" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 py-1">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className={`p-1.5 rounded-lg ${action.color}`}>
                <action.icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
