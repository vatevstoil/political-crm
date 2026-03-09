import { getMapData } from '@/app/actions/map'
import MapContainerWrapper from '@/components/map/MapContainerWrapper'
import { MapPin } from 'lucide-react'

export const metadata = {
  title: 'Карта | CRM',
  description: 'Интерактивна карта с контакти',
}

export default async function MapPage() {
  const mapData = await getMapData()

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            Интерактивна карта
          </h1>
          <p className="text-slate-500 mt-1">
             Преглед на контактите по населени места
          </p>
        </div>
      </div>

      <MapContainerWrapper initialData={mapData} />
    </div>
  )
}
