'use server'

import { prisma } from '@/lib/prisma'
import { getCoordinatesForCity, CityCoordinate } from '@/lib/mapCoordinates'

export interface MapMarkerData {
  city: CityCoordinate
  count: number
  people: {
    id: number
    fullName: string
    role: string | null
    phone: string | null
  }[]
}

export async function getMapData(): Promise<MapMarkerData[]> {
  // Fetch all people that have a city defined
  const people = await prisma.person.findMany({
    where: {
      city: { not: null }
    },
    select: {
      id: true,
      fullName: true,
      role: true,
      phone: true,
      city: true,
    }
  })

  // Group by calculated coordinates
  const cityGroups = new Map<string, MapMarkerData>()

  // Default coordinates for unknown cities (center of Bulgaria)
  const defaultCoords: CityCoordinate = { lat: 42.7339, lng: 25.4858, name: 'Други' }

  people.forEach(person => {
    const coords = getCoordinatesForCity(person.city)
    if (coords) {
      // Use the standardized name as a grouping key
      const key = coords.name
      if (!cityGroups.has(key)) {
        cityGroups.set(key, {
          city: coords,
          count: 0,
          people: []
        })
      }
      
      const group = cityGroups.get(key)!
      group.count += 1
      group.people.push({
        id: person.id,
        fullName: person.fullName,
        role: person.role,
        phone: person.phone
      })
    } else {
      // Group all unknown cities together
      const key = 'Други'
      if (!cityGroups.has(key)) {
        cityGroups.set(key, {
          city: { ...defaultCoords, name: person.city || 'Други' },
          count: 0,
          people: []
        })
      }
      
      const group = cityGroups.get(key)!
      group.count += 1
      group.people.push({
        id: person.id,
        fullName: person.fullName,
        role: person.role,
        phone: person.phone
      })
    }
  })

  // Return values directly
  return Array.from(cityGroups.values())
}
