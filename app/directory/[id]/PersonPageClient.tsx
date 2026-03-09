'use client'

import { useState, useEffect } from 'react'
import { Person, Note, ActivityLog } from '@prisma/client'
import BackButton from '@/components/common/BackButton'
import Link from 'next/link'
import Image from 'next/image'
import {
  Edit2, MapPin, Phone, Mail, Calendar, Briefcase, Bell,
  Facebook, Linkedin, Instagram, Users, Hash, Map, Activity, Printer, Send, Shield, UserCheck,
  Plus, X, Fingerprint, CreditCard
} from 'lucide-react'
import { toast } from 'sonner'
import { getNotes } from '@/app/actions/notes'
import { getTasks, type TaskWithAssignees } from '@/app/actions/tasks'
import { getActivities } from '@/app/actions/activities'
import { getPersonGroups } from '@/app/actions/groups'
import { getPersonTags } from '@/app/actions/tags'
import { getPersonReminders } from '@/app/actions/reminders'
import type { Reminder } from '@prisma/client'
import Timeline from '@/components/directory/Timeline'
import ActivityForm from '@/components/directory/ActivityForm'
import EmailModal from '@/components/directory/EmailModal'
import ReminderForm from '@/components/directory/ReminderForm'
import ReminderList from '@/components/directory/ReminderList'
import EditableField from '@/components/directory/EditableField'
import WhatsAppButton from '@/components/communication/WhatsAppButton'
import TelegramButton from '@/components/communication/TelegramButton'
import TagSelector from '@/components/tags/TagSelector'
import RelationsList from '@/components/directory/RelationsList'
import ChangeHistory from '@/components/directory/ChangeHistory'
import EngagementStats from '@/components/directory/EngagementStats'
import { getCoordinatesForCity } from '@/lib/mapCoordinates'
import { VOTING_SECTION_OPTIONS } from '@/lib/votingSections'

interface PersonPageClientProps {
  person: Person
  personId: number
}

const genderOptions = [
  { value: 'Male', label: 'Мъж' },
  { value: 'Female', label: 'Жена' },
  { value: 'Other', label: 'Друго' },
]

const statusOptions = [
  { value: 'Active', label: 'Активен' },
  { value: 'Inactive', label: 'Неактивен' },
  { value: 'Excluded', label: 'Изключен' },
]

const roleOptions = [
  { value: 'Координатор', label: 'Координатор' },
  { value: 'Член', label: 'Член' },
  { value: 'Симпатизант', label: 'Симпатизант' },
  { value: 'Доброволец', label: 'Доброволец' },
]

