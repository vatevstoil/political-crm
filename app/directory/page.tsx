import { getPeople } from '@/app/actions/people'
import DirectoryGrid from '@/components/directory/DirectoryGrid'
import FilterBar from '@/components/directory/FilterBar'
import Link from 'next/link'
import { Plus, Users } from 'lucide-react'

export interface DirectoryPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DirectoryPage({ searchParams }: DirectoryPageProps) {
  const resolvedSearchParams = await searchParams
  const q = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : ''
  const role = typeof resolvedSearchParams.role === 'string' ? resolvedSearchParams.role : ''
  const city = typeof resolvedSearchParams.city === 'string' ? resolvedSearchParams.city : ''
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1

  const { people, total, totalPages, currentPage } = await getPeople({
    query: q,
    role,
    city,
    page,
    limit: 12, // Items per page
  })

return (
    <div className="min-h-screen bg-ocean-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold gradient-text">
                Картотека
              </h1>
            </div>
            <p className="text-slate-500">
              Управление на членове, доброволци и симпатизанти
            </p>
          </div>
          <Link
            href="/directory/new"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:brightness-110"
          >
            <Plus className="mr-2 h-5 w-5" />
            Нов Човек
          </Link>
        </div>

        {/* Filters */}
        <FilterBar initialSearch={q} initialRole={role} initialCity={city} />

        {/* Stats */}
        <div className="flex justify-between items-center mb-6 px-2">
          <span className="text-sm text-slate-600">
            Общо намерени: <span className="font-bold text-slate-900">{total}</span>
          </span>
          <span className="text-sm text-slate-500">
            Страница {currentPage} от {totalPages}
          </span>
        </div>

        {/* Grid */}
        <DirectoryGrid people={people} />

        {/* Bottom spacing */}
        <div className="pb-12" />
      </div>
    </div>
  )
}
