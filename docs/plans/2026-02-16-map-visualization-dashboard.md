# Map Visualization Dashboard - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Добавяне на интерактивна Mapbox карта в Dashboard показваща клъстерирани маркери с хора по градове в България.

**Architecture:** Използваме Mapbox GL JS с клъстериране (supercluster). Създаваме utility за мапинг на български градове към координати. Данните се зареждат от съществуващия getDashboardStats с добавени координати. Картата е React компонент с интерактивни клъстери.

**Tech Stack:** Next.js 15, React 19, Mapbox GL JS, Supercluster, TypeScript, Tailwind CSS

---

## Task 1: Инсталация на Mapbox dependencies

**Files:**
- Modify: `package.json`

**Step 1: Инсталиране на необходимите пакети**

Run: `cd political-crm && npm install mapbox-gl @types/mapbox-gl supercluster @types/supercluster`

Expected: Пакетите се инсталират успешно

**Step 2: Проверка на package.json**

Провери че са добавени:
- mapbox-gl
- supercluster

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add mapbox-gl and supercluster dependencies"
```

---

## Task 2: Създаване на мапинг на български градове с координати

**Files:**
- Create: `lib/geo-data.ts`

**Step 1: Създаване на файл с координати на градовете**

```typescript
// lib/geo-data.ts

export interface CityCoordinates {
  name: string
  lat: number
  lng: number
}

// Координати на основните български градове
export const cityCoordinates: Record<string, CityCoordinates> = {
  'София': { name: 'София', lat: 42.6977, lng: 23.3219 },
  'Пловдив': { name: 'Пловдив', lat: 42.1354, lng: 24.7453 },
  'Варна': { name: 'Варна', lat: 43.2141, lng: 27.9147 },
  'Бургас': { name: 'Бургас', lat: 42.5048, lng: 27.4626 },
  'Русе': { name: 'Русе', lat: 43.8356, lng: 25.9657 },
  'Стара Загора': { name: 'Стара Загора', lat: 42.4258, lng: 25.6345 },
  'Плевен': { name: 'Плевен', lat: 43.4170, lng: 24.6067 },
  'Сливен': { name: 'Сливен', lat: 42.6819, lng: 26.3229 },
  'Добрич': { name: 'Добрич', lat: 43.5726, lng: 27.8273 },
  'Шумен': { name: 'Шумен', lat: 43.2742, lng: 26.9190 },
  'Перник': { name: 'Перник', lat: 42.6052, lng: 23.0378 },
  'Хасково': { name: 'Хасково', lat: 41.9341, lng: 25.5557 },
  'Ямбол': { name: 'Ямбол', lat: 42.4823, lng: 26.5004 },
  'Пазарджик': { name: 'Пазарджик', lat: 42.1928, lng: 24.3336 },
  'Благоевград': { name: 'Благоевград', lat: 42.0209, lng: 23.0943 },
  'Велико Търново': { name: 'Велико Търново', lat: 43.0757, lng: 25.6172 },
  'Враца': { name: 'Враца', lat: 43.2102, lng: 23.5528 },
  'Габрово': { name: 'Габрово', lat: 42.8742, lng: 25.3187 },
  'Асеновград': { name: 'Асеновград', lat: 42.0100, lng: 24.8743 },
  'Видин': { name: 'Видин', lat: 43.9962, lng: 22.8679 },
  'Казанлък': { name: 'Казанлък', lat: 42.6194, lng: 25.3929 },
  'Кърджали': { name: 'Кърджали', lat: 41.6455, lng: 25.3711 },
  'Кюстендил': { name: 'Кюстендил', lat: 42.2869, lng: 22.6939 },
  'Монтана': { name: 'Монтана', lat: 43.4085, lng: 23.2257 },
  'Силистра': { name: 'Силистра', lat: 44.1147, lng: 27.2672 },
  'Търговище': { name: 'Търговище', lat: 43.2462, lng: 26.5698 },
  'Ловеч': { name: 'Ловеч', lat: 43.1370, lng: 24.7140 },
  'Разград': { name: 'Разград', lat: 43.5242, lng: 26.5243 },
}

// Център на България за начален изглед
export const BULGARIA_CENTER = {
  lat: 42.7339,
  lng: 25.4858,
}

export const BULGARIA_BOUNDS = {
  north: 44.215,
  south: 41.235,
  west: 22.357,
  east: 28.609,
}

