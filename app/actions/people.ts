'use server'

import { prisma } from '@/lib/prisma'
import { Person } from '@prisma/client'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { logFieldChanges } from '@/app/actions/changelog'
import { buildPersonWhereClause } from '@/app/actions/shared/personFilters'

const CreatePersonSchema = z.object({
  fullName: z.string().min(2, 'Името трябва да е поне 2 символа'),
  role: z.string().optional().or(z.literal('')),
  email: z.string().email('Невалиден имейл').optional().or(z.literal('')),
  phone: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  membershipCardId: z.string().optional(),
  status: z.string().default('Active'),
  photoUrl: z.string().url('Невалиден URL').optional().or(z.literal('')),
  
  // Socials
  socialFb: z.string().url('Невалиден Facebook URL').optional().or(z.literal('')),
  socialInstagram: z.string().url('Невалиден Instagram URL').optional().or(z.literal('')),
  socialLinkedin: z.string().url('Невалиден LinkedIn URL').optional().or(z.literal('')),
  
  // Extended Location
  region: z.string().optional(),
  votingSection: z.string().optional(),
  
  // Demographics
  birthDate: z.string().optional().or(z.literal('')), // Will parse to Date or null later
  gender: z.enum(['Male', 'Female', 'Other']).optional().or(z.literal('')),
  
  // Profession
  profession: z.string().optional(),
  skills: z.string().optional(),
  
  // Additional fields
  votingMobile: z.string().optional(),
  pensioner: z.boolean().optional(),
  disability: z.string().optional(),
  employer: z.string().optional(),
  university: z.string().optional(),
  specialty: z.string().optional(),
})

export type CreatePersonState = {
  errors?: {
    fullName?: string[]
    role?: string[]
    email?: string[]
    phone?: string[]
    city?: string[] 
    address?: string[]
    membershipCardId?: string[]
    photoUrl?: string[]
    socialFb?: string[]
    socialInstagram?: string[]
    socialLinkedin?: string[]
    region?: string[]
    votingSection?: string[]
    birthDate?: string[]
    gender?: string[]
    profession?: string[]
    skills?: string[]
    votingMobile?: string[]
    pensioner?: string[]
    disability?: string[]
    employer?: string[]
    university?: string[]
    specialty?: string[]
    _form?: string[]
  }
  message?: string | null
}

export type GetPeopleParams = {
  query?: string
  role?: string
  city?: string
  status?: string
  profession?: string
  gender?: string
  groupId?: string
  tagId?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type PeopleResponse = {
  people: Person[]
  total: number
  totalPages: number
  currentPage: number
}

export type PersonWithTags = Person & {
  tags: { tag: { id: number; tagName: string; color: string } }[]
  _count?: { groupMemberships: number; activityLogs: number }
}

export type PeopleWithTagsResponse = {
  people: PersonWithTags[]
  total: number
  totalPages: number
  currentPage: number
}

function parsePersonFormData(formData: FormData) {
  return {
    fullName: formData.get('fullName'),
    role: formData.get('role'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    city: formData.get('city'),
    address: formData.get('address'),
    membershipCardId: formData.get('membershipCardId'),
    photoUrl: formData.get('photoUrl'),
    status: formData.get('status') || 'Active',
    socialFb: formData.get('socialFb'),
    socialInstagram: formData.get('socialInstagram'),
    socialLinkedin: formData.get('socialLinkedin'),
    region: formData.get('region'),
    votingSection: formData.get('votingSection'),
    birthDate: formData.get('birthDate'),
    gender: formData.get('gender'),
    profession: formData.get('profession'),
    skills: formData.get('skills'),
    votingMobile: formData.get('votingMobile'),
    pensioner: formData.get('pensioner') === 'on',
    disability: formData.get('disability'),
    employer: formData.get('employer'),
    university: formData.get('university'),
    specialty: formData.get('specialty'),
  }
}

const SORTABLE_FIELDS = new Set([
  'fullName', 'membershipCardId', 'role', 'city', 'phone', 'email', 'status', 'createdAt',
  'isRepresentative', 'isCommissionMember',
])

export async function getPeople({
  query,
  role,
  city,
  status,
  profession,
  gender,
  groupId,
  tagId,
  page = 1,
  limit = 12,
  sortBy,
  sortOrder = 'asc',
}: GetPeopleParams): Promise<PeopleWithTagsResponse> {
  const skip = (page - 1) * limit

  const where = await buildPersonWhereClause({ query, role, city, status, profession, gender, groupId, tagId })

  const orderField = sortBy && SORTABLE_FIELDS.has(sortBy) ? sortBy : 'createdAt'
  const orderDir = sortOrder === 'asc' ? 'asc' : 'desc'

  try {
    const [people, total] = await prisma.$transaction([
      prisma.person.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderField]: orderDir },
        include: {
          tags: {
            include: {
              tag: {
                select: { id: true, tagName: true, color: true },
              },
            },
          },
          _count: {
            select: { groupMemberships: true, activityLogs: true },
          },
        },
      }),
      prisma.person.count({ where }),
    ])

    return {
      people: people as PersonWithTags[],
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    }
  } catch (error) {
    console.error('Error fetching people:', error)
    throw new Error('Грешка при зареждане на хората.')
  }
}

