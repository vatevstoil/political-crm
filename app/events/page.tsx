'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { getEvents, createEvent, updateEvent, deleteEvent, EventWithId } from '@/app/actions/events'
import { Calendar, Plus, X, Trash2, Edit, MapPin, Clock, CalendarDays } from 'lucide-react'

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithId[]>([])
  const [isPending, startTransition] = useTransition()
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventWithId | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')

  const loadEvents = useCallback(async () => {
    const data = await getEvents()
    setEvents(data)
  }, [])

  useEffect(() => {
    loadEvents()
  }, [])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setStartTime('')
    setEndTime('')
    setLocation('')
    setEditingEvent(null)
  }

  const openCreateModal = () => {
    resetForm()
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    setStartTime(now.toISOString().slice(0, 16))
    setShowModal(true)
  }

  const openEditModal = (event: EventWithId) => {
    setEditingEvent(event)
    setTitle(event.title)
    setDescription(event.description || '')
    const start = new Date(event.startTime)
    start.setMinutes(start.getMinutes() - start.getTimezoneOffset())
    setStartTime(start.toISOString().slice(0, 16))
    if (event.endTime) {
      const end = new Date(event.endTime)
      end.setMinutes(end.getMinutes() - end.getTimezoneOffset())
      setEndTime(end.toISOString().slice(0, 16))
    } else {
      setEndTime('')
    }
    setLocation(event.location || '')
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!title.trim() || !startTime) return

    startTransition(async () => {
      if (editingEvent) {
        await updateEvent(editingEvent.id, title, description || null, startTime, endTime || null, location || null)
      } else {
        await createEvent(title, description || null, startTime, endTime || null, location || null)
      }
      setShowModal(false)
      resetForm()
      loadEvents()
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете това събитие?')) return

    startTransition(async () => {
      await deleteEvent(id)
      loadEvents()
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('bg-BG', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('bg-BG', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    const eventDate = new Date(date)
    return eventDate.toDateString() === today.toDateString()
  }

  const isPast = (date: Date) => {
    return new Date(date) < new Date()
  }

  const groupedEvents = events.reduce((acc, event) => {
    const dateKey = formatDate(event.startTime)
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(event)
    return acc
  }, {} as Record<string, EventWithId[]>)

  return (
    <div className="min-h-screen bg-ocean-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold gradient-text">
                Календар
              </h1>
            </div>
            <p className="text-slate-500">
              Управление на събития и срещи
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:brightness-110"
          >
            <Plus className="mr-2 h-5 w-5" />
            Ново Събитие
          </button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDays className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">Няма планирани събития</h3>
            <p className="text-slate-500">Създайте първото събитие, за да започнете</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedEvents).map(([date, dateEvents]) => (
              <div key={date}>
                <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  {date}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dateEvents.map(event => (
                    <div
                      key={event.id}
                      className={`bg-white rounded-2xl shadow-md border overflow-hidden hover:shadow-lg transition-shadow ${
                        isPast(event.startTime) ? 'border-slate-200 opacity-75' : 'border-slate-200'
                      }`}
                    >
                      <div className={`h-2 ${isToday(event.startTime) ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-blue-500'}`} />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(event)}
                              className="text-slate-400 hover:text-blue-500 transition-colors p-1"
                              title="Редактирай"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(event.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-1"
                              title="Изтрий"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {event.description && (
                          <p className="text-sm text-slate-500 mb-4 line-clamp-2">{event.description}</p>
                        )}
                        
                        <div className="space-y-2 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>{formatTime(event.startTime)}</span>
                            {event.endTime && (
                              <span className="text-slate-400">- {formatTime(event.endTime)}</span>
                            )}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-purple-500" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingEvent ? 'Редактирай събитие' : 'Ново събитие'}
                </h2>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Заглавие *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-500"
                    placeholder="Въведете заглавие..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-slate-900 placeholder:text-slate-500"
                    placeholder="Описание на събитието (по избор)..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Начало *
                    </label>
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Край
                    </label>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Локация
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-500"
                    placeholder="Място на провеждане..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                  Отказ
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!title.trim() || !startTime || isPending}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Запазване...' : editingEvent ? 'Обнови' : 'Създай'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
