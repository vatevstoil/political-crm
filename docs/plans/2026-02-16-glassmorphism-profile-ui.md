# Glassmorphism Profile UI - План за Имплементация

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Подобряване на UI-а на профилните страници с glassmorphism дизайн, като се даде по-голяма видимост на модулите за задачи и бележки.

**Architecture:** Реорганизация на страницата с профил - информацията за лицето отива в компактен sidebar, а задачите и бележките заемат централна позиция с пълношироки glassmorphism панели. Добавят се прогрес барове, статистика и подобрени форми.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide React

---

## Task 1: Добавяне на Glassmorphism CSS Utility Classes

**Files:**
- Modify: `app/globals.css`

**Step 1: Добавяне на glassmorphism стилове в globals.css**

Добави следните CSS класове в края на файла:

```css
/* Glassmorphism Utility Classes */
.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  box-shadow: 
    0 8px 32px 0 rgba(31, 38, 135, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.6);
}

.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(31, 38, 135, 0.08);
}

.glass-card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card-hover:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(31, 38, 135, 0.12);
}

.glass-input {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
}

.glass-input:focus {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.03),
    0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

.glass-button {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(31, 38, 135, 0.08);
  transition: all 0.2s ease;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(31, 38, 135, 0.12);
  transform: translateY(-1px);
}

.glass-button-primary {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  transition: all 0.2s ease;
}

.glass-button-primary:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 1) 0%, rgba(139, 92, 246, 1) 100%);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.glass-timeline-item {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(31, 38, 135, 0.06);
}

/* Progress Bar Styles */
.progress-bar-container {
  background: rgba(229, 231, 235, 0.6);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar-fill {
  background: linear-gradient(90deg, #14B8A6 0%, #3B82F6 100%);
  border-radius: 999px;
  transition: width 0.5s ease;
}

/* Task Status Styles */
.task-completed {
  background: rgba(20, 184, 166, 0.1);
  border-left: 3px solid #14B8A6;
}

.task-pending {
  background: rgba(245, 158, 11, 0.1);
  border-left: 3px solid #F59E0B;
}

.task-overdue {
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #EF4444;
}
```

**Step 2: Проверка на build**

Run: `npm run build`
Expected: Build успешен без грешки

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add glassmorphism CSS utility classes"
```

---

## Task 2: Подобряване на TaskList компонент

**Files:**
- Modify: `components/directory/TaskList.tsx`

**Step 1: Рефакториране на TaskList с glassmorphism и статистика**

Замени цялото съдържание на файла:

```typescript
'use client'

import { toggleTask, deleteTask } from '@/app/actions/tasks'
import { CheckCircle, Circle, Trash2, Clock, TrendingUp, Calendar } from 'lucide-react'

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
              <Clock className="h-4 w-4 mr-1" />
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
```

**Step 2: Проверка на build**

Run: `npm run build`
Expected: Build успешен

**Step 3: Commit**

```bash
git add components/directory/TaskList.tsx
git commit -m "feat: redesign TaskList with glassmorphism and statistics"
```

---

## Task 3: Подобряване на NoteForm компонент

**Files:**
- Modify: `components/directory/NoteForm.tsx`

**Step 1: Рефакториране на NoteForm с glassmorphism стил**

Замени цялото съдържание:

```typescript
'use client'

import { useState, useRef } from 'react'
import { createNote } from '@/app/actions/notes'
import { Send, MessageSquare } from 'lucide-react'

