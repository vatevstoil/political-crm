'use server'

import { prisma } from '@/lib/prisma'
import { Person } from '@prisma/client'

export type SearchResult = Person[]

export async function searchPeople(query: string): Promise<SearchResult> {
  if (!query || query.trim().length < 2) {
    return []
  }

  const searchTerm = query.trim().slice(0, 100)

  try {
    const results = await prisma.person.findMany({
      where: {
        OR: [
          { fullName: { contains: searchTerm } },
          { phone: { contains: searchTerm } },
          { membershipCardId: { contains: searchTerm } },
          { email: { contains: searchTerm } },
          { city: { contains: searchTerm } },
          { address: { contains: searchTerm } },
          { region: { contains: searchTerm } },
          { profession: { contains: searchTerm } },
          { skills: { contains: searchTerm } },
          { employer: { contains: searchTerm } },
          { university: { contains: searchTerm } },
          { specialty: { contains: searchTerm } },
          { votingSection: { contains: searchTerm } },
          { votingMobile: { contains: searchTerm } },
          { socialFb: { contains: searchTerm } },
          { socialInstagram: { contains: searchTerm } },
          { socialLinkedin: { contains: searchTerm } },
          { disability: { contains: searchTerm } },
        ],
      },
      take: 10,
      orderBy: { fullName: 'asc' },
    })

    return results
  } catch (error) {
    console.error('Error searching people:', error)
    return []
  }
}
