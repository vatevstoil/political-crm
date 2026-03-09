'use client'

import { useState, useRef, useEffect } from 'react'
import { createTask } from '@/app/actions/tasks'
import { getAllPeople } from '@/app/actions/people'
import { Plus, Calendar, Users, CheckSquare, Flag } from 'lucide-react'
import { toast } from 'sonner'

interface Person {
  id: number
  fullName: string
  role: string | null
  city: string | null
}

interface TaskFormProps {
  personId: number
  onSuccess?: () => void
}

const priorityOptions = [
  { value: 'low', label: 'Ниска', color: 'text-green-600' },
  { value: 'medium', label: 'Средна', color: 'text-amber-500' },
  { value: 'high', label: 'Висока', color: 'text-red-500' },
]

export default function TaskForm({ personId, onSuccess }: TaskFormProps) {
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAssignees, setShowAssignees] = useState(false)
  const [people, setPeople] = useState<Person[]>([])
  const [selectedAssignees, setSelectedAssignees] = useState<number[]>([personId])
  const [selectedPriority, setSelectedPriority] = useState<string>('medium')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    getAllPeople().then(setPeople).catch((err) => { console.error(err); toast.error('Грешка при зареждане') })
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setMessage(null)
    setError(null)

    const formData = new FormData(e.currentTarget)

    selectedAssignees.forEach(id => {
      formData.append('assigneeIds', id.toString())
    })

    formData.append('priority', selectedPriority)

    try {
      const result = await createTask(personId, { message: null, errors: {} }, formData)
      if (result.message?.includes('успешно')) {
        setMessage(result.message)
        formRef.current?.reset()
        setSelectedAssignees([personId])
        setSelectedPriority('medium')
        setShowAssignees(false)
        setTimeout(() => setMessage(null), 3000)
        onSuccess?.()
      } else {
        setError(result.message || 'Грешка')
      }
    } catch {
      setError('Възникна грешка')
    } finally {
      setIsPending(false)
    }
  }

  const toggleAssignee = (id: number) => {
    setSelectedAssignees(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
          <CheckSquare className="h-4 w-4 text-white" />
        </div>
        <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Нова задача</h4>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          name="title"
          placeholder="Заглавие на задачата..."
          className="glass-input w-full px-4 py-2.5 text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium"
          required
        />

        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-700 dark:text-slate-400" />
            <input
              type="date"
              name="dueDate"
              className="glass-input w-full pl-10 pr-4 py-2.5 text-base text-slate-700 dark:text-slate-200 font-medium"
            />
          </div>

          <div className="relative">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="glass-button w-full px-3 py-2 flex items-center gap-2 appearance-none cursor-pointer pr-8 text-base font-bold text-slate-800 dark:text-slate-200"
            >
              {priorityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <Flag className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none ${
              selectedPriority === 'high' ? 'text-red-500' :
              selectedPriority === 'medium' ? 'text-amber-500' : 'text-green-500'
            }`} />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowAssignees(!showAssignees)}
            className={`glass-button px-3 py-2 flex-1 flex items-center justify-center gap-2 ${
              showAssignees ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700' : ''
            }`}
          >
            <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span className="text-base font-bold text-slate-700 dark:text-slate-200">
              {selectedAssignees.length > 0 ? `${selectedAssignees.length} Отг.` : 'Отговорници'}
            </span>
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="glass-button-primary px-4 py-2 flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span>Добави</span>
          </button>
        </div>
      </div>

      {showAssignees && (
        <div className="mt-3 glass-card p-3 max-h-48 overflow-y-auto">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wide">Избери отговорници</p>
          <div className="space-y-2">
            {people.map(person => (
              <label
                key={person.id}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedAssignees.includes(person.id)}
                  onChange={() => toggleAssignee(person.id)}
                  className="w-5 h-5 rounded border-slate-400 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="text-base font-bold text-slate-800 dark:text-slate-200">{person.fullName}</span>
                  {person.role && (
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium ml-2">({person.role})</span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3">
        {message && (
          <span className="text-sm text-teal-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {message}
          </span>
        )}
        {error && (
          <span className="text-sm text-red-500 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {error}
          </span>
        )}
      </div>
    </form>
  )
}
