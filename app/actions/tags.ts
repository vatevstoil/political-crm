'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ActionResult } from '@/app/actions/shared/types'

const IdSchema = z.number().int().positive('Невалиден идентификатор')

const TagSchema = z.object({
  tagName: z.string().min(1, 'Името на тага е задължително').max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Невалиден цвят'),
})

export type TagWithCount = {
  id: number
  tagName: string
  color: string
  _count: {
    people: number
  }
}

export async function getTags(): Promise<TagWithCount[]> {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { tagName: 'asc' },
      include: {
        _count: {
          select: { people: true },
        },
      },
    })
    return tags
  } catch (error) {
    console.error('Failed to fetch tags:', error)
    throw new Error('Грешка при зареждане на таговете.')
  }
}

export async function createTag(tagName: string, color: string): Promise<ActionResult> {
  const validated = TagSchema.safeParse({ tagName, color })
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  try {
    await prisma.tag.create({
      data: {
        tagName: validated.data.tagName,
        color: validated.data.color,
      },
    })
    revalidatePath('/settings/tags')
    revalidatePath('/directory')
    return { success: true }
  } catch (error) {
    console.error('Failed to create tag:', error)
    return { success: false, error: 'Грешка при създаване на тага.' }
  }
}

export async function updateTag(id: number, tagName: string, color: string): Promise<ActionResult> {
  const parsedId = IdSchema.safeParse(id)
  if (!parsedId.success) return { success: false, error: 'Невалиден идентификатор.' }

  const validated = TagSchema.safeParse({ tagName, color })
  if (!validated.success) return { success: false, error: validated.error.issues[0].message }

  try {
    await prisma.tag.update({
      where: { id },
      data: {
        tagName: validated.data.tagName,
        color: validated.data.color,
      },
    })
    revalidatePath('/settings/tags')
    revalidatePath('/directory')
    return { success: true }
  } catch (error) {
    console.error('Failed to update tag:', error)
    return { success: false, error: 'Грешка при обновяване на тага.' }
  }
}

export async function deleteTag(id: number): Promise<ActionResult> {
  const parsedId = IdSchema.safeParse(id)
  if (!parsedId.success) return { success: false, error: 'Невалиден идентификатор.' }

  try {
    await prisma.tag.delete({ where: { id } })
    revalidatePath('/settings/tags')
    revalidatePath('/directory')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete tag:', error)
    return { success: false, error: 'Грешка при изтриване на тага.' }
  }
}

export async function addTagToPerson(personId: number, tagId: number): Promise<ActionResult> {
  const parsedPerson = IdSchema.safeParse(personId)
  const parsedTag = IdSchema.safeParse(tagId)
  if (!parsedPerson.success || !parsedTag.success) {
    return { success: false, error: 'Невалидни параметри.' }
  }

  try {
    await prisma.personTag.upsert({
      where: { personId_tagId: { personId, tagId } },
      update: {},
      create: { personId, tagId },
    })
    revalidatePath('/directory')
    return { success: true }
  } catch (error) {
    console.error('Failed to add tag to person:', error)
    return { success: false, error: 'Грешка при добавяне на тага.' }
  }
}

export async function removeTagFromPerson(personId: number, tagId: number): Promise<ActionResult> {
  const parsedPerson = IdSchema.safeParse(personId)
  const parsedTag = IdSchema.safeParse(tagId)
  if (!parsedPerson.success || !parsedTag.success) {
    return { success: false, error: 'Невалидни параметри.' }
  }

  try {
    await prisma.personTag.delete({
      where: { personId_tagId: { personId, tagId } },
    })
    revalidatePath('/directory')
    return { success: true }
  } catch (error) {
    console.error('Failed to remove tag from person:', error)
    return { success: false, error: 'Грешка при премахване на тага.' }
  }
}

export async function getPersonTags(personId: number) {
  const parsed = IdSchema.safeParse(personId)
  if (!parsed.success) return []

  try {
    const personTags = await prisma.personTag.findMany({
      where: { personId },
      include: { tag: true },
      orderBy: { tag: { tagName: 'asc' } },
    })
    return personTags.map(pt => pt.tag)
  } catch (error) {
    console.error('Failed to fetch person tags:', error)
    return []
  }
}
