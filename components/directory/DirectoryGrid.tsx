'use client'

import { Person } from '@prisma/client'
import { useState } from 'react'
import PersonCard from './PersonCard'
import { Trash2, UserCheck, UserX, Users, UserMinus, Mail, Send } from 'lucide-react'
import { deletePeople, updatePeopleStatus, addPeopleToGroup, removePeopleFromGroup } from '@/app/actions/bulk'
import { getGroups } from '@/app/actions/groups'
import { SkeletonGrid } from '@/components/common/Skeleton'
import EmailComposeModal from '@/components/communication/EmailComposeModal'
import { toast } from 'sonner'

interface DirectoryGridProps {
  people: Person[]
  onSelectionChange?: (ids: number[]) => void
  isLoading?: boolean
}

export default function DirectoryGrid({ people, onSelectionChange, isLoading: isLoadingProp = false }: DirectoryGridProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isLoadingState, setIsLoadingState] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showGroupMenu, setShowGroupMenu] = useState(false)
  const [showRemoveGroupMenu, setShowRemoveGroupMenu] = useState(false)
  const [groups, setGroups] = useState<{ id: number; name: string; color: string }[]>([])
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailRecipients, setEmailRecipients] = useState<{email: string; name: string}[]>([])

  const isLoading = isLoadingProp || isLoadingState

  const allSelected = people.length > 0 && selectedIds.size === people.length

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } else {
      const allIds = new Set(people.map(p => p.id))
      setSelectedIds(allIds)
      onSelectionChange?.(Array.from(allIds))
    }
  }

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
    onSelectionChange?.(Array.from(newSelected))
  }

  const handleDelete = async () => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете ${selectedIds.size} човека?`)) return
    
    setIsLoadingState(true)
    try {
      await deletePeople(Array.from(selectedIds))
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('Грешка при изтриването')
    } finally {
      setIsLoadingState(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    setIsLoadingState(true)
    setShowStatusMenu(false)
    try {
      await updatePeopleStatus(Array.from(selectedIds), status)
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Грешка при обновяването')
    } finally {
      setIsLoadingState(false)
    }
  }

  const handleAddToGroup = async (groupId: number) => {
    setIsLoadingState(true)
    setShowGroupMenu(false)
    try {
      await addPeopleToGroup(Array.from(selectedIds), groupId)
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } catch (error) {
      console.error('Failed to add to group:', error)
      alert('Грешка при добавянето към група')
    } finally {
      setIsLoadingState(false)
    }
  }

  const handleRemoveFromGroup = async (groupId: number) => {
    setIsLoadingState(true)
    setShowRemoveGroupMenu(false)
    try {
      await removePeopleFromGroup(Array.from(selectedIds), groupId)
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } catch (error) {
      console.error('Failed to remove from group:', error)
      alert('Грешка при премахването от група')
    } finally {
      setIsLoadingState(false)
    }
  }

  const openGroupMenu = async () => {
    if (groups.length === 0) {
      const fetchedGroups = await getGroups()
      setGroups(fetchedGroups)
    }
    setShowGroupMenu(true)
    setShowRemoveGroupMenu(false)
    setShowStatusMenu(false)
  }

  const openRemoveGroupMenu = async () => {
    if (groups.length === 0) {
      const fetchedGroups = await getGroups()
      setGroups(fetchedGroups)
    }
    setShowRemoveGroupMenu(true)
    setShowGroupMenu(false)
    setShowStatusMenu(false)
  }

  if (isLoading) {
    return <SkeletonGrid count={8} />
  }

  if (people.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">Няма намерени резултати</div>
        <p className="text-sm text-gray-500">Опитайте с други критерии за търсене.</p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleSelectAll}
            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-600">
            {allSelected ? 'Деселектирай всички' : 'Селектирай всички'}
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {people.map((person) => (
          <div key={person.id} className="relative">
            <div className="absolute top-4 left-4 z-10">
              <input
                type="checkbox"
                checked={selectedIds.has(person.id)}
                onChange={() => handleSelectOne(person.id)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
            <PersonCard person={person} />
          </div>
        ))}
      </div>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-3 flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-600 rounded-full text-sm font-medium">
              {selectedIds.size} избрани
            </span>

            <div className="h-6 w-px bg-slate-700" />

            <div className="relative">
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="p-2.5 rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                title="Изтрий избраните"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowStatusMenu(!showStatusMenu)
                  setShowGroupMenu(false)
                  setShowRemoveGroupMenu(false)
                }}
                disabled={isLoading}
                className="p-2.5 rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                title="Промени статуса"
              >
                <UserCheck className="w-5 h-5" />
              </button>
              {showStatusMenu && (
                <div className="absolute bottom-full mb-2 left-0 bg-slate-800 rounded-xl shadow-xl py-1 min-w-[160px]">
                  <button
                    onClick={() => handleStatusChange('Active')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    Активен
                  </button>
                  <button
                    onClick={() => handleStatusChange('Inactive')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Неактивен
                  </button>
                  <button
                    onClick={() => handleStatusChange('Excluded')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Изключен
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={openGroupMenu}
                disabled={isLoading}
                className="p-2.5 rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                title="Добави в група"
              >
                <Users className="w-5 h-5" />
              </button>
              {showGroupMenu && groups.length > 0 && (
                <div className="absolute bottom-full mb-2 left-0 bg-slate-800 rounded-xl shadow-xl py-1 max-h-[200px] overflow-y-auto min-w-[160px]">
                  {groups.map(group => (
                    <button
                      key={group.id}
                      onClick={() => handleAddToGroup(group.id)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2"
                    >
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: group.color }}
                      />
                      {group.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={openRemoveGroupMenu}
                disabled={isLoading}
                className="p-2.5 rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                title="Премахни от група"
              >
                <UserMinus className="w-5 h-5" />
              </button>
              {showRemoveGroupMenu && groups.length > 0 && (
                <div className="absolute bottom-full mb-2 left-0 bg-slate-800 rounded-xl shadow-xl py-1 max-h-[200px] overflow-y-auto min-w-[160px]">
                  {groups.map(group => (
                    <button
                      key={group.id}
                      onClick={() => handleRemoveFromGroup(group.id)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2"
                    >
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: group.color }}
                      />
                      {group.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                const recipients = people
                  .filter(p => selectedIds.has(p.id) && p.email)
                  .map(p => ({ email: p.email!, name: p.fullName }))
                if (recipients.length === 0) {
                  toast.warning('Няма имейли за изпращане')
                  return
                }
                setEmailRecipients(recipients)
                setShowEmailModal(true)
              }}
              className="p-2.5 rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2"
              title="Имейл"
            >
              <Mail className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      {showEmailModal && (
        <EmailComposeModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          recipients={emailRecipients}
        />
      )}
    </>
  )
}
