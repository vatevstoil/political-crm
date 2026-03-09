import { Activity, Phone, Mail, Users, FileText, Calendar, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface RecentActivity {
  id: number
  type: string
  content: string
  createdAt: Date
  person: { id: number; fullName: string }
}

interface RecentActivityFeedProps {
  activities: RecentActivity[]
}

const typeIcons: Record<string, { icon: typeof Activity; color: string; bg: string }> = {
  'Обаждане': { icon: Phone, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  'Имейл': { icon: Mail, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-900/30' },
  'Среща': { icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  'Събитие': { icon: Calendar, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  'Бележка': { icon: FileText, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-700' },
  'SMS': { icon: MessageSquare, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Току-що'
  if (minutes < 60) return `Преди ${minutes} мин`
  if (hours < 24) return `Преди ${hours} ч`
  if (days < 7) return `Преди ${days} дни`
  return new Date(date).toLocaleDateString('bg-BG')
}

export default function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/50 p-6 border border-transparent dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Последни активности
        </h3>
        <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
          Няма записани активности
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/50 p-6 border border-transparent dark:border-slate-700">
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        Последни активности
      </h3>
      <div className="space-y-3">
        {activities.map((activity) => {
          const typeConfig = typeIcons[activity.type] || { icon: Activity, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-700' }
          const Icon = typeConfig.icon

          return (
            <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
              <div className={`w-8 h-8 rounded-lg ${typeConfig.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-4 w-4 ${typeConfig.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/directory/${activity.person.id}`}
                    className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate"
                  >
                    {activity.person.fullName}
                  </Link>
                  <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {formatRelativeTime(activity.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {activity.type}{activity.content ? ` — ${activity.content}` : ''}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
