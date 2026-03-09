'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type DuplicatePair = {
  person1: {
    id: number
    fullName: string
    email: string | null
    phone: string | null
    city: string | null
    role: string | null
    status: string | null
    createdAt: Date
  }
  person2: {
    id: number
    fullName: string
    email: string | null
    phone: string | null
    city: string | null
    role: string | null
    status: string | null
    createdAt: Date
  }
  matchType: 'name' | 'email' | 'phone'
  similarity: number
}

function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ')
}

function nameSimilarity(a: string, b: string): number {
  const na = normalizeName(a)
  const nb = normalizeName(b)
  if (na === nb) return 1

  const wordsA = na.split(' ')
  const wordsB = nb.split(' ')

  let matches = 0
  for (const wa of wordsA) {
    for (const wb of wordsB) {
      if (wa === wb) {
        matches++
        break
      }
    }
  }

  const maxWords = Math.max(wordsA.length, wordsB.length)
  return matches / maxWords
}

export async function findDuplicates(): Promise<DuplicatePair[]> {
  try {
    const people = await prisma.person.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        city: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { fullName: 'asc' },
      take: 1000,
    })

    const duplicates: DuplicatePair[] = []
    const seen = new Set<string>()

    // Check email duplicates
    const emailMap = new Map<string, typeof people>()
    for (const p of people) {
      if (p.email) {
        const key = p.email.toLowerCase()
        if (!emailMap.has(key)) emailMap.set(key, [])
        emailMap.get(key)!.push(p)
      }
    }
    for (const [, group] of emailMap) {
      if (group.length > 1) {
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const pairKey = `${Math.min(group[i].id, group[j].id)}-${Math.max(group[i].id, group[j].id)}`
            if (!seen.has(pairKey)) {
              seen.add(pairKey)
              duplicates.push({
                person1: group[i],
                person2: group[j],
                matchType: 'email',
                similarity: 1,
              })
            }
          }
        }
      }
    }

    // Check phone duplicates
    const phoneMap = new Map<string, typeof people>()
    for (const p of people) {
      if (p.phone) {
        const key = p.phone.replace(/[\s\-()]/g, '')
        if (!phoneMap.has(key)) phoneMap.set(key, [])
        phoneMap.get(key)!.push(p)
      }
    }
    for (const [, group] of phoneMap) {
      if (group.length > 1) {
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const pairKey = `${Math.min(group[i].id, group[j].id)}-${Math.max(group[i].id, group[j].id)}`
            if (!seen.has(pairKey)) {
              seen.add(pairKey)
              duplicates.push({
                person1: group[i],
                person2: group[j],
                matchType: 'phone',
                similarity: 1,
              })
            }
          }
        }
      }
    }

    // Check name similarity (>= 80%)
    for (let i = 0; i < people.length; i++) {
      for (let j = i + 1; j < people.length; j++) {
        const pairKey = `${people[i].id}-${people[j].id}`
        if (seen.has(pairKey)) continue

        const sim = nameSimilarity(people[i].fullName, people[j].fullName)
        if (sim >= 0.8) {
          seen.add(pairKey)
          duplicates.push({
            person1: people[i],
            person2: people[j],
            matchType: 'name',
            similarity: sim,
          })
        }
      }
    }

    return duplicates.sort((a, b) => b.similarity - a.similarity)
  } catch (error) {
    console.error('Failed to find duplicates:', error)
    throw new Error('Грешка при търсене на дубликати.')
  }
}

