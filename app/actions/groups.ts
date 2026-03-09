'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ActionResult } from '@/app/actions/shared/types'

const GroupSchema = z.object({
  name: z.string().min(1, 'Името е задължително'),
  color: z.string().default('#3B82F6'),
  description: z.string().optional(),
})

export type GroupWithMemberCount = {
  id: number
  name: string
  color: string
  description: string | null
  createdAt: Date
  _count: {
    members: number
  }
}

export type GroupMemberWithPerson = {
  groupId: number
  personId: number
  person: {
    id: number
    fullName: string
    role: string | null
    city: string | null
    phone: string | null
    email: string | null
    photoUrl: string | null
    status: string | null
    profession: string | null
    telegram: string | null
  }
}

export async function getGroups(): Promise<GroupWithMemberCount[]> {
  try {
    const groups = await prisma.group.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { members: true },
        },
      },
    })
    return groups
  } catch (error) {
    console.error('Failed to fetch groups:', error)
    throw new Error('Грешка при зареждане на групите.')
  }
}

export async function createGroup(
  name: string,
  color: string,
  description?: string
): Promise<ActionResult> {
  const validatedFields = GroupSchema.safeParse({
    name,
    color,
    description,
  })

  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.issues[0].message }
  }

  try {
    await prisma.group.create({
      data: {
        name: validatedFields.data.name,
        color: validatedFields.data.color,
        description: validatedFields.data.description || null,
      },
    })
  } catch (error) {
    console.error('Database Error:', error)
    return { success: false, error: 'Грешка при създаване на групата.' }
  }

  revalidatePath('/groups')
  revalidatePath('/directory')
  return { success: true }
}

export async function updateGroup(
  id: number,
  name: string,
  color: string,
  description?: string
): Promise<ActionResult> {
  const validatedFields = GroupSchema.safeParse({
    name,
    color,
    description,
  })

  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.issues[0].message }
  }

  try {
    await prisma.group.update({
      where: { id },
      data: {
        name: validatedFields.data.name,
        color: validatedFields.data.color,
        description: validatedFields.data.description || null,
      },
    })
  } catch (error) {
    console.error('Database Error:', error)
    return { success: false, error: 'Грешка при обновяване на групата.' }
  }

  revalidatePath('/groups')
  revalidatePath('/directory')
  return { success: true }
}

export async function deleteGroup(id: number): Promise<ActionResult> {
  try {
    await prisma.group.delete({
      where: { id },
    })
  } catch (error) {
    console.error('Failed to delete group:', error)
    return { success: false, error: 'Грешка при изтриване на групата.' }
  }

  revalidatePath('/groups')
  revalidatePath('/directory')
  return { success: true }
}

export async function getGroupMembers(groupId: number): Promise<GroupMemberWithPerson[]> {
  try {
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        person: {
          select: {
            id: true,
            fullName: true,
            role: true,
            city: true,
            phone: true,
            email: true,
            photoUrl: true,
            status: true,
            profession: true,
            telegram: true,
          },
        },
      },
      orderBy: {
        person: {
          fullName: 'asc',
        },
      },
    })
    return members
  } catch (error) {
    console.error('Failed to fetch group members:', error)
    throw new Error('Грешка при зареждане на членовете.')
  }
}

export async function addMemberToGroup(groupId: number, personId: number): Promise<ActionResult> {
  const parsedGroupId = z.number().int().positive().safeParse(groupId)
  const parsedPersonId = z.number().int().positive().safeParse(personId)
  if (!parsedGroupId.success || !parsedPersonId.success) {
    return { success: false, error: 'Невалидни параметри за група или лице.' }
  }

  try {
    await prisma.groupMember.upsert({
      where: {
        groupId_personId: { groupId, personId }
      },
      update: {},
      create: {
        groupId,
        personId,
      },
    })
  } catch (error) {
    console.error('Failed to add member to group:', error)
    return { success: false, error: 'Грешка при добавяне на член в групата.' }
  }

  revalidatePath('/groups')
  return { success: true }
}

export async function addMembersToGroup(groupId: number, personIds: number[]): Promise<ActionResult> {
  try {
    await Promise.all(
      personIds.map(personId =>
        prisma.groupMember.upsert({
          where: {
            groupId_personId: { groupId, personId }
          },
          create: {
            groupId,
            personId,
          },
          update: {},
        })
      )
    )
  } catch (error) {
    console.error('Failed to add members to group:', error)
    return { success: false, error: 'Грешка при добавяне на членове в групата.' }
  }

  revalidatePath('/groups')
  revalidatePath('/directory')
  return { success: true }
}

export async function removeMemberFromGroup(groupId: number, personId: number): Promise<ActionResult> {
  try {
    await prisma.groupMember.delete({
      where: {
        groupId_personId: {
          groupId,
          personId,
        },
      },
    })
  } catch (error) {
    console.error('Failed to remove member from group:', error)
    return { success: false, error: 'Грешка при премахване на член от групата.' }
  }

  revalidatePath('/groups')
  return { success: true }
}

export async function getPersonGroups(personId: number) {
  try {
    const memberships = await prisma.groupMember.findMany({
      where: { personId },
      include: {
        group: true,
      },
    })
    return memberships.map(m => m.group)
  } catch (error) {
    console.error('Failed to fetch person groups:', error)
    throw new Error('Грешка при зареждане на групите на лицето.')
  }
}

