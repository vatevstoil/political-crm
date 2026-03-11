'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Link2, UserPlus, Trash2, Users, Briefcase, Heart, GraduationCap, Home, Flag, Pencil, Check, X } from 'lucide-react'
import { getPersonRelations, removeRelation, updateRelation, type PersonRelationWithDetails } from '@/app/actions/relations'
import { toast } from 'sonner'
import AddRelationModal from './AddRelationModal'

const RELATION_TYPE_LABELS: Record<string, string> = {
  family: 'Семейство', colleague: 'Колега', referral: 'Препоръка',
  mentor: 'Ментор', neighbor: 'Съсед', party: 'Партия',
}

const RELATION_TYPES = ['family', 'colleague', 'referral', 'mentor', 'neighbor', 'party'] as const

function getRelationTypeLabel(type: string): string {
  return RELATION_TYPE_LABELS[type] || type
}

const typeIcons: Record<string, typeof Link2> = {
  family: Heart,
  colleague: Briefcase,
  referral: Users,
  mentor: GraduationCap,
  neighbor: Home,
  party: Flag,
}

const typeColors: Record<string, string> = {
  family: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  colleague: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  referral: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  mentor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  neighbor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  party: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

interface RelationsListProps {
  personId: number
}

export default function RelationsList({ personId }: RelationsListProps) {
  const [relations, setRelations] = useState<PersonRelationWithDetails[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editType, setEditType] = useState('')
  const [editDesc, setEditDesc] = useState('')

  const load = useCallback(async () => {
    const data = await getPersonRelations(personId)
    setRelations(data)
  }, [personId])

  useEffect(() => {
    load()
  }, [load])

  const handleRemove = async (id: number) => {
    if (!confirm('Премахни тази връзка?')) return
    await removeRelation(id, personId)
    load()
  }

  const startEdit = (r: PersonRelationWithDetails) => {
    setEditingId(r.id)
    setEditType(r.type)
    setEditDesc(r.description || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditType('')
    setEditDesc('')
  }

  const saveEdit = async (r: PersonRelationWithDetails) => {
    if (editType === r.type && editDesc === (r.description || '')) {
      cancelEdit()
      return
    }
    const result = await updateRelation(r.id, personId, editType, editDesc || null)
    if (result.success) {
      toast.success('Връзката е обновена')
      cancelEdit()
      load()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="glass-panel p-2.5 bg-white/60 dark:bg-slate-800/60">
      <div className="flex items-center gap-1 mb-1 pb-1 border-b border-slate-100 dark:border-slate-700">
        <Link2 className="h-3 w-3 text-purple-600 dark:text-purple-400" />
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">Връзки</h3>
        {relations.length > 0 && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500">({relations.length})</span>
        )}
      </div>

      {relations.length > 0 && (
        <div className="space-y-0.5 mb-1.5">
          {relations.map(r => {
            const Icon = typeIcons[r.type] || Link2
            const colorClass = typeColors[r.type] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
            const isEditing = editingId === r.id

            if (isEditing) {
              return (
                <div key={r.id} className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                      {r.related.fullName.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{r.related.fullName}</span>
                  </div>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full text-xs border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    {RELATION_TYPES.map(t => (
                      <option key={t} value={t}>{getRelationTypeLabel(t)}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Описание (напр. Дъщеря, Съпруга...)"
                    className="w-full text-xs border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(r)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => saveEdit(r)}
                      className="flex-1 py-0.5 rounded bg-teal-600 text-white hover:bg-teal-700 text-xs font-medium flex items-center justify-center gap-1"
                    >
                      <Check className="h-3 w-3" /> Запази
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 py-0.5 rounded bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500 text-xs font-medium flex items-center justify-center gap-1"
                    >
                      <X className="h-3 w-3" /> Отказ
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <div key={r.id} className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 group">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                  {r.related.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/directory/${r.related.id}`} className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 truncate block">
                    {r.related.fullName}
                  </Link>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium px-1 py-0 rounded ${colorClass}`}>
                      <Icon className="h-2.5 w-2.5" />
                      {getRelationTypeLabel(r.type)}
                    </span>
                    {r.description && (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{r.description}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => startEdit(r)}
                  className="text-slate-300 dark:text-slate-600 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100"
                  title="Редактирай връзката"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleRemove(r.id)}
                  className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100"
                  title="Премахни връзката"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
      >
        <UserPlus className="h-3.5 w-3.5" />
        Добави връзка
      </button>

      {showModal && (
        <AddRelationModal
          personId={personId}
          existingRelatedIds={relations.map(r => r.relatedId)}
          onClose={() => setShowModal(false)}
          onAdded={load}
        />
      )}
    </div>
  )
}
