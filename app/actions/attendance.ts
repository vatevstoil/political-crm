'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type AttendanceStatus = 'invited' | 'confirmed' | 'attended' | 'absent'

export type EventAttendee = {
  eventId: number
  personId: number
  status: string
  person: {
    id: number
    fullName: string
    phone: string | null
    email: string | null
    photoUrl: string | null
  }
}

export type AttendanceStats = {
  invited: number
  confirmed: number
  attended: number
  absent: number
  total: number
}

export async function getEventAttendees(eventId: number): Promise<EventAttendee[]> {
  try {
    const attendees = await prisma.eventAttendance.findMany({
      where: { eventId },
      include: {
        person: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            photoUrl: true,
          },
        },
      },
      orderBy: { person: { fullName: 'asc' } },
    })
    return attendees
  } catch (error) {
    console.error('Failed to get event attendees:', error)
    return []
  }
}

export async function getAttendanceStats(eventId: number): Promise<AttendanceStats> {
  try {
    const attendees = await prisma.eventAttendance.findMany({
      where: { eventId },
      select: { status: true },
    })
    const stats: AttendanceStats = {
      invited: 0,
      confirmed: 0,
      attended: 0,
      absent: 0,
      total: attendees.length,
    }
    for (const a of attendees) {
      if (a.status in stats) {
        stats[a.status as keyof Omit<AttendanceStats, 'total'>]++
      }
    }
    return stats
  } catch (error) {
    console.error('Failed to get attendance stats:', error)
    return { invited: 0, confirmed: 0, attended: 0, absent: 0, total: 0 }
  }
}

export async function invitePeopleToEvent(eventId: number, personIds: number[]) {
  try {
    const existing = await prisma.eventAttendance.findMany({
      where: { eventId, personId: { in: personIds } },
      select: { personId: true },
    })
    const existingIds = new Set(existing.map((e) => e.personId))
    const newIds = personIds.filter((id) => !existingIds.has(id))

    if (newIds.length > 0) {
      await prisma.eventAttendance.createMany({
        data: newIds.map((personId) => ({
          eventId,
          personId,
          status: 'invited',
        })),
      })
    }

    revalidatePath('/events')
    return { success: true, added: newIds.length }
  } catch (error) {
    console.error('Failed to invite people:', error)
    return { error: 'Грешка при добавяне на участници.' }
  }
}

export async function updateAttendanceStatus(
  eventId: number,
  personId: number,
  status: AttendanceStatus
) {
  try {
    await prisma.eventAttendance.update({
      where: { eventId_personId: { eventId, personId } },
      data: { status },
    })
    revalidatePath('/events')
    return { success: true }
  } catch (error) {
    console.error('Failed to update attendance:', error)
    return { error: 'Грешка при обновяване на статус.' }
  }
}

export async function removeAttendee(eventId: number, personId: number) {
  try {
    await prisma.eventAttendance.delete({
      where: { eventId_personId: { eventId, personId } },
    })
    revalidatePath('/events')
    return { success: true }
  } catch (error) {
    console.error('Failed to remove attendee:', error)
    return { error: 'Грешка при премахване на участник.' }
  }
}
