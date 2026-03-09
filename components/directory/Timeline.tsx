'use client'

import { useState } from 'react'
import { Note, ActivityLog } from '@prisma/client'
import { MessageSquare, Trash2, ClipboardList, StickyNote, Phone, Mail, Users, CheckCircle, Circle, Calendar, TrendingUp, Pencil, X, Check } from 'lucide-react'
import { deleteNote, updateNote } from '@/app/actions/notes'
import { deleteActivity, updateActivity } from '@/app/actions/activities'
import { toggleTask, deleteTask, TaskWithAssignees } from '@/app/actions/tasks'
import { format } from 'date-fns'
import { bg } from 'date-fns/locale'
import { toast } from 'sonner'

interface TimelineProps {
  notes: Note[]
  activities?: ActivityLog[]
  tasks: TaskWithAssignees[]
  personId: number
  onRefresh?: () => void
}

type TimelineItem =
  | { kind: 'task'; date: Date; data: TaskWithAssignees }
  | { kind: 'activity'; date: Date; data: ActivityLog }
  | { kind: 'note'; date: Date; data: Note }

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  medium: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  low: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
}

const priorityLabels: Record<string, string> = {
  high: 'Висока',
  medium: 'Средна',
  low: 'Ниска',
}

function isOverdue(date: Date | null): boolean {
  if (!date) return false
  return new Date(date) < new Date()
}

