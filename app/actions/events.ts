'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const EventSchema = z.object({
  title: z.string().min(1, 'Заглавието е задължително'),
  description: z.string().nullish(),
  startTime: z.string().min(1, 'Началната дата е задължителна'),
  endTime: z.string().nullish(),
  location: z.string().nullish(),
})

export type EventWithId = {
  id: number
  title: string
  description: string | null
  startTime: Date
  endTime: Date | null
  location: string | null
  createdAt: Date
}

export async function createEvent(
  title: string,
  description: string | null,
  startTime: string,
  endTime: string | null,
  location: string | null
) {
  const validatedFields = EventSchema.safeParse({
    title,
    description,
    startTime,
    endTime,
    location,
  })

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors }
  }

  const { title: validTitle, description: validDescription, startTime: validStart, endTime: validEnd, location: validLocation } = validatedFields.data

  try {
    await prisma.event.create({
      data: {
        title: validTitle,
        description: validDescription || null,
        startTime: new Date(validStart),
        endTime: validEnd ? new Date(validEnd) : null,
        location: validLocation || null,
      },
    })
    revalidatePath('/events')
    return { success: true }
  } catch (error) {
    console.error('Database Error:', error)
    return { error: { _form: ['Възникна грешка при създаването на събитието.'] } }
  }
}

export async function updateEvent(
  id: number,
  title: string,
  description: string | null,
  startTime: string,
  endTime: string | null,
  location: string | null
) {
  const validatedFields = EventSchema.safeParse({
    title,
    description,
    startTime,
    endTime,
    location,
  })

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors }
  }

  const { title: validTitle, description: validDescription, startTime: validStart, endTime: validEnd, location: validLocation } = validatedFields.data

  try {
    await prisma.event.update({
      where: { id },
      data: {
        title: validTitle,
        description: validDescription || null,
        startTime: new Date(validStart),
        endTime: validEnd ? new Date(validEnd) : null,
        location: validLocation || null,
      },
    })
    revalidatePath('/events')
    return { success: true }
  } catch (error) {
    console.error('Database Error:', error)
    return { error: { _form: ['Възникна грешка при обновяването на събитието.'] } }
  }
}

export async function deleteEvent(id: number) {
  try {
    await prisma.event.delete({
      where: { id },
    })
    revalidatePath('/events')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete event:', error)
    return { error: { _form: ['Възникна грешка при изтриването на събитието.'] } }
  }
}

export async function getEvents(): Promise<EventWithId[]> {
  try {
    const events = await prisma.event.findMany({
      orderBy: { startTime: 'asc' },
    })
    return events
  } catch (error) {
    console.error('Failed to fetch events:', error)
    throw new Error('Грешка при зареждане на събитията.')
  }
}

export async function getEventsByMonth(year: number, month: number): Promise<EventWithId[]> {
  try {
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0, 23, 59, 59)

    const events = await prisma.event.findMany({
      where: {
        startTime: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { startTime: 'asc' },
    })
    return events
  } catch (error) {
    console.error('Failed to fetch events by month:', error)
    throw new Error('Грешка при зареждане на събитията за месеца.')
  }
}

export async function getUpcomingEvents(days: number = 7): Promise<EventWithId[]> {
  try {
    const now = new Date()
    const future = new Date(now)
    future.setDate(now.getDate() + days)

    const events = await prisma.event.findMany({
      where: {
        startTime: {
          gte: now,
          lte: future,
        },
      },
      orderBy: { startTime: 'asc' },
    })
    return events
  } catch (error) {
    console.error('Failed to fetch upcoming events:', error)
    throw new Error('Грешка при зареждане на предстоящите събития.')
  }
}