// Функция за намиране на координати по име на град
export function getCityCoordinates(cityName: string): CityCoordinates | null {
  // Търсене по точно съвпадение
  if (cityCoordinates[cityName]) {
    return cityCoordinates[cityName]
  }
  
  // Търсене по частично съвпадение (case-insensitive)
  const normalizedName = cityName.toLowerCase().trim()
  for (const [key, value] of Object.entries(cityCoordinates)) {
    if (key.toLowerCase() === normalizedName) {
      return value
    }
  }
  
  return null
}
```

**Step 2: Commit**

```bash
git add lib/geo-data.ts
git commit -m "feat: add Bulgarian cities coordinates mapping"
```

---

## Task 3: Обновяване на Dashboard Stats с координати

**Files:**
- Modify: `app/actions/dashboard.ts`

**Step 1: Добавяне на импорт за координати**

```typescript
import { getCityCoordinates, CityCoordinates } from '@/lib/geo-data'
```

**Step 2: Обновяване на типа DashboardStats**

Добави нов тип в интерфейса:
```typescript
export type DashboardStats = {
  // ... съществуващи полета
  byCity: { 
    city: string; 
    _count: { id: number } 
    coordinates: CityCoordinates | null
  }[]
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
  // ... останалите полета
}
```

**Step 3: Обновяване на getDashboardStats функцията**

```typescript
export async function getDashboardStats(): Promise<DashboardStats> {
  // ... съществуващ код до byCity заявката
  
  const byCityWithCoords = byCity
    .filter((c) => c.city !== null)
    .map((c) => {
      const coords = getCityCoordinates(c.city as string)
      return {
        city: c.city as string,
        _count: c._count,
        coordinates: coords,
      }
    })
    .filter((c) => c.coordinates !== null) // Премахваме градове без координати

  // Създаваме GeoJSON формат за картата
  const geoData = {
    type: 'FeatureCollection' as const,
    features: byCityWithCoords.map((city) => ({
      type: 'Feature' as const,
      properties: {
        city: city.city,
        count: city._count.id,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [city.coordinates!.lng, city.coordinates!.lat] as [number, number],
      },
    })),
  }

  // ... останалата част от кода

  return {
    // ... съществуващи полета
    byCity: byCityWithCoords,
    geoData,
    // ... останалите полета
  }
}
```

**Step 4: Проверка на build**

Run: `npm run build`
Expected: Build успешен

**Step 5: Commit**

```bash
git add app/actions/dashboard.ts
git commit -m "feat: add geo coordinates to dashboard stats"
```

---

## Task 4: Създаване на MapVisualization компонент

**Files:**
- Create: `components/dashboard/MapVisualization.tsx`

**Step 1: Създаване на компонента**

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import Supercluster from 'supercluster'
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
```

**Step 2: Проверка на build**

Run: `npm run build`
Expected: Build успешен

**Step 3: Commit**

```bash
git add components/dashboard/MapVisualization.tsx
git commit -m "feat: add MapVisualization component with clustering"
```

---

## Task 5: Интеграция на картата в Dashboard страницата

**Files:**
- Modify: `app/page.tsx`

**Step 1: Добавяне на импорт**

```typescript
import MapVisualization from '@/components/dashboard/MapVisualization'
```

**Step 2: Добавяне на картата в layout**

```typescript
export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-purple-50">
      {/* Header with Search */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-6">Табло</h1>
          <div className="max-w-md">
            <GlobalSearch />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <StatsCards
          totalMembers={stats.totalMembers}
          newThisMonth={stats.newThisMonth}
          activeMembers={stats.activeMembers}
        />
      </div>

      {/* Map Section - НОВО */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MapVisualization geoData={stats.geoData} />
      </div>

      {/* Task Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <TaskStatsCards
          total={stats.taskStats.total}
          completed={stats.taskStats.completed}
          pending={stats.taskStats.pending}
          overdue={stats.taskStats.overdue}
          byPriority={stats.taskStats.byPriority}
        />
      </div>

      {/* Останалата част от страницата... */}
    </div>
  )
}
```

**Step 3: Проверка на build**

Run: `npm run build`
Expected: Build успешен

**Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: integrate MapVisualization into Dashboard"
```

---

## Task 6: Добавяне на Mapbox Token инструкции

**Files:**
- Modify: `.env.example` или създаване на инструкции

**Step 1: Добавяне на примерен .env файл**

```bash
# .env.local
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

**Step 2: Инструкции за получаване на token**

1. Отиди на https://account.mapbox.com/
2. Създай акаунт или влез в съществуващ
3. Отиди на "Tokens" раздел
4. Създай нов Public token или използвай Default public token
5. Копирай токена в `.env.local`

**Step 3: Commit**

```bash
git add .env.local.example
git commit -m "docs: add Mapbox token instructions"
```

---

## Task 7: Финално тестване

**Files:**
- All modified files

**Step 1: Проверка на build**

Run: `npm run build`
Expected: Build успешен

**Step 2: Проверка на типовете**

Run: `npx tsc --noEmit`
Expected: Няма TypeScript грешки

**Step 3: Проверка на lint**

Run: `npm run lint`
Expected: Няма критични грешки

**Step 4: Финален commit**

```bash
git add -A
git commit -m "feat: implement map visualization with clustering for Dashboard"
```

---

## Резюме

След изпълнение на всички задачи:
- Dashboard има интерактивна Mapbox карта
- Показват се клъстерирани маркери по градове
- При клик на клъстер се разкриват отделните градове
- При клик на град се показва popup с брой хора
- Легенда показва цветовата кодировка по брой хора
- Лесно се вижда в кой град колко хора има

**Забележка:** Необходимо е да добавиш Mapbox token в `.env.local` за да работи картата.
