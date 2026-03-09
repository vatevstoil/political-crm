'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, Send, Users, Mail, FileText, ChevronRight, Loader2 } from 'lucide-react'
import { getSegmentRecipients, sendBulkEmail, type SegmentFilters, type RecipientPreviewData } from '@/app/actions/messaging'
import { getSavedFilters, type SavedFilterWithId } from '@/app/actions/savedFilters'
import { getTemplates } from '@/app/actions/templates'
import { getGroups } from '@/app/actions/groups'
import RecipientPreview from '@/components/messaging/RecipientPreview'
import MessageHistory from '@/components/messaging/MessageHistory'
import { toast } from 'sonner'

type Step = 'segment' | 'compose' | 'preview'

export default function MessagingPage() {
  const [step, setStep] = useState<Step>('segment')

  // Segment
  const [savedFilters, setSavedFilters] = useState<SavedFilterWithId[]>([])
  const [groups, setGroups] = useState<{ id: number; name: string; color: string }[]>([])
  const [selectedFilterId, setSelectedFilterId] = useState<number | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [recipientData, setRecipientData] = useState<RecipientPreviewData | null>(null)
  const [loadingRecipients, setLoadingRecipients] = useState(false)

  // Compose
  const [templates, setTemplates] = useState<{ id: number; name: string; subject: string; body: string }[]>([])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [selectedTemplateName, setSelectedTemplateName] = useState('')

  // Send
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null)

  useEffect(() => {
    getSavedFilters().then(setSavedFilters)
    getGroups().then(setGroups)
    getTemplates().then(setTemplates)
  }, [])

  const currentFilters = useCallback((): SegmentFilters => {
    if (selectedFilterId) {
      const filter = savedFilters.find(f => f.id === selectedFilterId)
      if (filter) return filter.filters
    }
    if (selectedGroupId) {
      return { groupId: selectedGroupId }
    }
    return {}
  }, [selectedFilterId, selectedGroupId, savedFilters])

  const loadRecipients = useCallback(async () => {
    const filters = currentFilters()
    if (!filters.query && !filters.role && !filters.city && !filters.status &&
        !filters.profession && !filters.gender && !filters.groupId && !filters.tagId) {
      setRecipientData(null)
      return
    }
    setLoadingRecipients(true)
    const data = await getSegmentRecipients(filters)
    setRecipientData(data)
    setLoadingRecipients(false)
  }, [currentFilters])

  useEffect(() => {
    loadRecipients()
  }, [loadRecipients])

  const handleSelectFilter = (id: number) => {
    setSelectedFilterId(id)
    setSelectedGroupId('')
  }

  const handleSelectGroup = (gid: string) => {
    setSelectedGroupId(gid)
    setSelectedFilterId(null)
  }

  const handleSelectTemplate = (id: number) => {
    const tpl = templates.find(t => t.id === id)
    if (tpl) {
      setSubject(tpl.subject)
      setBody(tpl.body)
      setSelectedTemplateName(tpl.name)
    }
  }

  const handleSend = async () => {
    setSending(true)
    const filters = currentFilters()
    const res = await sendBulkEmail(filters, subject, body, selectedTemplateName || undefined)
    if (res.success) {
      setResult({ sent: res.sent, failed: res.failed })
      setStep('preview')
    } else {
      toast.error(res.error || 'Грешка при изпращане')
    }
    setSending(false)
  }

  const resetAll = () => {
    setStep('segment')
    setSelectedFilterId(null)
    setSelectedGroupId('')
    setSubject('')
    setBody('')
    setSelectedTemplateName('')
    setRecipientData(null)
    setResult(null)
  }

  const canProceedToCompose = recipientData && recipientData.withEmail > 0
  const canSend = subject.trim() && body.trim() && canProceedToCompose

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <MessageSquare className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold gradient-text">Съобщения</h1>
            <p className="text-slate-500 dark:text-slate-400">Групово изпращане на имейли</p>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8">
          {(['segment', 'compose', 'preview'] as Step[]).map((s, i) => {
            const labels = ['Сегмент', 'Съставяне', 'Резултат']
            const icons = [Users, Mail, Send]
            const Icon = icons[i]
            const isActive = step === s
            const isDone = (['segment', 'compose', 'preview'] as Step[]).indexOf(step) > i

            return (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : isDone ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  <Icon className="h-4 w-4" />
                  {labels[i]}
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Step 1: Segment */}
            {step === 'segment' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Изберете получатели
                </h2>

                {/* Saved filters */}
                {savedFilters.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Запазени филтри</h3>
                    <div className="flex flex-wrap gap-2">
                      {savedFilters.map(f => (
                        <button
                          key={f.id}
                          onClick={() => handleSelectFilter(f.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                            selectedFilterId === f.id
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                          }`}
                        >
                          <div className={`w-2.5 h-2.5 rounded-full ${selectedFilterId === f.id ? 'bg-white' : ''}`}
                            style={{ backgroundColor: selectedFilterId === f.id ? undefined : f.color }}
                          />
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Groups */}
                {groups.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Групи</h3>
                    <div className="flex flex-wrap gap-2">
                      {groups.map(g => (
                        <button
                          key={g.id}
                          onClick={() => handleSelectGroup(String(g.id))}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                            selectedGroupId === String(g.id)
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                          }`}
                        >
                          <div className={`w-2.5 h-2.5 rounded-full ${selectedGroupId === String(g.id) ? 'bg-white' : ''}`}
                            style={{ backgroundColor: selectedGroupId === String(g.id) ? undefined : g.color }}
                          />
                          {g.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {savedFilters.length === 0 && groups.length === 0 && (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                    <p className="text-sm">Създайте запазени филтри или групи, за да изпращате групови съобщения.</p>
                  </div>
                )}

                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setStep('compose')}
                    disabled={!canProceedToCompose}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Продължи
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Compose */}
            {step === 'compose' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Съставете съобщение
                </h2>

                {/* Template picker */}
                {templates.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <FileText className="h-4 w-4" />
                      Използвай шаблон
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {templates.map(t => (
                        <button
                          key={t.id}
                          onClick={() => handleSelectTemplate(t.id)}
                          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Тема *</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      placeholder="Тема на имейла..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Съдържание *</label>
                    <textarea
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      rows={8}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      placeholder="Въведете съобщението. Можете да използвате {{fullName}}, {{firstName}}, {{city}}, {{email}} за персонализация."
                    />
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Налични полета: {'{{firstName}}'}, {'{{fullName}}'}, {'{{email}}'}, {'{{city}}'}, {'{{profession}}'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setStep('segment')}
                    className="px-4 py-2.5 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Назад
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!canSend || sending}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Изпращане...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Изпрати на {recipientData?.withEmail || 0} получател{(recipientData?.withEmail || 0) !== 1 ? 'я' : ''}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Result */}
            {step === 'preview' && result && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Съобщението е изпратено!</h2>
                <div className="flex justify-center gap-6 mb-6">
                  <div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{result.sent}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">успешно</div>
                  </div>
                  {result.failed > 0 && (
                    <div>
                      <div className="text-2xl font-bold text-red-500">{result.failed}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">неуспешно</div>
                    </div>
                  )}
                </div>
                <button
                  onClick={resetAll}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Ново съобщение
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RecipientPreview data={recipientData} loading={loadingRecipients} />

            {/* Message History */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">История</h3>
              <MessageHistory />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
