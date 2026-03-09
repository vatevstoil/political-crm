'use server'

import { prisma } from '@/lib/prisma'
import { sendTemplatedEmail } from '@/lib/mail'
import { revalidatePath } from 'next/cache'
import { buildPersonWhereClause } from '@/app/actions/shared/personFilters'
import { z } from 'zod'

const BulkEmailSchema = z.object({
  subject: z.string().min(1, 'Темата е задължителна'),
  body: z.string().min(1, 'Съдържанието е задължително'),
})

export type SegmentFilters = {
  query?: string
  role?: string
  city?: string
  status?: string
  profession?: string
  gender?: string
  groupId?: string
  tagId?: string
}

export type RecipientPreviewData = {
  total: number
  withEmail: number
  sample: { id: number; fullName: string; email: string | null }[]
}

export async function getSegmentRecipients(filters: SegmentFilters): Promise<RecipientPreviewData> {
  const where = await buildPersonWhereClause(filters)

  const people = await prisma.person.findMany({
    where,
    select: { id: true, fullName: true, email: true },
    orderBy: { fullName: 'asc' },
  })

  return {
    total: people.length,
    withEmail: people.filter(p => p.email).length,
    sample: people.slice(0, 10),
  }
}

export async function sendBulkEmail(
  filters: SegmentFilters,
  subject: string,
  body: string,
  templateName?: string
): Promise<{ success: boolean; sent: number; failed: number; error?: string }> {
  const validated = BulkEmailSchema.safeParse({ subject, body })
  if (!validated.success) {
    return { success: false, sent: 0, failed: 0, error: validated.error.issues[0].message }
  }

  try {
    const where = await buildPersonWhereClause(filters)

    const people = await prisma.person.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        city: true,
        profession: true,
        phone: true,
        role: true,
      },
    })

    const withEmail = people.filter(p => p.email)
    if (withEmail.length === 0) {
      return { success: false, sent: 0, failed: 0, error: 'Няма получатели с имейл адрес.' }
    }

    let sent = 0
    let failed = 0

    for (const person of withEmail) {
      try {
        const data = {
          firstName: person.fullName.split(' ')[0],
          fullName: person.fullName,
          email: person.email!,
          city: person.city || '',
          profession: person.profession || '',
          phone: person.phone || '',
          role: person.role || '',
        }

        await sendTemplatedEmail({
          to: person.email!,
          subjectTemplate: subject,
          bodyTemplate: body,
          data,
        })
        sent++
      } catch {
        failed++
      }
    }

    // Log the message
    await prisma.messageLog.create({
      data: {
        type: 'email',
        templateName: templateName || null,
        subject,
        body,
        recipientCount: sent,
        status: failed === 0 ? 'sent' : sent === 0 ? 'failed' : 'partial',
      },
    })

    revalidatePath('/messaging')
    return { success: true, sent, failed }
  } catch (error) {
    console.error('Bulk email failed:', error)
    return { success: false, sent: 0, failed: 0, error: 'Грешка при изпращане.' }
  }
}

export type MessageLogEntry = {
  id: number
  type: string
  templateName: string | null
  subject: string | null
  body: string
  recipientCount: number
  sentAt: Date
  status: string
}

export async function getMessageHistory(): Promise<MessageLogEntry[]> {
  return await prisma.messageLog.findMany({
    orderBy: { sentAt: 'desc' },
    take: 50,
  })
}
