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
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

export function OverdueTasks({ tasks }: { tasks: OverdueTask[] }) {
  if (tasks.length === 0) {
    return null
  }

  return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/50 p-4 border border-transparent dark:border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-base">Просрочени задачи</span>
          <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-sm font-semibold px-2.5 py-1 rounded-full ml-auto">
            {tasks.length}
          </span>
        </div>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-base font-semibold text-slate-800 dark:text-slate-200 truncate leading-snug">
                  {task.title}
                </span>
                <span className={`text-sm font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`}>
                  {task.priority === 'high' ? 'Висока' : task.priority === 'medium' ? 'Средна' : 'Ниска'}
                </span>
              </div>
              <span className="text-sm text-red-700 dark:text-red-400 font-medium flex items-center gap-1 flex-shrink-0 ml-2">
                <Calendar className="h-3.5 w-3.5" />
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
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/50 p-4 border border-transparent dark:border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-base">Задачи за тази седмица</span>
        </div>
        <p className="text-base text-slate-600 dark:text-slate-400 text-center py-4 leading-relaxed">Няма задачи за тази седмица</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/50 p-4 border border-transparent dark:border-slate-700">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <span className="font-semibold text-slate-800 dark:text-slate-200 text-base">Задачи за тази седмица</span>
        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-sm font-semibold px-2.5 py-1 rounded-full ml-auto">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-base font-semibold text-slate-800 dark:text-slate-200 truncate leading-snug">
                {task.title}
              </span>
              <span className={`text-sm font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`}>
                {task.priority === 'high' ? 'Висока' : task.priority === 'medium' ? 'Средна' : 'Ниска'}
              </span>
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1 flex-shrink-0 ml-2">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(task.dueDate)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
