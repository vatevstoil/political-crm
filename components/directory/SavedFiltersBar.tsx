'use client'

import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, X, Trash2 } from 'lucide-react'
import { getSavedFilters, deleteSavedFilter, type SavedFilterWithId } from '@/app/actions/savedFilters'
import { toast } from 'sonner'

export interface SavedFiltersBarRef {
  reload: () => void
}

const SavedFiltersBar = forwardRef<SavedFiltersBarRef>(function SavedFiltersBar(_, ref) {
  const router = useRouter()
  const [filters, setFilters] = useState<SavedFilterWithId[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)

  const load = useCallback(async () => {
    const data = await getSavedFilters()
    setFilters(data)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useImperativeHandle(ref, () => ({ reload: load }), [load])

  const applyFilter = (f: SavedFilterWithId) => {
    const params = new URLSearchParams()
    if (f.filters.query) params.set('q', f.filters.query)
    if (f.filters.city) params.set('city', f.filters.city)
    if (f.filters.role) params.set('role', f.filters.role)
    if (f.filters.status) params.set('status', f.filters.status)
    if (f.filters.profession) params.set('profession', f.filters.profession)
    if (f.filters.gender) params.set('gender', f.filters.gender)
    if (f.filters.groupId) params.set('group', f.filters.groupId)
    if (f.filters.tagId) params.set('tag', f.filters.tagId)
    params.set('page', '1')
    setActiveId(f.id)
    router.push(`/directory?${params.toString()}`)
  }

  const clearActive = () => {
    setActiveId(null)
    router.push('/directory')
  }

  const handleDelete = async (e: React.MouseEvent, id: number, name: string) => {
    e.stopPropagation()
    if (!confirm(`Изтрий филтър "${name}"?`)) return
    await deleteSavedFilter(id)
    if (activeId === id) setActiveId(null)
    toast.success(`Филтър "${name}" е изтрит`)
    load()
  }

  if (filters.length === 0) return null

  return (
    <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
      <Bookmark className="h-4 w-4 text-slate-400 flex-shrink-0" />
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => activeId === f.id ? clearActive() : applyFilter(f)}
          className={`group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeId === f.id
              ? 'text-white shadow-md'
              : 'text-slate-700 bg-white border border-slate-200 hover:shadow-sm'
          }`}
          style={activeId === f.id ? { backgroundColor: f.color } : undefined}
        >
          {activeId !== f.id && (
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: f.color }} />
          )}
          {f.name}
          {activeId === f.id ? (
            <X className="h-3.5 w-3.5 ml-0.5" />
          ) : (
            <span
              onClick={(e) => handleDelete(e, f.id, f.name)}
              className="hidden group-hover:flex items-center ml-0.5"
            >
              <Trash2 className="h-3 w-3 text-slate-400 hover:text-red-500" />
            </span>
          )}
        </button>
      ))}
    </div>
  )
})

export default SavedFiltersBar
