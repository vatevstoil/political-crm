'use client'

import Link from 'next/link'
import { Calendar, Clock, MapPin } from 'lucide-react'

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
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-500" />
          Предстоящи събития
        </h3>
        <p className="text-gray-500 text-sm">Няма предстоящи събития</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-500" />
          Предстоящи събития
        </h3>
        <Link href="/events" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Виж всички
        </Link>
      </div>
      <ul className="space-y-3">
        {events.map((event) => (
          <li key={event.id}>
            <div className="flex items-start hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex flex-col items-center justify-center">
                <span className="text-xs text-blue-600 font-medium">{formatDate(event.startTime)}</span>
                <span className="text-xs text-blue-500">{formatTime(event.startTime)}</span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {event.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {event.location && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3" />
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
