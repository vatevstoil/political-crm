'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import DirectoryGrid from './DirectoryGrid'
import FilterBar from './FilterBar'
import SavedFiltersBar, { type SavedFiltersBarRef } from './SavedFiltersBar'
import { Download, Upload, FileSpreadsheet } from 'lucide-react'
import { exportPeople, exportPeopleByIds, importPeople } from '@/app/actions/people'
import type { PersonWithTags } from '@/app/actions/people'
import { downloadExcel, parseExcel } from '@/lib/excel'
import { toast } from 'sonner'

const PAGE_SIZE_OPTIONS = [15, 50, 100, 500, 1000] as const

interface DirectoryClientProps {
  people: PersonWithTags[]
  total?: number
  currentPage?: number
  totalPages?: number
  pageSize?: number
  initialSearch?: string
  initialCity?: string
  initialRole?: string
  initialStatus?: string
  initialProfession?: string
  initialGender?: string
  initialGroup?: string
  initialTag?: string
  initialSortBy?: string
  initialSortOrder?: string
}

export default function DirectoryClient({
  people,
  total = 0,
  currentPage = 1,
  totalPages = 1,
  pageSize = 15,
  initialSearch = '',
  initialCity = '',
  initialRole = '',
  initialStatus = '',
  initialProfession = '',
  initialGender = '',
  initialGroup = '',
  initialTag = '',
  initialSortBy = '',
  initialSortOrder = '',
}: DirectoryClientProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const savedFiltersRef = useRef<SavedFiltersBarRef>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const handleSelectionChange = useCallback((ids: number[]) => {
    setSelectedIds(ids)
  }, [])

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = e.target.value
    const params = new URLSearchParams(searchParams)
    params.set('limit', newLimit)
    params.set('page', '1') // Reset to page 1 when changing page size
    router.push(`${pathname}?${params.toString()}`)
  }

  // Format person data for Excel export
  const formatForExcel = (p: { fullName: string; email?: string | null; phone?: string | null; role?: string | null; status?: string | null; region?: string | null; city?: string | null; address?: string | null; profession?: string | null; gender?: string | null; membershipCardId?: string | null; isRepresentative?: boolean; isCommissionMember?: boolean; votingSection?: string | null; birthDate?: Date | string | null; egn?: string | null }) => ({
    'Имена': p.fullName,
    'ЕГН': p.egn || '',
    'Телефон': p.phone || '',
    'Имейл': p.email || '',
    'Град': p.city || '',
    'Адрес': p.address || '',
    'Роля': p.role || '',
    'Статус': p.status || '',
    '№ Карта': p.membershipCardId || '',
    'Застъпник': p.isRepresentative ? 'Да' : '',
    'Член СИК': p.isCommissionMember ? 'Да' : '',
    'Секция': p.votingSection || '',
    'Професия': p.profession || '',
    'Пол': p.gender || '',
    'Дата раждане': p.birthDate ? new Date(p.birthDate).toLocaleDateString('bg-BG') : '',
    'Област': p.region || '',
  })

  const handleExport = async () => {
    startTransition(async () => {
      try {
        const data = await exportPeople({
          query: initialSearch,
          city: initialCity,
          role: initialRole,
          status: initialStatus,
          profession: initialProfession,
          gender: initialGender,
          groupId: initialGroup
        })
        const exportData = data.map(formatForExcel)
        downloadExcel(exportData, `Contacts_Export_${new Date().toISOString().split('T')[0]}`)
        toast.success('Експортът е успешен!')
      } catch (error) {
        console.error('Export failed:', error)
        toast.error('Грешка при експортиране на данни.')
      }
    })
  }

  const handleExportSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error('Моля, маркирайте поне един човек.')
      return
    }
    startTransition(async () => {
      try {
        const data = await exportPeopleByIds(selectedIds)
        const exportData = data.map(formatForExcel)
        downloadExcel(exportData, `Selected_Export_${selectedIds.length}_people_${new Date().toISOString().split('T')[0]}`)
        toast.success(`Експортирани ${data.length} записа!`)
      } catch (error) {
        console.error('Export selected failed:', error)
        toast.error('Грешка при експортиране.')
      }
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    startTransition(async () => {
      const loadingToast = toast.loading('Обработка на файла...')
      try {
        const jsonData = await parseExcel(file)
        if (!jsonData || jsonData.length === 0) throw new Error('Файлът е празен.')

        const res = await importPeople(jsonData)
        toast.success(`Успешно импортирани ${res.count} записа!`, { id: loadingToast })
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : 'Грешка при импорт.', { id: loadingToast })
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    })
  }

  return (
    <>
      <SavedFiltersBar ref={savedFiltersRef} />
      <FilterBar
        initialSearch={initialSearch}
        initialRole={initialRole}
        initialCity={initialCity}
        initialStatus={initialStatus}
        initialProfession={initialProfession}
        initialGender={initialGender}
        initialGroup={initialGroup}
        initialTag={initialTag}
        selectedCount={selectedIds.length}
        isLoading={isPending}
        onFilterSaved={() => savedFiltersRef.current?.reload()}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 px-2 gap-4">
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Общо намерени: <span className="font-bold text-slate-900 dark:text-slate-100">{total}</span>
        </span>
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
            title="Импорт на файл"
            aria-label="Импорт на файл"
            placeholder="Изберете файл"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className="text-sm px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 whitespace-nowrap transition-colors"
          >
            <Upload className="h-4 w-4" />
            Импорт
          </button>
          <button
            onClick={handleExport}
            disabled={isPending}
            className="text-sm px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 whitespace-nowrap transition-colors"
          >
            <Download className="h-4 w-4" />
            Експорт
          </button>
          {selectedIds.length > 0 && (
            <button
              onClick={handleExportSelected}
              disabled={isPending}
              className="text-sm px-3 py-1.5 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 rounded-md text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 flex items-center gap-2 whitespace-nowrap transition-colors font-medium"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Експорт {selectedIds.length} избрани
            </button>
          )}
          <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
            <label htmlFor="pageSize" className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Покажи:</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="text-sm px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline-block">
            Стр. {currentPage}/{totalPages}
          </span>
        </div>
      </div>

      <DirectoryGrid
        people={people}
        onSelectionChange={handleSelectionChange}
        isLoading={isPending}
        sortBy={initialSortBy}
        sortOrder={initialSortOrder}
      />
    </>
  )
}
