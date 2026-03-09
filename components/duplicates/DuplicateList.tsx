'use client'

import { useState } from 'react'
import { DuplicatePair, mergePeople } from '@/app/actions/duplicates'
import { Mail, Phone, MapPin, Calendar, AlertTriangle, Merge, Check } from 'lucide-react'
import { toast } from 'sonner'

interface DuplicateListProps {
  initialDuplicates: DuplicatePair[]
}

const matchLabels: Record<string, { label: string; color: string }> = {
  email: { label: 'Имейл', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  phone: { label: 'Телефон', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  name: { label: 'Име', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
}

export default function DuplicateList({ initialDuplicates }: DuplicateListProps) {
  const [duplicates, setDuplicates] = useState(initialDuplicates)
  const [merging, setMerging] = useState<string | null>(null)

  const handleMerge = async (keepId: number, removeId: number, pairIndex: number) => {
    const keepPerson = duplicates[pairIndex].person1.id === keepId
      ? duplicates[pairIndex].person1
      : duplicates[pairIndex].person2

    if (!confirm(`Ще запазите "${keepPerson.fullName}" и ще обедините данните от другия запис. Продължавате ли?`)) return

    const key = `${keepId}-${removeId}`
    setMerging(key)
    try {
      await mergePeople(keepId, removeId)
      setDuplicates(prev => prev.filter((_, i) => i !== pairIndex))
      toast.success('Записите са обединени успешно')
    } catch {
      toast.error('Грешка при обединяване')
    } finally {
      setMerging(null)
    }
  }

  if (duplicates.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Няма намерени дубликати</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Базата данни е чиста!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Намерени {duplicates.length} потенциални дубликата
        </span>
      </div>

      {duplicates.map((pair, index) => {
        const match = matchLabels[pair.matchType]
        return (
          <div key={`${pair.person1.id}-${pair.person2.id}`} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${match.color}`}>
                  {match.label}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {Math.round(pair.similarity * 100)}% съвпадение
                </span>
              </div>
              <Merge className="h-4 w-4 text-slate-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-700">
              {[pair.person1, pair.person2].map((person) => {
                const isKeep = merging === `${person.id}-${person.id === pair.person1.id ? pair.person2.id : pair.person1.id}`
                const otherId = person.id === pair.person1.id ? pair.person2.id : pair.person1.id

                return (
                  <div key={person.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">{person.fullName}</h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400">ID: {person.id}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        person.status === 'Active' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      }`}>
                        {person.role || 'Без роля'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {person.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <span className="truncate">{person.email}</span>
                        </div>
                      )}
                      {person.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{person.phone}</span>
                        </div>
                      )}
                      {person.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{person.city}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs">Създаден: {new Date(person.createdAt).toLocaleDateString('bg-BG')}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleMerge(person.id, otherId, index)}
                      disabled={merging !== null}
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                        isKeep
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                      } disabled:opacity-50`}
                    >
                      {merging !== null && isKeep ? 'Обединяване...' : 'Запази този'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
