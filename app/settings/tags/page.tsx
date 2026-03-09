import { getTags } from '@/app/actions/tags'
import TagManager from '@/components/tags/TagManager'
import { Tag } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TagsSettingsPage() {
  const tags = await getTags()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
            <Link href="/settings" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Настройки
            </Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300">Тагове</span>
          </div>
          <div className="flex items-center gap-3">
            <Tag className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Тагове</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Създавайте и управлявайте тагове за категоризиране на хора
              </p>
            </div>
          </div>
        </div>

        <TagManager initialTags={tags} />
      </div>
    </div>
  )
}
