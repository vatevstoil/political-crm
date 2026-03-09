'use client'

import { Bell, CheckCircle, Circle, Trash2, Calendar, Phone, Mail, Users, RotateCcw } from 'lucide-react'
import { toggleReminder, deleteReminder } from '@/app/actions/reminders'
import type { Reminder } from '@prisma/client'

const typeIcons: Record<string, typeof Bell> = {
  follow_up: RotateCcw,
  call: Phone,
  meeting: Users,
  email: Mail,
  other: Bell,
}

const typeLabels: Record<string, string> = {
  follow_up: 'Проследяване',
  call: 'Обаждане',
  meeting: 'Среща',
  email: 'Имейл',
  other: 'Друго',
}

interface ReminderListProps {
  reminders: Reminder[]
  personId: number
  onChanged: () => void
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isOverdue(date: Date): boolean {
  return new Date(date) < new Date()
}

export default function ReminderList({ reminders, personId, onChanged }: ReminderListProps) {
  const handleToggle = async (id: number) => {
    await toggleReminder(id, personId)
    onChanged()
  }

  const handleDelete = async (id: number) => {
    await deleteReminder(id, personId)
    onChanged()
  }

  if (reminders.length === 0) return null

  const overdueCount = reminders.filter(r => !r.isCompleted && isOverdue(r.dueDate)).length

  return (
    <div className="space-y-3">
      {overdueCount > 0 && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <p className="text-base font-bold text-red-700 dark:text-red-400 flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            {overdueCount} просрочени напомняния
          </p>
        </div>
      )}

      <div className="space-y-2">
        {reminders.map(reminder => {
          const overdue = !reminder.isCompleted && isOverdue(reminder.dueDate)
          const Icon = typeIcons[reminder.type] || Bell
          return (
            <div
              key={reminder.id}
              className={`glass-card glass-card-hover p-4 ${
                reminder.isCompleted ? 'opacity-60' : overdue ? 'border-l-4 border-l-red-400' : 'border-l-4 border-l-amber-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <button
                  onClick={() => handleToggle(reminder.id)}
                  className="flex items-start gap-3 text-left flex-1"
                >
                  {reminder.isCompleted ? (
                    <CheckCircle className="h-6 w-6 text-teal-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className={`h-6 w-6 flex-shrink-0 mt-0.5 ${overdue ? 'text-red-500' : 'text-amber-500'}`} />
                  )}
                  <div className="flex-1">
                    <span className={`text-base font-bold block ${reminder.isCompleted ? 'line-through text-slate-500 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                      {reminder.title}
                    </span>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className={`flex items-center gap-1 ${overdue ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(reminder.dueDate)}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                        <Icon className="h-3.5 w-3.5" />
                        {typeLabels[reminder.type] || reminder.type}
                      </span>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleDelete(reminder.id)}
                  className="text-slate-400 hover:text-red-500 transition-all p-1"
                  title="Изтрий"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
