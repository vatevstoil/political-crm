'use client'

import { Person } from '@prisma/client'
import Link from 'next/link'
import Image from 'next/image'
import { Cake, User } from 'lucide-react'

interface UpcomingBirthdaysProps {
  birthdays: Person[]
}

export default function UpcomingBirthdays({ birthdays }: UpcomingBirthdaysProps) {
  const formatBirthday = (birthDate: Date | null) => {
    if (!birthDate) return ''
    const date = new Date(birthDate)
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`
  }

  if (birthdays.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Cake className="h-5 w-5 mr-2 text-pink-500" />
          Предстоящи рождени дни
        </h3>
        <p className="text-gray-500 text-sm">Няма предстоящи рождени дни</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Cake className="h-5 w-5 mr-2 text-pink-500" />
        Предстоящи рождени дни
      </h3>
      <ul className="space-y-3">
        {birthdays.map((person) => (
          <li key={person.id}>
            <Link
              href={`/directory/${person.id}`}
              className="flex items-center hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
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
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {person.fullName}
                </p>
                <p className="text-xs text-gray-500">
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
