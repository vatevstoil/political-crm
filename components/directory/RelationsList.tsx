'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Link2, UserPlus, Trash2, Users, Briefcase, Heart, GraduationCap, Home, Flag } from 'lucide-react'
import { getPersonRelations, removeRelation, type PersonRelationWithDetails } from '@/app/actions/relations'
import AddRelationModal from './AddRelationModal'

const RELATION_TYPE_LABELS: Record<string, string> = {
  family: 'Семейство', colleague: 'Колега', referral: 'Препоръка',
  mentor: 'Ментор', neighbor: 'Съсед', party: 'Партия',
}

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

  return (
    <div className="glass-panel p-4 sm:p-5 bg-white/60 dark:bg-slate-800/60">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-700">
        <Link2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        <h3 className="font-bold text-slate-800 dark:text-slate-100">Връзки</h3>
        {relations.length > 0 && (
          <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">({relations.length})</span>
        )}
      </div>

      {relations.length > 0 && (
        <div className="space-y-2 mb-3">
          {relations.map(r => {
            const Icon = typeIcons[r.type] || Link2
            const colorClass = typeColors[r.type] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
            return (
              <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {r.related.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/directory/${r.related.id}`} className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 truncate block">
                    {r.related.fullName}
                  </Link>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded ${colorClass}`}>
                      <Icon className="h-3 w-3" />
                      {getRelationTypeLabel(r.type)}
                    </span>
                    {r.description && (
                      <span className="text-xs text-slate-400 dark:text-slate-500 truncate">{r.description}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(r.id)}
                  className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 flex-shrink-0"
                  title="Премахни връзката"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
      >
        <UserPlus className="h-4 w-4" />
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
