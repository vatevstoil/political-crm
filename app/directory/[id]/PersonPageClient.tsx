'use client'

import { useState } from 'react'
import { prisma } from '@/lib/prisma'
import { Person } from '@prisma/client'
import BackButton from '@/components/common/BackButton'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Edit2, MapPin, Phone, Mail, Calendar, Briefcase,
  Facebook, Linkedin, Instagram, Users, Hash, Map, Activity
} from 'lucide-react'
import { getNotes } from '@/app/actions/notes'
import { getTasks } from '@/app/actions/tasks'
import Timeline from '@/components/directory/Timeline'
import NoteForm from '@/components/directory/NoteForm'
import TaskForm from '@/components/directory/TaskForm'
import EditableField from '@/components/directory/EditableField'

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

export default function PersonPageClient({ person: initialPerson, personId }: PersonPageClientProps) {
  const [person, setPerson] = useState(initialPerson)

  const handleUpdate = async (field: string, value: string) => {
    await updateField(personId, field, value)
    setPerson((prev: Person) => ({ ...prev, [field]: value }))
  }

  const DisplayField = ({ label, value, icon: Icon }: { label: string, value: string | null | undefined, icon?: any }) => {
    if (!value) return null
    return (
      <div className="flex items-start gap-2 mb-3">
        {Icon && <Icon className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />}
        <div>
          <p className="text-xs text-slate-600 uppercase tracking-wide font-medium">{label}</p>
          <p className="text-sm text-slate-600 break-words">{value}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-purple-50 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">

        <div className="mb-4 sm:mb-6">
          <BackButton href="/directory" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

          <div className="lg:col-span-4 space-y-3 sm:space-y-6">

            <div className="glass-panel p-4 sm:p-6">
              <div className="text-center mb-4 sm:mb-6">
                <div className="relative inline-block">
                  {person.photoUrl ? (
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-white shadow-lg relative overflow-hidden mx-auto">
                      <Image
                        src={person.photoUrl}
                        alt={person.fullName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mx-auto">
                      <Users className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                  )}
                  <div className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white ${
                    person.status === 'Active' ? 'bg-teal-500' : 'bg-slate-500'
                  }`} />
                </div>

                <EditableField
                  label="Име"
                  value={person.fullName}
                  onSave={(v) => handleUpdate('fullName', v)}
                />

                <div className="flex justify-center gap-2 mt-3">
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

                {person.membershipCardId && (
                  <EditableField
                    label="Карта №"
                    value={person.membershipCardId}
                    onSave={(v) => handleUpdate('membershipCardId', v)}
                  />
                )}
              </div>

              <Link
                href={`/directory/${person.id}/edit`}
                className="glass-button w-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-slate-700"
              >
                <Edit2 className="h-4 w-4" />
                Редактирай профил
              </Link>
            </div>

            <div className="glass-panel p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Mail className="h-3 w-3 text-blue-600" />
                </div>
                Контакти
              </h3>
              <EditableField label="Имейл" value={person.email} onSave={(v) => handleUpdate('email', v)} icon={Mail} />
              <EditableField label="Телефон" value={person.phone} onSave={(v) => handleUpdate('phone', v)} icon={Phone} />

              {(person.socialFb || person.socialInstagram || person.socialLinkedin) && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold mb-3">Социални Мрежи</p>
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

            <div className="glass-panel p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                  <MapPin className="h-3 w-3 text-purple-600" />
                </div>
                Локация
              </h3>
              <EditableField label="Област" value={person.region} onSave={(v) => handleUpdate('region', v)} icon={Map} />
              <EditableField label="Град/Село" value={person.city} onSave={(v) => handleUpdate('city', v)} icon={MapPin} />
              <EditableField label="Адрес" value={person.address} onSave={(v) => handleUpdate('address', v)} />
            </div>

            <div className="glass-panel p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Hash className="h-3 w-3 text-teal-600" />
                </div>
                Избори
              </h3>
              <EditableField label="Секция" value={person.votingSection} onSave={(v) => handleUpdate('votingSection', v)} icon={Hash} />
              <EditableField label="Мобилна Урна" value={person.votingMobile} onSave={(v) => handleUpdate('votingMobile', v)} icon={Phone} />
            </div>

            <div className="glass-panel p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Calendar className="h-3 w-3 text-amber-600" />
                </div>
                Лични Данни
              </h3>
              <EditableField
                label="Дата на раждане"
                value={person.birthDate ? new Date(person.birthDate).toLocaleDateString('bg-BG') : ''}
                onSave={(v) => handleUpdate('birthDate', v)}
                icon={Calendar}
              />
              <EditableField
                label="Пол"
                value={person.gender}
                onSave={(v) => handleUpdate('gender', v)}
                options={genderOptions}
              />
              {person.pensioner && (
                <div className="flex items-center space-x-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    Пенсионер
                  </span>
                </div>
              )}
              <EditableField label="ТЕЛК / Увреждане" value={person.disability} onSave={(v) => handleUpdate('disability', v)} />
            </div>

            <div className="glass-panel p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Briefcase className="h-3 w-3 text-emerald-600" />
                </div>
                Образование и Работа
              </h3>
              <EditableField label="Професия" value={person.profession} onSave={(v) => handleUpdate('profession', v)} icon={Briefcase} />
              <EditableField label="Работодател" value={person.employer} onSave={(v) => handleUpdate('employer', v)} />
              <EditableField label="Университет" value={person.university} onSave={(v) => handleUpdate('university', v)} />
              <EditableField label="Специалност" value={person.specialty} onSave={(v) => handleUpdate('specialty', v)} />
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="glass-panel p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Активност и Задачи</h2>
                  <p className="text-sm text-slate-600">Управление на задачи и бележки</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <TaskForm personId={person.id} />
                <NoteForm personId={person.id} />
              </div>

              <div className="mt-8">
                <Timeline notes={[]} tasks={[]} personId={person.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
