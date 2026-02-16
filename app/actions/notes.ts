'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const NoteSchema = z.object({
  content: z.string().min(1, 'Please enter a note'),
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
      message: 'Missing Fields. Failed to Create Note.',
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
      message: 'Database Error: Failed to Create Note.',
    }
  }

  revalidatePath(`/directory/${personId}`)
  return { message: 'Note created successfully.' }
}

export async function getNotes(personId: number) {
    try {
        const notes = await prisma.note.findMany({
            where: { personId },
            orderBy: { createdAt: 'desc' },
        })
        return notes
    } catch (error) {
        console.error('Failed to fetch notes:', error)
        throw new Error('Failed to fetch notes.')
    }
}

export async function deleteNote(noteId: number, personId: number) {
    try {
        await prisma.note.delete({
            where: { id: noteId },
        })
        revalidatePath(`/directory/${personId}`)
        return { message: 'Note deleted successfully.' }
    } catch (error) {
        console.error('Failed to delete note:', error)
        throw new Error('Failed to delete note.')
    }
}
