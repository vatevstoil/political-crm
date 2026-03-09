'use server'

import { prisma } from '@/lib/prisma'
import { buildPersonWhereClause } from '@/app/actions/shared/personFilters'

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
  const where = await buildPersonWhereClause(filters)

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
    escapeCSV(formatDate(person.birthDate)),
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
    escapeCSV(formatDate(person.createdAt)),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')

  return csvContent
}
