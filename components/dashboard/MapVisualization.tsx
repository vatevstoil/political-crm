'use client'

import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { BULGARIA_CENTER } from '@/lib/geo-data'
import { MapPin } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

interface MapVisualizationProps {
  geoData: {
    type: 'FeatureCollection'
    features: {
      type: 'Feature'
      properties: {
        city: string
        count: number
      }
      geometry: {
        type: 'Point'
        coordinates: [number, number]
      }
    }[]
  }
}

// Създаваме кастомни икони за различните бройки
const createClusterIcon = (count: number) => {
  let color = '#14B8A6' // Teal за 1-5
  let size = 30
  
  if (count >= 15) {
    color = '#8B5CF6' // Purple за 15+
    size = 50
  } else if (count >= 5) {
    color = '#3B82F6' // Blue за 5-15
    size = 40
  }
  
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${count}</div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(size, size),
  })
}

const createMarkerIcon = () => {
  return L.divIcon({
    html: `<div style="
      background-color: #14B8A6;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    className: 'custom-marker-icon',
    iconSize: L.point(16, 16),
  })
}

export default function MapVisualization({ geoData }: MapVisualizationProps) {
  const markers = useMemo(() => {
    return geoData.features.map((feature) => ({
      position: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]] as [number, number],
      city: feature.properties.city,
      count: feature.properties.count,
    }))
  }, [geoData])

  if (markers.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-slate-700 text-base leading-relaxed">Няма данни за визуализация на картата</p>
      </div>
    )
  }

  return (
    <div className="glass-panel overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 leading-snug tracking-[-0.01em]">Географско разпределение</h2>
              <p className="text-base text-slate-600 leading-relaxed">
                {markers.length} града с регистрирани членове
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-base">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-500"></div>
              <span className="text-slate-700 font-medium">1-5</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-slate-700 font-medium">5-15</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-slate-700 font-medium">15+</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <MapContainer
          center={[BULGARIA_CENTER.lat, BULGARIA_CENTER.lng]}
          zoom={7}
          minZoom={6}
          maxZoom={12}
          style={{ height: '500px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MarkerClusterGroup
            chunkedLoading
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            iconCreateFunction={(cluster: any) => {
              const count = cluster.getChildCount()
              return createClusterIcon(count)
            }}
          >
            {markers.map((marker, index) => (
              <Marker
                key={index}
                position={marker.position}
                icon={createMarkerIcon()}
              >
                <Popup>
                  <div className="p-3">
                    <h3 className="font-semibold text-slate-900 text-base leading-snug">{marker.city}</h3>
                    <p className="text-slate-700 text-base leading-relaxed">{marker.count} човека</p>
                    <a 
                      href={`/directory?city=${encodeURIComponent(marker.city)}`}
                      className="text-blue-600 hover:text-blue-800 text-base font-medium"
                    >
                      Виж всички →
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <p className="text-sm text-slate-600 text-center leading-relaxed">
          Кликнете на клъстер за да видите отделните градове. Кликнете на град за детайли.
        </p>
      </div>
    </div>
  )
}
