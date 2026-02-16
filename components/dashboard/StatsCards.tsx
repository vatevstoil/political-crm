'use client'

import { Users, UserPlus, CheckCircle } from 'lucide-react'

interface StatsCardsProps {
  totalMembers: number
  newThisMonth: number
  activeMembers: number
}

export default function StatsCards({ totalMembers, newThisMonth, activeMembers }: StatsCardsProps) {
  const cards = [
    {
      title: 'Общо членове',
      value: totalMembers,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Нови този месец',
      value: newThisMonth,
      icon: UserPlus,
      color: 'bg-green-500',
    },
    {
      title: 'Активни членове',
      value: activeMembers,
      icon: CheckCircle,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-lg shadow p-5 flex items-center"
        >
          <div className={`${card.color} p-3 rounded-lg`}>
            <card.icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{card.title}</p>
            <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
