'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, User, Phone, Mail, MapPin } from 'lucide-react'
import { quickSearch, type QuickSearchResult } from '@/app/actions/header'

export default function GlobalSearch() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<QuickSearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    setIsSearching(true)
    const data = await quickSearch(q)
    setResults(data)
    setSelectedIndex(0)
    setIsSearching(false)
  }, [])

  const handleInputChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 250)
  }

  const navigateTo = (id: number) => {
    setIsOpen(false)
    router.push(`/directory/${id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      navigateTo(results[selectedIndex].id)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
        title="Търсене (Ctrl+K)"
      >
        <Search className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={() => setIsOpen(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Palette */}
      <div
        className="relative w-full max-w-lg mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Търси хора по име, телефон, имейл..."
            className="flex-1 bg-transparent text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-sm outline-none"
          />
          <div className="flex items-center gap-1.5">
            {query && (
              <button onClick={() => { setQuery(''); setResults([]) }} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="h-4 w-4 text-slate-400" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 rounded">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results */}
        {query.length >= 2 && (
          <div className="max-h-80 overflow-y-auto">
            {isSearching ? (
              <div className="p-6 text-center text-slate-400 text-sm">Търсене...</div>
            ) : results.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">Няма резултати за &quot;{query}&quot;</div>
            ) : (
              <div className="py-1">
                {results.map((person, idx) => (
                  <button
                    key={person.id}
                    onClick={() => navigateTo(person.id)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      idx === selectedIndex
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {person.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{person.fullName}</span>
                        {person.role && <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{person.role}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        {person.city && (
                          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <MapPin className="h-3 w-3" />{person.city}
                          </span>
                        )}
                        {person.phone && (
                          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Phone className="h-3 w-3" />{person.phone}
                          </span>
                        )}
                        {person.email && (
                          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Mail className="h-3 w-3" />{person.email}
                          </span>
                        )}
                      </div>
                    </div>
                    {idx === selectedIndex && (
                      <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 rounded">
                        ↵
                      </kbd>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer hint */}
        {query.length < 2 && (
          <div className="px-4 py-3 text-xs text-slate-400 flex items-center gap-4">
            <span className="flex items-center gap-1"><User className="h-3 w-3" /> Търси по име</span>
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> Телефон</span>
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> Имейл</span>
          </div>
        )}
      </div>
    </div>
  )
}
