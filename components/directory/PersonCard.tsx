'use client'

import { Person } from '@prisma/client'
import { User, MapPin, Phone, Mail } from 'lucide-react'
import Link from 'next/link'

interface PersonCardProps {
  person: Person
}

export default function PersonCard({ person }: PersonCardProps) {
  return (
    <div className="group bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-start justify-between">
          {/* Avatar with gradient ring */}
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
              <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                {person.photoUrl ? (
                  <img 
                    src={person.photoUrl} 
                    alt={person.fullName} 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <User className="h-8 w-8 text-slate-400" />
                )}
              </div>
            </div>
            {/* Status indicator */}
            <div className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${
              person.status === 'Active' ? 'bg-teal-500' : 'bg-slate-400'
            }`} />
          </div>
          
          {/* Role Badge */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm">
            {person.role}
          </span>
        </div>

        {/* Name & ID */}
        <div className="mt-4">
          <h3 className="text-lg font-bold text-slate-900 truncate" title={person.fullName}>
            {person.fullName}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              #{person.membershipCardId}
            </span>
          </p>
        </div>
        
        {/* Contact Info */}
        <div className="mt-4 space-y-2">
          {person.city && (
            <div className="flex items-center text-sm text-slate-600">
              <MapPin className="h-4 w-4 mr-2 text-blue-600" />
              {person.city}
            </div>
          )}
          {person.phone && (
            <div className="flex items-center text-sm text-slate-600">
              <Phone className="h-4 w-4 mr-2 text-purple-600" />
              {person.phone}
            </div>
          )}
          {person.email && (
            <div className="flex items-center text-sm text-slate-600 truncate">
              <Mail className="h-4 w-4 mr-2 text-teal-500 flex-shrink-0" />
              <span className="truncate">{person.email}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
        <Link 
          href={`/directory/${person.id}`}
          className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          Виж профил →
        </Link>
        <span className={`text-xs font-medium ${
          person.status === 'Active' ? 'text-teal-600' : 'text-slate-500'
        }`}>
          {person.status === 'Active' ? '🟢 Активен' : '⚪ Неактивен'}
        </span>
      </div>
    </div>
  )
}
