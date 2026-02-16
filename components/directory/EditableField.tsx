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
}

export default function EditableField({ label, value, icon: Icon, onSave, options }: EditableFieldProps) {
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

  if (!value && !isEditing) return null

  return (
      <div className="flex items-start gap-2 mb-3 group">
        {Icon && <Icon className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</p>
        
        {isEditing ? (
          <div className="flex items-center gap-1 mt-1">
            {options ? (
              <select
                ref={inputRef as any}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 text-sm border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700"
                onKeyDown={handleKeyDown}
              >
                {options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 text-sm border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700"
                onKeyDown={handleKeyDown}
              />
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-1 rounded bg-slate-600 text-white hover:bg-slate-700 disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 rounded px-1 -ml-1 py-0.5 transition-colors group/field"
          >
            <p className="text-sm text-slate-600 break-words">{value}</p>
            <Pencil className="h-3 w-3 text-slate-500 opacity-0 group-hover/field:opacity-100 flex-shrink-0" />
          </div>
        )}
      </div>
    </div>
  )
}
