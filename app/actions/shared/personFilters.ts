import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type PersonFilterParams = {
  query?: string
  role?: string
  city?: string
  status?: string
  profession?: string
  gender?: string
  groupId?: string
  tagId?: string
}

const SEARCHABLE_FIELDS = [
  'fullName', 'membershipCardId', 'phone', 'email',
  'city', 'address', 'region', 'profession',
  'skills', 'employer', 'university', 'specialty',
] as const

/**
 * SQLite LIKE is case-insensitive only for ASCII (A-Z).
 * For Cyrillic/Unicode we fetch all records and filter in JS
 * where toLowerCase() handles Unicode correctly.
 */
async function findMatchingIds(query: string): Promise<number[]> {
  const select: Record<string, boolean> = { id: true }
  for (const f of SEARCHABLE_FIELDS) select[f] = true

  const people = await prisma.person.findMany({
    select: select as Prisma.PersonSelect,
  })

  const q = query.toLowerCase()
  return people
    .filter(p =>
      SEARCHABLE_FIELDS.some(field => {
        const val = (p as Record<string, unknown>)[field]
        return typeof val === 'string' && val.toLowerCase().includes(q)
      })
    )
    .map(p => p.id)
}

export async function buildPersonWhereClause(filters: PersonFilterParams): Promise<Prisma.PersonWhereInput> {
  return {
    AND: [
      filters.query
        ? { id: { in: await findMatchingIds(filters.query) } }
        : {},
      filters.role ? { role: { contains: filters.role } } : {},
      filters.city ? { city: { contains: filters.city } } : {},
      filters.status ? { status: { contains: filters.status } } : {},
      filters.profession ? { profession: { contains: filters.profession } } : {},
      filters.gender ? { gender: { contains: filters.gender } } : {},
      filters.groupId && !isNaN(Number(filters.groupId))
        ? { groupMemberships: { some: { groupId: parseInt(filters.groupId) } } }
        : {},
      filters.tagId && !isNaN(Number(filters.tagId))
        ? { tags: { some: { tagId: parseInt(filters.tagId) } } }
        : {},
    ],
  }
}
