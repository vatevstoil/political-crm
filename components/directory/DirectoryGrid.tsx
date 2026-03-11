'use client'

import { useState, useEffect } from 'react'
import PersonCard from './PersonCard'
import { Trash2, UserCheck, Users, UserMinus, Mail, SearchX, LayoutGrid, List, MapPin, Phone, User, Shield, ArrowUp, ArrowDown, ArrowUpDown, ClipboardCheck } from 'lucide-react'
import { deletePeople, updatePeopleStatus, addPeopleToGroup, removePeopleFromGroup } from '@/app/actions/bulk'
import { getGroups } from '@/app/actions/groups'
import { SkeletonGrid } from '@/components/common/Skeleton'
import EmailComposeModal from '@/components/communication/EmailComposeModal'
import { useConfirm } from '@/components/common/ConfirmDialog'
import { toast } from 'sonner'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import TagBadge from '@/components/tags/TagBadge'
import type { PersonWithTags } from '@/app/actions/people'

function getFirstPhone(phone: string | null | undefined): string | null {
  if (!phone) return null
  try {
    const parsed = JSON.parse(phone)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed[0]
  } catch { /* not JSON */ }
  return phone
}

type ViewMode = 'grid' | 'list'

interface DirectoryGridProps {
  people: PersonWithTags[]
  onSelectionChange?: (ids: number[]) => void
  isLoading?: boolean
  sortBy?: string
  sortOrder?: string
}