export async function mergePeople(keepId: number, removeId: number) {
  try {
    await prisma.$transaction(async (tx) => {
      // Transfer group memberships
      const existingGroups = await tx.groupMember.findMany({
        where: { personId: keepId },
        select: { groupId: true },
      })
      const existingGroupIds = new Set(existingGroups.map(g => g.groupId))

      const groupsToTransfer = await tx.groupMember.findMany({
        where: { personId: removeId },
      })
      for (const gm of groupsToTransfer) {
        if (!existingGroupIds.has(gm.groupId)) {
          await tx.groupMember.create({
            data: { groupId: gm.groupId, personId: keepId },
          })
        }
      }
      await tx.groupMember.deleteMany({ where: { personId: removeId } })

      // Transfer tags
      const existingTags = await tx.personTag.findMany({
        where: { personId: keepId },
        select: { tagId: true },
      })
      const existingTagIds = new Set(existingTags.map(t => t.tagId))

      const tagsToTransfer = await tx.personTag.findMany({
        where: { personId: removeId },
      })
      for (const pt of tagsToTransfer) {
        if (!existingTagIds.has(pt.tagId)) {
          await tx.personTag.create({
            data: { tagId: pt.tagId, personId: keepId },
          })
        }
      }
      await tx.personTag.deleteMany({ where: { personId: removeId } })

      // Transfer activities
      await tx.activityLog.updateMany({
        where: { personId: removeId },
        data: { personId: keepId },
      })

      // Transfer notes
      await tx.note.updateMany({
        where: { personId: removeId },
        data: { personId: keepId },
      })

      // Transfer task assignments
      const existingAssignments = await tx.taskAssignee.findMany({
        where: { personId: keepId },
        select: { taskId: true },
      })
      const existingTaskIds = new Set(existingAssignments.map((a: { taskId: number }) => a.taskId))

      const assignmentsToTransfer = await tx.taskAssignee.findMany({
        where: { personId: removeId },
      })
      for (const ta of assignmentsToTransfer) {
        if (!existingTaskIds.has(ta.taskId)) {
          await tx.taskAssignee.create({
            data: { taskId: ta.taskId, personId: keepId },
          })
        }
      }
      await tx.taskAssignee.deleteMany({ where: { personId: removeId } })

      // Transfer event attendances
      const existingAttendances = await tx.eventAttendance.findMany({
        where: { personId: keepId },
        select: { eventId: true },
      })
      const existingEventIds = new Set(existingAttendances.map((a: { eventId: number }) => a.eventId))

      const attendancesToTransfer = await tx.eventAttendance.findMany({
        where: { personId: removeId },
      })
      for (const ea of attendancesToTransfer) {
        if (!existingEventIds.has(ea.eventId)) {
          await tx.eventAttendance.create({
            data: { eventId: ea.eventId, personId: keepId, status: ea.status },
          })
        }
      }
      await tx.eventAttendance.deleteMany({ where: { personId: removeId } })

      // Transfer reminders
      await tx.reminder.updateMany({
        where: { personId: removeId },
        data: { personId: keepId },
      })

      // Transfer person relations (from)
      const existingRelationsFrom = await tx.personRelation.findMany({
        where: { personId: keepId },
        select: { relatedId: true },
      })
      const existingRelFromIds = new Set(existingRelationsFrom.map((r: { relatedId: number }) => r.relatedId))
      const relationsToTransfer = await tx.personRelation.findMany({
        where: { personId: removeId },
      })
      for (const rel of relationsToTransfer) {
        if (!existingRelFromIds.has(rel.relatedId) && rel.relatedId !== keepId) {
          await tx.personRelation.create({
            data: { personId: keepId, relatedId: rel.relatedId, type: rel.type, description: rel.description },
          })
        }
      }
      await tx.personRelation.deleteMany({ where: { personId: removeId } })
      // Also delete relations pointing TO the removed person
      await tx.personRelation.deleteMany({ where: { relatedId: removeId } })

      // Transfer change logs
      await tx.changeLog.updateMany({
        where: { personId: removeId },
        data: { personId: keepId },
      })

      // Update tasks assigned to removed person
      await tx.task.updateMany({
        where: { assignedToId: removeId },
        data: { assignedToId: keepId },
      })

      // Delete the duplicate
      await tx.person.delete({ where: { id: removeId } })
    })

    revalidatePath('/directory')
    revalidatePath('/settings/duplicates')
    return { success: true }
  } catch (error) {
    console.error('Failed to merge people:', error)
    throw new Error('Грешка при обединяване на записите.')
  }
}
