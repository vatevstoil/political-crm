'use client'

import { Search, MapPin, Briefcase, X, Users, Clock, Folder, Filter, Download, Tag, Bookmark } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import { getGroups } from '@/app/actions/groups'
import { getUniqueCities, getUniqueProfessions, getUniqueRoles } from '@/app/actions/people'
import { getTags } from '@/app/actions/tags'
import { exportPeopleToCSV } from '@/app/actions/export'
import { SkeletonFilterBar } from '@/components/common/Skeleton'
import SaveFilterModal from './SaveFilterModal'
import type { FilterParams } from '@/app/actions/savedFilters'

export interface FilterBarProps {
  initialSearch?: string
  initialCity?: string
  initialRole?: string
  initialStatus?: string
  initialProfession?: string
  initialGender?: string
  initialGroup?: string
  initialTag?: string
  selectedCount?: number
  isLoading?: boolean
  onFilterSaved?: () => void
}

interface Option {
  value: string
  label: string
}

function SearchableSelect({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  icon: Icon,
  color = 'purple',
  fullWidth = false
}: { 
  value: string
  onChange: (v: string) => void
  options: Option[]
  placeholder: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  color?: string
  fullWidth?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const filtered = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  const selectedOption = options.find(o => o.value === value)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (v: string) => {
    onChange(v)
    setIsOpen(false)
    setSearch('')
  }

  const colorClasses: Record<string, string> = {
    purple: 'focus:ring-purple-500 focus:border-purple-500',
    teal: 'focus:ring-teal-500 focus:border-teal-500',
    amber: 'focus:ring-amber-500 focus:border-amber-500',
    pink: 'focus:ring-pink-500 focus:border-pink-500',
    indigo: 'focus:ring-indigo-500 focus:border-indigo-500',
    cyan: 'focus:ring-cyan-500 focus:border-cyan-500',
  }

  const iconColors: Record<string, string> = {
    purple: 'text-purple-600',
    teal: 'text-teal-500',
    amber: 'text-amber-500',
    pink: 'text-pink-500',
    indigo: 'text-indigo-500',
    cyan: 'text-cyan-500',
  }

  return (
    <div ref={ref} className={`relative ${fullWidth ? 'w-full' : 'w-full md:w-40'}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className={`h-5 w-5 ${iconColors[color]}`} />
      </div>
      <input
        type="text"
        className={`block w-full pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl leading-5 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 ${colorClasses[color]} focus:bg-white dark:focus:bg-slate-600 transition-all text-[14px] touch-manipulation font-medium`}
        placeholder={selectedOption?.label || placeholder}
        value={isOpen ? search : (selectedOption?.label || '')}
        onChange={(e) => {
          setSearch(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onClick={() => setIsOpen(true)}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg className="h-4 w-4 text-slate-600 dark:text-slate-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg dark:shadow-slate-900/50 max-h-60 overflow-y-auto touch-manipulation">
          {filtered.length > 0 ? (
            filtered.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 text-[14px] text-slate-700 dark:text-slate-300 touch-manipulation font-medium"
              >
                {opt.label}
              </button>
            ))
          ) : null}
        </div>
      )}
    </div>
  )
}

export default function FilterBar({
  initialSearch = '',
  initialCity = '',
  initialRole = '',
  initialStatus = '',
  initialProfession = '',
  initialGender = '',
  initialGroup = '',
  initialTag = '',
  selectedCount = 0,
  isLoading = false,
  onFilterSaved,
}: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(initialSearch)
  const [city, setCity] = useState(initialCity)
  const [role, setRole] = useState(initialRole)
  const [status, setStatus] = useState(initialStatus)
  const [profession, setProfession] = useState(initialProfession)
  const [gender, setGender] = useState(initialGender)
  const [group, setGroup] = useState(initialGroup)
  const [tag, setTag] = useState(initialTag)
  const [showFilters, setShowFilters] = useState(false)
  const [groups, setGroups] = useState<{id: number, name: string, color: string}[]>([])
  const [tags, setTags] = useState<Option[]>([])
  const [cities, setCities] = useState<Option[]>([])
  const [professions, setProfessions] = useState<Option[]>([])
  const [roles, setRoles] = useState<Option[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)

  useEffect(() => {
    getGroups().then(setGroups).catch(console.error)
    getUniqueCities().then(c => setCities(c.map(city => ({ value: city, label: city })))).catch(console.error)
    getUniqueProfessions().then(p => setProfessions(p.map(prof => ({ value: prof, label: prof })))).catch(console.error)
    getUniqueRoles().then(r => setRoles(r.map(role => ({ value: role, label: role })))).catch(console.error)
    getTags().then(t => setTags(t.map(tag => ({ value: String(tag.id), label: tag.tagName })))).catch(console.error)
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (search) params.set('q', search)
      else params.delete('q')

      if (city && city !== 'all') params.set('city', city)
      else params.delete('city')

      if (role && role !== 'all') params.set('role', role)
      else params.delete('role')

      if (status && status !== 'all') params.set('status', status)
      else params.delete('status')

      if (profession && profession !== 'all') params.set('profession', profession)
      else params.delete('profession')

      if (gender && gender !== 'all') params.set('gender', gender)
      else params.delete('gender')

      if (group && group !== 'all') params.set('group', group)
      else params.delete('group')

      if (tag && tag !== 'all') params.set('tag', tag)
      else params.delete('tag')

      params.set('page', '1')

      router.push(`/directory?${params.toString()}`)
    }, 500)

    return () => clearTimeout(handler)
  }, [search, city, role, status, profession, gender, group, tag, router, searchParams])

  const hasFilters = search || (city && city !== 'all') || (role && role !== 'all') ||
                     (status && status !== 'all') || (profession && profession !== 'all') ||
                     (gender && gender !== 'all') || (group && group !== 'all') ||
                     (tag && tag !== 'all')

  const activeFiltersCount = [
    city && city !== 'all',
    role && role !== 'all',
    status && status !== 'all',
    profession && profession !== 'all',
    gender && gender !== 'all',
    group && group !== 'all',
    tag && tag !== 'all',
  ].filter(Boolean).length

  const clearFilters = () => {
    setSearch('')
    setCity('')
    setRole('')
    setStatus('')
    setProfession('')
    setGender('')
    setGroup('')
    setTag('')
    router.push('/directory')
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const filters = {
        query: search || undefined,
        role: role && role !== 'all' ? role : undefined,
        city: city && city !== 'all' ? city : undefined,
        status: status && status !== 'all' ? status : undefined,
        profession: profession && profession !== 'all' ? profession : undefined,
        gender: gender && gender !== 'all' ? gender : undefined,
        groupId: group && group !== 'all' ? group : undefined,
      }

      const csvContent = await exportPeopleToCSV(filters)

      const today = new Date().toISOString().split('T')[0]
      const filename = `people_export_${today}.csv`

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Грешка при експортирането')
    } finally {
      setIsExporting(false)
    }
  }

  const getCurrentFilters = (): FilterParams => {
    const f: FilterParams = {}
    if (search) f.query = search
    if (city && city !== 'all') f.city = city
    if (role && role !== 'all') f.role = role
    if (status && status !== 'all') f.status = status
    if (profession && profession !== 'all') f.profession = profession
    if (gender && gender !== 'all') f.gender = gender
    if (group && group !== 'all') f.groupId = group
    if (tag && tag !== 'all') f.tagId = tag
    return f
  }

  if (isLoading) {
    return <SkeletonFilterBar />
  }

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl shadow-md mb-6">
      {/* Main Search - Always Visible */}
      <div className="p-4">
        <div className="flex gap-2 items-center">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-600 rounded-xl leading-5 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white dark:focus:bg-slate-900 transition-all touch-manipulation text-[15px] font-medium"
              placeholder="Търсене..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-600 hover:text-slate-600"
                aria-label="Изчисти"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative md:hidden p-3 rounded-xl border transition-colors touch-manipulation ${
              showFilters || activeFiltersCount > 0
                ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400'
                : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Filter className="h-5 w-5" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Section - Collapsible on Mobile */}
      <div className={`md:block ${showFilters ? 'block' : 'hidden'} border-t border-slate-200 dark:border-slate-700`}>
        <div className="p-4 pt-2">
          <div className="grid grid-cols-2 md:flex gap-3">
            <SearchableSelect
              value={city}
              onChange={setCity}
              options={cities}
              placeholder="Град"
              icon={MapPin}
              color="purple"
              fullWidth
            />

            <SearchableSelect
              value={role}
              onChange={setRole}
              options={roles}
              placeholder="Роля"
              icon={Users}
              color="teal"
              fullWidth
            />

            <SearchableSelect
              value={status}
              onChange={setStatus}
              options={[
                { value: 'Active', label: 'Активен' },
                { value: 'Inactive', label: 'Неактивен' },
                { value: 'Excluded', label: 'Изключен' },
              ]}
              placeholder="Статус"
              icon={Clock}
              color="amber"
              fullWidth
            />

            <SearchableSelect
              value={profession}
              onChange={setProfession}
              options={professions}
              placeholder="Професия"
              icon={Briefcase}
              color="indigo"
              fullWidth
            />

            <SearchableSelect
              value={group}
              onChange={setGroup}
              options={groups.map(g => ({ value: String(g.id), label: g.name }))}
              placeholder="Група"
              icon={Folder}
              color="pink"
              fullWidth
            />

            <SearchableSelect
              value={tag}
              onChange={setTag}
              options={tags}
              placeholder="Таг"
              icon={Tag}
              color="cyan"
              fullWidth
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 md:flex-none px-4 py-3 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors touch-manipulation flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Експортиране...' : 'Експорт CSV'}
            </button>

            {hasFilters && (
              <button
                onClick={() => setShowSaveModal(true)}
                className="flex-1 md:flex-none px-4 py-3 text-sm font-medium text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors touch-manipulation flex items-center justify-center gap-2"
              >
                <Bookmark className="h-4 w-4" />
                Запази филтър
              </button>
            )}

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex-1 md:flex-none px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors touch-manipulation"
              >
                Изчисти
              </button>
            )}

            {selectedCount > 0 && (
              <div className="flex-1 md:flex-none px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-blue-600 text-white rounded-full">
                  {selectedCount}
                </span>
                избрани
              </div>
            )}
          </div>
        </div>
      </div>

      {showSaveModal && (
        <SaveFilterModal
          filters={getCurrentFilters()}
          onClose={() => setShowSaveModal(false)}
          onSaved={() => onFilterSaved?.()}
        />
      )}
    </div>
  )
}
