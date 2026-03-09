'use client'

import dynamicImport from 'next/dynamic'

const PeopleByCityChart = dynamicImport(() => import('@/components/dashboard/PeopleByCityChart'), {
  loading: () => <div className="h-64 bg-slate-100 dark:bg-slate-700 animate-pulse rounded-lg" />,
  ssr: false
})
const AgeStructureChart = dynamicImport(() => import('@/components/dashboard/AgeStructureChart'), {
  loading: () => <div className="h-64 bg-slate-100 dark:bg-slate-700 animate-pulse rounded-lg" />,
  ssr: false
})
const MapVisualization = dynamicImport(() => import('@/components/dashboard/MapVisualization'), {
  loading: () => <div className="h-[500px] bg-slate-100 dark:bg-slate-700 animate-pulse rounded-lg" />,
  ssr: false
})
const StatusDistributionChart = dynamicImport(() => import('@/components/dashboard/StatusDistributionChart'), {
  loading: () => <div className="h-64 bg-slate-100 dark:bg-slate-700 animate-pulse rounded-lg" />,
  ssr: false
})
const MembershipGrowthChart = dynamicImport(() => import('@/components/dashboard/MembershipGrowthChart'), {
  loading: () => <div className="h-64 bg-slate-100 dark:bg-slate-700 animate-pulse rounded-lg" />,
  ssr: false
})

interface GeoDataFeature {
  type: 'Feature'
  properties: { city: string; count: number }
  geometry: { type: 'Point'; coordinates: [number, number] }
}

interface GeoData {
  type: 'FeatureCollection'
  features: GeoDataFeature[]
}

interface CityData {
  city: string
  _count: { id: number }
}

interface AgeGroupData {
  group: string
  count: number
}

interface StatusData {
  status: string
  count: number
}

interface GrowthData {
  month: string
  count: number
}

interface DashboardClientSectionProps {
  geoData: GeoData
  citiesWithoutCoords: CityData[]
  byCity: CityData[]
  byAgeGroup: AgeGroupData[]
  statusDistribution?: StatusData[]
  membershipGrowth?: GrowthData[]
}

export function MapSection({ geoData, citiesWithoutCoords }: Pick<DashboardClientSectionProps, 'geoData' | 'citiesWithoutCoords'>) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MapVisualization geoData={geoData} />

      {citiesWithoutCoords.length > 0 && (
        <div className="mt-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-5 w-5 rounded-md bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <svg className="h-3 w-3 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Градове без координати
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">{citiesWithoutCoords.length} града</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {citiesWithoutCoords.map((city) => (
              <a
                key={city.city}
                href={`/directory?city=${encodeURIComponent(city.city)}`}
                className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm bg-slate-50 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-200/60 dark:border-slate-600/40 hover:border-blue-200 dark:hover:border-blue-700/50 transition-all"
              >
                <span className="font-medium">{city.city || 'Неизвестен'}</span>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 tabular-nums">{city._count.id}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function ChartsSection({ byCity, byAgeGroup, statusDistribution, membershipGrowth }: Pick<DashboardClientSectionProps, 'byCity' | 'byAgeGroup' | 'statusDistribution' | 'membershipGrowth'>) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/50 p-6 border border-transparent dark:border-slate-700">
          <PeopleByCityChart data={byCity} />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/50 p-6 border border-transparent dark:border-slate-700">
          <AgeStructureChart data={byAgeGroup} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {statusDistribution && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/50 p-6 border border-transparent dark:border-slate-700">
            <StatusDistributionChart data={statusDistribution} />
          </div>
        )}
        {membershipGrowth && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/50 p-6 border border-transparent dark:border-slate-700">
            <MembershipGrowthChart data={membershipGrowth} />
          </div>
        )}
      </div>
    </div>
  )
}
