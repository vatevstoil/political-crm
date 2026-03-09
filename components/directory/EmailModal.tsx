'use client'

import { useState, useTransition, useEffect } from 'react'
import { Mail, X, Send, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'
import { sendEmailAction } from '@/app/actions/mail'
import { getTemplates } from '@/app/actions/templates'
import { EmailTemplate } from '@prisma/client'

interface EmailModalProps {
  personId: number
  email: string | null
  isOpen: boolean
  onClose: () => void
}

export default function EmailModal({ personId, email, isOpen, onClose }: EmailModalProps) {
  const [fromEmail, setFromEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isPending, startTransition] = useTransition()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])

  useEffect(() => {
    if (isOpen) {
      getTemplates().then(setTemplates).catch(console.error)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value
    if (!templateId) return
    const template = templates.find(t => t.id === Number(templateId))
    if (template) {
      setSubject(template.subject)
      setBody(template.body)
    }
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Лицето няма имейл адрес.')
      return
    }

    startTransition(async () => {
      const res = await sendEmailAction(personId, subject, body, fromEmail.trim() || undefined)
      if (res.success) {
        toast.success('Имейлът беше изпратен успешно! (Виж конзолата за тест URL)')
        setSubject('')
        setBody('')
        onClose()
      } else {
        toast.error(res.error || 'Грешка при изпращане')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-600 shadow-sm flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Изпрати Имейл</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Към: {email || 'Няма въведен имейл'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSend} className="p-4 sm:p-6 space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-3 flex gap-3 text-sm text-yellow-800 dark:text-yellow-300">
            <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0" />
            <div>
              <p className="font-semibold mb-1">Динамични променливи</p>
              <p>Можете да използвате следните променливи в темата и текста, които ще се заменят с данните на лицето: <code className="bg-yellow-100 dark:bg-yellow-800/40 px-1 rounded">{"{{firstName}}"}</code> <code className="bg-yellow-100 dark:bg-yellow-800/40 px-1 rounded">{"{{fullName}}"}</code> <code className="bg-yellow-100 dark:bg-yellow-800/40 px-1 rounded">{"{{city}}"}</code></p>
            </div>
          </div>

          {templates.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Бърз избор на шаблон</label>
              <select
                title="Избери шаблон"
                aria-label="Избери шаблон за имейл"
                onChange={handleTemplateChange}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:bg-white dark:focus:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-slate-900 dark:text-slate-100"
                defaultValue=""
              >
                <option value="" disabled>-- Изберете шаблон --</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">От (имейл адрес на подател)</label>
            <input
              type="email"
              value={fromEmail}
              onChange={e => setFromEmail(e.target.value)}
              placeholder="example@mail.com"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:bg-white dark:focus:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Тема</label>
            <input
              type="text"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Здравей, {{firstName}}!"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:bg-white dark:focus:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Съобщение</label>
            <textarea
              required
              rows={6}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Благодарим Ви за активността в град {{city}}..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:bg-white dark:focus:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={isPending || !email}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Изпрати
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
