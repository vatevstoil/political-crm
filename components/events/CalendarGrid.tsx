'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getEventsByMonth, type EventWithId } from '@/app/actions/events'
import DayEventsPanel from './DayEventsPanel'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
const MONTHS = [
  'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
  'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември',
]

interface CalendarGridProps {
  onEventChanged: () => void
}

export default function CalendarGrid({ onEventChanged }: CalendarGridProps) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [events, setEvents] = useState<EventWithId[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const loadEvents = useCallback(async () => {
    const data = await getEventsByMonth(year, month)
    setEvents(data)
  }, [year, month])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear(y => y - 1)
    } else {
      setMonth(m => m - 1)
    }
    setSelectedDay(null)
  }

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear(y => y + 1)
    } else {
      setMonth(m => m + 1)
    }
    setSelectedDay(null)
  }

  const goToday = () => {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
    setSelectedDay(today.getDate())
  }

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1)
  // Monday = 0, Sunday = 6
  let startDow = firstDayOfMonth.getDay() - 1
  if (startDow < 0) startDow = 6

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const cells: { day: number; isCurrentMonth: boolean }[] = []
  // Previous month fill
  for (let i = startDow - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, isCurrentMonth: false })
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true })
  }
  // Next month fill
  const remaining = 7 - (cells.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, isCurrentMonth: false })
    }
  }

  // Map events to days
  const eventsByDay = new Map<number, EventWithId[]>()
  for (const ev of events) {
    const d = new Date(ev.startTime).getDate()
    if (!eventsByDay.has(d)) eventsByDay.set(d, [])
    eventsByDay.get(d)!.push(ev)
  }

  const isToday = (day: number) =>
    year === today.getFullYear() && month === today.getMonth() && day === today.getDate()

  const selectedDayEvents = selectedDay ? (eventsByDay.get(selectedDay) || []) : []

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Calendar Grid */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={goToday}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              Днес
            </button>
          </div>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map(wd => (
            <div key={wd} className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-2">
              {wd}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            const dayEvents = cell.isCurrentMonth ? (eventsByDay.get(cell.day) || []) : []
            const isTodayCell = cell.isCurrentMonth && isToday(cell.day)
            const isSelected = cell.isCurrentMonth && selectedDay === cell.day

            return (
              <button
                key={i}
                onClick={() => {
                  if (cell.isCurrentMonth) {
                    setSelectedDay(selectedDay === cell.day ? null : cell.day)
                  }
                }}
                className={`
                  relative aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl transition-all text-sm
                  ${!cell.isCurrentMonth
                    ? 'text-slate-300 dark:text-slate-600 cursor-default'
                    : isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : isTodayCell
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold ring-2 ring-blue-300 dark:ring-blue-700'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }
                `}
              >
                <span className={`text-sm font-medium ${isSelected ? 'text-white' : ''}`}>
                  {cell.day}
                </span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                    {dayEvents.slice(0, 3).map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/80' : 'bg-blue-500 dark:bg-blue-400'}`}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className={`text-[9px] leading-none ${isSelected ? 'text-white/80' : 'text-blue-500 dark:text-blue-400'}`}>
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Day Events Panel */}
      {selectedDay !== null && (
        <DayEventsPanel
          day={selectedDay}
          month={month}
          year={year}
          events={selectedDayEvents}
          onClose={() => setSelectedDay(null)}
          onEventChanged={() => { loadEvents(); onEventChanged(); }}
        />
      )}
    </div>
  )
}
