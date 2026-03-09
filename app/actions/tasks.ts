'use server'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const IdSchema = z.number().int().positive('Невалиден идентификатор')

const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Заглавието е задължително').max(200),
  dueDate: z.string().optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  assigneeIds: z.array(z.number().int().positive()).optional(),
})

export type CreateTaskState = {
  errors?: {
    title?: string[]
    priority?: string[]
    _form?: string[]
  }
  message?: string | null
}

export async function createTask(
  personId: number,
  prevState: CreateTaskState,
  formData: FormData
): Promise<CreateTaskState> {
  const validatedFields = CreateTaskSchema.safeParse({
    title: formData.get('title'),
    dueDate: formData.get('dueDate') || undefined,
    priority: formData.get('priority') || 'medium',
    assigneeIds: formData.getAll('assigneeIds').map(id => parseInt(id as string)).filter(id => !isNaN(id)),
  })
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Моля, поправете грешките във формата.',
    }
  }
  
  const { title, dueDate, priority, assigneeIds } = validatedFields.data

  try {
    await prisma.task.create({
      data: {
        title,
        description: null,
        assignedToId: personId,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority,
        assignees: {
          create: assigneeIds && assigneeIds.length > 0 
            ? assigneeIds.map(pid => ({ personId: pid }))
            : [{ personId }]
        }
      },
    })
  } catch (error) {
    console.error('Database Error:', error)
    return {
      message: 'Възникна грешка при създаването на задачата.',
    }
  }

  revalidatePath(`/directory/${personId}`)
  return { message: 'Задачата е създадена успешно.' }
}

export async function toggleTask(taskId: number, personId: number) {
  const parsedTask = IdSchema.safeParse(taskId)
  const parsedPerson = IdSchema.safeParse(personId)
  if (!parsedTask.success || !parsedPerson.success) {
    throw new Error('Невалидни параметри.')
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      throw new Error('Задачата не е намерена')
    }

    await prisma.task.update({
      where: { id: taskId },
      data: { isCompleted: !task.isCompleted },
    })

    revalidatePath(`/directory/${personId}`)
    return { message: 'Задачата е обновена.' }
  } catch (error) {
    console.error('Failed to toggle task:', error)
    throw new Error('Грешка при обновяване на задачата.')
  }
}

export async function deleteTask(taskId: number, personId: number) {
  const parsedTask = IdSchema.safeParse(taskId)
  const parsedPerson = IdSchema.safeParse(personId)
  if (!parsedTask.success || !parsedPerson.success) {
    throw new Error('Невалидни параметри.')
  }

  try {
    await prisma.task.delete({
      where: { id: taskId },
    })
    revalidatePath(`/directory/${personId}`)
    return { message: 'Задачата е изтрита.' }
  } catch (error) {
    console.error('Failed to delete task:', error)
    throw new Error('Грешка при изтриване на задачата.')
  }
}

export async function getTasks(personId: number) {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { assignedToId: personId },
          { assignees: { some: { personId } } }
        ]
      },
      include: {
        assignees: {
          include: {
            person: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
    return tasks
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    throw new Error('Грешка при зареждане на задачите.')
  }
}


export type TaskFilters = {
  status?: 'completed' | 'pending'
  priority?: 'low' | 'medium' | 'high'
  overdue?: boolean
}

export type TaskWithAssignees = {
  id: number
  title: string
  description: string | null
  priority: string
  dueDate: Date | null
  isCompleted: boolean
  createdAt: Date
  assignees: {
    person: {
      id: number
      fullName: string
    }
  }[]
}

export async function getTasksForDashboard(filters?: TaskFilters): Promise<TaskWithAssignees[]> {
  try {
    const where: Prisma.TaskWhereInput = {}

    if (filters?.status === 'completed') {
      where.isCompleted = true
    } else if (filters?.status === 'pending') {
      where.isCompleted = false
    }

    if (filters?.priority) {
      where.priority = filters.priority
    }

    if (filters?.overdue) {
      where.isCompleted = false
      where.dueDate = { lt: new Date() }
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignees: {
          include: {
            person: true
          }
        }
      },
      orderBy: [
        { isCompleted: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    })
    return tasks
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    throw new Error('Грешка при зареждане на задачите.')
  }
}

export type TaskStats = {
  total: number
  completed: number
  pending: number
  overdue: number
  byPriority: {
    low: number
    medium: number
    high: number
  }
}

export async function getTaskStats(): Promise<TaskStats> {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [allTasks, completedTasks, pendingTasks, overdueTasks, lowPriority, mediumPriority, highPriority] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { isCompleted: true } }),
      prisma.task.count({ where: { isCompleted: false } }),
      prisma.task.count({ where: { isCompleted: false, dueDate: { lt: today } } }),
      prisma.task.count({ where: { priority: 'low' } }),
      prisma.task.count({ where: { priority: 'medium' } }),
      prisma.task.count({ where: { priority: 'high' } }),
    ])

    return {
      total: allTasks,
      completed: completedTasks,
      pending: pendingTasks,
      overdue: overdueTasks,
      byPriority: {
        low: lowPriority,
        medium: mediumPriority,
        high: highPriority,
      }
    }
  } catch (error) {
    console.error('Failed to fetch task stats:', error)
    throw new Error('Грешка при зареждане на статистиката.')
  }
}

export async function getOverdueTasks(): Promise<TaskWithAssignees[]> {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tasks = await prisma.task.findMany({
      where: {
        isCompleted: false,
        dueDate: { lt: today },
      },
      include: {
        assignees: {
          include: {
            person: true
          }
        }
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    })
    return tasks
  } catch (error) {
    console.error('Failed to fetch overdue tasks:', error)
    throw new Error('Грешка при зареждане на просрочените задачи.')
  }
}

export async function getTasksDueSoon(days: number = 7): Promise<TaskWithAssignees[]> {
  try {
    const now = new Date()
    const future = new Date(now)
    future.setDate(now.getDate() + days)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const tasks = await prisma.task.findMany({
      where: {
        isCompleted: false,
        dueDate: {
          gte: todayStart,
          lte: future,
        },
      },
      include: {
        assignees: {
          include: {
            person: true
          }
        }
      },
      orderBy: { dueDate: 'asc' },
    })
    return tasks
  } catch (error) {
    console.error('Failed to fetch tasks due soon:', error)
    throw new Error('Грешка при зареждане на предстоящите задачи.')
  }
}
