'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

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
    throw new Error('Failed to fetch groups.')
  }
}

export async function createGroup(
  name: string,
  color: string,
  description?: string
) {
  const validatedFields = GroupSchema.safeParse({
    name,
    color,
    description,
  })

  if (!validatedFields.success) {
    throw new Error(validatedFields.error.issues[0].message)
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
    throw new Error('Възникна грешка при създаването на групата.')
  }

  revalidatePath('/groups')
  revalidatePath('/directory')
}

export async function updateGroup(
  id: number,
  name: string,
  color: string,
  description?: string
) {
  const validatedFields = GroupSchema.safeParse({
    name,
    color,
    description,
  })

  if (!validatedFields.success) {
    throw new Error(validatedFields.error.issues[0].message)
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
    throw new Error('Възникна грешка при обновяването на групата.')
  }

  revalidatePath('/groups')
  revalidatePath('/directory')
}

export async function deleteGroup(id: number) {
  try {
    await prisma.group.delete({
      where: { id },
    })
  } catch (error) {
    console.error('Failed to delete group:', error)
    throw new Error('Възникна грешка при изтриването.')
  }

  revalidatePath('/groups')
  revalidatePath('/directory')
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
    throw new Error('Failed to fetch group members.')
  }
}

export async function addMemberToGroup(groupId: number, personId: number) {
  try {
    await prisma.groupMember.create({
      data: {
        groupId,
        personId,
      },
    })
  } catch (error) {
    console.error('Failed to add member to group:', error)
    throw new Error('Възникна грешка при добавянето на член в групата.')
  }

  revalidatePath('/groups')
}

export async function removeMemberFromGroup(groupId: number, personId: number) {
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
    throw new Error('Възникна грешка при премахването на член от групата.')
  }

  revalidatePath('/groups')
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
    throw new Error('Failed to fetch person groups.')
  }
}

export async function getAllPeople() {
  try {
    const people = await prisma.person.findMany({
      orderBy: { fullName: 'asc' },
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
      },
    })
    return people
  } catch (error) {
    console.error('Failed to fetch people:', error)
    throw new Error('Failed to fetch people.')
  }
}
