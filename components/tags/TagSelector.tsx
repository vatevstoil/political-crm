'use client'

import { useState, useEffect, useRef } from 'react'
import { Tag, Plus, ChevronDown, Palette } from 'lucide-react'
import { getTags, getPersonTags, addTagToPerson, removeTagFromPerson, createTag, TagWithCount } from '@/app/actions/tags'
import TagBadge from './TagBadge'
import { toast } from 'sonner'

interface TagSelectorProps {
  personId: number
  onTagsChange?: () => void
}

export default function TagSelector({ personId, onTagsChange }: TagSelectorProps) {
  const [allTags, setAllTags] = useState<TagWithCount[]>([])
  const [personTags, setPersonTags] = useState<{ id: number; tagName: string; color: string }[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [creatingTag, setCreatingTag] = useState(false)
  const [newTagColor, setNewTagColor] = useState('#3b82f6')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getTags().then(setAllTags).catch((err) => { console.error(err); toast.error('Грешка при зареждане на тагове') })
    getPersonTags(personId).then(setPersonTags).catch((err) => { console.error(err); toast.error('Грешка при зареждане на тагове') })
  }, [personId])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const personTagIds = new Set(personTags.map(t => t.id))
  const availableTags = allTags.filter(t =>
    !personTagIds.has(t.id) &&
    t.tagName.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = async (tagId: number) => {
    const result = await addTagToPerson(personId, tagId)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    const tag = allTags.find(t => t.id === tagId)
    if (tag) {
      setPersonTags(prev => [...prev, { id: tag.id, tagName: tag.tagName, color: tag.color }])
    }
    toast.success('Тагът е добавен')
    onTagsChange?.()
    setSearch('')
    setIsOpen(false)
  }

  const handleRemove = async (tagId: number) => {
    const result = await removeTagFromPerson(personId, tagId)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setPersonTags(prev => prev.filter(t => t.id !== tagId))
    toast.success('Тагът е премахнат')
    onTagsChange?.()
  }

  const handleCreateTag = async () => {
    if (!search.trim()) return
    const result = await createTag(search.trim(), newTagColor)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success('Тагът е създаден')
    // Reload tags and add the new one to person
    const refreshed = await getTags()
    setAllTags(refreshed)
    const newTag = refreshed.find(t => t.tagName === search.trim())
    if (newTag) {
      await handleAdd(newTag.id)
    }
    setSearch('')
    setCreatingTag(false)
    setIsOpen(false)
  }

  return (
    <div className="relative z-10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm overflow-visible">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Тагове</h3>
      </div>

      {/* Current tags */}
      <div className="flex flex-wrap gap-1.5 mb-3 min-h-[24px]">
        {personTags.length === 0 ? (
          <span className="text-xs text-slate-400 dark:text-slate-500">Няма тагове</span>
        ) : (
          personTags.map(tag => (
            <TagBadge
              key={tag.id}
              tagName={tag.tagName}
              color={tag.color}
              size="md"
              onRemove={() => handleRemove(tag.id)}
            />
          ))
        )}
      </div>

      {/* Add tag dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Добави таг
          <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg overflow-hidden">
            <div className="p-2">
              <input
                type="text"
                className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-slate-100 dark:placeholder:text-slate-400"
                placeholder="Търси таг..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="max-h-40 overflow-y-auto">
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleAdd(tag.id)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-200">{tag.tagName}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">{tag._count.people}</span>
                </button>
              ))}
              {availableTags.length === 0 && !search.trim() && (
                <div className="px-3 py-2 text-xs text-slate-400 dark:text-slate-500 text-center">
                  Няма налични тагове
                </div>
              )}
            </div>
            {/* Create new tag when search has no exact match */}
            {search.trim() && !allTags.some(t => t.tagName.toLowerCase() === search.trim().toLowerCase()) && (
              <div className="border-t border-slate-200 dark:border-slate-600 p-2">
                {creatingTag ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                      title="Избери цвят"
                    />
                    <button
                      onClick={handleCreateTag}
                      className="flex-1 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      Създай &quot;{search.trim()}&quot;
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setCreatingTag(true)}
                    className="w-full text-left px-3 py-2 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 flex items-center gap-2 text-cyan-600 dark:text-cyan-400 rounded-lg transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="text-sm font-medium">Създай таг &quot;{search.trim()}&quot;</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
