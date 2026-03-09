'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { ActionResult } from '@/app/actions/shared/types'

const AddRelationSchema = z.object({
  personId: z.number().int().positive(),
  relatedId: z.number().int().positive(),
  type: z.enum(['family', 'colleague', 'referral', 'mentor', 'neighbor', 'party']),
  description: z.string().max(500).optional(),
})

export type PersonRelationWithDetails = {
  id: number
  personId: number
  relatedId: number
  type: string
  description: string | null
  createdAt: Date
  related: {
    id: number
    fullName: string
    photoUrl: string | null
    city: string | null
    role: string | null
  }
}

export async function addRelation(
  personId: number,
  relatedId: number,
  type: string,
  description?: string | null
): Promise<ActionResult> {
  const parsed = AddRelationSchema.safeParse({ personId, relatedId, type, description: description || undefined })
  if (!parsed.success) {
    return { success: false, error: 'Невалидни данни за връзка.' }
  }

  if (parsed.data.personId === parsed.data.relatedId) {
    return { success: false, error: 'Не може да се създаде връзка на лице със себе си.' }
  }

  try {
    await prisma.personRelation.create({
      data: {
        personId: parsed.data.personId,
        relatedId: parsed.data.relatedId,
        type: parsed.data.type,
        description: parsed.data.description || null,
      },
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to add relation:', error)
    return { success: false, error: 'Грешка при добавяне на връзка.' }
  }
}

export async function removeRelation(id: number, personId: number): Promise<ActionResult> {
  const parsedId = z.number().int().positive().safeParse(id)
  const parsedPersonId = z.number().int().positive().safeParse(personId)
  if (!parsedId.success || !parsedPersonId.success) {
    return { success: false, error: 'Невалидни параметри.' }
  }

  try {
    await prisma.personRelation.delete({ where: { id: parsedId.data } })
    return { success: true }
  } catch (error) {
    console.error('Failed to remove relation:', error)
    return { success: false, error: 'Грешка при премахване на връзка.' }
  }
}

export async function getPersonRelations(personId: number): Promise<PersonRelationWithDetails[]> {
  try {
    const relationsFrom = await prisma.personRelation.findMany({
      where: { personId },
      include: {
        related: {
          select: { id: true, fullName: true, photoUrl: true, city: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return relationsFrom.map(r => ({
      id: r.id,
      personId: r.personId,
      relatedId: r.relatedId,
      type: r.type,
      description: r.description,
      createdAt: r.createdAt,
      related: r.related,
    }))
  } catch (error) {
    console.error('Failed to get person relations:', error)
    throw new Error('Грешка при зареждане на връзките.')
  }
}
