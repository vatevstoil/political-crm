'use server'

import { prisma } from '@/lib/prisma'

export type NotificationCounts = {
  overdueReminders: number
  overdueTasks: number
  total: number
}

export type NotificationItem = {
  id: number
  type: 'reminder' | 'task'
  title: string
  personName: string | null
  personId: number | null
  dueDate: Date
}

export type QuickSearchResult = {
  id: number
  fullName: string
  role: string | null
  city: string | null
  phone: string | null
  email: string | null
  photoUrl: string | null
}

export async function getNotificationCounts(): Promise<NotificationCounts> {
  const now = new Date()

  const [overdueReminders, overdueTasks] = await Promise.all([
    prisma.reminder.count({
      where: { isCompleted: false, dueDate: { lt: now } },
    }),
    prisma.task.count({
      where: { isCompleted: false, dueDate: { lt: now } },
    }),
  ])

  return {
    overdueReminders,
    overdueTasks,
    total: overdueReminders + overdueTasks,
  }
}

export async function getNotificationItems(): Promise<NotificationItem[]> {
  const now = new Date()

  const [reminders, tasks] = await Promise.all([
    prisma.reminder.findMany({
      where: { isCompleted: false, dueDate: { lt: now } },
      include: { person: { select: { id: true, fullName: true } } },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),
    prisma.task.findMany({
      where: { isCompleted: false, dueDate: { lt: now } },
      include: {
        person: { select: { id: true, fullName: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),
  ])

  const items: NotificationItem[] = [
    ...reminders.map(r => ({
      id: r.id,
      type: 'reminder' as const,
      title: r.title,
      personName: r.person.fullName,
      personId: r.person.id,
      dueDate: r.dueDate,
    })),
    ...tasks.map(t => ({
      id: t.id,
      type: 'task' as const,
      title: t.title,
      personName: t.person?.fullName || null,
      personId: t.person?.id || null,
      dueDate: t.dueDate!,
    })),
  ]

  return items.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()).slice(0, 8)
}

export async function quickSearch(query: string): Promise<QuickSearchResult[]> {
  if (!query || query.trim().length < 2) return []

  let q = query.trim()
  q = q.slice(0, 100)

  return prisma.person.findMany({
    where: {
      OR: [
        { fullName: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
        { city: { contains: q } },
      ],
    },
    select: {
      id: true,
      fullName: true,
      role: true,
      city: true,
      phone: true,
      email: true,
      photoUrl: true,
    },
    take: 8,
    orderBy: { fullName: 'asc' },
  })
}
