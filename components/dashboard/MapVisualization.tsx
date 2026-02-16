'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { BULGARIA_CENTER } from '@/lib/geo-data'
import { MapPin } from 'lucide-react'

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

// Замени с твоя Mapbox token или използвай environment variable
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export default function MapVisualization({ geoData }: MapVisualizationProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!mapContainer.current || geoData.features.length === 0) return

    mapboxgl.accessToken = MAPBOX_TOKEN

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [BULGARIA_CENTER.lng, BULGARIA_CENTER.lat],
      zoom: 6.5,
      minZoom: 5,
      maxZoom: 12,
    })

    map.current.on('load', () => {
      if (!map.current) return

      // Добавяме източник с данни
      map.current.addSource('cities', {
        type: 'geojson',
        data: geoData,
        cluster: true,
        clusterMaxZoom: 10,
        clusterRadius: 50,
      })

      // Клъстерен слой
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'cities',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#14B8A6', // 1-5 човека
            5,
            '#3B82F6', // 5-15 човека
            15,
            '#8B5CF6', // 15+ човека
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            25,
            5,
            35,
            15,
            45,
          ],
          'circle-opacity': 0.8,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      })

      // Текст на клъстерите
      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'cities',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 14,
        },
        paint: {
          'text-color': '#ffffff',
        },
      })

      // Неклъстерирани точки
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'cities',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#14B8A6',
          'circle-radius': 12,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })

      // Текст на градовете
      map.current.addLayer({
        id: 'city-labels',
        type: 'symbol',
        source: 'cities',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': '{city}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-offset': [0, 1.5],
        },
        paint: {
          'text-color': '#1e293b',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2,
        },
      })

      setLoading(false)
    })

    // Event handlers
    map.current.on('click', 'clusters', (e) => {
      if (!map.current) return
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ['clusters'],
      })
      const clusterId = features[0].properties?.cluster_id
      const source = map.current.getSource('cities') as mapboxgl.GeoJSONSource

      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || !map.current) return
        map.current.easeTo({
          center: (features[0].geometry as any).coordinates,
          zoom: zoom || 10,
        })
      })
    })

    map.current.on('click', 'unclustered-point', (e) => {
      if (!e.features || e.features.length === 0) return
      const feature = e.features[0]
      const city = feature.properties?.city
      const count = feature.properties?.count

      setSelectedCity(city)

      // Можем да добавим popup или навигация
      new mapboxgl.Popup()
        .setLngLat((feature.geometry as any).coordinates)
        .setHTML(`
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${city}</h3>
            <p style="margin: 0; color: #666;">${count} човека</p>
            <a href="/directory?city=${encodeURIComponent(city)}"
               style="color: #3B82F6; text-decoration: none; font-size: 12px;">
              Виж всички →
            </a>
          </div>
        `)
        .addTo(map.current!)
    })

    map.current.on('mouseenter', 'clusters', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer'
    })

    map.current.on('mouseleave', 'clusters', () => {
      if (map.current) map.current.getCanvas().style.cursor = ''
    })

    map.current.on('mouseenter', 'unclustered-point', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer'
    })

    map.current.on('mouseleave', 'unclustered-point', () => {
      if (map.current) map.current.getCanvas().style.cursor = ''
    })

    return () => {
      map.current?.remove()
    }
  }, [geoData])

  if (!MAPBOX_TOKEN) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-slate-600">Моля, добавете Mapbox token в environment variables</p>
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
              <h2 className="text-lg font-bold text-slate-900">Географско разпределение</h2>
              <p className="text-sm text-slate-500">
                {geoData.features.length} града с регистрирани членове
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-500"></div>
              <span className="text-slate-600">1-5</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-slate-600">5-15</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-slate-600">15+</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          ref={mapContainer}
          className="w-full h-[500px]"
          style={{ minHeight: '500px' }}
        />

        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-sm text-slate-600">Зареждане на картата...</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <p className="text-xs text-slate-500 text-center">
          Кликнете на клъстер за да видите отделните градове. Кликнете на град за детайли.
        </p>
      </div>
    </div>
  )
}
