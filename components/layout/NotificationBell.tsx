'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Bell, Clock, CheckSquare, AlertTriangle, X } from 'lucide-react'
import { getNotificationCounts, getNotificationItems, type NotificationItem } from '@/app/actions/header'
import { formatDistanceToNow } from 'date-fns'
import { bg } from 'date-fns/locale'

export default function NotificationBell() {
  const [count, setCount] = useState(0)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Load counts on mount and periodically
  useEffect(() => {
    const loadCounts = async () => {
      const data = await getNotificationCounts()
      setCount(data.total)
    }
    loadCounts()
    const interval = setInterval(loadCounts, 60_000) // refresh every minute
    return () => clearInterval(interval)
  }, [])

  // Load items when dropdown opens
  const openDropdown = useCallback(async () => {
    setIsOpen(true)
    if (!loaded) {
      const data = await getNotificationItems()
      setItems(data)
      setLoaded(true)
    }
  }, [loaded])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => isOpen ? setIsOpen(false) : openDropdown()}
        className="relative p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
        title="Известия"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white dark:ring-purple-950 animate-pulse">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                Просрочени ({count})
              </span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">
              Няма просрочени елементи
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
              {items.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={item.personId ? `/directory/${item.personId}` : '/'}
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${
                    item.type === 'reminder'
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {item.type === 'reminder' ? <Clock className="h-3.5 w-3.5" /> : <CheckSquare className="h-3.5 w-3.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.personName && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.personName}</span>
                      )}
                      <span className="text-xs text-red-500 font-medium">
                        {formatDistanceToNow(new Date(item.dueDate), { addSuffix: true, locale: bg })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Виж всички на таблото →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
