'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { ActionResult } from '@/app/actions/shared/types'

const CreateReminderSchema = z.object({
  personId: z.number().int().positive(),
  title: z.string().min(1).max(200),
  dueDate: z.string().min(1),
  type: z.string().min(1).max(50),
  description: z.string().max(1000).optional(),
})

export type ReminderWithPerson = {
  id: number
  personId: number
  title: string
  description: string | null
  dueDate: Date
  type: string
  isCompleted: boolean
  createdAt: Date
  person: { id: number; fullName: string }
}

export async function createReminder(
  personId: number,
  title: string,
  dueDate: string,
  type: string = 'follow_up',
  description?: string | null
): Promise<ActionResult> {
  const parsed = CreateReminderSchema.safeParse({
    personId,
    title,
    dueDate,
    type,
    description: description || undefined,
  })
  if (!parsed.success) {
    return { success: false, error: 'Невалидни данни за напомняне.' }
  }

  try {
    await prisma.reminder.create({
      data: {
        personId: parsed.data.personId,
        title: parsed.data.title.trim(),
        description: parsed.data.description || null,
        dueDate: new Date(parsed.data.dueDate),
        type: parsed.data.type,
      },
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to create reminder:', error)
    return { success: false, error: 'Грешка при създаване на напомняне.' }
  }
}

export async function toggleReminder(id: number, personId: number): Promise<ActionResult> {
  try {
    const reminder = await prisma.reminder.findUnique({ where: { id } })
    if (!reminder) return { success: false, error: 'Напомнянето не е намерено.' }
    await prisma.reminder.update({
      where: { id },
      data: { isCompleted: !reminder.isCompleted },
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to toggle reminder:', error)
    return { success: false, error: 'Грешка при промяна на напомняне.' }
  }
}

export async function deleteReminder(id: number, personId: number): Promise<ActionResult> {
  try {
    await prisma.reminder.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    console.error('Failed to delete reminder:', error)
    return { success: false, error: 'Грешка при изтриване на напомняне.' }
  }
}

export async function getPersonReminders(personId: number) {
  try {
    return await prisma.reminder.findMany({
      where: { personId },
      orderBy: [{ isCompleted: 'asc' }, { dueDate: 'asc' }],
    })
  } catch (error) {
    console.error('Failed to get person reminders:', error)
    throw new Error('Грешка при зареждане на напомнянията.')
  }
}

export async function getUpcomingReminders(days: number = 7): Promise<ReminderWithPerson[]> {
  const now = new Date()
  const future = new Date()
  future.setDate(now.getDate() + days)

  try {
    return await prisma.reminder.findMany({
      where: {
        isCompleted: false,
        dueDate: { gte: now, lte: future },
      },
      include: {
        person: { select: { id: true, fullName: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    })
  } catch (error) {
    console.error('Failed to get upcoming reminders:', error)
    throw new Error('Грешка при зареждане на предстоящи напомняния.')
  }
}

export async function getOverdueReminders(): Promise<ReminderWithPerson[]> {
  try {
    return await prisma.reminder.findMany({
      where: {
        isCompleted: false,
        dueDate: { lt: new Date() },
      },
      include: {
        person: { select: { id: true, fullName: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    })
  } catch (error) {
    console.error('Failed to get overdue reminders:', error)
    throw new Error('Грешка при зареждане на просрочени напомняния.')
  }
}
