'use client'

import { Search, MapPin, Briefcase, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export interface FilterBarProps {
  initialSearch?: string
  initialCity?: string
  initialRole?: string
}

export default function FilterBar({
  initialSearch = '',
  initialCity = '',
  initialRole = '',
}: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(initialSearch)
  const [city, setCity] = useState(initialCity)
  const [role, setRole] = useState(initialRole)

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (search) params.set('q', search)
      else params.delete('q')

      if (city && city !== 'all') params.set('city', city)
      else params.delete('city')

      if (role && role !== 'all') params.set('role', role)
      else params.delete('role')

      // Reset to page 1 on filter change
      params.set('page', '1')

      router.push(`/directory?${params.toString()}`)
    }, 500)

    return () => clearTimeout(handler)
  }, [search, city, role, router, searchParams])

  const hasFilters = search || (city && city !== 'all') || (role && role !== 'all')

  const clearFilters = () => {
    setSearch('')
    setCity('')
    setRole('')
    router.push('/directory')
  }

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative flex-grow w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-blue-600" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all sm:text-sm"
            placeholder="Търсене по име, ID, телефон..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* City Filter */}
        <div className="relative w-full md:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-purple-600" />
          </div>
          <select
            className="block w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl leading-5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all sm:text-sm appearance-none cursor-pointer"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="all">Всички Градове</option>
            <option value="София">София</option>
            <option value="Пловдив">Пловдив</option>
            <option value="Варна">Варна</option>
            <option value="Бургас">Бургас</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Role Filter */}
        <div className="relative w-full md:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Briefcase className="h-5 w-5 text-teal-500" />
          </div>
          <select
            className="block w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl leading-5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition-all sm:text-sm appearance-none cursor-pointer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="all">Всички Роли</option>
            <option value="Координатор">Координатор</option>
            <option value="Член">Член</option>
            <option value="Симпатизант">Симпатизант</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="w-full md:w-auto px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <X className="h-4 w-4" />
            Изчисти
          </button>
        )}
      </div>
    </div>
  )
}
