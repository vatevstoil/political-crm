import Link from 'next/link'
import { Users, UserPlus, Activity, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ocean-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Political CRM
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Управление на членове, симпатизанти и кампании на едно място
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/directory"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <Users className="mr-2 h-5 w-5" />
                Виж Картотеката
              </Link>
              <Link
                href="/directory/new"
                className="inline-flex items-center px-8 py-4 bg-white/20 text-white font-semibold rounded-full border-2 border-white/30 hover:bg-white/30 transition-all duration-200"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Добави Член
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stat Card 1 */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-teal-500 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12%
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">1,248</h3>
            <p className="text-slate-500 mt-1">Общо членове</p>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-50 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-teal-500 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +5%
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">892</h3>
            <p className="text-slate-500 mt-1">Активни членове</p>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-teal-100 rounded-xl">
                <UserPlus className="h-6 w-6 text-teal-600" />
              </div>
              <span className="text-sm font-medium text-teal-500 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +28%
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">47</h3>
            <p className="text-slate-500 mt-1">Нови този месец</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Бързи Действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/directory"
            className="group flex items-center p-4 bg-white rounded-xl shadow border border-slate-200 hover:shadow-md transition-all"
          >
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mr-4">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">Картотека</h3>
              <p className="text-sm text-slate-500">Виж всички членове</p>
            </div>
          </Link>

          <Link
            href="/directory/new"
            className="group flex items-center p-4 bg-white rounded-xl shadow border border-slate-200 hover:shadow-md transition-all"
          >
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg mr-4">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">Добави Член</h3>
              <p className="text-sm text-slate-500">Регистрирай нов човек</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
