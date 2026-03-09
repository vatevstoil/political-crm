'use server'

import { prisma } from '@/lib/prisma'
import { getCityCoordinates, CityCoordinates } from '@/lib/geo-data'
import { unstable_cache } from 'next/cache'

export type BirthdayPerson = {
  id: number
  fullName: string
  birthDate: Date | null
  photoUrl: string | null
}

export type DashboardStats = {
  totalMembers: number
  newThisMonth: number
  activeMembers: number
  byCity: { city: string; _count: { id: number }; coordinates: CityCoordinates | null }[]
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
  citiesWithoutCoords: { city: string; _count: { id: number } }[]
  byAgeGroup: {
    group: string
    count: number
  }[]
  upcomingBirthdays: BirthdayPerson[]
  taskStats: {
    total: number
    completed: number
    pending: number
    overdue: number
    byPriority: {
      low: number
      medium: number
      high: number
    }
  }
  overdueTasks: {
    id: number
    title: string
    dueDate: Date | null
    priority: string
    assignees: {
      person: {
        id: number
        fullName: string
      }
    }[]
  }[]
  upcomingTasks: {
    id: number
    title: string
    dueDate: Date | null
    priority: string
    assignees: {
      person: {
        id: number
        fullName: string
      }
    }[]
  }[]
  upcomingEvents: {
    id: number
    title: string
    startTime: Date
    endTime: Date | null
    location: string | null
  }[]
  statusDistribution: { status: string; count: number }[]
  membershipGrowth: { month: string; count: number }[]
  recentActivities: {
    id: number
    type: string
    content: string
    createdAt: Date
    person: { id: number; fullName: string }
  }[]
}

export const getDashboardStats = unstable_cache(
  async (): Promise<DashboardStats> => {
    return getDashboardStatsInternal()
  },
  ['dashboard-stats'],
  { revalidate: 300, tags: ['dashboard'] }
)