function formatDate(date: Date | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function Timeline({ notes, tasks, activities = [], personId, onRefresh }: TimelineProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const startEditing = (kind: string, id: number, content: string) => {
    setEditingId(`${kind}-${id}`)
    setEditContent(content)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditContent('')
  }

  const handleSaveNote = async (noteId: number) => {
    if (!editContent.trim()) return
    setIsSaving(true)
    try {
      const result = await updateNote(noteId, personId, editContent.trim())
      if (result.success) {
        toast.success('Бележката е обновена')
        setEditingId(null)
        onRefresh?.()
      } else {
        toast.error(result.error || 'Грешка при обновяване')
      }
    } catch {
      toast.error('Грешка при обновяване на бележката')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveActivity = async (activityId: number) => {
    if (!editContent.trim()) return
    setIsSaving(true)
    try {
      const result = await updateActivity(activityId, personId, editContent.trim())
      if (result.success) {
        toast.success('Записът е обновен')
        setEditingId(null)
        onRefresh?.()
      } else {
        toast.error(result.error || 'Грешка при обновяване')
      }
    } catch {
      toast.error('Грешка при обновяване на записа')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteNote = async (noteId: number) => {
    try {
      await deleteNote(noteId, personId)
      onRefresh?.()
    } catch {
      toast.error('Грешка при изтриване на бележката')
    }
  }

  const handleDeleteActivity = async (activityId: number) => {
    if (!window.confirm('Сигурни ли сте, че искате да изтриете тази активност?')) return
    try {
      await deleteActivity(activityId, personId)
      onRefresh?.()
    } catch {
      toast.error('Грешка при изтриване на активността')
    }
  }

  const handleToggleTask = async (taskId: number) => {
    try {
      await toggleTask(taskId, personId)
      onRefresh?.()
    } catch {
      toast.error('Грешка при промяна на задачата')
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm('Сигурни ли сте, че искате да изтриете тази задача?')) return
    try {
      await deleteTask(taskId, personId)
      onRefresh?.()
    } catch {
      toast.error('Грешка при изтриване на задачата')
    }
  }

  // Build unified timeline sorted by date (newest first)
  const items: TimelineItem[] = [
    ...tasks.map(t => ({ kind: 'task' as const, date: new Date(t.createdAt), data: t })),
    ...activities.map(a => ({ kind: 'activity' as const, date: new Date(a.date), data: a })),
    ...notes.map(n => ({ kind: 'note' as const, date: new Date(n.createdAt), data: n })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  // Task stats summary
  const completedTasks = tasks.filter(t => t.isCompleted).length
  const overdueTasks = tasks.filter(t => !t.isCompleted && isOverdue(t.dueDate)).length
  const pendingTasks = tasks.length - completedTasks
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4 text-blue-500" />
      case 'email': return <Mail className="h-4 w-4 text-purple-500" />
      case 'meeting': return <Users className="h-4 w-4 text-green-500" />
      default: return <StickyNote className="h-4 w-4 text-orange-500" />
    }
  }

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'call': return 'Обаждане'
      case 'email': return 'Имейл'
      case 'meeting': return 'Среща'
      default: return 'Бележка'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call': return 'border-l-blue-400'
      case 'email': return 'border-l-purple-400'
      case 'meeting': return 'border-l-green-400'
      default: return 'border-l-orange-400'
    }
  }

  if (items.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
          <MessageSquare className="h-8 w-8 text-blue-400" />
        </div>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">Няма записи</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Добавете бележка, обаждане или задача по-горе</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Task Stats Summary (only if there are tasks) */}
      {tasks.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">Задачи</span>
            </div>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 mb-3">
            <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex gap-3 text-sm">
            <span className="text-slate-600 dark:text-slate-400">{tasks.length} общо</span>
            <span className="text-teal-600 dark:text-teal-400">{completedTasks} завършени</span>
            <span className="text-amber-600 dark:text-amber-400">{pendingTasks} предстоящи</span>
            {overdueTasks > 0 && (
              <span className="text-red-600 dark:text-red-400 font-bold">{overdueTasks} просрочени</span>
            )}
          </div>
        </div>
      )}

      {/* Unified Timeline */}
      <div className="space-y-2">
        {items.map((item) => {
          if (item.kind === 'task') {
            const task = item.data
            const overdue = isOverdue(task.dueDate) && !task.isCompleted
            return (
              <div key={`task-${task.id}`} className={`group glass-card p-4 border-l-4 ${task.isCompleted ? 'border-l-teal-400 opacity-70' : overdue ? 'border-l-red-400' : 'border-l-blue-400'}`}>
                <div className="flex items-start justify-between">
                  <button onClick={() => handleToggleTask(task.id)} className="flex items-start gap-3 text-left flex-1">
                    {task.isCompleted ? (
                      <CheckCircle className="h-6 w-6 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className={`h-6 w-6 flex-shrink-0 mt-0.5 ${overdue ? 'text-red-500' : 'text-amber-500'}`} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-bold text-slate-900 dark:text-slate-100 ${task.isCompleted ? 'line-through text-slate-500 dark:text-slate-500' : ''}`}>
                          {task.title}
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          <ClipboardList className="h-3 w-3 inline mr-1" />Задача
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${priorityColors[task.priority] || priorityColors.medium}`}>
                          {priorityLabels[task.priority] || 'Средна'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {task.dueDate && (
                          <span className={`text-xs flex items-center gap-1 ${overdue ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                        {task.assignees.length > 0 && (
                          <div className="flex gap-1">
                            {task.assignees.map(a => (
                              <span key={a.person.id} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                                {a.person.fullName}
                              </span>
                            ))}
                          </div>
                        )}
                        <time className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
                          {format(item.date, 'd MMM yyyy, HH:mm', { locale: bg })}
                        </time>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-sm:opacity-60 text-slate-400 hover:text-red-500 transition-all p-1 ml-2"
                    title="Изтрий"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          }

          if (item.kind === 'activity') {
            const activity = item.data
            const isEditing = editingId === `activity-${activity.id}`
            return (
              <div key={`act-${activity.id}`} className={`group glass-card p-4 border-l-4 ${getActivityColor(activity.type)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{getActivityLabel(activity.type)}</span>
                        <time className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
                          {format(new Date(activity.date), 'd MMM yyyy, HH:mm', { locale: bg })}
                        </time>
                      </div>
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 resize-none"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveActivity(activity.id)}
                              disabled={isSaving || !editContent.trim()}
                              className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Check className="h-3 w-3" />
                              Запази
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                            >
                              <X className="h-3 w-3" />
                              Отказ
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{activity.content}</p>
                      )}
                    </div>
                  </div>
                  {!isEditing && (
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => startEditing('activity', activity.id, activity.content)}
                        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-sm:opacity-60 text-slate-400 hover:text-blue-500 transition-all p-1"
                        title="Редактирай"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-sm:opacity-60 text-slate-400 hover:text-red-500 transition-all p-1"
                        title="Изтрий"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          }

          // Note
          const note = item.data as Note
          const isEditing = editingId === `note-${note.id}`
          return (
            <div key={`note-${note.id}`} className="group glass-card p-4 border-l-4 border-l-indigo-400">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <MessageSquare className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Бележка</span>
                      <time className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
                        {format(new Date(note.createdAt), 'd MMM yyyy, HH:mm', { locale: bg })}
                      </time>
                    </div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 resize-none"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveNote(note.id)}
                            disabled={isSaving || !editContent.trim()}
                            className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Check className="h-3 w-3" />
                            Запази
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                          >
                            <X className="h-3 w-3" />
                            Отказ
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{note.content}</p>
                    )}
                  </div>
                </div>
                {!isEditing && (
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => startEditing('note', note.id, note.content)}
                      className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-sm:opacity-60 text-slate-400 hover:text-blue-500 transition-all p-1"
                      title="Редактирай"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-sm:opacity-60 text-slate-400 hover:text-red-500 transition-all p-1"
                      title="Изтрий"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
