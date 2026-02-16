'use client'

import { Person } from '@prisma/client'
import { User, MapPin, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import WhatsAppButton from '@/components/communication/WhatsAppButton'

interface PersonCardProps {
  person: Person
}

export default function PersonCard({ person }: PersonCardProps) {
  return (
    <Link 
      href={`/directory/${person.id}`}
      className="group bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block"
    >
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          {/* Avatar with gradient ring */}
          <div className="relative">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
              <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden relative">
                {person.photoUrl ? (
                  <Image 
                    src={person.photoUrl} 
                    alt={person.fullName} 
                    fill
                    className="object-cover" 
                  />
                ) : (
                  <User className="h-6 w-6 sm:h-8 sm:w-8 text-slate-500" />
                )}
              </div>
            </div>
            {/* Status indicator */}
            <div className={`absolute bottom-0 right-0 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white ${
              person.status === 'Active' ? 'bg-teal-500' : 'bg-slate-500'
            }`} />
          </div>
          
          {/* Role Badge */}
          <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            {person.role}
          </span>
        </div>

        {/* Name & ID */}
        <div className="mt-3 sm:mt-4">
          <h3 className="text-base sm:text-lg font-semibold text-slate-700 truncate" title={person.fullName}>
            {person.fullName}
          </h3>
          {person.membershipCardId && (
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                #{person.membershipCardId}
              </span>
            </p>
          )}
        </div>
        
        {/* Contact Info - Hidden on very small screens */}
        <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-2 hidden sm:block">
          {person.city && (
            <div className="flex items-center text-sm text-slate-500">
              <MapPin className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
              <span className="truncate">{person.city}</span>
            </div>
          )}
          {person.phone && (
            <div className="flex items-center text-sm text-slate-500">
              <Phone className="h-4 w-4 mr-2 text-purple-500 flex-shrink-0" />
              <span className="truncate">{person.phone}</span>
            </div>
          )}
          {person.email && (
            <div className="flex items-center text-sm text-slate-500 truncate">
              <Mail className="h-4 w-4 mr-2 text-teal-500 flex-shrink-0" />
              <span className="truncate">{person.email}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-slate-50 px-4 sm:px-6 py-2 sm:py-3 border-t border-slate-100 flex justify-between items-center">
        <span className={`text-xs sm:text-sm font-medium ${
          person.status === 'Active' ? 'text-teal-600' : 'text-slate-500'
        }`}>
          {person.status === 'Active' ? '● Активен' : '○ Неактивен'}
        </span>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          {person.phone && (
            <>
              <a 
                href={`tel:${person.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Обади се"
              >
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </a>
              <span className="inline-block" onClick={(e) => e.stopPropagation()}>
                <WhatsAppButton phone={person.phone} name={person.fullName} />
              </span>
            </>
          )}
          {person.email && (
            <a 
              href={`mailto:${person.email}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Имейл"
            >
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </a>
          )}
        </div>
      </div>
    </Link>
  )
}
