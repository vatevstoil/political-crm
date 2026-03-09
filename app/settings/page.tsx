import Link from 'next/link'
import { Settings, FileText, Tag, Copy, Database, Keyboard } from 'lucide-react'

const settingsCards = [
  {
    href: '/settings/templates',
    icon: FileText,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    title: 'Шаблони',
    description: 'Имейл и Телеграм шаблони за комуникация',
  },
  {
    href: '/settings/tags',
    icon: Tag,
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    title: 'Тагове',
    description: 'Създаване и управление на тагове',
  },
  {
    href: '/settings/duplicates',
    icon: Copy,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    title: 'Дубликати',
    description: 'Намиране и обединяване на дублирани записи',
  },
]

const infoCards = [
  {
    icon: Database,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    title: 'База данни',
    description: 'SQLite — локално съхранение',
  },
  {
    icon: Keyboard,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    title: 'Клавишни комбинации',
    description: 'Ctrl+K — търсене, ? — помощ',
  },
]

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Настройки</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Управление на системните настройки
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {settingsCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all group"
            >
              <div className={`w-12 h-12 rounded-lg ${card.bg} flex items-center justify-center mb-4`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {card.description}
              </p>
            </Link>
          ))}
        </div>

        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">Информация</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {infoCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center flex-shrink-0`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{card.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
