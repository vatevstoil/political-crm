import { getTemplates, getTelegramTemplates } from '@/app/actions/templates'
import TemplatesClient from './TemplatesClient'

export const dynamic = 'force-dynamic'

export default async function TemplatesPage() {
  const templates = await getTemplates()
  const telegramTemplates = await getTelegramTemplates()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Шаблони</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Управлявайте стандартните текстове за бързо изпращане на имейли и телеграм съобщения.
          </p>
        </div>

        <TemplatesClient initialTemplates={templates} initialTelegramTemplates={telegramTemplates} />
      </div>
    </div>
  )
}
