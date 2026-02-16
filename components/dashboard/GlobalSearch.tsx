'use client'

import { useState, useEffect, useRef } from 'react'
import { searchPeople } from '@/app/actions/search'
import { Person } from '@prisma/client'
import Link from 'next/link'
import { Search, User, Phone, MapPin, Briefcase, CreditCard } from 'lucide-react'
import Image from 'next/image'

function getMatchInfo(person: Person, query: string): { icon: React.ReactNode; label: string } | null {
  const q = query.toLowerCase()
  if (person.fullName?.toLowerCase().includes(q)) return { icon: <User className="h-3 w-3" />, label: 'Име' }
  if (person.phone?.includes(q)) return { icon: <Phone className="h-3 w-3" />, label: 'Телефон' }
  if (person.membershipCardId?.toLowerCase().includes(q)) return { icon: <CreditCard className="h-3 w-3" />, label: 'Карта' }
  if (person.email?.toLowerCase().includes(q)) return { icon: <Search className="h-3 w-3" />, label: 'Имейл' }
  if (person.city?.toLowerCase().includes(q)) return { icon: <MapPin className="h-3 w-3" />, label: 'Град' }
  if (person.profession?.toLowerCase().includes(q)) return { icon: <Briefcase className="h-3 w-3" />, label: 'Професия' }
  return null
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Person[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const search = async () => {
      if (query.trim().length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const data = await searchPeople(query)
        setResults(data)
        setIsOpen(data.length > 0)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(search, 300)
    return () => clearTimeout(debounce)
  }, [query])

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-500" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Търси по всяко поле..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-600 focus:outline-none focus:placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-80 overflow-y-auto">
          {results.map((person) => {
            const match = getMatchInfo(person, query)
            return (
              <Link
                key={person.id}
                href={`/directory/${person.id}`}
                className="flex items-center px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                onClick={() => setIsOpen(false)}
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
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {person.fullName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600 truncate">
                    <span>{person.role || 'Без роля'}</span>
                    {person.city && (
                      <>
                        <span>•</span>
                        <span>{person.city}</span>
                      </>
                    )}
                    {match && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-blue-600">
                          {match.icon}
                          {match.label}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
