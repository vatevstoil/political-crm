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

// Reverse description mapping for Bulgarian family/relation terms
const REVERSE_DESCRIPTIONS: Record<string, string> = {
  'Дъщеря': 'Родител',
  'Син': 'Родител',
  'Съпруга': 'Съпруг',
  'Съпруг': 'Съпруга',
  'Майка': 'Дете',
  'Баща': 'Дете',
  'Родител': 'Дете',
  'Дете': 'Родител',
  'Брат': 'Брат/Сестра',
  'Сестра': 'Брат/Сестра',
  'Брат/Сестра': 'Брат/Сестра',
  'Баба': 'Внук/Внучка',
  'Дядо': 'Внук/Внучка',
  'Внук': 'Баба/Дядо',
  'Внучка': 'Баба/Дядо',
  'Внук/Внучка': 'Баба/Дядо',
  'Баба/Дядо': 'Внук/Внучка',
  'Леля': 'Племенник/ца',
  'Чичо': 'Племенник/ца',
  'Племенник': 'Леля/Чичо',
  'Племенница': 'Леля/Чичо',
}

// Reverse type mapping (mentor is asymmetric)
const REVERSE_TYPES: Record<string, string> = {
  'mentor': 'mentor', // both sides keep same type
}

function getReverseDescription(desc: string | null | undefined): string | null {
  if (!desc) return null
  return REVERSE_DESCRIPTIONS[desc.trim()] || desc
}

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
    await prisma.$transaction(async (tx) => {
      // Create A → B
      await tx.personRelation.create({
        data: {
          personId: parsed.data.personId,
          relatedId: parsed.data.relatedId,
          type: parsed.data.type,
          description: parsed.data.description || null,
        },
      })

      // Auto-create reverse B → A (if it doesn't already exist)
      const existing = await tx.personRelation.findUnique({
        where: {
          personId_relatedId: {
            personId: parsed.data.relatedId,
            relatedId: parsed.data.personId,
          },
        },
      })
      if (!existing) {
        const reverseType = REVERSE_TYPES[parsed.data.type] || parsed.data.type
        const reverseDesc = getReverseDescription(parsed.data.description || null)
        await tx.personRelation.create({
          data: {
            personId: parsed.data.relatedId,
            relatedId: parsed.data.personId,
            type: reverseType,
            description: reverseDesc,
          },
        })
      }
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
    await prisma.$transaction(async (tx) => {
      // Find the relation to get personId/relatedId for reverse lookup
      const relation = await tx.personRelation.findUnique({
        where: { id: parsedId.data },
      })
      if (!relation) {
        throw new Error('Relation not found')
      }

      // Delete the original relation
      await tx.personRelation.delete({ where: { id: parsedId.data } })

      // Delete the reverse relation if it exists
      const reverse = await tx.personRelation.findUnique({
        where: {
          personId_relatedId: {
            personId: relation.relatedId,
            relatedId: relation.personId,
          },
        },
      })
      if (reverse) {
        await tx.personRelation.delete({ where: { id: reverse.id } })
      }
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to remove relation:', error)
    return { success: false, error: 'Грешка при премахване на връзка.' }
  }
}

export async function getPersonRelations(personId: number): Promise<PersonRelationWithDetails[]> {
  try {
    // Fetch relations where this person is the source (A → B)
    const relationsFrom = await prisma.personRelation.findMany({
      where: { personId },
      include: {
        related: {
          select: { id: true, fullName: true, photoUrl: true, city: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const fromResults: PersonRelationWithDetails[] = relationsFrom.map(r => ({
      id: r.id,
      personId: r.personId,
      relatedId: r.relatedId,
      type: r.type,
      description: r.description,
      createdAt: r.createdAt,
      related: r.related,
    }))

    // Also fetch relations where this person is the target (B → A)
    // This catches old one-directional relations that don't have a reverse record
    const relationsTo = await prisma.personRelation.findMany({
      where: { relatedId: personId },
      include: {
        person: {
          select: { id: true, fullName: true, photoUrl: true, city: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Only include "to" relations that don't already have a "from" counterpart
    const fromRelatedIds = new Set(fromResults.map(r => r.relatedId))
    const toResults: PersonRelationWithDetails[] = relationsTo
      .filter(r => !fromRelatedIds.has(r.personId))
      .map(r => ({
        id: r.id,
        personId: r.relatedId, // swap: current person is the "person"
        relatedId: r.personId,
        type: r.type,
        description: getReverseDescription(r.description),
        createdAt: r.createdAt,
        related: r.person, // the other person
      }))

    return [...fromResults, ...toResults]
  } catch (error) {
    console.error('Failed to get person relations:', error)
    throw new Error('Грешка при зареждане на връзките.')
  }
}
