'use server'

import { prisma } from '@/lib/prisma'

export type ChangeLogEntry = {
  id: number
  personId: number
  field: string
  oldValue: string | null
  newValue: string | null
  changedAt: Date
}

export async function logFieldChange(
  personId: number,
  field: string,
  oldValue: string | null,
  newValue: string | null
) {
  if (oldValue === newValue) return
  await prisma.changeLog.create({
    data: {
      personId,
      field,
      oldValue,
      newValue,
    },
  })
}

export async function logFieldChanges(
  personId: number,
  changes: { field: string; oldValue: string | null; newValue: string | null }[]
) {
  const filtered = changes.filter(c => c.oldValue !== c.newValue)
  if (filtered.length === 0) return

  await prisma.changeLog.createMany({
    data: filtered.map(c => ({
      personId,
      field: c.field,
      oldValue: c.oldValue,
      newValue: c.newValue,
    })),
  })
}

export async function getPersonChangeLogs(personId: number): Promise<ChangeLogEntry[]> {
  return await prisma.changeLog.findMany({
    where: { personId },
    orderBy: { changedAt: 'desc' },
    take: 50,
  })
}
