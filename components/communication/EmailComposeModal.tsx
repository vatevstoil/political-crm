'use client'

import { useState } from 'react'
import { X, Send, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface Recipient {
  email: string
  name: string
}

interface EmailComposeModalProps {
  isOpen: boolean
  onClose: () => void
  recipients: Recipient[]
  subject?: string
}

export default function EmailComposeModal({ 
  isOpen, 
  onClose, 
  recipients, 
  subject = '' 
}: EmailComposeModalProps) {
  const [emailSubject, setEmailSubject] = useState(subject)
  const [body, setBody] = useState('')

  if (!isOpen) return null

  const handleSend = () => {
    const bccEmails = recipients.map(r => r.email).join(',')
    const params = new URLSearchParams()
    params.set('subject', emailSubject)
    params.set('body', body)
    params.set('bcc', bccEmails)
    
    const mailto = `mailto:?${params.toString()}`
    window.location.href = mailto
    
    toast.success(`Отворен имейл клиент за ${recipients.length} получателя`)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Ново съобщение</h2>
                <p className="text-sm text-slate-500">
                  До: {recipients.length} получател{recipients.length !== 1 ? 'а' : ''}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Относно</label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="glass-input w-full px-4 py-3 text-slate-700 placeholder:text-slate-400"
              placeholder="Заглавиe на съобщението..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Съобщение</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="glass-input w-full px-4 py-3 text-slate-700 placeholder:text-slate-400 resize-none"
              placeholder="Напишете вашето съобщение..."
            />
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 glass-button px-4 py-3 font-medium text-slate-600"
          >
            Отказ
          </button>
          <button
            onClick={handleSend}
            className="flex-1 glass-button-primary px-4 py-3 flex items-center justify-center gap-2 font-medium"
          >
            <Send className="h-4 w-4" />
            Изпрати
          </button>
        </div>
      </div>
    </div>
  )
}
