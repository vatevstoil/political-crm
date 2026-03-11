'use client'

import { useState } from 'react'
import { Bell, Plus } from 'lucide-react'
import { createReminder } from '@/app/actions/reminders'
import { toast } from 'sonner'

const reminderTypes = [
  { value: 'follow_up', label: 'Проследяване' },
  { value: 'call', label: 'Обаждане' },
  { value: 'meeting', label: 'Среща' },
  { value: 'email', label: 'Имейл' },
  { value: 'other', label: 'Друго' },
]

interface ReminderFormProps {
  personId: number
  onCreated: () => void
}

export default function ReminderForm({ personId, onCreated }: ReminderFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [type, setType] = useState('follow_up')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !dueDate) return
    setSaving(true)
    try {
      await createReminder(personId, title, dueDate, type)
      setTitle('')
      setDueDate('')
      setType('follow_up')
      setIsOpen(false)
      onCreated()
      toast.success('Напомнянето е създадено')
    } catch (error) {
      console.error('Failed to create reminder:', error)
      toast.error('Грешка при операцията')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
      >
        <Bell className="h-3.5 w-3.5" />
        Ново напомняне
      </button>
    )
  }

  return (
    <div className="glass-card p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <Bell className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Ново напомняне</h4>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Напомняне за..."
        className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder:text-slate-500 dark:placeholder:text-slate-400 text-sm"
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 text-sm"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 text-sm"
        >
          {reminderTypes.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setIsOpen(false)}
          className="flex-1 px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-xs"
        >
          Отказ
        </button>
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !dueDate || saving}
          className="flex-1 px-2.5 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium disabled:opacity-50 text-xs flex items-center justify-center gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          {saving ? 'Запазване...' : 'Добави'}
        </button>
      </div>
    </div>
  )
}