async function updateField(personId: number, field: string, value: string) {
  const res = await fetch(`/api/people/${personId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ [field]: value }),
  })
  if (!res.ok) throw new Error('Failed to update')
}

function parsePhones(phone: string | null | undefined): string[] {
  if (!phone) return []
  try {
    const parsed = JSON.parse(phone)
    if (Array.isArray(parsed)) return parsed.filter(Boolean)
  } catch {
    // Not JSON — treat as single phone
  }
  return [phone]
}

function serializePhones(phones: string[]): string | null {
  const filtered = phones.filter(Boolean)
  if (filtered.length === 0) return null
  if (filtered.length === 1) return filtered[0]
  return JSON.stringify(filtered)
}

export default function PersonPageClient({ person: initialPerson, personId }: PersonPageClientProps) {
  const [person, setPerson] = useState(initialPerson)
  const [notes, setNotes] = useState<Note[]>([])
  const [tasks, setTasks] = useState<TaskWithAssignees[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [personGroups, setPersonGroups] = useState<{ id: number; name: string; color: string }[]>([])
  const [personTags, setPersonTags] = useState<{ id: number; tagName: string; color: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [addingPhone, setAddingPhone] = useState(false)
  const [newPhone, setNewPhone] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const [notesData, tasksData, activitiesData, groupsData, tagsData, remindersData] = await Promise.all([
          getNotes(personId),
          getTasks(personId),
          getActivities(personId),
          getPersonGroups(personId),
          getPersonTags(personId),
          getPersonReminders(personId),
        ])
        setNotes(notesData || [])
        setTasks(tasksData || [])
        setActivities(activitiesData || [])
        setPersonGroups(groupsData || [])
        setPersonTags(tagsData || [])
        setReminders(remindersData || [])
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [personId])

  const refreshData = async () => {
    try {
      const [notesData, tasksData, activitiesData, remindersData] = await Promise.all([
        getNotes(personId),
        getTasks(personId),
        getActivities(personId),
        getPersonReminders(personId),
      ])
      setNotes(notesData || [])
      setTasks(tasksData || [])
      setActivities(activitiesData || [])
      setReminders(remindersData || [])
    } catch (error) {
      console.error('Failed to refresh data:', error)
    }
  }

  // Optimistic update after adding activity — Timeline shows immediately,
  // then refreshData syncs real data from DB in the background.
  const handleActivityAdded = (optimistic?: { type: string; content: string }) => {
    if (optimistic) {
      const now = new Date()
      const tempActivity: ActivityLog = {
        id: -Date.now(), // temporary negative ID, replaced when refreshData succeeds
        personId,
        type: optimistic.type,
        content: optimistic.content,
        date: now,
        createdAt: now,
        updatedAt: now,
      }
      setActivities(prev => [tempActivity, ...prev])
    }
    refreshData()
  }

  const handleUpdate = async (field: string, value: string) => {
    try {
      await updateField(personId, field, value)
      setPerson((prev: Person) => ({ ...prev, [field]: value }))
      // Warn if city is not found in map lookup
      if (field === 'city' && value && !getCoordinatesForCity(value)) {
        toast.warning('Градът не е намерен на картата — ще бъде показан в "Други"')
      }
    } catch {
      toast.error('Грешка при запазване')
    }
  }

  const handleBooleanUpdate = async (field: string, value: boolean) => {
    try {
      const res = await fetch(`/api/people/${personId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setPerson((prev: Person) => ({ ...prev, [field]: value }))
      toast.success('Успешно запазено')
    } catch {
      toast.error('Грешка при запазване')
    }
  }

  const escapeHtml = (str: string | null | undefined): string => {
    if (!str) return ''
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
  }

  const handlePrint = () => {
    const e = escapeHtml
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Профил - ${e(person.fullName)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #333; }
          .avatar { width: 100px; height: 100px; border-radius: 50%; background: #ddd; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 40px; }
          h1 { font-size: 28px; margin-bottom: 10px; }
          .role { display: inline-block; background: #e0e0e0; padding: 5px 15px; border-radius: 20px; font-size: 14px; }
          .section { margin-bottom: 25px; }
          .section h2 { font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 15px; }
          .field { margin-bottom: 10px; }
          .label { font-weight: bold; font-size: 12px; color: #666; text-transform: uppercase; }
          .value { font-size: 14px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="avatar">${e(person.fullName?.charAt(0))}</div>
          <h1>${e(person.fullName)}</h1>
          <span class="role">${e(person.role) || 'Без роля'} | ${person.status === 'Active' ? 'Активен' : 'Неактивен'}</span>
        </div>
        
        <div class="grid">
          <div class="section">
            <h2>Контакти</h2>
            ${person.email ? `<div class="field"><div class="label">Имейл</div><div class="value">${e(person.email)}</div></div>` : ''}
            ${person.phone ? `<div class="field"><div class="label">Телефон</div><div class="value">${parsePhones(person.phone).map(p => e(p)).join('<br>')}</div></div>` : ''}
            ${person.membershipCardId ? `<div class="field"><div class="label">Карта №</div><div class="value">${e(person.membershipCardId)}</div></div>` : ''}
          </div>

          <div class="section">
            <h2>Локация</h2>
            ${person.city ? `<div class="field"><div class="label">Град</div><div class="value">${e(person.city)}</div></div>` : ''}
            ${person.region ? `<div class="field"><div class="label">Област</div><div class="value">${e(person.region)}</div></div>` : ''}
            ${person.address ? `<div class="field"><div class="label">Адрес</div><div class="value">${e(person.address)}</div></div>` : ''}
          </div>

          <div class="section">
            <h2>Лични Данни</h2>
            ${person.birthDate ? `<div class="field"><div class="label">Роден на</div><div class="value">${new Date(person.birthDate).toLocaleDateString('bg-BG')}</div></div>` : ''}
            ${person.gender ? `<div class="field"><div class="label">Пол</div><div class="value">${person.gender === 'Male' ? 'Мъж' : person.gender === 'Female' ? 'Жена' : person.gender}</div></div>` : ''}
            ${person.profession ? `<div class="field"><div class="label">Професия</div><div class="value">${e(person.profession)}</div></div>` : ''}
            ${person.employer ? `<div class="field"><div class="label">Работодател</div><div class="value">${e(person.employer)}</div></div>` : ''}
          </div>

          <div class="section">
            <h2>Избори</h2>
            ${person.votingSection ? `<div class="field"><div class="label">Секция</div><div class="value">${e(person.votingSection)}</div></div>` : ''}
            ${person.votingMobile ? `<div class="field"><div class="label">Мобилна урна</div><div class="value">${e(person.votingMobile)}</div></div>` : ''}
            ${person.isRepresentative ? `<div class="field"><div class="label">Застъпник</div><div class="value" style="color: #0d9488; font-weight: bold;">✓ Да</div></div>` : ''}
            ${person.isCommissionMember ? `<div class="field"><div class="label">Член на СИК</div><div class="value" style="color: #6366f1; font-weight: bold;">✓ Да</div></div>` : ''}
          </div>
        </div>

        ${personGroups.length > 0 || personTags.length > 0 ? `
        <div class="grid" style="margin-top: 10px;">
          ${personGroups.length > 0 ? `
          <div class="section">
            <h2>Групи</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${personGroups.map(g => `<span style="display: inline-block; padding: 3px 12px; border-radius: 12px; font-size: 13px; background: ${g.color}20; color: ${g.color}; border: 1px solid ${g.color}40;">${e(g.name)}</span>`).join('')}
            </div>
          </div>` : ''}
          ${personTags.length > 0 ? `
          <div class="section">
            <h2>Тагове</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${personTags.map(t => `<span style="display: inline-block; padding: 3px 12px; border-radius: 12px; font-size: 13px; background: ${t.color}20; color: ${t.color}; border: 1px solid ${t.color}40;">${e(t.tagName)}</span>`).join('')}
            </div>
          </div>` : ''}
        </div>` : ''}

        ${activities.length > 0 ? `
        <div class="section" style="margin-top: 10px;">
          <h2>Последни Активности</h2>
          ${activities.slice(0, 5).map((a: { type: string; createdAt: string | Date; content?: string }) => `
          <div style="margin-bottom: 8px; padding: 6px 0; border-bottom: 1px solid #eee;">
            <div style="font-size: 13px; font-weight: bold;">${e(a.type)}</div>
            <div style="font-size: 12px; color: #666;">${new Date(a.createdAt).toLocaleDateString('bg-BG')} ${a.content ? '— ' + e(a.content) : ''}</div>
          </div>`).join('')}
        </div>` : ''}

        <div class="footer">
          Отпечатано от Political CRM - ${new Date().toLocaleDateString('bg-BG')}
        </div>
      </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-4 sm:py-6">
      <EmailModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)} 
        personId={personId} 
        email={person.email} 
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8" suppressHydrationWarning>

        <div className="mb-4 sm:mb-6">
          <BackButton href="/directory" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">

          <div className="md:col-span-1 lg:col-span-3 space-y-3 sm:space-y-4">

            <div className="glass-panel p-4">
              {/* Avatar + Name + Card# row */}
              <div className="flex items-center gap-3 mb-2">
                <div className="relative flex-shrink-0">
                  {person.photoUrl ? (
                    <div className="h-16 w-16 rounded-full border-2 border-white/50 shadow-md relative overflow-hidden">
                      <Image src={person.photoUrl} alt={person.fullName} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-full border-2 border-white/20 shadow-md bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                  )}
                  <div className={`absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                    person.status === 'Active' ? 'bg-teal-500' : 'bg-slate-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <EditableField
                    label=""
                    value={person.fullName}
                    onSave={(v) => handleUpdate('fullName', v)}
                    valueClassName="text-lg font-bold text-slate-900 dark:text-white leading-tight"
                  />
                  <EditableField
                    label=""
                    value={(person as Record<string, unknown>).fullNameEn as string | null | undefined}
                    onSave={async (v) => { await handleUpdate('fullNameEn', v) }}
                    valueClassName="text-sm text-slate-400 dark:text-slate-500 italic leading-tight -mt-0.5"
                    emptyLabel="English name..."
                  />
                  <div className="flex items-center gap-1 mt-0.5">
                    <CreditCard className="h-3 w-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                    <EditableField
                      label=""
                      value={person.membershipCardId}
                      onSave={(v) => handleUpdate('membershipCardId', v)}
                      valueClassName="text-sm font-semibold text-slate-500 dark:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Role + Status row */}
              <div className="flex gap-4 mb-2">
                <EditableField
                  label="Роля"
                  value={person.role}
                  onSave={(v) => handleUpdate('role', v)}
                  options={roleOptions}
                />
                <EditableField
                  label="Статус"
                  value={person.status}
                  onSave={(v) => handleUpdate('status', v)}
                  options={statusOptions}
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Link
                  href={`/directory/${person.id}/edit`}
                  className="glass-button flex-1 py-1.5 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 dark:hover:text-white"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Редактирай
                </Link>
                <button
                  onClick={handlePrint}
                  className="glass-button flex-1 py-1.5 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 dark:hover:text-white"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Принтирай
                </button>
              </div>
            </div>

            <div className="glass-panel p-4 sm:p-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                Контакти
              </h3>
              <EditableField label="Имейл" value={person.email} onSave={(v) => handleUpdate('email', v)} icon={Mail} />

              {/* Multi-phone section */}
              <div className="mb-2">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  Телефон
                </p>
                {parsePhones(person.phone).map((ph, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 mb-1 group/phone">
                    <EditableField
                      label=""
                      value={ph}
                      onSave={async (v) => {
                        const phones = parsePhones(person.phone)
                        phones[idx] = v
                        const serialized = serializePhones(phones)
                        await handleUpdate('phone', serialized || '')
                      }}
                    />
                    {parsePhones(person.phone).length > 1 && (
                      <button
                        onClick={() => {
                          const phones = parsePhones(person.phone)
                          phones.splice(idx, 1)
                          handleUpdate('phone', serializePhones(phones) || '')
                        }}
                        className="opacity-0 group-hover/phone:opacity-100 text-red-400 hover:text-red-600 transition-all p-0.5"
                        title="Премахни номер"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {parsePhones(person.phone).length === 0 && (
                  <p className="text-sm text-slate-400 dark:text-slate-500 italic cursor-pointer hover:text-slate-600 dark:hover:text-slate-300"
                    onClick={() => handleUpdate('phone', '')}
                  >
                    Не е зададено
                  </p>
                )}
                {addingPhone ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+359..."
                      autoFocus
                      className="flex-1 text-sm px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newPhone.trim()) {
                          const phones = parsePhones(person.phone)
                          phones.push(newPhone.trim())
                          handleUpdate('phone', serializePhones(phones) || newPhone.trim())
                          setNewPhone('')
                          setAddingPhone(false)
                        }
                        if (e.key === 'Escape') {
                          setNewPhone('')
                          setAddingPhone(false)
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newPhone.trim()) {
                          const phones = parsePhones(person.phone)
                          phones.push(newPhone.trim())
                          handleUpdate('phone', serializePhones(phones) || newPhone.trim())
                          setNewPhone('')
                          setAddingPhone(false)
                        }
                      }}
                      className="text-green-500 hover:text-green-700 p-1"
                      title="Запази"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { setNewPhone(''); setAddingPhone(false) }}
                      className="text-red-400 hover:text-red-600 p-1"
                      title="Откажи"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingPhone(true)}
                    className="mt-1 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Добави номер
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                  {parsePhones(person.phone)[0] && (
                    <WhatsAppButton phone={parsePhones(person.phone)[0]} name={person.fullName} />
                  )}
                  {parsePhones(person.phone)[0] && (
                    <TelegramButton
                      username={parsePhones(person.phone)[0]}
                      firstName={person.fullName.split(' ')[0]}
                      fullName={person.fullName}
                      city={person.city || undefined}
                      profession={person.profession || undefined}
                    />
                  )}
                  {parsePhones(person.phone)[0] && (
                    <a
                      href={`viber://chat?number=${encodeURIComponent(parsePhones(person.phone)[0].replace(/[\s\-()]/g, ''))}`}
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-[#7360f2] hover:bg-[#5f4bd6] text-white transition-colors duration-200"
                      title={`Viber на ${person.fullName}`}
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.541 6.783.453 9.96c-.088 3.178-.198 9.135 5.637 10.705l.007.003v2.43s-.04.984.612 1.187c.764.244 1.22-.5 1.953-1.3.403-.438.957-1.08 1.376-1.573 3.793.322 6.71-.41 7.042-.523.767-.257 5.103-.806 5.808-6.583.727-5.955-.352-9.71-2.291-11.396C18.818.761 14.166-.028 11.4 0zm.597 2.127c2.384.012 6.264.625 7.8 2.07 1.58 1.395 2.407 4.656 1.794 9.67-.567 4.618-3.905 5.058-4.555 5.275-.274.094-2.735.71-5.812.543 0 0-2.302 2.782-3.022 3.51-.112.113-.243.157-.33.136-.124-.03-.158-.174-.156-.384.002-.14.01-2.476.01-2.476C2.971 19.188 2.549 14.09 2.62 11.63c.044-2.46.608-4.571 1.977-5.93 1.693-1.595 5.024-2.04 7.4-1.573zm-.207 3.468a.424.424 0 00-.42.428.424.424 0 00.42.427c1.106 0 2.096.4 2.865 1.133.77.733 1.234 1.756 1.234 2.906a.424.424 0 00.42.427.424.424 0 00.42-.427c0-1.39-.558-2.65-1.5-3.549-.942-.898-2.149-1.345-3.44-1.345zm-3.584.93c-.215-.008-.437.06-.624.212l-.006.004c-.494.414-.94.91-1.312 1.47a1.3 1.3 0 00-.182.919c.087.412.257.868.532 1.395.55 1.054 1.39 2.322 2.605 3.536 1.215 1.213 2.55 2.121 3.67 2.707.56.293 1.05.483 1.479.58a1.4 1.4 0 00.955-.168l.01-.005c.563-.37 1.06-.814 1.473-1.308l.003-.004c.35-.432.257-.955-.15-1.345l-1.8-1.616c-.38-.342-.93-.36-1.268-.043l-.707.665a.326.326 0 01-.372.06l-.017-.01c-.425-.22-1.018-.596-1.588-1.166-.57-.57-.955-1.19-1.185-1.633a.326.326 0 01.057-.377l.66-.71c.306-.345.285-.888-.043-1.268l-1.616-1.8a.95.95 0 00-.574-.295zm4.233.297a.424.424 0 00-.41.437c.032.85.392 1.63.95 2.21.558.582 1.32.958 2.157 1.003a.424.424 0 00.447-.4.424.424 0 00-.4-.453c-.593-.032-1.107-.298-1.503-.71-.396-.413-.657-.975-.68-1.602a.424.424 0 00-.437-.41z"/></svg>
                    </a>
                  )}
                  <button
                    onClick={() => setIsEmailModalOpen(true)}
                    className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors tooltip" title="Имейл"
                  >
                    <Mail className="h-5 w-5" />
                  </button>
                  <button className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors tooltip" title="Среща">
                    <Users className="h-5 w-5" />
                  </button>
              </div>

              {(person.socialFb || person.socialInstagram || person.socialLinkedin) && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide font-semibold mb-3">Социални Мрежи</p>
                  <div className="flex space-x-3">
                    {person.socialFb && (
                      <a href={person.socialFb} target="_blank" rel="noopener noreferrer" title="Facebook"
                         className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                        <Facebook className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </a>
                    )}
                    {person.socialInstagram && (
                      <a href={person.socialInstagram} target="_blank" rel="noopener noreferrer" title="Instagram"
                         className="w-9 h-9 rounded-lg bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-colors">
                        <Instagram className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                      </a>
                    )}
                    {person.socialLinkedin && (
                      <a href={person.socialLinkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn"
                         className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                        <Linkedin className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <EngagementStats personId={personId} />

            <TagSelector personId={personId} />

            <RelationsList personId={personId} />

          </div>

          {/* Middle Column: Location, Elections, Personal Data, Education, History */}
          <div className="md:col-span-1 lg:col-span-3 space-y-4 sm:space-y-5">

            <div className="glass-panel p-4 sm:p-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                </div>
                Локация
              </h3>
              <EditableField label="Област" value={person.region} onSave={(v) => handleUpdate('region', v)} icon={Map} />
              <EditableField label="Град/Село" value={person.city} onSave={(v) => handleUpdate('city', v)} icon={MapPin} />
              <EditableField label="Адрес" value={person.address} onSave={(v) => handleUpdate('address', v)} />
            </div>

            <div className="glass-panel p-4 sm:p-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <Hash className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                </div>
                Избори
              </h3>
              <EditableField label="Секция" value={person.votingSection} onSave={(v) => handleUpdate('votingSection', v)} icon={Hash} options={VOTING_SECTION_OPTIONS} />
              <EditableField label="Мобилна Урна" value={person.votingMobile} onSave={(v) => handleUpdate('votingMobile', v)} icon={Phone} />
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <Shield className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wide mb-0.5">Застъпник</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleBooleanUpdate('isRepresentative', !person.isRepresentative)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        person.isRepresentative
                          ? 'bg-teal-500'
                          : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                      role="switch"
                      aria-checked={person.isRepresentative}
                      aria-label="Застъпник в секция"
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        person.isRepresentative ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                    <span className={`text-sm font-semibold ${
                      person.isRepresentative
                        ? 'text-teal-700 dark:text-teal-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {person.isRepresentative ? 'Да — застъпник' : 'Не'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <UserCheck className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wide mb-0.5">Член на СИК</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleBooleanUpdate('isCommissionMember', !person.isCommissionMember)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        person.isCommissionMember
                          ? 'bg-indigo-500'
                          : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                      role="switch"
                      aria-checked={person.isCommissionMember}
                      aria-label="Член на секционна избирателна комисия"
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        person.isCommissionMember ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                    <span className={`text-sm font-semibold ${
                      person.isCommissionMember
                        ? 'text-indigo-700 dark:text-indigo-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {person.isCommissionMember ? 'Да — член на СИК' : 'Не'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-4 sm:p-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Calendar className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                Лични Данни
              </h3>
              <EditableField
                label="ЕГН"
                value={(person as Record<string, unknown>).egn as string | null | undefined}
                onSave={async (v) => {
                  if (v && !/^\d{10}$/.test(v)) {
                    toast.error('ЕГН трябва да е точно 10 цифри')
                    return
                  }
                  await handleUpdate('egn', v)
                }}
                icon={Fingerprint}
              />
              <EditableField
                label="Дата на раждане"
                value={person.birthDate ? new Date(person.birthDate).toISOString().split('T')[0] : ''}
                onSave={(v) => handleUpdate('birthDate', v)}
                icon={Calendar}
                type="date"
              />
              <EditableField
                label="Пол"
                value={person.gender}
                onSave={(v) => handleUpdate('gender', v)}
                options={genderOptions}
              />
              {person.pensioner && (
                <div className="flex items-center space-x-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                    Пенсионер
                  </span>
                </div>
              )}
              <EditableField label="ТЕЛК / Увреждане" value={person.disability} onSave={(v) => handleUpdate('disability', v)} />
            </div>

            <div className="glass-panel p-4 sm:p-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Briefcase className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                Образование и Работа
              </h3>
              <EditableField label="Професия" value={person.profession} onSave={(v) => handleUpdate('profession', v)} icon={Briefcase} />
              <EditableField label="Работодател" value={person.employer} onSave={(v) => handleUpdate('employer', v)} />
              <EditableField label="Университет" value={person.university} onSave={(v) => handleUpdate('university', v)} />
              <EditableField label="Специалност" value={person.specialty} onSave={(v) => handleUpdate('specialty', v)} />
            </div>

            <ChangeHistory personId={personId} />
          </div>

          {/* Right Column: Reminders + Timeline */}
          <div className="md:col-span-2 lg:col-span-6 space-y-4 sm:space-y-6">

            {/* Reminders Section */}
            {!loading && (
              <div className="glass-panel p-4 sm:p-6 bg-white/60 dark:bg-slate-800/60">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                    <Bell className="h-4 w-4" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Напомняния</h2>
                  {reminders.filter(r => !r.isCompleted).length > 0 && (
                    <span className="ml-2 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                      {reminders.filter(r => !r.isCompleted).length} активни
                    </span>
                  )}
                </div>
                <ReminderList reminders={reminders} personId={person.id} onChanged={refreshData} />
                <div className="mt-3">
                  <ReminderForm personId={person.id} onCreated={refreshData} />
                </div>
              </div>
            )}

            <div className="glass-panel p-4 sm:p-6 bg-white/60 dark:bg-slate-800/60">
              <div className="flex items-center gap-2 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                  <Activity className="h-4 w-4" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Хронология</h2>
              </div>

              <ActivityForm personId={person.id} onActivityAdded={handleActivityAdded} />

              <div className="mt-4">
                {loading ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">Зареждане...</div>
                ) : (
                  <Timeline notes={notes} tasks={tasks} activities={activities} personId={person.id} onRefresh={refreshData} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