export async function createPerson(
  prevState: CreatePersonState,
  formData: FormData
): Promise<CreatePersonState> {
  const validatedFields = CreatePersonSchema.safeParse(parsePersonFormData(formData))

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Моля, поправете грешките във формата.',
    }
  }

  const { data } = validatedFields

  try {
    await prisma.person.create({
      data: {
        fullName: data.fullName,
        role: data.role || null,
        email: data.email || null,
        phone: data.phone || null,
        city: data.city || null,
        address: data.address || null,
        membershipCardId: data.membershipCardId || null,
        status: data.status,
        photoUrl: data.photoUrl || null,
        socialFb: data.socialFb || null,
        socialInstagram: data.socialInstagram || null,
        socialLinkedin: data.socialLinkedin || null,
        region: data.region || null,
        votingSection: data.votingSection || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        gender: data.gender || null,
        profession: data.profession || null,
        skills: data.skills || null,
        votingMobile: data.votingMobile || null,
        pensioner: data.pensioner || false,
        disability: data.disability || null,
        employer: data.employer || null,
        university: data.university || null,
        specialty: data.specialty || null,
      },
    })
  } catch (error) {
    console.error('Database Error:', error)
    return {
      message: 'Възникна грешка при създаването на записа.',
    }
  }

  revalidatePath('/directory')
  revalidatePath('/')
  redirect('/directory')
}

export async function updatePerson(
  id: number,
  prevState: CreatePersonState,
  formData: FormData
): Promise<CreatePersonState> {
  const validatedFields = CreatePersonSchema.safeParse(parsePersonFormData(formData))

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Моля, поправете грешките във формата.',
    }
  }

  const { data } = validatedFields

  try {
    // Fetch current for change logging
    const current = await prisma.person.findUnique({ where: { id } })

    const newData = {
      fullName: data.fullName,
      role: data.role || null,
      email: data.email || null,
      phone: data.phone || null,
      city: data.city || null,
      address: data.address || null,
      membershipCardId: data.membershipCardId || null,
      status: data.status,
      photoUrl: data.photoUrl || null,
      socialFb: data.socialFb || null,
      socialInstagram: data.socialInstagram || null,
      socialLinkedin: data.socialLinkedin || null,
      region: data.region || null,
      votingSection: data.votingSection || null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      gender: data.gender || null,
      profession: data.profession || null,
      skills: data.skills || null,
      votingMobile: data.votingMobile || null,
      pensioner: data.pensioner || false,
      disability: data.disability || null,
      employer: data.employer || null,
      university: data.university || null,
      specialty: data.specialty || null,
    }

    await prisma.person.update({
      where: { id },
      data: newData,
    })

    // Log changes
    if (current) {
      const changes: { field: string; oldValue: string | null; newValue: string | null }[] = []
      const trackFields = [
        'fullName', 'role', 'email', 'phone', 'city', 'address', 'membershipCardId',
        'status', 'region', 'votingSection', 'gender', 'profession', 'skills',
        'votingMobile', 'disability', 'employer', 'university', 'specialty', 'egn',
      ]
      for (const field of trackFields) {
        const oldVal = (current as Record<string, unknown>)[field]
        const newVal = (newData as Record<string, unknown>)[field]
        const oldStr = oldVal != null ? String(oldVal) : null
        const newStr = newVal != null ? String(newVal) : null
        if (oldStr !== newStr) {
          changes.push({ field, oldValue: oldStr, newValue: newStr })
        }
      }
      // birthDate special handling
      const oldBd = current.birthDate ? current.birthDate.toISOString().split('T')[0] : null
      const newBd = newData.birthDate ? newData.birthDate.toISOString().split('T')[0] : null
      if (oldBd !== newBd) {
        changes.push({ field: 'birthDate', oldValue: oldBd, newValue: newBd })
      }
      if (changes.length > 0) {
        await logFieldChanges(id, changes).catch(console.error)
      }
    }
  } catch (error) {
    console.error('Database Error:', error)
    return {
      message: 'Възникна грешка при обновяването на записа.',
    }
  }

  revalidatePath('/directory')
  revalidatePath(`/directory/${id}`)
  revalidatePath('/')
  redirect(`/directory/${id}`)
}

