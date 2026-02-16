import { prisma } from '@/lib/prisma'
import BackButton from '@/components/common/BackButton'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  Edit2, MapPin, Phone, Mail, Calendar, Briefcase,
  Facebook, Linkedin, Instagram, Users, Hash, Map, Activity, LucideIcon
} from 'lucide-react'
import { getNotes } from '@/app/actions/notes'
import { getTasks } from '@/app/actions/tasks'
import Timeline from '@/components/directory/Timeline'
import NoteForm from '@/components/directory/NoteForm'
import TaskForm from '@/components/directory/TaskForm'

interface PersonPageProps {
  params: Promise<{ id: string }>
}

const DisplayField = ({ label, value, icon: Icon }: { label: string, value: string | null | undefined, icon?: LucideIcon }) => {
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
