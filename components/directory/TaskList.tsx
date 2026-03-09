'use client'

import { toggleTask, deleteTask, TaskWithAssignees } from '@/app/actions/tasks'
import { CheckCircle, Circle, Trash2, Calendar, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-green-100 text-green-700 border-green-200',
}

const priorityLabels: Record<string, string> = {
  high: 'Висока',
  medium: 'Средна',
  low: 'Ниска',
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
      toast.error('Грешка при зареждане')
    }
  }

  const handleDelete = async (taskId: number) => {
    try {
      await deleteTask(taskId, personId)
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Грешка при зареждане')
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
            <p className="text-lg font-bold text-slate-800">Няма задачи</p>
            <p className="text-base text-slate-600 mt-2">Добави първата си задача по-долу</p>
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
          <span className="text-3xl font-bold text-blue-600">{progress}%</span>
        </div>

        <div className="progress-bar-container h-2.5 mb-4">
          <div
            className="progress-bar-fill h-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="glass-card-hover p-3 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{totalCount}</p>
            <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">Общо</p>
          </div>
          <div className="glass-card-hover p-3 rounded-lg">
            <p className="text-2xl font-bold text-teal-600">{completedCount}</p>
            <p className="text-sm font-bold text-teal-700 uppercase tracking-wide">Завършени</p>
          </div>
          <div className="glass-card-hover p-3 rounded-lg">
            <p className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-600' : 'text-amber-600'}`}>
              {pendingCount}
            </p>
            <p className={`text-sm font-bold uppercase tracking-wide ${overdueCount > 0 ? 'text-red-700' : 'text-amber-700'}`}>Предстоящи</p>
          </div>
        </div>

        {overdueCount > 0 && (
          <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-base font-bold text-red-700 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
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
              className={`group glass-card glass-card-hover p-4 ${
                task.isCompleted ? 'task-completed' : overdue ? 'task-overdue' : 'task-pending'
              }`}
            >
              <div className="flex items-start justify-between">
                <button
                  onClick={() => handleToggle(task.id)}
                  className={`flex items-start gap-3 text-left flex-1 ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}
                >
                  {task.isCompleted ? (
                    <CheckCircle className="h-7 w-7 text-teal-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className={`h-7 w-7 flex-shrink-0 mt-0.5 ${overdue ? 'text-red-500' : 'text-amber-500'}`} />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-base font-bold block ${task.isCompleted ? 'line-through' : ''}`}>
                        {task.title}
                      </span>
                      <span className={`text-sm font-bold px-2.5 py-1 rounded-full border ${priorityColors[task.priority] || priorityColors.medium}`}>
                        {priorityLabels[task.priority] || 'Средна'}
                      </span>
                    </div>
                    {task.assignees.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {task.assignees.map(a => (
                          <span key={a.person.id} className="text-sm font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                            {a.person.fullName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>

                <div className="flex items-center gap-3 ml-3">
                  {task.dueDate && (
                    <span className={`text-base flex items-center gap-1.5 ${overdue ? 'text-red-600 font-bold' : 'text-slate-600 font-semibold'}`}>
                      {overdue && <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></span>}
                      <Calendar className="h-5 w-5" />
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