export default function DirectoryGrid({ people, onSelectionChange, isLoading: isLoadingProp = false, sortBy = '', sortOrder = '' }: DirectoryGridProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isLoadingState, setIsLoadingState] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('directoryViewMode') as ViewMode) || 'grid'
    }
    return 'grid'
  })
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Restore saved sort from localStorage on mount (if no sort in URL)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(searchParams)
    if (!params.has('sortBy')) {
      const savedSort = localStorage.getItem('directorySortBy')
      const savedOrder = localStorage.getItem('directorySortOrder')
      if (savedSort) {
        params.set('sortBy', savedSort)
        params.set('sortOrder', savedOrder || 'asc')
        router.replace(`${pathname}?${params.toString()}`)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams)
    if (sortBy === field) {
      // Toggle: asc → desc → clear
      if (sortOrder === 'asc') {
        params.set('sortBy', field)
        params.set('sortOrder', 'desc')
        localStorage.setItem('directorySortBy', field)
        localStorage.setItem('directorySortOrder', 'desc')
      } else {
        params.delete('sortBy')
        params.delete('sortOrder')
        localStorage.removeItem('directorySortBy')
        localStorage.removeItem('directorySortOrder')
      }
    } else {
      params.set('sortBy', field)
      params.set('sortOrder', 'asc')
      localStorage.setItem('directorySortBy', field)
      localStorage.setItem('directorySortOrder', 'asc')
    }
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <ArrowUpDown className="h-3 w-3 opacity-0 group-hover/th:opacity-50 transition-opacity" />
    if (sortOrder === 'asc') return <ArrowUp className="h-3 w-3 text-blue-500" />
    return <ArrowDown className="h-3 w-3 text-blue-500" />
  }

  const HIGHLIGHT_COLORS = [
    { value: '#ef4444', label: 'Червен' },
    { value: '#f97316', label: 'Оранжев' },
    { value: '#eab308', label: 'Жълт' },
    { value: '#22c55e', label: 'Зелен' },
    { value: '#3b82f6', label: 'Син' },
    { value: '#8b5cf6', label: 'Лилав' },
    { value: '#ec4899', label: 'Розов' },
  ]

  const [colorPickerFor, setColorPickerFor] = useState<number | null>(null)
  const [localHighlights, setLocalHighlights] = useState<Record<number, string | null>>({})

  const updateHighlight = async (personId: number, color: string | null) => {
    setLocalHighlights(prev => ({ ...prev, [personId]: color }))
    setColorPickerFor(null)
    try {
      await fetch(`/api/people/${personId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ highlightColor: color || '' }),
      })
    } catch {
      toast.error('Грешка при маркиране')
    }
  }

  const getHighlight = (person: PersonWithTags): string | null => {
    if (person.id in localHighlights) return localHighlights[person.id]
    return (person as Record<string, unknown>).highlightColor as string | null
  }

  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showGroupMenu, setShowGroupMenu] = useState(false)
  const [showRemoveGroupMenu, setShowRemoveGroupMenu] = useState(false)
  const [groups, setGroups] = useState<{ id: number; name: string; color: string }[]>([])
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailRecipients, setEmailRecipients] = useState<{email: string; name: string}[]>([])
  const { confirm, ConfirmDialog } = useConfirm()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowStatusMenu(false)
        setShowGroupMenu(false)
        setShowRemoveGroupMenu(false)
        setColorPickerFor(null)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.bulk-action-menu')) {
        setShowStatusMenu(false)
        setShowGroupMenu(false)
        setShowRemoveGroupMenu(false)
      }
      if (!target.closest('.color-picker-wrapper')) {
        setColorPickerFor(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isLoading = isLoadingProp || isLoadingState

  const allSelected = people.length > 0 && selectedIds.size === people.length

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } else {
      const allIds = new Set(people.map(p => p.id))
      setSelectedIds(allIds)
      onSelectionChange?.(Array.from(allIds))
    }
  }

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
    onSelectionChange?.(Array.from(newSelected))
  }

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Изтриване на записи',
      message: `Сигурни ли сте, че искате да изтриете ${selectedIds.size} ${selectedIds.size === 1 ? 'запис' : 'записа'}? Това действие е необратимо.`,
      confirmLabel: 'Изтрий',
      variant: 'danger',
    })
    if (!confirmed) return

    setIsLoadingState(true)
    try {
      await deletePeople(Array.from(selectedIds))
      toast.success(`Успешно изтрити ${selectedIds.size} записа`)
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } catch (error) {
      console.error('Failed to delete:', error)
      toast.error('Грешка при изтриването')
    } finally {
      setIsLoadingState(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    setIsLoadingState(true)
    setShowStatusMenu(false)
    try {
      await updatePeopleStatus(Array.from(selectedIds), status)
      toast.success(`Статусът е променен на ${status === 'Active' ? 'Активен' : status === 'Inactive' ? 'Неактивен' : 'Изключен'}`)
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Грешка при обновяването на статуса')
    } finally {
      setIsLoadingState(false)
    }
  }

  const handleAddToGroup = async (groupId: number) => {
    setIsLoadingState(true)
    setShowGroupMenu(false)
    try {
      await addPeopleToGroup(Array.from(selectedIds), groupId)
      toast.success('Добавени в групата')
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } catch (error) {
      console.error('Failed to add to group:', error)
      toast.error('Грешка при добавянето към група')
    } finally {
      setIsLoadingState(false)
    }
  }

  const handleRemoveFromGroup = async (groupId: number) => {
    setIsLoadingState(true)
    setShowRemoveGroupMenu(false)
    try {
      await removePeopleFromGroup(Array.from(selectedIds), groupId)
      toast.success('Премахнати от групата')
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } catch (error) {
      console.error('Failed to remove from group:', error)
      toast.error('Грешка при премахването от група')
    } finally {
      setIsLoadingState(false)
    }
  }

  const openGroupMenu = async () => {
    try {
      if (groups.length === 0) {
        const fetchedGroups = await getGroups()
        setGroups(fetchedGroups)
      }
      setShowGroupMenu(true)
      setShowRemoveGroupMenu(false)
      setShowStatusMenu(false)
    } catch {
      toast.error('Грешка при зареждане на групите')
    }
  }

  const openRemoveGroupMenu = async () => {
    try {
      if (groups.length === 0) {
        const fetchedGroups = await getGroups()
        setGroups(fetchedGroups)
      }
      setShowRemoveGroupMenu(true)
      setShowGroupMenu(false)
      setShowStatusMenu(false)
    } catch {
      toast.error('Грешка при зареждане на групите')
    }
  }

  if (isLoading) {
    return <SkeletonGrid count={8} />
  }

  if (people.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <SearchX className="h-10 w-10 text-slate-300 dark:text-slate-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Няма намерени резултати</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Опитайте с други критерии за търсене или премахнете някои от филтрите.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleSelectAll}
            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-[14px] font-medium text-slate-700 dark:text-slate-300">
            {allSelected ? 'Деселектирай всички' : 'Селектирай всички'}
          </span>
        </label>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => { setViewMode('grid'); localStorage.setItem('directoryViewMode', 'grid') }}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            title="Решетка"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => { setViewMode('list'); localStorage.setItem('directoryViewMode', 'list') }}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            title="Списък"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {people.map((person) => (
            <div key={person.id} className="relative">
              {getHighlight(person) && (
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl z-[5]"
                  style={{ backgroundColor: getHighlight(person)! }}
                />
              )}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.has(person.id)}
                  onChange={() => handleSelectOne(person.id)}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  title={`Селектирай ${person.fullName}`}
                />
                <div className="color-picker-wrapper relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setColorPickerFor(colorPickerFor === person.id ? null : person.id) }}
                    className="w-3.5 h-3.5 rounded-full border border-white/70 shadow-sm hover:scale-125 transition-transform"
                    style={{ backgroundColor: getHighlight(person) || '#cbd5e1' }}
                    title="Маркирай с цвят"
                  />
                  {colorPickerFor === person.id && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-2 flex items-center gap-1.5">
                      {HIGHLIGHT_COLORS.map(c => (
                        <button
                          key={c.value}
                          onClick={(e) => { e.stopPropagation(); updateHighlight(person.id, c.value) }}
                          className="w-5 h-5 rounded-full hover:scale-125 transition-transform ring-1 ring-black/10"
                          style={{ backgroundColor: c.value }}
                          title={c.label}
                        />
                      ))}
                      <button
                        onClick={(e) => { e.stopPropagation(); updateHighlight(person.id, null) }}
                        className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:scale-125 transition-transform flex items-center justify-center text-slate-400 text-[10px]"
                        title="Без цвят"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <PersonCard person={person} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <th className="w-10 px-3 py-3" />
                  <th className="text-left px-3 py-3 font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none group/th hover:text-slate-900 dark:hover:text-slate-200 transition-colors" onClick={() => handleSort('fullName')}>
                    <span className="inline-flex items-center gap-1">Име <SortIcon field="fullName" /></span>
                  </th>
                  <th className="text-left px-3 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell cursor-pointer select-none group/th hover:text-slate-900 dark:hover:text-slate-200 transition-colors" onClick={() => handleSort('membershipCardId')}>
                    <span className="inline-flex items-center gap-1">№ Карта <SortIcon field="membershipCardId" /></span>
                  </th>
                  <th className="text-left px-3 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell cursor-pointer select-none group/th hover:text-slate-900 dark:hover:text-slate-200 transition-colors" onClick={() => handleSort('city')}>
                    <span className="inline-flex items-center gap-1">Град <SortIcon field="city" /></span>
                  </th>
                  <th className="text-left px-3 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell cursor-pointer select-none group/th hover:text-slate-900 dark:hover:text-slate-200 transition-colors" onClick={() => handleSort('phone')}>
                    <span className="inline-flex items-center gap-1">Телефон <SortIcon field="phone" /></span>
                  </th>
                  <th className="text-left px-3 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden xl:table-cell cursor-pointer select-none group/th hover:text-slate-900 dark:hover:text-slate-200 transition-colors" onClick={() => handleSort('email')}>
                    <span className="inline-flex items-center gap-1">Имейл <SortIcon field="email" /></span>
                  </th>
                  <th className="text-left px-3 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden xl:table-cell">Тагове</th>
                  <th className="text-center px-2 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell cursor-pointer select-none hover:text-slate-900 dark:hover:text-slate-200 transition-colors" title="Застъпник" onClick={() => handleSort('isRepresentative')}>
                    <Shield className={`h-4 w-4 inline ${sortBy === 'isRepresentative' ? 'text-blue-500' : ''}`} />
                    {sortBy === 'isRepresentative' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 inline ml-0.5 text-blue-500" /> : <ArrowDown className="h-3 w-3 inline ml-0.5 text-blue-500" />)}
                  </th>
                  <th className="text-center px-2 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell cursor-pointer select-none hover:text-slate-900 dark:hover:text-slate-200 transition-colors" title="Член на СИК" onClick={() => handleSort('isCommissionMember')}>
                    <ClipboardCheck className={`h-4 w-4 inline ${sortBy === 'isCommissionMember' ? 'text-blue-500' : ''}`} />
                    {sortBy === 'isCommissionMember' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 inline ml-0.5 text-blue-500" /> : <ArrowDown className="h-3 w-3 inline ml-0.5 text-blue-500" />)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {people.map((person) => {
                  const highlight = getHighlight(person)
                  return (
                  <tr
                    key={person.id}
                    onClick={() => router.push(`/directory/${person.id}`)}
                    className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                    style={highlight ? { backgroundColor: `${highlight}12` } : undefined}
                  >
                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(person.id)}
                        onChange={() => handleSelectOne(person.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="color-picker-wrapper relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setColorPickerFor(colorPickerFor === person.id ? null : person.id)}
                            className="w-3 h-3 rounded-full hover:scale-150 transition-transform"
                            style={{ backgroundColor: highlight || '#d1d5db', boxShadow: highlight ? `0 0 0 1px ${highlight}` : undefined }}
                            title="Маркирай с цвят"
                          />
                          {colorPickerFor === person.id && (
                            <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-2 flex items-center gap-1.5">
                              {HIGHLIGHT_COLORS.map(c => (
                                <button
                                  key={c.value}
                                  onClick={() => updateHighlight(person.id, c.value)}
                                  className="w-5 h-5 rounded-full hover:scale-125 transition-transform ring-1 ring-black/10"
                                  style={{ backgroundColor: c.value }}
                                  title={c.label}
                                />
                              ))}
                              <button
                                onClick={() => updateHighlight(person.id, null)}
                                className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:scale-125 transition-transform flex items-center justify-center text-slate-400 text-[10px]"
                                title="Без цвят"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 dark:text-slate-100 truncate">{person.fullName}</div>
                          {person.profession && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{person.profession}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 hidden md:table-cell">
                      {person.membershipCardId && (
                        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                          {person.membershipCardId}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 hidden lg:table-cell">
                      {person.city && (
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <MapPin className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                          <span className="truncate max-w-[120px]">{person.city}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 hidden lg:table-cell">
                      {getFirstPhone(person.phone) && (
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <Phone className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                          <span className="truncate max-w-[130px]">{getFirstPhone(person.phone)}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 hidden xl:table-cell">
                      {person.email && (
                        <span className="text-slate-600 dark:text-slate-400 truncate block max-w-[180px]">{person.email}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 hidden xl:table-cell">
                      {person.tags && person.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {person.tags.slice(0, 2).map(({ tag }) => (
                            <TagBadge key={tag.id} tagName={tag.tagName} color={tag.color} size="sm" />
                          ))}
                          {person.tags.length > 2 && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium px-1">
                              +{person.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center hidden lg:table-cell">
                      {person.isRepresentative && (
                        <Shield className="h-4 w-4 text-teal-500 inline" />
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center hidden lg:table-cell">
                      {person.isCommissionMember && (
                        <ClipboardCheck className="h-4 w-4 text-indigo-500 inline" />
                      )}
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bulk-action-menu bg-slate-900 text-white rounded-2xl shadow-2xl p-3 flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-600 rounded-full text-[14px] font-semibold">
              {selectedIds.size} избрани
            </span>

            <div className="h-6 w-px bg-slate-700" />

            <div className="relative">
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="p-2.5 rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                title="Изтрий избраните"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowStatusMenu(!showStatusMenu)
                  setShowGroupMenu(false)
                  setShowRemoveGroupMenu(false)
                }}
                disabled={isLoading}
                className="p-2.5 rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                title="Промени статуса"
                aria-expanded={showStatusMenu}
              >
                <UserCheck className="w-5 h-5" />
              </button>
              {showStatusMenu && (
                <div className="absolute bottom-full mb-2 left-0 bg-slate-800 rounded-xl shadow-xl py-1 min-w-[160px]">
                  <button
                    onClick={() => handleStatusChange('Active')}
                    className="w-full px-4 py-2 text-left text-[14px] hover:bg-slate-700 flex items-center gap-2 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    Активен
                  </button>
                  <button
                    onClick={() => handleStatusChange('Inactive')}
                    className="w-full px-4 py-2 text-left text-[14px] hover:bg-slate-700 flex items-center gap-2 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Неактивен
                  </button>
                  <button
                    onClick={() => handleStatusChange('Excluded')}
                    className="w-full px-4 py-2 text-left text-[14px] hover:bg-slate-700 flex items-center gap-2 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Изключен
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={openGroupMenu}
                disabled={isLoading}
                className="p-2.5 rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                title="Добави в група"
                aria-expanded={showGroupMenu}
              >
                <Users className="w-5 h-5" />
              </button>
              {showGroupMenu && groups.length > 0 && (
                <div className="absolute bottom-full mb-2 left-0 bg-slate-800 rounded-xl shadow-xl py-1 max-h-[200px] overflow-y-auto min-w-[160px]">
                  {groups.map(group => (
                    <button
                      key={group.id}
                      onClick={() => handleAddToGroup(group.id)}
                      className="w-full px-4 py-2 text-left text-[14px] hover:bg-slate-700 flex items-center gap-2 font-medium"
                    >
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: group.color }}
                      />
                      {group.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={openRemoveGroupMenu}
                disabled={isLoading}
                className="p-2.5 rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                title="Премахни от група"
                aria-expanded={showRemoveGroupMenu}
              >
                <UserMinus className="w-5 h-5" />
              </button>
              {showRemoveGroupMenu && groups.length > 0 && (
                <div className="absolute bottom-full mb-2 left-0 bg-slate-800 rounded-xl shadow-xl py-1 max-h-[200px] overflow-y-auto min-w-[160px]">
                  {groups.map(group => (
                    <button
                      key={group.id}
                      onClick={() => handleRemoveFromGroup(group.id)}
                      className="w-full px-4 py-2 text-left text-[14px] hover:bg-slate-700 flex items-center gap-2 font-medium"
                    >
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: group.color }}
                      />
                      {group.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                const recipients = people
                  .filter(p => selectedIds.has(p.id) && p.email)
                  .map(p => ({ email: p.email!, name: p.fullName }))
                if (recipients.length === 0) {
                  toast.warning('Няма имейли за изпращане')
                  return
                }
                setEmailRecipients(recipients)
                setShowEmailModal(true)
              }}
              className="p-2.5 rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2"
              title="Имейл"
            >
              <Mail className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      {showEmailModal && (
        <EmailComposeModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          recipients={emailRecipients}
        />
      )}
      {ConfirmDialog}
    </>
  )
}
