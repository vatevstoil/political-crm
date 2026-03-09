'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, MessageCircle } from 'lucide-react'
import { getTelegramTemplates } from '@/app/actions/templates'

interface TelegramTemplate {
  id: number
  name: string
  message: string
}

interface TelegramButtonProps {
  username: string
  firstName?: string
  fullName?: string
  city?: string
  profession?: string
}

function replaceVariables(message: string, vars: { firstName?: string; fullName?: string; city?: string; profession?: string }): string {
  let result = message
  result = result.replace(/{{firstName}}/g, vars.firstName || '')
  result = result.replace(/{{fullName}}/g, vars.fullName || '')
  result = result.replace(/{{city}}/g, vars.city || '')
  result = result.replace(/{{profession}}/g, vars.profession || '')
  return result
}

export default function TelegramButton({ username, firstName, fullName, city, profession }: TelegramButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [templates, setTemplates] = useState<TelegramTemplate[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getTelegramTemplates().then(setTemplates).catch(console.error)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSendMessage = (message?: string) => {
    const cleaned = username.replace(/@/g, '').trim()
    // Detect phone numbers: starts with + or digits only
    const isPhone = /^\+?\d[\d\s\-()]+$/.test(cleaned)
    const identifier = isPhone
      ? '+' + cleaned.replace(/[\s\-()]/g, '').replace(/^\+/, '')
      : cleaned

    const vars = { firstName, fullName, city, profession }
    const finalMessage = message ? replaceVariables(message, vars) : ''

    const telegramUrl = finalMessage
      ? `https://t.me/${identifier}?text=${encodeURIComponent(finalMessage)}`
      : `https://t.me/${identifier}`

    window.open(telegramUrl, '_blank')
    setShowDropdown(false)
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {templates.length > 0 ? (
        <>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="inline-flex items-center justify-center p-2 rounded-lg bg-[#0088cc] hover:bg-[#0077b3] text-white transition-colors duration-200"
            aria-label={fullName ? `Telegram на ${fullName}` : 'Telegram'}
          >
            <Send className="h-5 w-5" />
          </button>
          {showDropdown && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase">Избери шаблон</p>
              </div>
              <button
                onClick={() => handleSendMessage()}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-700"
              >
                <MessageCircle className="w-4 h-4 text-slate-400" />
                Без шаблон
              </button>
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSendMessage(t.message)}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-700"
                >
                  <Send className="w-4 h-4 text-[#0088cc]" />
                  <span className="truncate">{t.name}</span>
                </button>
              ))}
              <div className="px-3 py-2 border-t border-slate-100 mt-1">
                <a 
                  href="/settings/templates" 
                  target="_blank"
                  className="text-xs text-blue-600 hover:underline"
                >
                  + Управлявай шаблони
                </a>
              </div>
            </div>
          )}
        </>
      ) : (
        <button
          onClick={() => handleSendMessage()}
          className="inline-flex items-center justify-center p-2 rounded-lg bg-[#0088cc] hover:bg-[#0077b3] text-white transition-colors duration-200"
          aria-label={fullName ? `Telegram на ${fullName}` : 'Telegram'}
        >
          <Send className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
