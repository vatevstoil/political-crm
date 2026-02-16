'use client'

import { MessageCircle } from 'lucide-react'

interface WhatsAppButtonProps {
  phone: string
  message?: string
  name?: string
}

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.startsWith('0')) {
    return '359' + cleaned.slice(1)
  }
  
  if (!cleaned.startsWith('359')) {
    return '359' + cleaned
  }
  
  return cleaned
}

export default function WhatsAppButton({ phone, message = '', name }: WhatsAppButtonProps) {
  const formattedPhone = formatPhoneNumber(phone)
  const waUrl = message 
    ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${formattedPhone}`

  const handleClick = () => {
    window.open(waUrl, '_blank')
  }

  const button = (
    <button
      onClick={handleClick}
      className="inline-flex items-center justify-center p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors duration-200"
      aria-label={name ? `WhatsApp на ${name}` : 'WhatsApp'}
    >
      <MessageCircle className="h-5 w-5" />
    </button>
  )

  if (name) {
    return (
      <div className="relative group inline-block">
        {button}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {name}
        </div>
      </div>
    )
  }

  return button
}
