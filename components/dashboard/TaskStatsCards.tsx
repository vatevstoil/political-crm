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
            className="bg-white rounded-lg shadow p-4 flex items-center"
          >
            <div className={`${card.color} p-2 rounded-lg`}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">{card.title}</p>
              <p className="text-xl font-semibold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-gray-800">По приоритет</span>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 bg-green-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{byPriority.low}</p>
            <p className="text-xs text-green-700">Ниска</p>
          </div>
          <div className="flex-1 bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{byPriority.medium}</p>
            <p className="text-xs text-amber-700">Средна</p>
          </div>
          <div className="flex-1 bg-red-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{byPriority.high}</p>
            <p className="text-xs text-red-700">Висока</p>
          </div>
        </div>
      </div>
    </div>
  )
}
