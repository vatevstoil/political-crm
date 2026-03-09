'use server'

import { prisma } from '@/lib/prisma'
import { FRANCE_VOTING_SECTIONS } from '@/lib/votingSections'

export interface SectionPerson {
  id: number
  fullName: string
  phone: string | null
}

export interface SectionOverview {
  id: string
  label: string
  city: string
  representatives: SectionPerson[]
  commissionMembers: SectionPerson[]
  status: 'full' | 'partial' | 'empty'
}

export interface SectionsStats {
  totalSections: number
  coveredSections: number
  totalRepresentatives: number
  totalCommissionMembers: number
}

export interface SectionsData {
  sections: SectionOverview[]
  stats: SectionsStats
}

export async function getSectionsOverview(): Promise<SectionsData> {
  // Fetch all people assigned to a voting section who are representative or commission member
  const people = await prisma.person.findMany({
    where: {
      votingSection: { not: null },
      OR: [
        { isRepresentative: true },
        { isCommissionMember: true },
      ],
    },
    select: {
      id: true,
      fullName: true,
      phone: true,
      votingSection: true,
      isRepresentative: true,
      isCommissionMember: true,
    },
  })

  // Build a map: section label → { representatives, commissionMembers }
  const sectionMap = new Map<string, { representatives: SectionPerson[]; commissionMembers: SectionPerson[] }>()

  for (const p of people) {
    if (!p.votingSection) continue
    if (!sectionMap.has(p.votingSection)) {
      sectionMap.set(p.votingSection, { representatives: [], commissionMembers: [] })
    }
    const entry = sectionMap.get(p.votingSection)!
    const person: SectionPerson = { id: p.id, fullName: p.fullName, phone: p.phone }
    if (p.isRepresentative) entry.representatives.push(person)
    if (p.isCommissionMember) entry.commissionMembers.push(person)
  }

  let totalRepresentatives = 0
  let totalCommissionMembers = 0
  let coveredSections = 0

  const sections: SectionOverview[] = FRANCE_VOTING_SECTIONS.map(vs => {
    const entry = sectionMap.get(vs.label)
    const reps = entry?.representatives ?? []
    const cms = entry?.commissionMembers ?? []

    totalRepresentatives += reps.length
    totalCommissionMembers += cms.length

    const hasReps = reps.length > 0
    const hasCms = cms.length > 0
    let status: SectionOverview['status'] = 'empty'
    if (hasReps && hasCms) {
      status = 'full'
      coveredSections++
    } else if (hasReps || hasCms) {
      status = 'partial'
      coveredSections++
    }

    return {
      id: vs.id,
      label: vs.label,
      city: vs.city,
      representatives: reps,
      commissionMembers: cms,
      status,
    }
  })

  return {
    sections,
    stats: {
      totalSections: FRANCE_VOTING_SECTIONS.length,
      coveredSections,
      totalRepresentatives,
      totalCommissionMembers,
    },
  }
}
