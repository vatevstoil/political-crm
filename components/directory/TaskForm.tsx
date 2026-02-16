'use client'

import { useState, useRef, useEffect } from 'react'
import { createTask, getAllPeople } from '@/app/actions/tasks'
import { Plus, Calendar, Users, CheckSquare } from 'lucide-react'

interface Person {
  id: number
  fullName: string
  role: string | null
  city: string | null
}

interface TaskFormProps {
  personId: number
}

export default function TaskForm({ personId }: TaskFormProps) {
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAssignees, setShowAssignees] = useState(false)
  const [people, setPeople] = useState<Person[]>([])
  const [selectedAssignees, setSelectedAssignees] = useState<number[]>([personId])
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    getAllPeople().then(setPeople).catch(console.error)
  }, [])

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    setMessage(null)
    setError(null)

    selectedAssignees.forEach(id => {
      formData.append('assigneeIds', id.toString())
    })

    try {
      const result = await createTask(personId, { message: null, errors: {} }, formData)
      if (result.message?.includes('успешно')) {
        setMessage(result.message)
        formRef.current?.reset()
        setSelectedAssignees([personId])
        setShowAssignees(false)
        setTimeout(() => setMessage(null), 3000)
      } else {
        setError(result.message || 'Грешка')
      }
    } catch (e) {
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
    <form ref={formRef} action={handleSubmit} className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
          <CheckSquare className="h-4 w-4 text-white" />
        </div>
        <h4 className="font-semibold text-slate-800">Нова задача</h4>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          name="title"
          placeholder="Заглавие на задачата..."
          className="glass-input w-full px-4 py-2.5 text-slate-700 placeholder:text-slate-400"
          required
        />

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="date"
              name="dueDate"
              className="glass-input w-full pl-10 pr-4 py-2.5 text-slate-600"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAssignees(!showAssignees)}
            className={`glass-button px-3 py-2 flex items-center gap-2 ${
              showAssignees ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <Users className="h-4 w-4 text-slate-600" />
            <span className="text-sm text-slate-600">{selectedAssignees.length}</span>
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="glass-button-primary px-4 py-2 flex items-center gap-2 disabled:opacity-50"
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
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide font-medium">Избери отговорници</p>
          <div className="space-y-1">
            {people.map(person => (
              <label
                key={person.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedAssignees.includes(person.id)}
                  onChange={() => toggleAssignee(person.id)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="text-sm text-slate-700">{person.fullName}</span>
                  {person.role && (
                    <span className="text-xs text-slate-400 ml-2">({person.role})</span>
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