async function getDashboardStatsInternal(): Promise<DashboardStats> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const nextWeek = new Date(now)
  nextWeek.setDate(now.getDate() + 7)

  const [
    totalMembers,
    newThisMonth,
    activeMembers,
    byCity,
    allPeople,
    taskStatsResult,
    overdueTasksResult,
    upcomingTasksResult,
    upcomingEventsResult,
    statusDistributionResult,
    membershipGrowthResult,
    recentActivitiesResult,
  ] = await Promise.all([
    prisma.person.count(),
    prisma.person.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
    prisma.person.count({
      where: { status: 'Active' },
    }),
    prisma.person.groupBy({
      by: ['city'],
      _count: { id: true },
      where: { city: { not: null } },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
    prisma.person.findMany({
      where: { birthDate: { not: null } },
      select: { id: true, fullName: true, birthDate: true, photoUrl: true },
    }),
    getTaskStatsInternal(),
    prisma.task.findMany({
      where: {
        isCompleted: false,
        dueDate: { lt: today },
      },
      include: {
        assignees: {
          include: {
            person: true
          }
        }
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),
    prisma.task.findMany({
      where: {
        isCompleted: false,
        dueDate: {
          gte: today,
          lte: nextWeek,
        },
      },
      include: {
        assignees: {
          include: {
            person: true
          }
        }
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    }),
    prisma.event.findMany({
      where: {
        startTime: { gte: today },
      },
      orderBy: { startTime: 'asc' },
      take: 5,
    }),
    getStatusDistributionInternal(),
    getMembershipGrowthInternal(),
    prisma.activityLog.findMany({
      include: { person: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ] as const)

  const upcomingBirthdays = getUpcomingBirthdays(allPeople)

  const ageGroups = calculateAgeGroups(allPeople)

  // Добавяме координати към byCity данните
  const allCities = byCity
    .filter((c) => c.city !== null)
    .map((c) => {
      const coords = getCityCoordinates(c.city as string)
      return {
        city: c.city as string,
        _count: c._count,
        coordinates: coords,
      }
    })

  // Само градове с координати за картата
  const byCityWithCoords = allCities.filter((c) => c.coordinates !== null)
  
  // Градове без координати (за статистика)
  const citiesWithoutCoords = allCities.filter((c) => c.coordinates === null)

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

  return {
    totalMembers,
    newThisMonth,
    activeMembers,
    byCity: allCities,
    geoData,
    citiesWithoutCoords,
    byAgeGroup: ageGroups,
    upcomingBirthdays,
    taskStats: taskStatsResult,
    overdueTasks: overdueTasksResult,
    upcomingTasks: upcomingTasksResult,
    upcomingEvents: upcomingEventsResult,
    statusDistribution: statusDistributionResult,
    membershipGrowth: membershipGrowthResult,
    recentActivities: recentActivitiesResult,
  }
}

async function getTaskStatsInternal() {
  const [total, completed, pending, overdue, low, medium, high] = await Promise.all([
    prisma.task.count(),
    prisma.task.count({ where: { isCompleted: true } }),
    prisma.task.count({ where: { isCompleted: false } }),
    prisma.task.count({ where: { isCompleted: false, dueDate: { lt: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    prisma.task.count({ where: { priority: 'low' } }),
    prisma.task.count({ where: { priority: 'medium' } }),
    prisma.task.count({ where: { priority: 'high' } }),
  ])

  return {
    total,
    completed,
    pending,
    overdue,
    byPriority: { low, medium, high }
  }
}

function getUpcomingBirthdays(people: { id: number; fullName: string; birthDate: Date | null; photoUrl: string | null }[]): BirthdayPerson[] {
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  return people
    .filter((p) => {
      if (!p.birthDate) return false
      const birthDate = new Date(p.birthDate)
      const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
      
      if (thisYearBirthday >= today && thisYearBirthday <= nextWeek) {
        return true
      }
      return false
    })
    .sort((a, b) => {
      const aDate = new Date(a.birthDate!)
      const bDate = new Date(b.birthDate!)
      const aThisYear = new Date(today.getFullYear(), aDate.getMonth(), aDate.getDate())
      const bThisYear = new Date(today.getFullYear(), bDate.getMonth(), bDate.getDate())
      return aThisYear.getTime() - bThisYear.getTime()
    })
    .slice(0, 5)
}

async function getStatusDistributionInternal() {
  const [active, inactive, excluded, lead, prospect] = await Promise.all([
    prisma.person.count({ where: { status: 'Active' } }),
    prisma.person.count({ where: { status: 'Inactive' } }),
    prisma.person.count({ where: { status: 'Excluded' } }),
    prisma.person.count({ where: { status: 'Lead' } }),
    prisma.person.count({ where: { status: 'Prospect' } }),
  ])
  return [
    { status: 'Активен', count: active },
    { status: 'Неактивен', count: inactive },
    { status: 'Изключен', count: excluded },
    { status: 'Потенциален', count: lead },
    { status: 'Перспективен', count: prospect },
  ]
}

async function getMembershipGrowthInternal() {
  const now = new Date()

  const monthRanges = Array.from({ length: 12 }, (_, idx) => {
    const i = 11 - idx
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
    const label = date.toLocaleDateString('bg-BG', { month: 'short', year: '2-digit' })
    return { date, nextMonth, label }
  })

  const counts = await Promise.all(
    monthRanges.map(({ date, nextMonth }) =>
      prisma.person.count({
        where: {
          createdAt: { gte: date, lt: nextMonth },
        },
      })
    )
  )

  return monthRanges.map((range, idx) => ({
    month: range.label,
    count: counts[idx],
  }))
}

function calculateAgeGroups(people: { birthDate: Date | null }[]) {
  const now = new Date()
  let group18_30 = 0
  let group31_50 = 0
  let group50Plus = 0

  people.forEach((p) => {
    if (!p.birthDate) return
    const birthDate = new Date(p.birthDate)
    let age = now.getFullYear() - birthDate.getFullYear()
    const monthDiff = now.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
      age--
    }
    
    if (age >= 18 && age <= 30) group18_30++
    else if (age > 30 && age <= 50) group31_50++
    else if (age > 50) group50Plus++
  })

  return [
    { group: '18-30', count: group18_30 },
    { group: '31-50', count: group31_50 },
    { group: '50+', count: group50Plus },
  ]
}
