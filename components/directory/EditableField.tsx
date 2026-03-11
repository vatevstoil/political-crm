'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, X, Pencil } from 'lucide-react'
import { toast } from 'sonner'

interface EditableFieldProps {
  label: string
  value: string | null | undefined
  icon?: React.ComponentType<{ className?: string }>
  onSave: (value: string) => Promise<void>
  options?: { value: string; label: string }[]
  type?: 'text' | 'date'
  valueClassName?: string
  emptyLabel?: string  // custom placeholder when value is empty, default "Не е зададено"
}

export default function EditableField({ label, value, icon: Icon, onSave, options, type = 'text', valueClassName, emptyLabel }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false)
      return
    }
    setIsSaving(true)
    try {
      await onSave(editValue)
      setIsEditing(false)
      toast.success('Успешно запазено')
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error('Грешка при запазване')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value || '')
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
      <div className="flex items-start gap-2 mb-3 group">
        {Icon && <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          {label && <p className="text-sm font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>}

        {isEditing ? (
          <div className="mt-1 space-y-1.5">
            {options ? (
              <select
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ref={inputRef as any}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
                onKeyDown={handleKeyDown}
                title="Избери опция"
              >
                <option value="">— Изберете —</option>
                {options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                ref={inputRef}
                type={type}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
                onKeyDown={handleKeyDown}
                title={type === 'date' ? 'Избери дата' : 'Въведи текст'}
              />
            )}
            <div className="flex gap-1.5">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-1 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 text-xs font-medium flex items-center justify-center gap-1"
                title="Запази"
              >
                <Check className="h-3 w-3" />
                Запази
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-1 rounded bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500 text-xs font-medium flex items-center justify-center gap-1"
                title="Отказ"
              >
                <X className="h-3 w-3" />
                Отказ
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => { setEditValue(value || ''); setIsEditing(true) }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setEditValue(value || ''); setIsEditing(true) } }}
            role="button"
            tabIndex={0}
            aria-label={`Редактирай ${label}`}
            className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded px-1 -ml-1 py-0.5 transition-colors group/field"
          >
            {value ? (
              <p className={valueClassName || "text-base text-emerald-700 dark:text-emerald-400 font-semibold break-words leading-relaxed"}>
                {type === 'date'
                  ? new Date(value).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })
                  : options?.find(o => o.value === value)?.label ?? value}
              </p>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic">{emptyLabel ?? 'Не е зададено'}</p>
            )}
            <Pencil className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 opacity-0 group-hover/field:opacity-100 group-focus-visible/field:opacity-100 flex-shrink-0" />
          </div>
        )}
      </div>
    </div>
  )
}
