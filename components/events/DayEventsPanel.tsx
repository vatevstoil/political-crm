'use client'

import { X, Clock, MapPin, CalendarDays } from 'lucide-react'
import type { EventWithId } from '@/app/actions/events'
import AttendancePanel from './AttendancePanel'

const MONTHS_SHORT = [
  'яну', 'фев', 'мар', 'апр', 'май', 'юни',
  'юли', 'авг', 'сеп', 'окт', 'ное', 'дек',
]

const WEEKDAYS_FULL = [
  'Неделя', 'Понеделник', 'Вторник', 'Сряда',
  'Четвъртък', 'Петък', 'Събота',
]

interface DayEventsPanelProps {
  day: number
  month: number
  year: number
  events: EventWithId[]
  onClose: () => void
  onEventChanged: () => void
}

export default function DayEventsPanel({
  day,
  month,
  year,
  events,
  onClose,
}: DayEventsPanelProps) {
  const date = new Date(year, month, day)
  const dayOfWeek = WEEKDAYS_FULL[date.getDay()]

  const formatTime = (d: Date) =>
    new Date(d).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })

  const isNow = (start: Date, end: Date | null) => {
    const now = new Date()
    const s = new Date(start)
    if (!end) return s.toDateString() === now.toDateString() && s <= now
    return s <= now && now <= new Date(end)
  }

  return (
    <div className="w-full lg:w-80 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-white/80">{dayOfWeek}</span>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="text-2xl font-bold">
          {day} {MONTHS_SHORT[month]} {year}
        </div>
        <div className="text-sm text-white/70 mt-1">
          {events.length === 0 ? 'Няма събития' : `${events.length} събити${events.length === 1 ? 'е' : 'я'}`}
        </div>
      </div>

      {/* Events list */}
      <div className="p-3 max-h-[500px] overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center py-8">
            <CalendarDays className="h-10 w-10 text-slate-200 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400 dark:text-slate-500">Свободен ден</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(event => {
              const happening = isNow(event.startTime, event.endTime)
              return (
                <div
                  key={event.id}
                  className={`rounded-xl border p-3 ${
                    happening
                      ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  } transition-colors`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${happening ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-600'}`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(event.startTime)}</span>
                        {event.endTime && (
                          <span>— {formatTime(event.endTime)}</span>
                        )}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      {event.description && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <AttendancePanel eventId={event.id} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
