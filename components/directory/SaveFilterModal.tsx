'use client'

import { useState } from 'react'
import { X, Bookmark } from 'lucide-react'
import { createSavedFilter, type FilterParams } from '@/app/actions/savedFilters'
import { toast } from 'sonner'

const PRESET_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#10B981', '#06B6D4', '#3B82F6',
]

interface SaveFilterModalProps {
  filters: FilterParams
  onClose: () => void
  onSaved: () => void
}

export default function SaveFilterModal({ filters, onClose, onSaved }: SaveFilterModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await createSavedFilter(name, color, filters)
      toast.success(`Филтър "${name}" е запазен!`)
      onSaved()
      onClose()
    } catch {
      toast.error('Грешка при запазване на филтъра')
    } finally {
      setSaving(false)
    }
  }

  const activeFilterDescriptions: string[] = []
  if (filters.query) activeFilterDescriptions.push(`Търсене: "${filters.query}"`)
  if (filters.city) activeFilterDescriptions.push(`Град: ${filters.city}`)
  if (filters.role) activeFilterDescriptions.push(`Роля: ${filters.role}`)
  if (filters.status) activeFilterDescriptions.push(`Статус: ${filters.status}`)
  if (filters.profession) activeFilterDescriptions.push(`Професия: ${filters.profession}`)
  if (filters.gender) activeFilterDescriptions.push(`Пол: ${filters.gender}`)
  if (filters.groupId) activeFilterDescriptions.push(`Група: #${filters.groupId}`)
  if (filters.tagId) activeFilterDescriptions.push(`Таг: #${filters.tagId}`)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Запази филтър</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Име *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder:text-slate-500"
              placeholder="напр. Доброволци София"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Цвят</label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Активни филтри</label>
            <div className="bg-slate-50 rounded-xl p-3 space-y-1">
              {activeFilterDescriptions.length > 0 ? (
                activeFilterDescriptions.map((desc, i) => (
                  <div key={i} className="text-sm text-slate-600">{desc}</div>
                ))
              ) : (
                <div className="text-sm text-slate-400">Няма активни филтри</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            Отказ
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Запазване...' : 'Запази'}
          </button>
        </div>
      </div>
    </div>
  )
}
