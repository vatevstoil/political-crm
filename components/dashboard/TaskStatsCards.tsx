'use client'

import { CheckSquare, Clock, AlertTriangle, TrendingUp } from 'lucide-react'

interface TaskStatsCardsProps {
  total: number
  completed: number
  pending: number
  overdue: number
  byPriority: {
    low: number
    medium: number
    high: number
  }
}

export default function TaskStatsCards({ total, completed, pending, overdue, byPriority }: TaskStatsCardsProps) {
  const cards = [
    {
      title: 'Общо задачи',
      value: total,
      icon: CheckSquare,
      color: 'bg-blue-500',
    },
    {
      title: 'Завършени',
      value: completed,
      icon: CheckSquare,
      color: 'bg-teal-500',
    },
    {
      title: 'Предстоящи',
      value: pending,
      icon: Clock,
      color: 'bg-amber-500',
    },
    {
      title: 'Просрочени',
      value: overdue,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/50 p-4 flex items-center border border-transparent dark:border-slate-700"
          >
            <div className={`${card.color} p-2 rounded-lg`}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">{card.title}</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 leading-tight tracking-[-0.01em]">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/50 p-4 border border-transparent dark:border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-base">По приоритет</span>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
            <p className="text-[28px] font-bold text-green-700 dark:text-green-400 leading-tight tracking-[-0.01em]">{byPriority.low}</p>
            <p className="text-sm font-semibold text-green-800 dark:text-green-300 leading-relaxed">Ниска</p>
          </div>
          <div className="flex-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
            <p className="text-[28px] font-bold text-amber-700 dark:text-amber-400 leading-tight tracking-[-0.01em]">{byPriority.medium}</p>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 leading-relaxed">Средна</p>
          </div>
          <div className="flex-1 bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
            <p className="text-[28px] font-bold text-red-700 dark:text-red-400 leading-tight tracking-[-0.01em]">{byPriority.high}</p>
            <p className="text-sm font-semibold text-red-800 dark:text-red-300 leading-relaxed">Висока</p>
          </div>
        </div>
      </div>
    </div>
  )
}
