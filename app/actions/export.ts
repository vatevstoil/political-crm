'use server'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export type ExportPeopleParams = {
  query?: string
  role?: string
  city?: string
  status?: string
  profession?: string
  gender?: string
  groupId?: string
}

function escapeCSV(value: string | null | undefined): string {
  if (value === null || value === undefined) return ''
  const stringValue = String(value)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return ''
  return date.toISOString().split('T')[0]
}

export async function exportPeopleToCSV(filters: ExportPeopleParams): Promise<string> {
  const where: Prisma.PersonWhereInput = {
    AND: [
      filters.query
        ? {
            OR: [
              { fullName: { contains: filters.query } },
              { membershipCardId: { contains: filters.query } },
              { phone: { contains: filters.query } },
              { email: { contains: filters.query } },
              { city: { contains: filters.query } },
              { address: { contains: filters.query } },
              { region: { contains: filters.query } },
              { profession: { contains: filters.query } },
              { skills: { contains: filters.query } },
              { employer: { contains: filters.query } },
              { university: { contains: filters.query } },
              { specialty: { contains: filters.query } },
            ],
          }
        : {},
      filters.role ? { role: { contains: filters.role } } : {},
      filters.city ? { city: { contains: filters.city } } : {},
      filters.status ? { status: { contains: filters.status } } : {},
      filters.profession ? { profession: { contains: filters.profession } } : {},
      filters.gender ? { gender: { contains: filters.gender } } : {},
      filters.groupId ? { groupMemberships: { some: { groupId: parseInt(filters.groupId) } } } : {},
    ],
  }

  const people = await prisma.person.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  const headers = [
    'ID',
    'Име',
    'Имейл',
    'Телефон',
    'Град',
    'Адрес',
    'Роля',
    'Статус',
    'Професия',
    'Училище/Университет',
    'Специалност',
    'Работодател',
    'Умения',
    'Пол',
    'Дата на раждане',
    'Пенсионер',
    'Инвалидност',
    'Номер на карта',
    'Регион',
    'Секция за гласуване',
    'Facebook',
    'Instagram',
    'LinkedIn',
    'Мобилен за гласуване',
    'Снимка',
    'Дата на създаване',
  ]

  const rows = people.map(person => [
    escapeCSV(String(person.id)),
    escapeCSV(person.fullName),
    escapeCSV(person.email),
    escapeCSV(person.phone),
    escapeCSV(person.city),
    escapeCSV(person.address),
    escapeCSV(person.role),
    escapeCSV(person.status),
    escapeCSV(person.profession),
    escapeCSV(person.university),
    escapeCSV(person.specialty),
    escapeCSV(person.employer),
    escapeCSV(person.skills),
    escapeCSV(person.gender),
    formatDate(person.birthDate),
    escapeCSV(person.pensioner ? 'Да' : 'Не'),
    escapeCSV(person.disability),
    escapeCSV(person.membershipCardId),
    escapeCSV(person.region),
    escapeCSV(person.votingSection),
    escapeCSV(person.socialFb),
    escapeCSV(person.socialInstagram),
    escapeCSV(person.socialLinkedin),
    escapeCSV(person.votingMobile),
    escapeCSV(person.photoUrl),
    formatDate(person.createdAt),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')

  return csvContent
}
