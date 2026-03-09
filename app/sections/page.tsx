import { getSectionsOverview } from '@/app/actions/sections'
import SectionsTable from '@/components/sections/SectionsTable'
import { ClipboardList } from 'lucide-react'

export default async function SectionsPage() {
  const data = await getSectionsOverview()

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <ClipboardList className="h-7 w-7 text-purple-500" />
            <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.01em] text-slate-800 dark:text-slate-100">
              Избирателни секции
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 ml-10">
            Преглед на застъпници и членове на СИК по секции
          </p>
        </div>

        <SectionsTable sections={data.sections} stats={data.stats} />
      </div>
    </div>
  )
}
