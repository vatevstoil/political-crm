'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const DeletePeopleSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(100),
})

const UpdateStatusSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(100),
  status: z.enum(['Active', 'Inactive', 'Excluded', 'Lead', 'Prospect']),
})

const GroupActionSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(100),
  groupId: z.number().int().positive(),
})

export async function deletePeople(ids: number[]) {
  const validated = DeletePeopleSchema.safeParse({ ids })
  
  if (!validated.success) {
    throw new Error('Невалидни ID данни')
  }
  
  try {
    await prisma.person.deleteMany({
      where: {
        id: { in: validated.data.ids },
      },
    })
    revalidatePath('/directory')
  } catch (error) {
    console.error('Failed to delete people:', error)
    throw new Error('Грешка при изтриване на записи.')
  }
}

export async function updatePeopleStatus(ids: number[], status: string) {
  const validated = UpdateStatusSchema.safeParse({ ids, status })
  
  if (!validated.success) {
    throw new Error('Невалидни данни за статус')
  }
  
  try {
    await prisma.person.updateMany({
      where: {
        id: { in: validated.data.ids },
      },
      data: {
        status: validated.data.status,
      },
    })
    revalidatePath('/directory')
  } catch (error) {
    console.error('Failed to update people status:', error)
    throw new Error('Грешка при обновяване на статус.')
  }
}

export async function addPeopleToGroup(ids: number[], groupId: number) {
  const validated = GroupActionSchema.safeParse({ ids, groupId })
  
  if (!validated.success) {
    throw new Error('Невалидни данни')
  }
  
  const { ids: validIds, groupId: validGroupId } = validated.data
  
  try {
    const existingMembers = await prisma.groupMember.findMany({
      where: {
        groupId: validGroupId,
        personId: { in: validIds },
      },
      select: { personId: true },
    })
    const existingIds = new Set(existingMembers.map(m => m.personId))
    const newMembers = validIds.filter(id => !existingIds.has(id))
    
    if (newMembers.length > 0) {
      await prisma.groupMember.createMany({
        data: newMembers.map((personId) => ({
          groupId: validGroupId,
          personId,
        })),
      })
    }
    revalidatePath('/directory')
    revalidatePath('/groups')
  } catch (error) {
    console.error('Failed to add people to group:', error)
    throw new Error('Грешка при добавяне към група.')
  }
}

export async function removePeopleFromGroup(ids: number[], groupId: number) {
  const validated = GroupActionSchema.safeParse({ ids, groupId })
  
  if (!validated.success) {
    throw new Error('Невалидни данни')
  }
  
  const { ids: validIds, groupId: validGroupId } = validated.data
  
  try {
    await prisma.groupMember.deleteMany({
      where: {
        groupId: validGroupId,
        personId: { in: validIds },
      },
    })
    revalidatePath('/directory')
    revalidatePath('/groups')
  } catch (error) {
    console.error('Failed to remove people from group:', error)
    throw new Error('Грешка при премахване от група.')
  }
}
