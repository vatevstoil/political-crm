'use client'

import { AlertTriangle, Calendar } from 'lucide-react'

interface OverdueTask {
  id: number
  title: string
  dueDate: Date | null
  priority: string
  assignees: {
    person: {
      id: number
      fullName: string
    }
  }[]
}

interface UpcomingTask {
  id: number
  title: string
  dueDate: Date | null
  priority: string
  assignees: {
    person: {
      id: number
      fullName: string
    }
  }[]
}

function formatDate(date: Date | null): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit' })
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-green-100 text-green-700',
}

export function OverdueTasks({ tasks }: { tasks: OverdueTask[] }) {
  if (tasks.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <span className="font-medium text-gray-800">Просрочени задачи</span>
        <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full ml-auto">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-100"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-800 truncate">
                {task.title}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`}>
                {task.priority === 'high' ? 'Висока' : task.priority === 'medium' ? 'Средна' : 'Ниска'}
              </span>
            </div>
            <span className="text-xs text-red-500 flex items-center gap-1 flex-shrink-0 ml-2">
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function UpcomingTasks({ tasks }: { tasks: UpcomingTask[] }) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-gray-800">Задачи за тази седмица</span>
        </div>
        <p className="text-sm text-gray-500 text-center py-4">Няма задачи за тази седмица</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-5 w-5 text-blue-600" />
        <span className="font-medium text-gray-800">Задачи за тази седмица</span>
        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full ml-auto">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-800 truncate">
                {task.title}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`}>
                {task.priority === 'high' ? 'Висока' : task.priority === 'medium' ? 'Средна' : 'Ниска'}
              </span>
            </div>
            <span className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0 ml-2">
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
