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
