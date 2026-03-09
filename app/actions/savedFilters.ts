'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateFilterSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().min(1).max(20),
  filters: z.record(z.string(), z.unknown()),
})

export interface FilterParams {
  query?: string
  city?: string
  role?: string
  status?: string
  profession?: string
  gender?: string
  groupId?: string
  tagId?: string
}

export interface SavedFilterWithId {
  id: number
  name: string
  color: string
  filters: FilterParams
  createdAt: Date
}

export async function getSavedFilters(): Promise<SavedFilterWithId[]> {
  try {
    const filters = await prisma.savedFilter.findMany({
      orderBy: { name: 'asc' },
    })
    return filters.map(f => ({
      ...f,
      filters: JSON.parse(f.filters) as FilterParams,
    }))
  } catch (error) {
    console.error('Failed to get saved filters:', error)
    throw new Error('Грешка при зареждане на запазените филтри.')
  }
}

export async function createSavedFilter(
  name: string,
  color: string,
  filters: FilterParams
): Promise<SavedFilterWithId> {
  const parsed = CreateFilterSchema.safeParse({ name, color, filters })
  if (!parsed.success) {
    throw new Error('Невалидни данни за филтър.')
  }

  try {
    const created = await prisma.savedFilter.create({
      data: {
        name: parsed.data.name.trim(),
        color: parsed.data.color,
        filters: JSON.stringify(parsed.data.filters),
      },
    })
    revalidatePath('/directory')
    return {
      ...created,
      filters: JSON.parse(created.filters) as FilterParams,
    }
  } catch (error) {
    console.error('Failed to create saved filter:', error)
    throw new Error('Грешка при създаване на филтър.')
  }
}

export async function updateSavedFilter(
  id: number,
  name: string,
  color: string,
  filters: FilterParams
): Promise<void> {
  const parsed = CreateFilterSchema.safeParse({ name, color, filters })
  if (!parsed.success) {
    throw new Error('Невалидни данни за филтър.')
  }

  try {
    await prisma.savedFilter.update({
      where: { id },
      data: {
        name: parsed.data.name.trim(),
        color: parsed.data.color,
        filters: JSON.stringify(parsed.data.filters),
      },
    })
    revalidatePath('/directory')
  } catch (error) {
    console.error('Failed to update saved filter:', error)
    throw new Error('Грешка при обновяване на филтър.')
  }
}

export async function deleteSavedFilter(id: number): Promise<void> {
  try {
    await prisma.savedFilter.delete({ where: { id } })
    revalidatePath('/directory')
  } catch (error) {
    console.error('Failed to delete saved filter:', error)
    throw new Error('Грешка при изтриване на филтър.')
  }
}
