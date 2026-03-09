'use client'

import { memo } from 'react'
import { User, MapPin, Phone, Mail, Briefcase, Vote, Facebook, Linkedin, Instagram, Users, Activity } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
// Link removed — card uses div+onClick to avoid nested <a> hydration errors
import WhatsAppButton from '@/components/communication/WhatsAppButton'
import TagBadge from '@/components/tags/TagBadge'
import type { PersonWithTags } from '@/app/actions/people'

function getFirstPhone(phone: string | null | undefined): string | null {
  if (!phone) return null
  try {
    const parsed = JSON.parse(phone)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed[0]
  } catch { /* not JSON */ }
  return phone
}

interface PersonCardProps {
  person: PersonWithTags
}

const PersonCard = memo(function PersonCard({ person }: PersonCardProps) {
  const router = useRouter()

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/directory/${person.id}`)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/directory/${person.id}`) } }}
      className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block cursor-pointer"
    >
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="relative">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
              <div className="h-full w-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden relative">
                {person.photoUrl ? (
                  <Image
                    src={person.photoUrl}
                    alt={person.fullName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 sm:h-8 sm:w-8 text-slate-500 dark:text-slate-400" />
                )}
              </div>
            </div>
            <div className={`absolute bottom-0 right-0 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white dark:border-slate-800 ${
              person.status === 'Active' ? 'bg-teal-500' : 'bg-slate-500'
            }`} />
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-[13px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {person.role}
            </span>
            {person.birthDate && (
              <span className="text-[13px] text-slate-500 dark:text-slate-400 font-medium" suppressHydrationWarning>
                {(() => {
                  const now = new Date()
                  const bd = new Date(person.birthDate)
                  let age = now.getFullYear() - bd.getFullYear()
                  const m = now.getMonth() - bd.getMonth()
                  if (m < 0 || (m === 0 && now.getDate() < bd.getDate())) age--
                  return age
                })()} г.
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 sm:mt-4">
          <h3 className="text-[17px] font-semibold text-slate-900 dark:text-slate-100 truncate tracking-tight leading-tight" title={person.fullName}>
            {person.fullName}
          </h3>
          {person.membershipCardId && (
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                #{person.membershipCardId}
              </span>
            </p>
          )}
          {person.tags && person.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {person.tags.slice(0, 3).map(({ tag }) => (
                <TagBadge key={tag.id} tagName={tag.tagName} color={tag.color} size="sm" />
              ))}
              {person.tags.length > 3 && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium px-1.5 py-0.5">
                  +{person.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 hidden sm:block">
          {person.votingSection && (
            <div className="flex items-center text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed">
              <Vote className="h-4 w-4 mr-2 text-rose-500 flex-shrink-0" />
              <span className="truncate">Секция: <span className="font-semibold text-slate-800 dark:text-slate-200">{person.votingSection}</span></span>
            </div>
          )}
          {person.profession && (
            <div className="flex items-center text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed">
              <Briefcase className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-500 flex-shrink-0" />
              <span className="truncate">{person.profession}</span>
            </div>
          )}
          {person.city && (
            <div className="flex items-center text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed">
              <MapPin className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
              <span className="truncate">{person.city}</span>
            </div>
          )}
          {getFirstPhone(person.phone) && (
            <div className="flex items-center text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed">
              <Phone className="h-4 w-4 mr-2 text-purple-500 flex-shrink-0" />
              <span className="truncate">{getFirstPhone(person.phone)}</span>
            </div>
          )}
          {person.email && (
            <div className="flex items-center text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed truncate">
              <Mail className="h-4 w-4 mr-2 text-teal-500 flex-shrink-0" />
              <span className="truncate">{person.email}</span>
            </div>
          )}
        </div>

        {/* Group & Activity counts */}
        {person._count && (person._count.groupMemberships > 0 || person._count.activityLogs > 0) && (
          <div className="mt-3 flex items-center gap-3 hidden sm:flex">
            {person._count.groupMemberships > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Users className="h-3 w-3" />
                {person._count.groupMemberships} {person._count.groupMemberships === 1 ? 'група' : 'групи'}
              </span>
            )}
            {person._count.activityLogs > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Activity className="h-3 w-3" />
                {person._count.activityLogs} {person._count.activityLogs === 1 ? 'активност' : 'активности'}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 px-4 sm:px-6 py-2.5 sm:py-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <span className={`text-[14px] font-semibold tracking-wide ${
          person.status === 'Active' ? 'text-teal-700 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400'
        }`}>
          {person.status === 'Active' ? '● Активен' : person.status === 'Lead' ? '◆ Потенциален' : person.status === 'Prospect' ? '◇ Перспективен' : person.status === 'Excluded' ? '✕ Изключен' : '○ Неактивен'}
        </span>

        <div className="flex items-center gap-1">
          {getFirstPhone(person.phone) && (
            <>
              <a
                href={`tel:${getFirstPhone(person.phone)}`}
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="Обади се"
              >
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </a>
              <span className="inline-block" onClick={(e) => e.stopPropagation()}>
                <WhatsAppButton phone={getFirstPhone(person.phone)!} name={person.fullName} />
              </span>
            </>
          )}
          {person.socialFb && (
            <a
              href={person.socialFb}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title="Facebook"
            >
              <Facebook className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </a>
          )}
          {person.socialInstagram && (
            <a
              href={person.socialInstagram}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-slate-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/30 rounded-lg transition-colors"
              title="Instagram"
            >
              <Instagram className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </a>
          )}
          {person.socialLinkedin && (
            <a
              href={person.socialLinkedin}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title="LinkedIn"
            >
              <Linkedin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </a>
          )}
          {person.email && (
            <a
              href={`mailto:${person.email}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title="Имейл"
            >
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
})

export default PersonCard
