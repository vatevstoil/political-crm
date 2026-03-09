'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const IdSchema = z.number().int().positive('Невалиден идентификатор')

const NoteSchema = z.object({
  content: z.string().min(1, 'Моля, въведете бележка'),
  personId: z.number().int().positive(),
})

export type CreateNoteState = {
  errors?: {
    content?: string[]
    personId?: string[]
  }
  message?: string | null
}

export async function createNote(
  personId: number,
  prevState: CreateNoteState,
  formData: FormData
): Promise<CreateNoteState> {
  const validatedFields = NoteSchema.safeParse({
    content: formData.get('content'),
    personId: personId,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Липсващи полета. Неуспешно създаване на бележка.',
    }
  }

  const { content } = validatedFields.data

  try {
    await prisma.note.create({
      data: {
        content,
        personId,
      },
    })
  } catch {
    return {
      message: 'Грешка в базата данни при създаване на бележка.',
    }
  }

  return { message: 'Бележката е създадена успешно.' }
}

export async function getNotes(personId: number) {
    const parsed = IdSchema.safeParse(personId)
    if (!parsed.success) return []

    try {
        const notes = await prisma.note.findMany({
            where: { personId },
            orderBy: { createdAt: 'desc' },
        })
        return notes
    } catch (error) {
        console.error('Failed to fetch notes:', error)
        throw new Error('Грешка при зареждане на бележките.')
    }
}

export async function updateNote(noteId: number, personId: number, content: string) {
    const parsedNote = IdSchema.safeParse(noteId)
    const parsedPerson = IdSchema.safeParse(personId)
    const parsedContent = z.string().min(1, 'Моля, въведете бележка').safeParse(content)
    if (!parsedNote.success || !parsedPerson.success || !parsedContent.success) {
      return { success: false, error: 'Невалидни параметри.' }
    }

    try {
        await prisma.note.update({
            where: { id: noteId },
            data: { content: parsedContent.data },
        })
        return { success: true }
    } catch (error) {
        console.error('Failed to update note:', error)
        return { success: false, error: 'Грешка при обновяване на бележката.' }
    }
}

export async function deleteNote(noteId: number, personId: number) {
    const parsedNote = IdSchema.safeParse(noteId)
    const parsedPerson = IdSchema.safeParse(personId)
    if (!parsedNote.success || !parsedPerson.success) {
      throw new Error('Невалидни параметри.')
    }

    try {
        await prisma.note.delete({
            where: { id: noteId },
        })
        return { message: 'Бележката е изтрита успешно.' }
    } catch (error) {
        console.error('Failed to delete note:', error)
        throw new Error('Грешка при изтриване на бележката.')
    }
}