export default function NoteForm({ personId }: { personId: number }) {
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    setMessage(null)
    setError(null)
    
    try {
      const result = await createNote(personId, { message: null, errors: {} }, formData)
      if (result.message?.includes('success')) {
        setMessage(result.message)
        formRef.current?.reset()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setError(result.message || 'Грешка при създаване на бележка')
      }
    } catch {
      setError('Възникна грешка')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-white" />
        </div>
        <h4 className="font-semibold text-slate-800">Нова бележка</h4>
      </div>
      
      <div className="relative">
        <textarea
          rows={3}
          name="content"
          className="glass-input w-full px-4 py-3 text-slate-700 placeholder:text-slate-400 resize-none"
          placeholder="Напиши бележка..."
          required
        />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex-1">
          {message && (
            <span className="text-sm text-teal-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {message}
            </span>
          )}
          {error && (
            <span className="text-sm text-red-500 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {error}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="glass-button-primary px-4 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Запазване...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Добави</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
```

**Step 2: Проверка на build**

Run: `npm run build`
Expected: Build успешен

**Step 3: Commit**

```bash
git add components/directory/NoteForm.tsx
git commit -m "feat: redesign NoteForm with glassmorphism style"
```

---

## Task 4: Подобряване на TaskForm компонент

**Files:**
- Modify: `components/directory/TaskForm.tsx`

**Step 1: Рефакториране на TaskForm с glassmorphism стил**

Замени цялото съдържание:

```typescript
'use client'

import { useState, useRef, useEffect } from 'react'
import { createTask, getAllPeople } from '@/app/actions/tasks'
import { Plus, Calendar, Users, X, CheckSquare } from 'lucide-react'

interface Person {
  id: number
  fullName: string
  role: string | null
  city: string | null
}

interface TaskFormProps {
  personId: number
}

export default function TaskForm({ personId }: TaskFormProps) {
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAssignees, setShowAssignees] = useState(false)
  const [people, setPeople] = useState<Person[]>([])
  const [selectedAssignees, setSelectedAssignees] = useState<number[]>([personId])
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    getAllPeople().then(setPeople).catch(console.error)
  }, [])

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    setMessage(null)
    setError(null)
    
    selectedAssignees.forEach(id => {
      formData.append('assigneeIds', id.toString())
    })

    try {
      const result = await createTask(personId, { message: null, errors: {} }, formData)
      if (result.message?.includes('успешно')) {
        setMessage(result.message)
        formRef.current?.reset()
        setSelectedAssignees([personId])
        setShowAssignees(false)
        setTimeout(() => setMessage(null), 3000)
      } else {
        setError(result.message || 'Грешка')
      }
    } catch (e) {
      setError('Възникна грешка')
    } finally {
      setIsPending(false)
    }
  }

  const toggleAssignee = (id: number) => {
    setSelectedAssignees(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    )
  }

  return (
    <form ref={formRef} action={handleSubmit} className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
          <CheckSquare className="h-4 w-4 text-white" />
        </div>
        <h4 className="font-semibold text-slate-800">Нова задача</h4>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          name="title"
          placeholder="Заглавие на задачата..."
          className="glass-input w-full px-4 py-2.5 text-slate-700 placeholder:text-slate-400"
          required
        />
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="date"
              name="dueDate"
              className="glass-input w-full pl-10 pr-4 py-2.5 text-slate-600"
            />
          </div>
          
          <button
            type="button"
            onClick={() => setShowAssignees(!showAssignees)}
            className={`glass-button px-3 py-2 flex items-center gap-2 ${
              showAssignees ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <Users className="h-4 w-4 text-slate-600" />
            <span className="text-sm text-slate-600">{selectedAssignees.length}</span>
          </button>
          
          <button
            type="submit"
            disabled={isPending}
            className="glass-button-primary px-4 py-2 flex items-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span>Добави</span>
          </button>
        </div>
      </div>

      {showAssignees && (
        <div className="mt-3 glass-card p-3 max-h-48 overflow-y-auto">
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide font-medium">Избери отговорници</p>
          <div className="space-y-1">
            {people.map(person => (
              <label
                key={person.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedAssignees.includes(person.id)}
                  onChange={() => toggleAssignee(person.id)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="text-sm text-slate-700">{person.fullName}</span>
                  {person.role && (
                    <span className="text-xs text-slate-400 ml-2">({person.role})</span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3">
        {message && (
          <span className="text-sm text-teal-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {message}
          </span>
        )}
        {error && (
          <span className="text-sm text-red-500 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {error}
          </span>
        )}
      </div>
    </form>
  )
}
```

**Step 2: Проверка на build**

Run: `npm run build`
Expected: Build успешен

**Step 3: Commit**

```bash
git add components/directory/TaskForm.tsx
git commit -m "feat: redesign TaskForm with glassmorphism style"
```

---

## Task 5: Подобряване на Timeline компонент

**Files:**
- Modify: `components/directory/Timeline.tsx`

**Step 1: Рефакториране на Timeline с подобрени бележки**

Замени цялото съдържание:

```typescript
'use client'

import { Note } from '@prisma/client'
import { MessageSquare, Trash2, ClipboardList, StickyNote } from 'lucide-react'
import { deleteNote } from '@/app/actions/notes'
import TaskList from './TaskList'

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

interface TimelineProps {
  notes: Note[]
  tasks: TaskWithAssignees[]
  personId: number
}

export default function Timeline({ notes, tasks, personId }: TimelineProps) {
  const handleDeleteNote = async (noteId: number) => {
    try {
      await deleteNote(noteId, personId)
      window.location.reload()
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tasks Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
            <ClipboardList className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Задачи</h3>
          <span className="ml-auto text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
        <TaskList tasks={tasks} personId={personId} />
      </div>

      {/* Notes Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <StickyNote className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Бележки</h3>
          <span className="ml-auto text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            {notes.length}
          </span>
        </div>
        
        {notes.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-blue-400" />
            </div>
            <p className="text-slate-600 font-medium">Няма бележки</p>
            <p className="text-sm text-slate-400 mt-1">Добави първата си бележка по-горе</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="glass-timeline-item p-4 group relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-500 rounded-l-lg" />
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center text-xs text-slate-400">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mr-2">
                      <MessageSquare className="h-3 w-3 text-blue-500" />
                    </div>
                    <time>
                      {new Date(note.createdAt).toLocaleDateString('bg-BG', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </time>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-2 hover:bg-red-50 rounded-lg"
                    title="Изтрий бележката"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Проверка на build**

Run: `npm run build`
Expected: Build успешен

**Step 3: Commit**

```bash
git add components/directory/Timeline.tsx
git commit -m "feat: redesign Timeline with glassmorphism style"
```

---

## Task 6: Реорганизация на Person Profile страницата

**Files:**
- Modify: `app/directory/[id]/page.tsx`

**Step 1: Реорганизиране на layout-а - Sidebar + Central Hub**

Замени цялото съдържание на страницата:

```typescript
import { prisma } from '@/lib/prisma'
import BackButton from '@/components/common/BackButton'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { 
  Edit2, MapPin, Phone, Mail, Calendar, Briefcase, 
  CreditCard, Facebook, Linkedin, Instagram, Users, Hash, Map, Activity
} from 'lucide-react'
import { getNotes } from '@/app/actions/notes'
import { getTasks } from '@/app/actions/tasks'
import Timeline from '@/components/directory/Timeline'
import NoteForm from '@/components/directory/NoteForm'
import TaskForm from '@/components/directory/TaskForm'

interface PersonPageProps {
  params: Promise<{ id: string }>
}

const DisplayField = ({ label, value, icon: Icon }: { label: string, value: string | null | undefined, icon?: any }) => {
  if (!value) return null
  return (
    <div className="flex items-start space-x-3 mb-3">
      {Icon && <Icon className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm text-slate-700 break-words">{value}</p>
      </div>
    </div>
  )
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { id } = await params
  const personId = parseInt(id)

  if (isNaN(personId)) {
    notFound()
  }

  const person = await prisma.person.findUnique({
    where: { id: personId },
  })
  
  const notes = await getNotes(personId)
  const tasks = await getTasks(personId)

  if (!person) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-purple-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <div className="mb-6">
          <BackButton href="/directory" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar - Person Info */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Profile Card */}
            <div className="glass-panel p-6">
              {/* Avatar and Name */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {person.photoUrl ? (
                    <div className="h-24 w-24 rounded-full border-4 border-white shadow-lg relative overflow-hidden mx-auto">
                      <Image 
                        src={person.photoUrl} 
                        alt={person.fullName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-24 w-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mx-auto">
                      <Users className="h-10 w-10 text-white" />
                    </div>
                  )}
                  <div className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white ${
                    person.status === 'Active' ? 'bg-teal-500' : 'bg-slate-400'
                  }`} />
                </div>
                
                <h1 className="mt-4 text-xl font-bold text-slate-900">{person.fullName}</h1>
                
                <div className="flex justify-center gap-2 mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm">
                    {person.role}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    person.status === 'Active' 
                      ? 'bg-teal-100 text-teal-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {person.status === 'Active' ? 'Активен' : 'Неактивен'}
                  </span>
                </div>
                
                {person.membershipCardId && (
                  <p className="mt-2 text-sm text-slate-500 font-mono">
                    Карта №: {person.membershipCardId}
                  </p>
                )}
              </div>

              {/* Edit Button */}
              <Link
                href={`/directory/${person.id}/edit`}
                className="glass-button w-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-slate-700"
              >
                <Edit2 className="h-4 w-4" />
                Редактирай профил
              </Link>
            </div>

            {/* Contact Info Card */}
            <div className="glass-panel p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Mail className="h-3 w-3 text-blue-600" />
                </div>
                Контакти
              </h3>
              <DisplayField label="Имейл" value={person.email} icon={Mail} />
              <DisplayField label="Телефон" value={person.phone} icon={Phone} />
              
              {(person.socialFb || person.socialInstagram || person.socialLinkedin) && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-3">Социални Мрежи</p>
                  <div className="flex space-x-3">
                    {person.socialFb && (
                      <a href={person.socialFb} target="_blank" rel="noopener noreferrer" 
                         className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors">
                        <Facebook className="h-4 w-4 text-blue-600" />
                      </a>
                    )}
                    {person.socialInstagram && (
                      <a href={person.socialInstagram} target="_blank" rel="noopener noreferrer"
                         className="w-9 h-9 rounded-lg bg-pink-50 flex items-center justify-center hover:bg-pink-100 transition-colors">
                        <Instagram className="h-4 w-4 text-pink-600" />
                      </a>
                    )}
                    {person.socialLinkedin && (
                      <a href={person.socialLinkedin} target="_blank" rel="noopener noreferrer"
                         className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors">
                        <Linkedin className="h-4 w-4 text-blue-700" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Location Card */}
            <div className="glass-panel p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                  <MapPin className="h-3 w-3 text-purple-600" />
                </div>
                Локация
              </h3>
              <DisplayField label="Област" value={person.region} icon={Map} />
              <DisplayField label="Град/Село" value={person.city} icon={MapPin} />
              <DisplayField label="Адрес" value={person.address} />
            </div>

            {/* Voting Info Card */}
            <div className="glass-panel p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Hash className="h-3 w-3 text-teal-600" />
                </div>
                Избори
              </h3>
              <DisplayField label="Секция" value={person.votingSection} icon={Hash} />
              <DisplayField label="Мобилна Урна" value={person.votingMobile} icon={Phone} />
            </div>

            {/* Personal Info Card */}
            <div className="glass-panel p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Calendar className="h-3 w-3 text-amber-600" />
                </div>
                Лични Данни
              </h3>
              <DisplayField 
                label="Дата на раждане" 
                value={person.birthDate ? new Date(person.birthDate).toLocaleDateString('bg-BG') : null} 
                icon={Calendar} 
              />
              <DisplayField 
                label="Пол" 
                value={person.gender === 'Male' ? 'Мъж' : person.gender === 'Female' ? 'Жена' : person.gender} 
              />
              {person.pensioner && (
                <div className="flex items-center space-x-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    Пенсионер
                  </span>
                </div>
              )}
              <DisplayField label="ТЕЛК / Увреждане" value={person.disability} />
            </div>

            {/* Work Info Card */}
            <div className="glass-panel p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Briefcase className="h-3 w-3 text-emerald-600" />
                </div>
                Образование и Работа
              </h3>
              <DisplayField label="Професия" value={person.profession} icon={Briefcase} />
              <DisplayField label="Работодател" value={person.employer} />
              <DisplayField label="Университет" value={person.university} />
              <DisplayField label="Специалност" value={person.specialty} />
            </div>
          </div>

          {/* Central Hub - Tasks & Notes */}
          <div className="lg:col-span-8">
            <div className="glass-panel p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Активност и Задачи</h2>
                  <p className="text-sm text-slate-500">Управление на задачи и бележки</p>
                </div>
              </div>
              
              {/* Forms Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <TaskForm personId={person.id} />
                <NoteForm personId={person.id} />
              </div>

              {/* Timeline Section */}
              <div className="mt-8">
                <Timeline notes={notes} tasks={tasks} personId={person.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Проверка на build**

Run: `npm run build`
Expected: Build успешен

**Step 3: Commit**

```bash
git add app/directory/\[id\]/page.tsx
git commit -m "feat: reorganize profile page with sidebar layout and central activity hub"
```

---

## Task 7: Финални Проверки

**Files:**
- All modified files

**Step 1: Проверка на build**

Run: `npm run build`
Expected: Build успешен без грешки

**Step 2: Проверка на типовете**

Run: `npx tsc --noEmit`
Expected: Няма TypeScript грешки

**Step 3: Проверка на lint**

Run: `npm run lint`
Expected: Няма lint грешки

**Step 4: Финален review checklist**

Провери в браузър:
- [ ] Страницата има glassmorphism ефекти (прозрачни фонове, blur)
- [ ] Информацията за лицето е в sidebar отляво
- [ ] Задачите и бележките са в централен панел с пълна ширина
- [ ] TaskForm има glassmorphism стил
- [ ] NoteForm има glassmorphism стил
- [ ] TaskList показва прогрес бар и статистика
- [ ] Бележките са в glassmorphism карти
- [ ] Всичко е responsive

**Step 5: Финален commit**

```bash
git add -A
git commit -m "feat: implement glassmorphism profile UI with enhanced tasks and notes"
```

---

## Резюме

След изпълнение на всички задачи:
- Профилната страница има модерен glassmorphism дизайн
- Задачите и бележките са преместени в централна секция с по-голяма видимост
- Добавени са прогрес бар и статистика за задачите
- Всички форми имат glassmorphism стил
- Страницата е responsive и работи добре на мобилни устройства
