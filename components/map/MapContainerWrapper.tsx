'use client'

import dynamic from 'next/dynamic'
import { MapMarkerData } from '@/app/actions/map'

// Disable SSR for mapping since Leaflet heavily depends on the window object
const MapViewClientDynamic = dynamic(() => import('./MapViewClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-slate-500 text-sm font-medium">Зареждане на картата...</p>
      </div>
    </div>
  )
})

export default function MapContainer({ initialData }: { initialData: MapMarkerData[] }) {
  return <MapViewClientDynamic initialData={initialData} />
}
