'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const EmailTemplateSchema = z.object({
  name: z.string().min(1, 'Името е задължително').max(100),
  subject: z.string().min(1, 'Тема е задължителна').max(200),
  body: z.string().min(1, 'Съдържанието е задължително').max(10000),
})

const TelegramTemplateSchema = z.object({
  name: z.string().min(1, 'Името е задължително').max(100),
  message: z.string().min(1, 'Съобщението е задължително').max(4000),
})

const IdSchema = z.number().int().positive()

export async function getTemplates() {
  return await prisma.emailTemplate.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function getTelegramTemplates() {
  return await prisma.telegramTemplate.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function createTemplate(name: string, subject: string, body: string) {
  const validated = EmailTemplateSchema.safeParse({ name, subject, body })
  
  if (!validated.success) {
    throw new Error('Невалидни данни: ' + Object.values(validated.error.flatten().fieldErrors).flat().join(', '))
  }
  
  const template = await prisma.emailTemplate.create({
    data: validated.data
  })
  revalidatePath('/settings/templates')
  return template
}

export async function createTelegramTemplate(name: string, message: string) {
  const validated = TelegramTemplateSchema.safeParse({ name, message })
  
  if (!validated.success) {
    throw new Error('Невалидни данни: ' + Object.values(validated.error.flatten().fieldErrors).flat().join(', '))
  }
  
  const template = await prisma.telegramTemplate.create({
    data: validated.data
  })
  revalidatePath('/settings/templates')
  return template
}

export async function updateTemplate(id: number, name: string, subject: string, body: string) {
  if (!IdSchema.safeParse(id).success) {
    throw new Error('Невалиден ID')
  }
  
  const validated = EmailTemplateSchema.safeParse({ name, subject, body })
  
  if (!validated.success) {
    throw new Error('Невалидни данни')
  }
  
  await prisma.emailTemplate.update({
    where: { id },
    data: validated.data
  })
  revalidatePath('/settings/templates')
}

export async function updateTelegramTemplate(id: number, name: string, message: string) {
  if (!IdSchema.safeParse(id).success) {
    throw new Error('Невалиден ID')
  }
  
  const validated = TelegramTemplateSchema.safeParse({ name, message })
  
  if (!validated.success) {
    throw new Error('Невалидни данни')
  }
  
  await prisma.telegramTemplate.update({
    where: { id },
    data: validated.data
  })
  revalidatePath('/settings/templates')
}

export async function deleteTemplate(id: number) {
  if (!IdSchema.safeParse(id).success) {
    throw new Error('Невалиден ID')
  }
  
  await prisma.emailTemplate.delete({
    where: { id }
  })
  revalidatePath('/settings/templates')
}

export async function deleteTelegramTemplate(id: number) {
  if (!IdSchema.safeParse(id).success) {
    throw new Error('Невалиден ID')
  }
  
  await prisma.telegramTemplate.delete({
    where: { id }
  })
  revalidatePath('/settings/templates')
}
