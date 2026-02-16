'use client'

import { Person } from '@prisma/client'
import { useState, useTransition } from 'react'
import DirectoryGrid from './DirectoryGrid'
import FilterBar from './FilterBar'

interface DirectoryClientProps {
  people: Person[]
  total?: number
  currentPage?: number
  totalPages?: number
  initialSearch?: string
  initialCity?: string
  initialRole?: string
  initialStatus?: string
  initialProfession?: string
  initialGender?: string
  initialGroup?: string
}

export default function DirectoryClient({
  people,
  total = 0,
  currentPage = 1,
  totalPages = 1,
  initialSearch = '',
  initialCity = '',
  initialRole = '',
  initialStatus = '',
  initialProfession = '',
  initialGender = '',
  initialGroup = '',
}: DirectoryClientProps) {
  const [selectedCount, setSelectedCount] = useState(0)
  const [isPending, startTransition] = useTransition()

  const handleSelectionChange = (ids: number[]) => {
    setSelectedCount(ids.length)
  }

  return (
    <>
      <FilterBar 
        initialSearch={initialSearch} 
        initialRole={initialRole} 
        initialCity={initialCity}
        initialStatus={initialStatus}
        initialProfession={initialProfession}
        initialGender={initialGender}
        initialGroup={initialGroup}
        selectedCount={selectedCount}
        isLoading={isPending}
      />

      <div className="flex justify-between items-center mb-6 px-2">
        <span className="text-sm text-slate-600">
          Общо намерени: <span className="font-bold text-slate-900">{total}</span>
        </span>
        <span className="text-sm text-slate-500">
          Страница {currentPage} от {totalPages}
        </span>
      </div>

      <DirectoryGrid 
        people={people} 
        onSelectionChange={handleSelectionChange}
        isLoading={isPending}
      />
    </>
  )
}
