'use client'

import { BirthdayPerson } from '@/app/actions/dashboard'
import Link from 'next/link'
import Image from 'next/image'
import { Cake, User } from 'lucide-react'

interface UpcomingBirthdaysProps {
  birthdays: BirthdayPerson[]
}

export default function UpcomingBirthdays({ birthdays }: UpcomingBirthdaysProps) {
  const formatBirthday = (birthDate: Date | null) => {
    if (!birthDate) return ''
    const date = new Date(birthDate)
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`
  }

  if (birthdays.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/50 p-6 border border-transparent dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center leading-snug">
          <Cake className="h-5 w-5 mr-2 text-pink-500" />
          Предстоящи рождени дни
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">Няма предстоящи рождени дни</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/50 p-6 border border-transparent dark:border-slate-700">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center leading-snug tracking-[-0.01em]">
        <Cake className="h-5 w-5 mr-2 text-pink-500" />
        Предстоящи рождени дни
      </h3>
      <ul className="space-y-3">
        {birthdays.map((person) => (
          <li key={person.id}>
            <Link
              href={`/directory/${person.id}`}
              className="flex items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg p-2 -mx-2 transition-colors"
            >
              <div className="flex-shrink-0 h-10 w-10 relative">
                {person.photoUrl ? (
                  <Image
                    src={person.photoUrl}
                    alt={person.fullName}
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate leading-snug">
                  {person.fullName}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {formatBirthday(person.birthDate)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
