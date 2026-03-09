'use client'

import { useState, useEffect, useTransition, useMemo, useCallback } from 'react'
import {
  getGroups,
  createGroup,
  deleteGroup,
  getGroupMembers,
  addMemberToGroup,
  addMembersToGroup,
  removeMemberFromGroup,
  GroupWithMemberCount,
} from '@/app/actions/groups'
import { exportPeople, getAllPeople } from '@/app/actions/people'
import { downloadExcel } from '@/lib/excel'
import { Users, Plus, X, Trash2, UserPlus, UserMinus, MapPin, Phone, Mail, Search, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import EmailComposeModal from '@/components/communication/EmailComposeModal'
import WhatsAppButton from '@/components/communication/WhatsAppButton'
import { toast } from 'sonner'

interface Person {
  id: number
  fullName: string
  role: string | null
  city: string | null
  phone: string | null
  email: string | null
  photoUrl: string | null
  status: string | null
  profession: string | null
  telegram: string | null
}

interface Member {
  groupId: number
  personId: number
  person: Person
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
]

type SortField = 'name' | 'city' | 'role' | 'phone'
type SortOrder = 'asc' | 'desc'

export default function GroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<GroupWithMemberCount[]>([])
  const [selectedGroup, setSelectedGroup] = useState<GroupWithMemberCount | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [allPeople, setAllPeople] = useState<Person[]>([])
  const [isPending, startTransition] = useTransition()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupColor, setNewGroupColor] = useState(COLORS[0])
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [searchNewMember, setSearchNewMember] = useState('')
  const [searchMembers, setSearchMembers] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [selectedForGroup, setSelectedForGroup] = useState<Set<number>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailRecipients, setEmailRecipients] = useState<{email: string; name: string}[]>([])

  const loadGroups = useCallback(async () => {
    const data = await getGroups()
    setGroups(data)
  }, [])

  const loadAllPeople = useCallback(async () => {
    const data = await getAllPeople()
    setAllPeople(data)
  }, [])

  const loadMembers = useCallback(async (groupId: number) => {
    const data = await getGroupMembers(groupId)
    setMembers(data)
  }, [])

  useEffect(() => {
    loadGroups()
    loadAllPeople()
  }, [loadGroups, loadAllPeople])

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return

    startTransition(async () => {
      const result = await createGroup(newGroupName, newGroupColor, newGroupDescription)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setShowCreateModal(false)
      setNewGroupName('')
      setNewGroupColor(COLORS[0])
      setNewGroupDescription('')
      loadGroups()
    })
  }

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете тази група?')) return

    startTransition(async () => {
      const result = await deleteGroup(groupId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null)
        setShowMembersModal(false)
      }
      loadGroups()
    })
  }

  const handleViewMembers = async (group: GroupWithMemberCount) => {
    setSelectedGroup(group)
    setSelectedForGroup(new Set())
    setShowBulkActions(false)
    await loadMembers(group.id)
    setShowMembersModal(true)
  }

  const handleAddMember = async (personId: number) => {
    if (!selectedGroup) return

    startTransition(async () => {
      const result = await addMemberToGroup(selectedGroup.id, personId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      await loadMembers(selectedGroup.id)
    })
  }

  const handleRemoveMember = async (personId: number) => {
    if (!selectedGroup) return

    startTransition(async () => {
      const result = await removeMemberFromGroup(selectedGroup.id, personId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      await loadMembers(selectedGroup.id)
    })
  }

  const memberIds = useMemo(() => new Set(members.map(m => m.person.id)), [members])
  
  const availablePeople = useMemo(() => 
    allPeople.filter(p => !memberIds.has(p.id)), 
  [allPeople, memberIds])

  const filteredAvailablePeople = useMemo(() => {
    if (!searchNewMember) return availablePeople
    const lowerSearch = searchNewMember.toLowerCase()
    return availablePeople.filter(p => 
      p.fullName.toLowerCase().includes(lowerSearch) ||
      p.city?.toLowerCase().includes(lowerSearch) ||
      p.phone?.includes(lowerSearch) ||
      p.email?.toLowerCase().includes(lowerSearch) ||
      p.role?.toLowerCase().includes(lowerSearch)
    )
  }, [availablePeople, searchNewMember])

  const filteredMembers = useMemo(() => {
    if (!searchMembers) return members
    const lowerSearch = searchMembers.toLowerCase()
    return members.filter(m => 
      m.person.fullName.toLowerCase().includes(lowerSearch) ||
      m.person.city?.toLowerCase().includes(lowerSearch) ||
      m.person.phone?.includes(lowerSearch) ||
      m.person.profession?.toLowerCase().includes(lowerSearch)
    )
  }, [members, searchMembers])

  const sortedMembers = useMemo(() => {
    return [...filteredMembers].sort((a, b) => {
      let aVal = ''
      let bVal = ''
      
      switch (sortField) {
        case 'name':
          aVal = a.person.fullName.toLowerCase()
          bVal = b.person.fullName.toLowerCase()
          break
        case 'city':
          aVal = a.person.city?.toLowerCase() || ''
          bVal = b.person.city?.toLowerCase() || ''
          break
        case 'role':
          aVal = a.person.role?.toLowerCase() || ''
          bVal = b.person.role?.toLowerCase() || ''
          break
        case 'phone':
          aVal = a.person.phone || ''
          bVal = b.person.phone || ''
          break
      }
      
      if (sortOrder === 'asc') {
        return aVal.localeCompare(bVal)
      } else {
        return bVal.localeCompare(aVal)
      }
    })
  }, [filteredMembers, sortField, sortOrder])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const toggleSelectForGroup = (personId: number) => {
    const newSet = new Set(selectedForGroup)
    if (newSet.has(personId)) {
      newSet.delete(personId)
    } else {
      newSet.add(personId)
    }
    setSelectedForGroup(newSet)
    setShowBulkActions(newSet.size > 0)
  }

  const selectAllForGroup = () => {
    if (selectedForGroup.size === filteredAvailablePeople.length) {
      setSelectedForGroup(new Set())
      setShowBulkActions(false)
    } else {
      setSelectedForGroup(new Set(filteredAvailablePeople.map(p => p.id)))
      setShowBulkActions(true)
    }
  }

  const handleExportGroup = () => {
    if (!selectedGroup) return
    
    startTransition(async () => {
      try {
        const data = await exportPeople({ groupId: selectedGroup.id.toString() })
        const exportData = data.map(p => ({
          'Имена': p.fullName,
          'Имейл': p.email || '',
          'Телефон': p.phone || '',
          'Роля': p.role,
          'Статус': p.status,
          'Област': p.region || '',
          'Град': p.city || '',
          'Професия': p.profession || '',
          'Пол': p.gender || ''
        }))
        downloadExcel(exportData, `Група_${selectedGroup.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`)
        toast.success('Експортът е успешен!')
      } catch (error) {
        console.error('Export error:', error)
        toast.error('Грешка при експортиране на данни.')
      }
    })
  }

  const handleBulkAddToGroup = async () => {
    if (!selectedGroup || selectedForGroup.size === 0) return
    
    startTransition(async () => {
      const result = await addMembersToGroup(selectedGroup.id, Array.from(selectedForGroup))
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setSelectedForGroup(new Set())
      setShowBulkActions(false)
      await loadMembers(selectedGroup.id)
    })
  }

  const handleBulkSendEmail = () => {
    const recipients = filteredAvailablePeople
      .filter(p => selectedForGroup.has(p.id) && p.email)
      .map(p => ({ email: p.email!, name: p.fullName }))
    
    if (recipients.length > 0) {
      setEmailRecipients(recipients)
      setShowEmailModal(true)
    } else {
      toast.warning('Няма имейли за изпращане')
    }
    setSelectedForGroup(new Set())
    setShowBulkActions(false)
  }

  const renderSortButton = (field: SortField, label: string) => (
    <button
      onClick={() => toggleSort(field)}
      className={`flex items-center gap-1 text-xs font-medium transition-colors ${
        sortField === field ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
      }`}
      title={`Сортирай по ${label}`}
    >
      {label}
      {sortField === field && (
        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
      )}
    </button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold gradient-text">
                Групи
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Управление на групи и техните членове
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:brightness-110"
          >
            <Plus className="mr-2 h-5 w-5" />
            Нова Група
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Users className="h-10 w-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Няма създадени групи</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Създайте първата група, за да организирате хората по категории</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map(group => (
              <div
                key={group.id}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewMembers(group)}
              >
                <div 
                  className="h-2" 
                  style={{ backgroundColor: group.color }}
                />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{group.name}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteGroup(group.id)
                      }}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Изтрий групата"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {group.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{group.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{group._count?.members ?? 0}</span> членове
                    </span>
                    <span className="text-sm text-blue-600 font-medium flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      Виж
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Създай група</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  title="Затвори"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Име на групата *
                  </label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    placeholder="Въведете име..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Цвят
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewGroupColor(color)}
                        className={`w-8 h-8 rounded-full transition-transform ${
                          newGroupColor === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        title="Избери цвят"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Описание
                  </label>
                  <textarea
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    placeholder="Описание на групата (по избор)..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                  Отказ
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim() || isPending}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Създаване...' : 'Създай'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showMembersModal && selectedGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col">
              <div 
                className="p-6 rounded-t-2xl"
                style={{ backgroundColor: selectedGroup.color + '20' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{selectedGroup.name}</h2>
                    {selectedGroup.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedGroup.description}</p>
                    )}
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{members.length} членове</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportGroup}
                      disabled={isPending}
                      className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                      title="Експорт на групата"
                    >
                      Експорт
                    </button>
                    <button
                      onClick={() => setShowMembersModal(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2"
                      title="Затвори"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 overflow-hidden flex flex-col gap-6">
                {/* Add Member Section */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Търси и добави членове
                    </h3>
                    {filteredAvailablePeople.length > 0 && (
                      <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedForGroup.size === filteredAvailablePeople.length && filteredAvailablePeople.length > 0}
                          onChange={selectAllForGroup}
                          className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                        />
                        Избери всички
                      </label>
                    )}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchNewMember}
                      onChange={(e) => setSearchNewMember(e.target.value)}
                      placeholder="Търси по име, град или телефон..."
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  {/* Bulk Actions Bar */}
                  {showBulkActions && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-between">
                      <span className="text-sm text-blue-700 dark:text-blue-400">
                        Избрани: <strong>{selectedForGroup.size}</strong>
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={handleBulkAddToGroup}
                          disabled={isPending}
                          className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          + Добави в група
                        </button>
                        <button
                          onClick={handleBulkSendEmail}
                          className="px-3 py-1.5 text-xs bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                        >
                          ✉️ Имейл
                        </button>
                        <button
                          onClick={() => {
                            setSelectedForGroup(new Set())
                            setShowBulkActions(false)
                          }}
                          className="px-3 py-1.5 text-xs bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500"
                        >
                          Отмени
                        </button>
                      </div>
                    </div>
                  )}

                  {filteredAvailablePeople.length > 0 ? (
                    <div className="mt-2 max-h-80 overflow-y-auto space-y-1 border border-slate-200 dark:border-slate-600 rounded-xl">
                      {filteredAvailablePeople.slice(0, 50).map(person => (
                        <div
                          key={person.id}
                          className={`flex items-center gap-3 px-4 py-2 transition-colors ${
                            selectedForGroup.has(person.id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedForGroup.has(person.id)}
                            onChange={() => toggleSelectForGroup(person.id)}
                            className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                            title={`Избери ${person.fullName}`}
                          />
                          <button
                            onClick={() => handleAddMember(person.id)}
                            className="flex-1 text-left flex items-center gap-3"
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                              {person.fullName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{person.fullName}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {person.role || 'Без роля'} {person.city && `• ${person.city}`}
                              </p>
                            </div>
                          </button>
                          <UserPlus className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : searchNewMember ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Няма намерени хора</p>
                  ) : null}
                </div>

                {/* Members List with Sort */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Членове ({sortedMembers.length})
                    </h3>
                    <div className="flex items-center gap-3">
                      {renderSortButton('name', 'Име')}
                      {renderSortButton('city', 'Град')}
                      {renderSortButton('role', 'Роля')}
                      {renderSortButton('phone', 'Телефон')}
                    </div>
                  </div>

                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchMembers}
                      onChange={(e) => setSearchMembers(e.target.value)}
                      placeholder="Филтрирай членове..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm"
                    />
                  </div>

                  {sortedMembers.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">Няма членове в тази група</p>
                  ) : (
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                      {sortedMembers.map(member => (
                        <div
                          key={member.personId}
                          onClick={() => router.push(`/directory/${member.person.id}`)}
                          className="block cursor-pointer group"
                        >
                          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative flex-shrink-0">
                                {member.person.photoUrl ? (
                                  <Image
                                    src={member.person.photoUrl}
                                    alt={member.person.fullName}
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                                    {member.person.fullName.charAt(0)}
                                  </div>
                                )}
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${
                                  member.person.status === 'Active' ? 'bg-teal-500' : 'bg-slate-400'
                                }`} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                  {member.person.fullName}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                                  {member.person.role && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                      {member.person.role}
                                    </span>
                                  )}
                                  {member.person.city && (
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {member.person.city}
                                    </span>
                                  )}
                                  {member.person.profession && (
                                    <span className="inline-flex items-center gap-1">
                                      {member.person.profession}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {member.person.phone && (
                                <>
                                  <a 
                                    href={`tel:${member.person.phone}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title="Обади се"
                                  >
                                    <Phone className="h-4 w-4" />
                                  </a>
                                  <WhatsAppButton 
                                    phone={member.person.phone} 
                                    name={member.person.fullName}
                                  />
                                </>
                              )}
                              {member.person.email && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setEmailRecipients([{ email: member.person.email!, name: member.person.fullName }])
                                    setShowEmailModal(true)
                                  }}
                                  onClickCapture={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                  }}
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                  title="Имейл"
                                >
                                  <Mail className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleRemoveMember(member.personId)
                                }}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Премахни от групата"
                              >
                                <UserMinus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
      </div>
    </div>
  )
}
