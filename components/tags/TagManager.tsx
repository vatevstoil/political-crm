'use client'

import { useState, useTransition } from 'react'
import { Tag, Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { getTags, createTag, updateTag, deleteTag, TagWithCount } from '@/app/actions/tags'
import TagBadge from './TagBadge'
import { toast } from 'sonner'

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#22C55E', '#14B8A6',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#6B7280',
]

interface TagManagerProps {
  initialTags: TagWithCount[]
}

export default function TagManager({ initialTags }: TagManagerProps) {
  const [tags, setTags] = useState<TagWithCount[]>(initialTags)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#3B82F6')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [isPending, startTransition] = useTransition()

  const refreshTags = async () => {
    const updated = await getTags()
    setTags(updated)
  }

  const handleCreate = () => {
    if (!newName.trim()) return
    startTransition(async () => {
      try {
        await createTag(newName.trim(), newColor)
        setNewName('')
        setNewColor('#3B82F6')
        await refreshTags()
        toast.success('Тагът е създаден')
      } catch {
        toast.error('Грешка при създаване на тага')
      }
    })
  }

  const handleUpdate = (id: number) => {
    if (!editName.trim()) return
    startTransition(async () => {
      try {
        await updateTag(id, editName.trim(), editColor)
        setEditingId(null)
        await refreshTags()
        toast.success('Тагът е обновен')
      } catch {
        toast.error('Грешка при обновяване на тага')
      }
    })
  }

  const handleDelete = (id: number, tagName: string) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете тага "${tagName}"?`)) return
    startTransition(async () => {
      try {
        await deleteTag(id)
        await refreshTags()
        toast.success('Тагът е изтрит')
      } catch {
        toast.error('Грешка при изтриване на тага')
      }
    })
  }

  const startEdit = (tag: TagWithCount) => {
    setEditingId(tag.id)
    setEditName(tag.tagName)
    setEditColor(tag.color)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Create new tag */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          Нов таг
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Име на тага..."
            className="flex-grow px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:text-slate-100 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-600 transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={`w-6 h-6 rounded-full transition-all ${newColor === c ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
            <button
              onClick={handleCreate}
              disabled={isPending || !newName.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium rounded-xl hover:brightness-110 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              Създай
            </button>
          </div>
        </div>
        {/* Preview */}
        {newName.trim() && (
          <div className="mt-3">
            <TagBadge tagName={newName.trim()} color={newColor} size="md" />
          </div>
        )}
      </div>

      {/* Tags list */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Tag className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          Съществуващи тагове
          <span className="text-sm font-normal text-slate-500 dark:text-slate-400">({tags.length})</span>
        </h2>

        {tags.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">Няма създадени тагове</p>
        ) : (
          <div className="space-y-2">
            {tags.map(tag => (
              <div
                key={tag.id}
                className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
              >
                {editingId === tag.id ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-grow px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-slate-100"
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate(tag.id)}
                      autoFocus
                    />
                    <div className="flex gap-1">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setEditColor(c)}
                          className={`w-5 h-5 rounded-full transition-all ${editColor === c ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`}
                          style={{ backgroundColor: c }}
                          aria-label={c}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => handleUpdate(tag.id)}
                      className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <TagBadge tagName={tag.tagName} color={tag.color} size="md" />
                    <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
                      {tag._count.people} {tag._count.people === 1 ? 'лице' : 'лица'}
                    </span>
                    <button
                      onClick={() => startEdit(tag)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id, tag.tagName)}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
