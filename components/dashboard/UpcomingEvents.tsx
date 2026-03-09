'use client'

import Link from 'next/link'
import { Calendar, MapPin } from 'lucide-react'

interface UpcomingEventsProps {
  events: {
    id: number
    title: string
    startTime: Date
    endTime: Date | null
    location: string | null
  }[]
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  const formatDate = (date: Date) => {
    const d = new Date(date)
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`
  }

  const formatTime = (date: Date) => {
    const d = new Date(date)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/50 p-6 border border-transparent dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center leading-snug">
          <Calendar className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
          Предстоящи събития
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">Няма предстоящи събития</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/50 p-6 border border-transparent dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center leading-snug tracking-[-0.01em]">
          <Calendar className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
          Предстоящи събития
        </h3>
        <Link href="/events" className="text-base text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
          Виж всички
        </Link>
      </div>
      <ul className="space-y-3">
        {events.map((event) => (
          <li key={event.id}>
            <div className="flex items-start hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg p-2 -mx-2 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex flex-col items-center justify-center">
                <span className="text-sm text-blue-700 dark:text-blue-300 font-semibold">{formatDate(event.startTime)}</span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{formatTime(event.startTime)}</span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate leading-snug">
                  {event.title}
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {event.location && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
