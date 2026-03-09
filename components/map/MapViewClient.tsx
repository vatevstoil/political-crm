'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapMarkerData } from '@/app/actions/map'
import { Users, MapPin, Search } from 'lucide-react'

function FitBounds({ data, activeGroup }: { data: MapMarkerData[], activeGroup: MapMarkerData | null }) {
  const map = useMap()

  useEffect(() => {
    if (activeGroup) {
      map.setView([activeGroup.city.lat, activeGroup.city.lng], 12, { animate: true })
      return
    }
    if (data.length === 0) return
    const bounds = L.latLngBounds(data.map(d => [d.city.lat, d.city.lng] as [number, number]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 })
  }, [data, activeGroup, map])

  return null
}

function createCountIcon(count: number, name: string) {
  const size = count >= 10 ? 44 : count >= 5 ? 38 : 32
  const bg = count >= 10 ? '#2563eb' : count >= 5 ? '#3b82f6' : '#60a5fa'
  return L.divIcon({
    className: '',
    iconSize: [size, size + 18],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
      <div style="
        width:${size}px;height:${size}px;
        background:${bg};
        border:3px solid white;
        border-radius:50%;
        color:white;
        font-weight:700;
        font-size:${count >= 10 ? 15 : 13}px;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
        cursor:pointer;
      ">${count}</div>
      <div style="
        font-size:11px;
        font-weight:600;
        color:white;
        text-shadow:0 1px 3px rgba(0,0,0,0.8),0 0 6px rgba(0,0,0,0.5);
        white-space:nowrap;
        pointer-events:none;
      ">${name}</div>
    </div>`
  })
}

interface MapViewClientProps {
  initialData: MapMarkerData[]
}

export default function MapViewClient({ initialData }: MapViewClientProps) {
  const [activeGroup, setActiveGroup] = useState<MapMarkerData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Ensuring the map resizes correctly if inside a dynamic container
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 200)
  }, [])

  const filteredData = initialData.filter(d => 
    d.city.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const bulgariaCenter: [number, number] = [42.7339, 25.4858] // Central point approx

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar with list */}
      <div className="w-full md:w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Локации ({initialData.length})</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Търси град..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredData.map(group => (
            <button
              key={group.city.name}
              onClick={() => setActiveGroup(group)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center justify-between ${
                activeGroup?.city.name === group.city.name
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 border'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{group.city.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Users className="h-3 w-3" /> {group.count} контакта
                  </div>
                </div>
              </div>
            </button>
          ))}
          {filteredData.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 p-4 text-center">Няма намерени резултати</p>
          )}
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative z-0">
        <MapContainer
          center={activeGroup ? [activeGroup.city.lat, activeGroup.city.lng] : bulgariaCenter}
          zoom={activeGroup ? 12 : 7}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <FitBounds data={filteredData} activeGroup={activeGroup} />
          {filteredData.map(group => (
            <Marker
              key={group.city.name}
              position={[group.city.lat, group.city.lng]}
              icon={createCountIcon(group.count, group.city.name)}
              eventHandlers={{
                click: () => setActiveGroup(group)
              }}
            >
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <h3 className="font-bold text-slate-900 border-b pb-2 mb-2 flex items-center justify-between">
                    {group.city.name}
                    <span className="text-xs font-normal px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      {group.count}
                    </span>
                  </h3>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {group.people.slice(0, 10).map(p => (
                      <a
                        key={p.id}
                        href={`/directory/${p.id}`}
                        className="block text-sm text-blue-600 hover:text-blue-800 hover:underline py-1 truncate"
                      >
                        {p.fullName} {p.role && <span className="text-slate-400 text-xs">({p.role})</span>}
                      </a>
                    ))}
                    {group.people.length > 10 && (
                      <div className="text-xs text-slate-500 italic pt-1 border-t mt-1">
                        + още {group.people.length - 10} човека
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
