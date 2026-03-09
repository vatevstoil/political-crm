import { findDuplicates } from '@/app/actions/duplicates'
import DuplicateList from '@/components/duplicates/DuplicateList'
import { Copy } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DuplicatesSettingsPage() {
  const duplicates = await findDuplicates()

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
            <span className="text-slate-700 dark:text-slate-300">Дубликати</span>
          </div>
          <div className="flex items-center gap-3">
            <Copy className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Дубликати</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Намерете и обединете дублирани записи
              </p>
            </div>
          </div>
        </div>

        <DuplicateList initialDuplicates={duplicates} />
      </div>
    </div>
  )
}
