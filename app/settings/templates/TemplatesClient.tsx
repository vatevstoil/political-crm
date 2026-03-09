'use client'

import { useState, useTransition } from 'react'
import { EmailTemplate, TelegramTemplate } from '@prisma/client'
import { 
  createTemplate, updateTemplate, deleteTemplate,
  createTelegramTemplate, updateTelegramTemplate, deleteTelegramTemplate
} from '@/app/actions/templates'
import { Plus, Save, Trash2, ArrowLeft, Lightbulb, Mail, Send } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

type TemplateType = 'email' | 'telegram'

interface TemplatesClientProps {
  initialTemplates: EmailTemplate[]
  initialTelegramTemplates: TelegramTemplate[]
}

export default function TemplatesClient({ initialTemplates, initialTelegramTemplates }: TemplatesClientProps) {
  const [templateType, setTemplateType] = useState<TemplateType>('email')
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(initialTemplates)
  const [telegramTemplates, setTelegramTemplates] = useState<TelegramTemplate[]>(initialTelegramTemplates)
  
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<EmailTemplate | null>(null)
  const [selectedTelegramTemplate, setSelectedTelegramTemplate] = useState<TelegramTemplate | null>(null)
  
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [message, setMessage] = useState('')
  
  const [isPending, startTransition] = useTransition()

  const templates = templateType === 'email' ? emailTemplates : telegramTemplates
  const selectedTemplate = templateType === 'email' ? selectedEmailTemplate : selectedTelegramTemplate

  const handleSelectEmail = (t: EmailTemplate) => {
    setSelectedEmailTemplate(t)
    setSelectedTelegramTemplate(null)
    setName(t.name)
    setSubject(t.subject)
    setBody(t.body)
    setMessage('')
  }

  const handleSelectTelegram = (t: TelegramTemplate) => {
    setSelectedTelegramTemplate(t)
    setSelectedEmailTemplate(null)
    setName(t.name)
    setMessage(t.message)
    setSubject('')
    setBody('')
  }

  const handleAddNew = () => {
    if (templateType === 'email') {
      setSelectedEmailTemplate(null)
      setName('')
      setSubject('')
      setBody('')
    } else {
      setSelectedTelegramTemplate(null)
      setName('')
      setMessage('')
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    
    startTransition(async () => {
      try {
        if (templateType === 'email') {
          if (selectedEmailTemplate) {
            await updateTemplate(selectedEmailTemplate.id, name, subject, body)
            setEmailTemplates(prev => prev.map(t => t.id === selectedEmailTemplate.id ? { ...t, name, subject, body, updatedAt: new Date() } : t))
            toast.success('Шаблонът е обновен')
          } else {
            const newTemplate = await createTemplate(name, subject, body)
            setEmailTemplates(prev => [...prev, newTemplate])
            setSelectedEmailTemplate(newTemplate)
            toast.success('Шаблонът е създаден')
          }
        } else {
          if (selectedTelegramTemplate) {
            await updateTelegramTemplate(selectedTelegramTemplate.id, name, message)
            setTelegramTemplates(prev => prev.map(t => t.id === selectedTelegramTemplate.id ? { ...t, name, message, updatedAt: new Date() } : t))
            toast.success('Шаблонът е обновен')
          } else {
            const newTemplate = await createTelegramTemplate(name, message)
            setTelegramTemplates(prev => [...prev, newTemplate])
            setSelectedTelegramTemplate(newTemplate)
            toast.success('Шаблонът е създаден')
          }
        }
      } catch (error) {
        console.error(error)
        toast.error('При запазването възникна грешка.')
      }
    })
  }

  const handleDelete = () => {
    if (!selectedTemplate) return
    if (!confirm(`Сигурни ли сте, че искате да изтриете шаблона "${selectedTemplate.name}"?`)) return
    
    startTransition(async () => {
      try {
        if (templateType === 'email') {
          await deleteTemplate(selectedEmailTemplate!.id)
          setEmailTemplates(prev => prev.filter(t => t.id !== selectedEmailTemplate!.id))
        } else {
          await deleteTelegramTemplate(selectedTelegramTemplate!.id)
          setTelegramTemplates(prev => prev.filter(t => t.id !== selectedTelegramTemplate!.id))
        }
        handleAddNew()
        toast.success('Шаблонът е изтрит')
      } catch (error) {
        console.error(error)
        toast.error('Грешка при изтриване')
      }
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar List */}
      <div className="lg:col-span-4 space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/settings" className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Назад към Настройки
          </Link>
        </div>

        {/* Type Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-1 flex border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => { setTemplateType('email'); handleAddNew() }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              templateType === 'email'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Mail className="w-4 h-4" />
            Имейл
          </button>
          <button
            onClick={() => { setTemplateType('telegram'); handleAddNew() }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              templateType === 'telegram'
                ? 'bg-[#0088cc] text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Send className="w-4 h-4" />
            Телеграм
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-3 border-b border-slate-100 dark:border-slate-700">
            <button
              onClick={handleAddNew}
              className="w-full flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Нов {templateType === 'email' ? 'имейл' : 'телеграм'} шаблон
            </button>
          </div>

          {templates.length === 0 ? (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
              Няма намерени шаблони. Създайте първия си шаблон.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[500px] overflow-y-auto">
              {templateType === 'email' ? (
                emailTemplates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectEmail(t)}
                    className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                      selectedEmailTemplate?.id === t.id
                        ? 'bg-blue-50/50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                        : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{t.name}</h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-6 line-clamp-1">{t.subject}</p>
                  </button>
                ))
              ) : (
                telegramTemplates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTelegram(t)}
                    className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                      selectedTelegramTemplate?.id === t.id
                        ? 'bg-[#0088cc]/10 border-l-4 border-l-[#0088cc]'
                        : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-[#0088cc]" />
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{t.name}</h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-6 line-clamp-1">{t.message.slice(0, 50)}...</p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="lg:col-span-8">
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {selectedTemplate 
                ? `Редактиране на ${templateType === 'email' ? 'имейл' : 'телеграм'} шаблон` 
                : `Създаване на нов ${templateType === 'email' ? 'имейл' : 'телеграм'} шаблон`}
            </h2>
            {selectedTemplate && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Изтрий шаблона"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 flex gap-3 text-sm text-yellow-800 dark:text-yellow-300 mb-6">
            <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0" />
            <div>
              <p className="font-semibold mb-1">Динамични променливи</p>
              <p>Тези променливи ще бъдат заменени с реалните данни на лицето при изпращането: 
                <code className="bg-yellow-100 px-1 rounded ml-1">{"{{firstName}}"}</code>
                <code className="bg-yellow-100 px-1 rounded ml-1">{"{{fullName}}"}</code>
                <code className="bg-yellow-100 px-1 rounded ml-1">{"{{city}}"}</code>
                <code className="bg-yellow-100 px-1 rounded ml-1">{"{{profession}}"}</code>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Име на Шаблона (само за вътрешна употреба)</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={templateType === 'email' ? "напр. Поздрав за рожден ден" : "напр. Поздрав за рожден ден (TG)"}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:bg-white dark:focus:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors dark:text-slate-100 dark:placeholder:text-slate-400"
              />
            </div>

            {templateType === 'email' ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Тема на Имейла (Subject)</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Здравей, {{firstName}}!"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:bg-white dark:focus:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors dark:text-slate-100 dark:placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Съдържание на Имейла</label>
                  <textarea
                    required
                    rows={10}
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Уважаеми/а {{fullName}}, бихме искали да..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:bg-white dark:focus:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none dark:text-slate-100 dark:placeholder:text-slate-400"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Съобщение за Телеграм</label>
                <textarea
                  required
                  rows={10}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Здравейте, {{fullName}}! 👋&#10;&#10;Искаме да ви информираме за..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:bg-white dark:focus:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0088cc]/20 focus:border-[#0088cc] transition-colors resize-none dark:text-slate-100 dark:placeholder:text-slate-400"
                />
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isPending || !name || (templateType === 'email' ? (!subject || !body) : !message)}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              style={templateType === 'telegram' ? { backgroundColor: '#0088cc' } : {}}
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Запази
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
