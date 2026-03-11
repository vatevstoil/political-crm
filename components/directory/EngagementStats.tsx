'use client'

import { useState, useEffect } from 'react'
import { getPersonEngagement, type PersonEngagement } from '@/app/actions/engagement'
import { Activity, Calendar, Users, MessageSquare, Clock, TrendingUp } from 'lucide-react'

interface EngagementStatsProps {
  personId: number
}

export default function EngagementStats({ personId }: EngagementStatsProps) {
  const [data, setData] = useState<PersonEngagement | null>(null)

  useEffect(() => {
    getPersonEngagement(personId).then(setData)
  }, [personId])

  if (!data) {
    return (
      <div className="glass-panel p-3 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28 mb-2" />
        <div className="space-y-1.5">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        </div>
      </div>
    )
  }

  const levelColors = {
    high: { bg: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', label: 'Висок', barBg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    medium: { bg: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400', label: 'Среден', barBg: 'bg-amber-100 dark:bg-amber-900/30' },
    low: { bg: 'bg-red-500', text: 'text-red-700 dark:text-red-400', label: 'Нисък', barBg: 'bg-red-100 dark:bg-red-900/30' },
    none: { bg: 'bg-slate-400', text: 'text-slate-600 dark:text-slate-400', label: 'Няма', barBg: 'bg-slate-100 dark:bg-slate-800' },
  }

  const level = levelColors[data.engagementLevel]

  const stats = [
    { icon: Activity, label: 'Активности', value: data.activitiesCount, color: 'text-blue-500' },
    { icon: MessageSquare, label: 'Бележки', value: data.notesCount, color: 'text-purple-500' },
    { icon: Calendar, label: 'Събития', value: data.eventsAttended, color: 'text-teal-500' },
    { icon: Users, label: 'Групи', value: data.groupsCount, color: 'text-indigo-500' },
  ]

  return (
    <div className="glass-panel p-3">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5 flex items-center gap-1.5">
        <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
        Ангажираност
      </h3>

      {/* Engagement Score Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Резултат</span>
          <span className={`text-sm font-bold ${level.text}`}>
            {data.engagementScore}/100 — {level.label}
          </span>
        </div>
        <div className={`w-full h-2.5 rounded-full ${level.barBg}`}>
          <div
            className={`h-full rounded-full ${level.bg} transition-all duration-500`}
            style={{ width: `${data.engagementScore}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/50"
          >
            <stat.icon className={`h-3.5 w-3.5 ${stat.color} flex-shrink-0`} />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight">{stat.label}</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Last Activity */}
      {data.lastActivityDate && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          <span>
            Последна активност: {data.daysSinceLastActivity === 0
              ? 'днес'
              : data.daysSinceLastActivity === 1
                ? 'вчера'
                : `преди ${data.daysSinceLastActivity} дни`}
          </span>
        </div>
      )}
    </div>
  )
}
