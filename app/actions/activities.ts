'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const PersonIdSchema = z.number().int().positive('Невалиден идентификатор на лице')

const AddActivitySchema = z.object({
  personId: z.number().int().positive(),
  type: z.enum(['note', 'call', 'email', 'meeting', 'task']),
  content: z.string().min(1, 'Съдържанието е задължително').max(2000),
  dateStr: z.string().optional(),
})

export async function addActivity(personId: number, type: string, content: string, dateStr?: string) {
  const validatedFields = AddActivitySchema.safeParse({
    personId,
    type,
    content,
    dateStr,
  })
  
  if (!validatedFields.success) {
    return { 
      success: false, 
      error: 'Невалидни данни',
      details: validatedFields.error.flatten().fieldErrors 
    }
  }
  
  const { personId: pid, type: t, content: c, dateStr: ds } = validatedFields.data
  
  try {
    const date = ds ? new Date(ds) : new Date()
    
    await prisma.activityLog.create({
      data: {
        personId: pid,
        type: t,
        content: c,
        date
      }
    })
    
    return { success: true }
  } catch (error: unknown) {
    console.error('SERVER ERROR in addActivity:', error)
    return { success: false, error: 'Грешка при запис на активността' }
  }
}

export async function getActivities(personId: number) {
  const parsed = PersonIdSchema.safeParse(personId)
  if (!parsed.success) return []

  return await prisma.activityLog.findMany({
    where: { personId },
    orderBy: { date: 'desc' },
  })
}

export async function updateActivity(id: number, personId: number, content: string) {
  const parsedId = z.number().int().positive().safeParse(id)
  const parsedPersonId = PersonIdSchema.safeParse(personId)
  const parsedContent = z.string().min(1, 'Съдържанието е задължително').max(2000).safeParse(content)
  if (!parsedId.success || !parsedPersonId.success || !parsedContent.success) {
    return { success: false, error: 'Невалидни параметри' }
  }

  try {
    await prisma.activityLog.update({
      where: { id },
      data: { content: parsedContent.data }
    })
    return { success: true }
  } catch (error: unknown) {
    console.error('SERVER ERROR in updateActivity:', error)
    return { success: false, error: 'Грешка при обновяване на активността' }
  }
}

export async function deleteActivity(id: number, personId: number) {
  const parsedId = z.number().int().positive().safeParse(id)
  const parsedPersonId = PersonIdSchema.safeParse(personId)
  if (!parsedId.success || !parsedPersonId.success) {
    return { success: false, error: 'Невалидни параметри' }
  }

  try {
    await prisma.activityLog.delete({
      where: { id }
    })
    return { success: true }
  } catch (error: unknown) {
    console.error('SERVER ERROR in deleteActivity:', error)
    return { success: false, error: 'Грешка при изтриване на активността' }
  }
}
