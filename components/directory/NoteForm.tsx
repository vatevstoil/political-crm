'use client'

import { useState, useRef } from 'react'
import { createNote } from '@/app/actions/notes'
import { Send, MessageSquare } from 'lucide-react'

export default function NoteForm({ personId, onSuccess }: { personId: number; onSuccess?: () => void }) {
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setMessage(null)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await createNote(personId, { message: null, errors: {} }, formData)
      if (result.message?.includes('успешно')) {
        setMessage(result.message)
        formRef.current?.reset()
        setTimeout(() => setMessage(null), 3000)
        onSuccess?.()
      } else {
        setError(result.message || 'Грешка при създаване на бележка')
      }
    } catch {
      setError('Възникна грешка')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-white" />
        </div>
        <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Нова бележка</h4>
      </div>

      <div className="relative">
        <textarea
          rows={3}
          name="content"
          className="glass-input w-full px-4 py-3 text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 resize-none font-medium"
          placeholder="Напиши бележка..."
          required
        />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex-1">
          {message && (
            <span className="text-base font-bold text-teal-700 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {message}
            </span>
          )}
          {error && (
            <span className="text-base font-bold text-red-600 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {error}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="glass-button-primary px-4 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Запазване...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span className="font-bold">Добави</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