export async function deletePerson(id: number) {
  try {
    await prisma.person.delete({
      where: { id },
    })
    revalidatePath('/directory')
  } catch (error) {
    console.error('Failed to delete person:', error)
    throw new Error('Грешка при изтриване на записа.')
  }
}

export async function getUniqueCities() {
  try {
    const cities = await prisma.person.groupBy({
      by: ['city'],
      where: { city: { not: null } },
      orderBy: { city: 'asc' },
    })
    return cities.filter(c => c.city).map(c => c.city as string)
  } catch (error) {
    console.error('Failed to get cities:', error)
    return []
  }
}

export async function getUniqueProfessions() {
  try {
    const professions = await prisma.person.groupBy({
      by: ['profession'],
      where: { profession: { not: null } },
      orderBy: { profession: 'asc' },
    })
    return professions.filter(p => p.profession).map(p => p.profession as string)
  } catch (error) {
    console.error('Failed to get professions:', error)
    return []
  }
}

export async function getUniqueRoles() {
  try {
    const roles = await prisma.person.groupBy({
      by: ['role'],
      where: { role: { not: null } },
      orderBy: { role: 'asc' },
    })
    return roles.filter(r => r.role).map(r => r.role as string)
  } catch (error) {
    console.error('Failed to get roles:', error)
    return []
  }
}

export async function exportPeople(params: GetPeopleParams = {}) {
  const where = await buildPersonWhereClause(params)

  try {
    const people = await prisma.person.findMany({
      where,
      orderBy: { fullName: 'asc' },
    })

    return people
  } catch (error) {
    console.error('Failed to export people:', error)
    return []
  }
}

export async function exportPeopleByIds(ids: number[]) {
  try {
    const people = await prisma.person.findMany({
      where: { id: { in: ids } },
      orderBy: { fullName: 'asc' },
    })
    return people
  } catch (error) {
    console.error('Failed to export people by IDs:', error)
    return []
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
        telegram: true,
      },
    })
    return people
  } catch (error) {
    console.error('Failed to fetch people:', error)
    throw new Error('Грешка при зареждане на хората.')
  }
}

export async function importPeople(data: Record<string, unknown>[]) {
  if (data.length > 500) {
    throw new Error('Максимум 500 записа на импорт')
  }

  try {
    const validPeople = data.map(row => {
      const fName = String(row['Име'] || row['Имена'] || row['firstName'] || row['fullName'] || '')
      const lName = String(row['Фамилия'] || row['lastName'] || '')
      const fullName = String(lName ? `${fName} ${lName}` : fName).trim()

      return {
        fullName,
        phone: row['Телефон'] || row['phone'] ? String(row['Телефон'] || row['phone']) : null,
        email: row['Имейл'] || row['email'] ? String(row['Имейл'] || row['email']) : null,
        city: row['Град'] || row['city'] ? String(row['Град'] || row['city']) : null,
        region: row['Област'] || row['region'] ? String(row['Област'] || row['region']) : null,
        role: String(row['Роля'] || row['role'] || 'Симпатизант'),
        status: String(row['Статус'] || row['status'] || 'Active'),
        gender: row['Пол'] || row['gender'] ? String(row['Пол'] || row['gender']) : null,
        profession: row['Професия'] || row['profession'] ? String(row['Професия'] || row['profession']) : null,
      }
    }).filter(p => p.fullName.length > 0)

    if (validPeople.length === 0) {
      throw new Error('Няма намерени валидни записи за импорт.')
    }

    const BATCH_SIZE = 50
    for (let i = 0; i < validPeople.length; i += BATCH_SIZE) {
      const batch = validPeople.slice(i, i + BATCH_SIZE)
      await prisma.$transaction(
        batch.map(p => p.email
          ? prisma.person.upsert({ where: { email: p.email }, update: p, create: p })
          : prisma.person.create({ data: p })
        )
      )
    }

    revalidatePath('/directory')
    return { success: true, count: validPeople.length }
  } catch (error: unknown) {
    console.error('Import failed:', error)
    throw new Error(error instanceof Error ? error.message : 'Възникна грешка при импорта.')
  }
}
