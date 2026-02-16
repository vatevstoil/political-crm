'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function deletePeople(ids: number[]) {
  try {
    await prisma.person.deleteMany({
      where: {
        id: { in: ids },
      },
    })
    revalidatePath('/directory')
  } catch (error) {
    console.error('Failed to delete people:', error)
    throw new Error('Failed to delete people.')
  }
}

export async function updatePeopleStatus(ids: number[], status: string) {
  try {
    await prisma.person.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        status,
      },
    })
    revalidatePath('/directory')
  } catch (error) {
    console.error('Failed to update people status:', error)
    throw new Error('Failed to update people status.')
  }
}

export async function addPeopleToGroup(ids: number[], groupId: number) {
  try {
    const existingMembers = await prisma.groupMember.findMany({
      where: {
        groupId,
        personId: { in: ids },
      },
      select: { personId: true },
    })
    const existingIds = new Set(existingMembers.map(m => m.personId))
    const newMembers = ids.filter(id => !existingIds.has(id))
    
    if (newMembers.length > 0) {
      await prisma.groupMember.createMany({
        data: newMembers.map((personId) => ({
          groupId,
          personId,
        })),
      })
    }
    revalidatePath('/directory')
    revalidatePath('/groups')
  } catch (error) {
    console.error('Failed to add people to group:', error)
    throw new Error('Failed to add people to group.')
  }
}

export async function removePeopleFromGroup(ids: number[], groupId: number) {
  try {
    await prisma.groupMember.deleteMany({
      where: {
        groupId,
        personId: { in: ids },
      },
    })
    revalidatePath('/directory')
    revalidatePath('/groups')
  } catch (error) {
    console.error('Failed to remove people from group:', error)
    throw new Error('Failed to remove people from group.')
  }
}
