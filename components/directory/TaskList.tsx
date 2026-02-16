'use client'

import { toggleTask, deleteTask } from '@/app/actions/tasks'
import { CheckCircle, Circle, Trash2, Calendar, TrendingUp } from 'lucide-react'

interface TaskAssignee {
  person: {
    id: number
    fullName: string
  }
}

interface TaskWithAssignees {
  id: number
  title: string
  description: string | null
  dueDate: Date | null
  isCompleted: boolean
  createdAt: Date
  assignees: TaskAssignee[]
}

interface TaskListProps {
  tasks: TaskWithAssignees[]
  personId: number
}

function formatDate(date: Date | null): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function isOverdue(date: Date | null): boolean {
  if (!date) return false
  return new Date(date) < new Date()
}

export default function TaskList({ tasks, personId }: TaskListProps) {
  const handleToggle = async (taskId: number) => {
    try {
      await toggleTask(taskId, personId)
    } catch (error) {
      console.error('Failed to toggle task:', error)
    }
  }

  const handleDelete = async (taskId: number) => {
    try {
      await deleteTask(taskId, personId)
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const completedCount = tasks.filter(t => t.isCompleted).length
  const totalCount = tasks.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const pendingCount = totalCount - completedCount
  const overdueCount = tasks.filter(t => !t.isCompleted && isOverdue(t.dueDate)).length

  if (tasks.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-blue-400" />
        </div>
        <p className="text-slate-600 font-medium">Няма задачи</p>
        <p className="text-sm text-slate-400 mt-1">Добави първата си задача по-долу</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Statistics Panel */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-slate-800">Прогрес</span>
          </div>
          <span className="text-2xl font-bold text-blue-600">{progress}%</span>
        </div>

        <div className="progress-bar-container h-2.5 mb-4">
          <div
            className="progress-bar-fill h-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="glass-card-hover p-2 rounded-lg">
            <p className="text-xl font-bold text-slate-700">{totalCount}</p>
            <p className="text-xs text-slate-500">Общо</p>
          </div>
          <div className="glass-card-hover p-2 rounded-lg">
            <p className="text-xl font-bold text-teal-600">{completedCount}</p>
            <p className="text-xs text-slate-500">Завършени</p>
          </div>
          <div className="glass-card-hover p-2 rounded-lg">
            <p className={`text-xl font-bold ${overdueCount > 0 ? 'text-red-500' : 'text-amber-500'}`}>
              {pendingCount}
            </p>
            <p className="text-xs text-slate-500">Предстоящи</p>
          </div>
        </div>

        {overdueCount > 0 && (
          <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-100">
            <p className="text-sm text-red-600 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {overdueCount} просрочени задачи
            </p>
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {tasks.map((task) => {
          const overdue = isOverdue(task.dueDate) && !task.isCompleted
          return (
            <div
              key={task.id}
              className={`glass-card glass-card-hover p-4 ${
                task.isCompleted ? 'task-completed' : overdue ? 'task-overdue' : 'task-pending'
              }`}
            >
              <div className="flex items-start justify-between">
                <button
                  onClick={() => handleToggle(task.id)}
                  className={`flex items-start gap-3 text-left flex-1 ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}
                >
                  {task.isCompleted ? (
                    <CheckCircle className="h-6 w-6 text-teal-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className={`h-6 w-6 flex-shrink-0 mt-0.5 ${overdue ? 'text-red-400' : 'text-amber-400'}`} />
                  )}
                  <div className="flex-1">
                    <span className={`font-medium block ${task.isCompleted ? 'line-through' : ''}`}>
                      {task.title}
                    </span>
                    {task.assignees.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.assignees.map(a => (
                          <span key={a.person.id} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100">
                            {a.person.fullName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>

                <div className="flex items-center gap-3 ml-3">
                  {task.dueDate && (
                    <span className={`text-sm flex items-center gap-1.5 ${overdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                      <Calendar className="h-4 w-4" />
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1 hover:bg-red-50 rounded-lg"
                    title="Изтрий задачата"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
