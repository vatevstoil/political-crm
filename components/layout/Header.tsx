'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Menu, X, Home, FolderOpen, Calendar, MapPin, Settings, MessageSquare, UserSearch, ClipboardList } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import NotificationBell from './NotificationBell'
import GlobalSearch from './GlobalSearch'
import QuickAdd from './QuickAdd'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileMenuOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

  const navItems = [
    { href: '/', label: 'Начало', icon: Home },
    { href: '/directory', label: 'Картотека', icon: UserSearch },
    { href: '/groups', label: 'Групи', icon: FolderOpen },
    { href: '/events', label: 'Календар', icon: Calendar },
    { href: '/messaging', label: 'Съобщения', icon: MessageSquare },
    { href: '/map', label: 'Карта', icon: MapPin },
    { href: '/sections', label: 'Секции', icon: ClipboardList },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm dark:bg-gradient-to-r dark:from-purple-950 dark:via-indigo-950 dark:to-slate-900 dark:shadow-lg dark:shadow-purple-950/40 dark:border-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-500/20 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-500/30 transition-colors">
                <Users className="h-5 w-5 text-purple-600 dark:text-white" />
              </div>
              <span className="text-lg font-bold text-slate-800 dark:text-white hidden sm:block tracking-tight">
                Political <span className="text-purple-500 dark:text-purple-300/70 font-normal">CRM</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navItems.map(item => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-purple-100 text-purple-700 shadow-sm ring-1 ring-purple-200 dark:bg-purple-500/30 dark:text-white dark:shadow-purple-500/20 dark:ring-purple-400/30'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10'
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${active ? 'text-purple-500 dark:text-purple-300' : 'text-slate-400 dark:text-white/40'}`} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-1">
              <GlobalSearch />
              <QuickAdd />
              <NotificationBell />
              <div className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-purple-400/20 mx-1" />
              <ThemeToggle />
              <Link
                href="/settings"
                className={`hidden sm:flex p-2 rounded-lg transition-colors ${
                  pathname.startsWith('/settings')
                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-200'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/5'
                }`}
                title="Настройки"
              >
                <Settings className="h-4.5 w-4.5" />
              </Link>

              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5 transition-colors ml-1"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Меню"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-nav"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide-down panel */}
          <div id="mobile-nav" className="absolute top-14 left-0 right-0 bg-white shadow-2xl rounded-b-2xl overflow-hidden animate-slideDown border-b border-slate-200 dark:bg-gradient-to-b dark:from-purple-950 dark:via-indigo-950 dark:to-slate-900 dark:border-purple-800/30">
            <nav className="flex flex-col p-3 gap-1">
              {navItems.map(item => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${
                      active
                        ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200 dark:bg-purple-500/20 dark:text-white dark:ring-purple-400/20'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50 active:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/5 dark:active:bg-white/10'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${active ? 'text-purple-500 dark:text-purple-300' : 'text-slate-400 dark:text-white/40'}`} />
                    {item.label}
                  </Link>
                )
              })}

              {/* Settings in mobile menu */}
              <div className="border-t border-slate-200 dark:border-purple-800/30 mt-1 pt-1">
                <Link
                  href="/settings"
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${
                    pathname.startsWith('/settings')
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-white'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/5'
                  }`}
                >
                  <Settings className="h-5 w-5 text-slate-400 dark:text-white/40" />
                  Настройки
                </Link>
              </div>
            </nav>

            {/* Keyboard shortcut hint */}
            <div className="px-4 py-3 text-center text-slate-400 dark:text-white/40 text-xs border-t border-slate-100 dark:border-white/10">
              Натисни <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 rounded text-slate-500 dark:text-white/60">Ctrl+K</kbd> за бързо търсене
            </div>
          </div>
        </div>
      )}
    </>
  )
}
