'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  UserPlus,
  X,
  Search,
  Check,
  Clock,
  UserCheck,
  UserX,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react'
import {
  getEventAttendees,
  getAttendanceStats,
  invitePeopleToEvent,
  updateAttendanceStatus,
  removeAttendee,
  type EventAttendee,
  type AttendanceStats,
  type AttendanceStatus,
} from '@/app/actions/attendance'
import { getAllPeople } from '@/app/actions/people'

interface AttendancePanelProps {
  eventId: number
}

const statusConfig: Record<
  string,
  { label: string; icon: typeof Check; color: string; bg: string }
> = {
  invited: { label: 'Поканен', icon: Clock, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  confirmed: { label: 'Потвърден', icon: Check, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
  attended: { label: 'Присъствал', icon: UserCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  absent: { label: 'Отсъствал', icon: UserX, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
}

export default function AttendancePanel({ eventId }: AttendancePanelProps) {
  const [attendees, setAttendees] = useState<EventAttendee[]>([])
  const [stats, setStats] = useState<AttendanceStats>({ invited: 0, confirmed: 0, attended: 0, absent: 0, total: 0 })
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [allPeople, setAllPeople] = useState<{ id: number; fullName: string }[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async () => {
    const [a, s] = await Promise.all([
      getEventAttendees(eventId),
      getAttendanceStats(eventId),
    ])
    setAttendees(a)
    setStats(s)
  }, [eventId])

  useEffect(() => {
    if (isExpanded) {
      loadData()
    }
  }, [isExpanded, loadData])

  const openPicker = async () => {
    const people = await getAllPeople()
    setAllPeople(people.map((p) => ({ id: p.id, fullName: p.fullName })))
    setSelectedIds(new Set())
    setSearchQuery('')
    setShowPicker(true)
  }

  const handleInvite = async () => {
    if (selectedIds.size === 0) return
    setLoading(true)
    await invitePeopleToEvent(eventId, Array.from(selectedIds))
    setShowPicker(false)
    await loadData()
    setLoading(false)
  }

  const handleStatusChange = async (personId: number, status: AttendanceStatus) => {
    await updateAttendanceStatus(eventId, personId, status)
    await loadData()
  }

  const handleRemove = async (personId: number) => {
    await removeAttendee(eventId, personId)
    await loadData()
  }

  const togglePerson = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const existingPersonIds = new Set(attendees.map((a) => a.personId))
  const filteredPeople = allPeople.filter(
    (p) =>
      !existingPersonIds.has(p.id) &&
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mt-3 border-t border-slate-100 dark:border-slate-700 pt-3">
      {/* Inline stats + toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-purple-500" />
          <span className="font-medium">Присъствие</span>
          {stats.total > 0 && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              ({stats.total} участника)
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {/* Stats bar */}
          {stats.total > 0 && (
            <div className="flex gap-2 flex-wrap">
              {(Object.entries(statusConfig) as [string, typeof statusConfig[string]][]).map(
                ([key, cfg]) => {
                  const count = stats[key as keyof Omit<AttendanceStats, 'total'>]
                  if (count === 0) return null
                  const Icon = cfg.icon
                  return (
                    <span
                      key={key}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${cfg.bg} ${cfg.color}`}
                    >
                      <Icon className="h-3 w-3" />
                      {count} {cfg.label.toLowerCase()}
                    </span>
                  )
                }
              )}
            </div>
          )}

          {/* Attendee list */}
          {attendees.length > 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {attendees.map((a) => {
                const cfg = statusConfig[a.status] || statusConfig.invited
                return (
                  <div
                    key={a.personId}
                    className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {a.person.fullName.charAt(0)}
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-200 truncate">
                        {a.person.fullName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <select
                        value={a.status}
                        onChange={(e) =>
                          handleStatusChange(a.personId, e.target.value as AttendanceStatus)
                        }
                        className={`text-xs px-1.5 py-0.5 rounded border-0 ${cfg.bg} ${cfg.color} cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-300`}
                      >
                        <option value="invited">Поканен</option>
                        <option value="confirmed">Потвърден</option>
                        <option value="attended">Присъствал</option>
                        <option value="absent">Отсъствал</option>
                      </select>
                      <button
                        onClick={() => handleRemove(a.personId)}
                        className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-0.5"
                        title="Премахни"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Add people button */}
          <button
            onClick={openPicker}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Добави участници
          </button>

          {/* Person picker modal */}
          {showPicker && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-transparent dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Добави участници</h3>
                  <button
                    onClick={() => setShowPicker(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Търсене по име..."
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                  />
                </div>

                {selectedIds.size > 0 && (
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">
                    Избрани: {selectedIds.size}
                  </div>
                )}

                <div className="max-h-64 overflow-y-auto space-y-1 mb-4">
                  {filteredPeople.length === 0 ? (
                    <div className="text-center text-sm text-slate-400 dark:text-slate-500 py-4">
                      {searchQuery ? 'Няма намерени хора' : 'Всички са вече добавени'}
                    </div>
                  ) : (
                    filteredPeople.map((person) => (
                      <button
                        key={person.id}
                        onClick={() => togglePerson(person.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                          selectedIds.has(person.id)
                            ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedIds.has(person.id)
                              ? 'bg-purple-600 border-purple-600'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {selectedIds.has(person.id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm truncate">{person.fullName}</span>
                      </button>
                    ))
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPicker(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
                  >
                    Отказ
                  </button>
                  <button
                    onClick={handleInvite}
                    disabled={selectedIds.size === 0 || loading}
                    className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    {loading ? 'Добавяне...' : `Добави (${selectedIds.size})`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
