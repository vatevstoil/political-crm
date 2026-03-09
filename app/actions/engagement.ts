'use server'

import { prisma } from '@/lib/prisma'

export type PersonEngagement = {
  activitiesCount: number
  notesCount: number
  tasksCount: number
  completedTasksCount: number
  remindersCount: number
  eventsAttended: number
  groupsCount: number
  tagsCount: number
  relationsCount: number
  lastActivityDate: Date | null
  daysSinceLastActivity: number | null
  engagementScore: number
  engagementLevel: 'high' | 'medium' | 'low' | 'none'
}

const defaultEngagement: PersonEngagement = {
  activitiesCount: 0,
  notesCount: 0,
  tasksCount: 0,
  completedTasksCount: 0,
  remindersCount: 0,
  eventsAttended: 0,
  groupsCount: 0,
  tagsCount: 0,
  relationsCount: 0,
  lastActivityDate: null,
  daysSinceLastActivity: null,
  engagementScore: 0,
  engagementLevel: 'none',
}

export async function getPersonEngagement(personId: number): Promise<PersonEngagement> {
  if (!personId || personId < 1) return defaultEngagement

  const [person, completedTasksCount, lastActivity] = await Promise.all([
    prisma.person.findUnique({
      where: { id: personId },
      include: {
        _count: {
          select: {
            activityLogs: true,
            notes: true,
            taskAssignments: true,
            reminders: true,
            eventAttendances: true,
            groupMemberships: true,
            tags: true,
            relationsFrom: true,
            relationsTo: true,
          }
        }
      }
    }),
    prisma.task.count({ where: { assignees: { some: { personId } }, isCompleted: true } }),
    prisma.activityLog.findFirst({
      where: { personId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
  ])

  if (!person) return defaultEngagement

  const activitiesCount = person._count.activityLogs
  const notesCount = person._count.notes
  const tasksCount = person._count.taskAssignments
  const remindersCount = person._count.reminders
  const eventsAttended = person._count.eventAttendances
  const groupsCount = person._count.groupMemberships
  const tagsCount = person._count.tags
  const relationsCount = person._count.relationsFrom + person._count.relationsTo

  const lastActivityDate = lastActivity?.createdAt ?? null
  const daysSinceLastActivity = lastActivityDate
    ? Math.floor((Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Calculate engagement score (0-100)
  let score = 0
  score += Math.min(activitiesCount * 5, 25) // up to 25 pts for activities
  score += Math.min(notesCount * 3, 15) // up to 15 pts for notes
  score += Math.min(eventsAttended * 8, 20) // up to 20 pts for events
  score += Math.min(groupsCount * 5, 15) // up to 15 pts for groups
  score += Math.min(relationsCount * 3, 10) // up to 10 pts for relations
  score += Math.min(tagsCount * 2, 5) // up to 5 pts for tags

  // Recency bonus
  if (daysSinceLastActivity !== null) {
    if (daysSinceLastActivity <= 7) score += 10
    else if (daysSinceLastActivity <= 30) score += 5
  }

  score = Math.min(score, 100)

  const engagementLevel: PersonEngagement['engagementLevel'] =
    score >= 60 ? 'high' : score >= 30 ? 'medium' : score > 0 ? 'low' : 'none'

  return {
    activitiesCount,
    notesCount,
    tasksCount,
    completedTasksCount,
    remindersCount,
    eventsAttended,
    groupsCount,
    tagsCount,
    relationsCount,
    lastActivityDate,
    daysSinceLastActivity,
    engagementScore: score,
    engagementLevel,
  }
}
