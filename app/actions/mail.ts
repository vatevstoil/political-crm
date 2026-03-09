'use server'

import { sendTemplatedEmail } from '@/lib/mail'
import { prisma } from '@/lib/prisma'
import { addActivity } from '@/app/actions/activities'

export async function sendEmailAction(personId: number, subjectTemplate: string, bodyTemplate: string, fromEmail?: string) {
  try {
    const person = await prisma.person.findUnique({ where: { id: personId } })
    if (!person || !person.email) {
      throw new Error("Лицето няма въведен валиден имейл адрес.")
    }

    const data = {
      firstName: person.fullName.split(' ')[0],
      fullName: person.fullName,
      email: person.email,
      city: person.city || '',
      profession: person.profession || '',
    }

    await sendTemplatedEmail({
      to: person.email,
      subjectTemplate,
      bodyTemplate,
      data,
      fromEmail,
    })

    // Automatically log this action in the person's history
    await addActivity(
      personId,
      'email',
      `Изпратен имейл на ${person.email}\n\nТема: ${subjectTemplate}`
    )
    
    return { success: true }
  } catch (error: Error | unknown) {
    console.error('Failed to send email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Възникна грешка при изпращането на имейла.' 
    }
  }
}
