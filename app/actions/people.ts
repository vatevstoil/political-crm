'use server'

import { prisma } from '@/lib/prisma'
import { Person, Prisma } from '@prisma/client'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const CreatePersonSchema = z.object({
  fullName: z.string().min(2, 'Името трябва да е поне 2 символа'),
  role: z.string().min(1, 'Ролята е задължителна'),
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
  page?: number
  limit?: number
}

export type PeopleResponse = {
  people: Person[]
  total: number
  totalPages: number
  currentPage: number
}

export async function getPeople({
  query,
  role,
  city,
  status,
  profession,
  gender,
  groupId,
  page = 1,
  limit = 12,
}: GetPeopleParams): Promise<PeopleResponse> {
  const skip = (page - 1) * limit

  const where: Prisma.PersonWhereInput = {
    AND: [
      query
        ? {
            OR: [
              { fullName: { contains: query } },
              { membershipCardId: { contains: query } },
              { phone: { contains: query } },
              { email: { contains: query } },
              { city: { contains: query } },
              { address: { contains: query } },
              { region: { contains: query } },
              { profession: { contains: query } },
              { skills: { contains: query } },
              { employer: { contains: query } },
              { university: { contains: query } },
              { specialty: { contains: query } },
            ],
          }
        : {},
      role ? { role: { contains: role } } : {},
      city ? { city: { contains: city } } : {},
      status ? { status: { contains: status } } : {},
      profession ? { profession: { contains: profession } } : {},
      gender ? { gender: { contains: gender } } : {},
      groupId ? { groupMemberships: { some: { groupId: parseInt(groupId) } } } : {},
    ],
  }

  try {
    const [people, total] = await prisma.$transaction([
      prisma.person.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.person.count({ where }),
    ])

    return {
      people,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    }
  } catch (error) {
    console.error('Error fetching people:', error)
    throw new Error('Failed to fetch people')
  }
}

export async function createPerson(
  prevState: CreatePersonState,
  formData: FormData
): Promise<CreatePersonState> {
  const validatedFields = CreatePersonSchema.safeParse({
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
  })

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
        role: data.role,
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
  redirect('/directory')
}

export async function updatePerson(
  id: number,
  prevState: CreatePersonState,
  formData: FormData
): Promise<CreatePersonState> {
  const validatedFields = CreatePersonSchema.safeParse({
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
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Моля, поправете грешките във формата.',
    }
  }

  const { data } = validatedFields

  try {
    await prisma.person.update({
      where: { id },
      data: {
        fullName: data.fullName,
        role: data.role,
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
      message: 'Възникна грешка при обновяването на записа.',
    }
  }

  revalidatePath('/directory')
  redirect('/directory')
}

export async function deletePerson(id: number) {
  try {
    await prisma.person.delete({
      where: { id },
    })
    revalidatePath('/directory')
  } catch (error) {
    console.error('Failed to delete person:', error)
    throw new Error('Failed to delete person.')
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
