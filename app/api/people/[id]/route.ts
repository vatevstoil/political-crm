import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { logFieldChanges } from '@/app/actions/changelog'

const UpdatePersonSchema = z.object({
  fullName: z.string().min(2).optional(),
  fullNameEn: z.string().optional().or(z.literal('')).or(z.null()),
  role: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal('')).or(z.null()),
  phone: z.string().optional().or(z.null()),
  city: z.string().optional().or(z.null()),
  address: z.string().optional().or(z.null()),
  membershipCardId: z.string().optional().or(z.null()),
  status: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal('')).or(z.null()),
  socialFb: z.string().url().optional().or(z.literal('')).or(z.null()),
  socialInstagram: z.string().url().optional().or(z.literal('')).or(z.null()),
  socialLinkedin: z.string().url().optional().or(z.literal('')).or(z.null()),
  telegram: z.string().optional().or(z.null()),
  region: z.string().optional().or(z.null()),
  votingSection: z.string().optional().or(z.null()),
  birthDate: z.string().optional().or(z.literal('')).or(z.null()),
  gender: z.enum(['Male', 'Female', 'Other']).optional().or(z.literal('')).or(z.null()),
  profession: z.string().optional().or(z.null()),
  skills: z.string().optional().or(z.null()),
  votingMobile: z.string().optional().or(z.null()),
  pensioner: z.boolean().optional(),
  isRepresentative: z.boolean().optional(),
  isCommissionMember: z.boolean().optional(),
  disability: z.string().optional().or(z.null()),
  employer: z.string().optional().or(z.null()),
  university: z.string().optional().or(z.null()),
  specialty: z.string().optional().or(z.null()),
  egn: z.string().regex(/^\d{10}$/).optional().or(z.literal('')).or(z.null()),
  highlightColor: z.string().optional().or(z.literal('')).or(z.null()),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const personId = parseInt(id)

  if (isNaN(personId)) {
    return NextResponse.json({ error: 'Невалиден ID' }, { status: 400 })
  }

  try {
    const body = await request.json()
    
    const validatedFields = UpdatePersonSchema.safeParse(body)
    
    if (!validatedFields.success) {
      return NextResponse.json(
        { error: 'Невалидни данни', details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { data } = validatedFields
    
    // Fetch current values for change logging
    const current = await prisma.person.findUnique({ where: { id: personId } })
    if (!current) {
      return NextResponse.json({ error: 'Записът не е намерен' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue
      if (key === 'birthDate' && value && typeof value === 'string') {
        updateData[key] = new Date(value)
      } else if (value !== undefined) {
        updateData[key] = value
      }
    }

    const person = await prisma.person.update({
      where: { id: personId },
      data: updateData,
    })

    // Log changes
    const changes: { field: string; oldValue: string | null; newValue: string | null }[] = []
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue
      const oldVal = (current as Record<string, unknown>)[key]
      const oldStr = oldVal instanceof Date ? oldVal.toISOString().split('T')[0] : (oldVal != null ? String(oldVal) : null)
      const newStr = value != null && value !== '' ? String(value) : null
      if (oldStr !== newStr) {
        changes.push({ field: key, oldValue: oldStr, newValue: newStr })
      }
    }
    if (changes.length > 0) {
      await logFieldChanges(personId, changes).catch(console.error)
    }

    // Revalidate map when location fields change
    if ('city' in data || 'region' in data || 'address' in data) {
      revalidatePath('/map')
    }

    return NextResponse.json(person)
  } catch (error) {
    console.error('Failed to update person:', error)
    return NextResponse.json({ error: 'Грешка при обновяване' }, { status: 500 })
  }
}
