import { getPeople } from '@/app/actions/people'
import DirectoryClient from '@/components/directory/DirectoryClient'
import Pagination from '@/components/common/Pagination'
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
  const status = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : ''
  const profession = typeof resolvedSearchParams.profession === 'string' ? resolvedSearchParams.profession : ''
  const gender = typeof resolvedSearchParams.gender === 'string' ? resolvedSearchParams.gender : ''
  const group = typeof resolvedSearchParams.group === 'string' ? resolvedSearchParams.group : ''
  const tag = typeof resolvedSearchParams.tag === 'string' ? resolvedSearchParams.tag : ''
  const sortBy = typeof resolvedSearchParams.sortBy === 'string' ? resolvedSearchParams.sortBy : ''
  const sortOrder = resolvedSearchParams.sortOrder === 'asc' ? 'asc' as const : resolvedSearchParams.sortOrder === 'desc' ? 'desc' as const : undefined
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1
  const limit = typeof resolvedSearchParams.limit === 'string' ? parseInt(resolvedSearchParams.limit) : 100

  const { people, total, totalPages, currentPage } = await getPeople({
    query: q,
    role,
    city,
    status,
    profession,
    gender,
    groupId: group,
    tagId: tag,
    page,
    limit,
    sortBy: sortBy || undefined,
    sortOrder,
  })

return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <h1 className="text-3xl font-bold gradient-text dark:text-white">
                Картотека
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Управление на членове, доброволци и симпатизанти
            </p>
          </div>
          <Link
            href="/directory/new"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:brightness-110"
          >
            <Plus className="mr-2 h-5 w-5" />
            Нов Човек
          </Link>
        </div>

        {/* Filters & Grid */}
        <DirectoryClient
          people={people}
          total={total}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={limit}
          initialSearch={q}
          initialRole={role}
          initialCity={city}
          initialStatus={status}
          initialProfession={profession}
          initialGender={gender}
          initialGroup={group}
          initialTag={tag}
          initialSortBy={sortBy}
          initialSortOrder={sortOrder || ''}
        />

        {/* Pagination */}
        <div className="mt-8 flex justify-center">
            <Pagination totalPages={totalPages} currentPage={currentPage} />
        </div>

        {/* Bottom spacing */}
        <div className="pb-12" />
      </div>
    </div>
  )
}
