'use client'

import { useState, useTransition } from 'react'
import { addActivity } from '@/app/actions/activities'
import { createTask } from '@/app/actions/tasks'
import { Phone, Mail, Users, StickyNote, Plus, CheckSquare } from 'lucide-react'
import { toast } from 'sonner'

interface ActivityFormProps {
  personId: number
  onActivityAdded?: (optimistic?: { type: string; content: string }) => void
}

const ACTIVITY_TYPES = [
  { value: 'note', label: 'Бележка', icon: <StickyNote className="w-4 h-4" /> },
  { value: 'call', label: 'Обаждане', icon: <Phone className="w-4 h-4" /> },
  { value: 'email', label: 'Имейл', icon: <Mail className="w-4 h-4" /> },
  { value: 'meeting', label: 'Среща', icon: <Users className="w-4 h-4" /> },
  { value: 'task', label: 'Задача', icon: <CheckSquare className="w-4 h-4" /> },
]

export default function ActivityForm({ personId, onActivityAdded }: ActivityFormProps) {
  const [content, setContent] = useState('')
  const [type, setType] = useState('note')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    startTransition(async () => {
      try {
        if (type === 'task') {
          const formData = new FormData()
          formData.append('title', content)
          const res = await createTask(personId, {}, formData)
          
          if (res.message && !res.message.includes('успешно')) {
            toast.error(res.message)
            return
          }
          
          setContent('')
          setType('note')
          toast.success('Задачата е запазена')
          if (onActivityAdded) {
            onActivityAdded()
          }
        } else {
          const res = await addActivity(personId, type, content)
          if (res && res.success === false) {
             toast.error('Грешка: ' + res.error)
             return
          }
          const savedType = type
          const savedContent = content
          setContent('')
          setType('note')
          toast.success('Активността е запазена')
          if (onActivityAdded) {
            onActivityAdded({ type: savedType, content: savedContent })
          }
        }
      } catch (error) {
        console.error('Failed to add activity/task:', error)
        toast.error('Грешка при комуникация със сървъра')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
      <div className="flex flex-wrap gap-2 mb-3">
        {ACTIVITY_TYPES.map(t => (
          <button
            key={t.value}
            type="button"
            aria-pressed={type === t.value}
            onClick={() => setType(t.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              type === t.value
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700'
                : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Въведете детайли за ${ACTIVITY_TYPES.find(t => t.value === type)?.label.toLowerCase()}...`}
          className="w-full min-h-[100px] p-3 pr-12 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all resize-none text-slate-700 dark:text-slate-200 dark:placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!content.trim() || isPending}
          className="absolute right-3 bottom-3 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          title="Запази"
        >
          {isPending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </button>
      </div>
    </form>
  )
}
