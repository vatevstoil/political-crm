'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Search, Check, Link2 } from 'lucide-react'
import { getAllPeople } from '@/app/actions/people'
import { addRelation } from '@/app/actions/relations'
import { toast } from 'sonner'

const relationTypes = [
  { value: 'family', label: 'Семейство' },
  { value: 'colleague', label: 'Колега' },
  { value: 'referral', label: 'Препоръка' },
  { value: 'mentor', label: 'Ментор' },
  { value: 'neighbor', label: 'Съсед' },
  { value: 'party', label: 'Партия' },
]

interface AddRelationModalProps {
  personId: number
  existingRelatedIds: number[]
  onClose: () => void
  onAdded: () => void
}

export default function AddRelationModal({ personId, existingRelatedIds, onClose, onAdded }: AddRelationModalProps) {
  const [people, setPeople] = useState<{ id: number; fullName: string }[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null)
  const [type, setType] = useState('family')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getAllPeople().then(p =>
      setPeople(p.map(person => ({ id: person.id, fullName: person.fullName })))
    )
  }, [])

  const excludeIds = new Set([personId, ...existingRelatedIds])
  const filtered = people.filter(
    p => !excludeIds.has(p.id) && p.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSave = async () => {
    if (!selectedPersonId) return
    setSaving(true)
    try {
      await addRelation(personId, selectedPersonId, type, description || null)
      toast.success('Връзката е добавена')
      onAdded()
      onClose()
    } catch {
      toast.error('Грешка при добавяне на връзка')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Добави връзка</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Person search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Търсене по име..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder:text-slate-500 dark:placeholder:text-slate-400"
          />
        </div>

        {/* Person list */}
        <div className="max-h-48 overflow-y-auto space-y-1 mb-4">
          {filtered.length === 0 ? (
            <div className="text-center text-sm text-slate-400 dark:text-slate-500 py-4">
              {searchQuery ? 'Няма намерени' : 'Всички са вече свързани'}
            </div>
          ) : (
            filtered.map(person => (
              <button
                key={person.id}
                onClick={() => setSelectedPersonId(person.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedPersonId === person.id
                    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedPersonId === person.id
                      ? 'bg-purple-600 border-purple-600'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {selectedPersonId === person.id && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="text-sm truncate">{person.fullName}</span>
              </button>
            ))
          )}
        </div>

        {/* Relation type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Тип връзка</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
          >
            {relationTypes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Описание (по избор)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="напр. съпруг, баща, колега от ОбС..."
            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder:text-slate-500 dark:placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
          >
            Отказ
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedPersonId || saving}
            className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium text-sm disabled:opacity-50"
          >
            {saving ? 'Добавяне...' : 'Добави'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
