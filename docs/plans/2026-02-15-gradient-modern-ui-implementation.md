# Gradient Modern UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Имплементиране на "Gradient Modern" дизайн система в Political CRM приложението

**Architecture:** Ще обновим Tailwind конфигурацията с кастомни цветове и градиенти, след което ще рефакторираме основните компоненти (layout, header, cards, filters) с новия стил. Всички промени ще се правят инкрементално с тестове.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui (ако е наличен), Lucide React

---

## Task 1: Обновяване на Tailwind Config и Global Styles

**Files:**
- Modify: `tailwind.config.ts` или `tailwind.config.js`
- Modify: `app/globals.css`

**Step 1: Добавяне на кастомни цветове в Tailwind config**

```javascript
// tailwind.config.ts - добави в theme.extend.colors
colors: {
  'ocean': {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },
  'teal': {
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
  }
}
```

**Step 2: Добавяне на CSS custom properties за градиенти в globals.css**

```css
/* app/globals.css - добави в началото */
:root {
  --gradient-primary: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
  --gradient-secondary: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  --gradient-text: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
}

/* Utility класове за градиенти */
.gradient-primary {
  background: var(--gradient-primary);
}

.gradient-text {
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

**Step 3: Тестване на конфигурацията**

Run: `npm run build`
Expected: Build успешен без грешки

**Step 4: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "chore: add custom colors and gradient utilities"
```

---

## Task 2: Създаване на Navigation Header Component

**Files:**
- Create: `components/layout/Header.tsx`
- Modify: `app/layout.tsx`

**Step 1: Създаване на Header компонент**

```typescript
// components/layout/Header.tsx
import Link from 'next/link'
import { Users, Menu } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Users className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">Political CRM</span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className="text-white/90 hover:text-white font-medium transition-colors"
            >
              Начало
            </Link>
            <Link 
              href="/directory" 
              className="text-white/90 hover:text-white font-medium transition-colors"
            >
              Картотека
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  )
}
```

**Step 2: Интегриране на Header в layout**

```typescript
// app/layout.tsx - обнови RootLayout
import Header from '@/components/layout/Header'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bg">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-ocean-50`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
```

**Step 3: Проверка в браузър**

Run: `npm run dev`
Check: http://localhost:3000 - трябва да видиш gradient header

**Step 4: Commit**

```bash
git add components/layout/Header.tsx app/layout.tsx
git commit -m "feat: add gradient navigation header"
```

---

## Task 3: Рефакториране на PersonCard с Gradient Стил

**Files:**
- Modify: `components/directory/PersonCard.tsx`

**Step 1: Обновяване на дизайна**

```typescript
// components/directory/PersonCard.tsx
import { Person } from '@prisma/client'
import { User, MapPin, Phone, Mail } from 'lucide-react'
import Link from 'next/link'

interface PersonCardProps {
  person: Person
}

export default function PersonCard({ person }: PersonCardProps) {
  return (
    <div className="group bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-start justify-between">
          {/* Avatar with gradient ring */}
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
              <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                {person.photoUrl ? (
                  <img 
                    src={person.photoUrl} 
                    alt={person.fullName} 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <User className="h-8 w-8 text-slate-400" />
                )}
              </div>
            </div>
            {/* Status indicator */}
            <div className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${
              person.status === 'Active' ? 'bg-teal-500' : 'bg-slate-400'
            }`} />
          </div>
          
          {/* Role Badge */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm">
            {person.role}
          </span>
        </div>

        {/* Name & ID */}
        <div className="mt-4">
          <h3 className="text-lg font-bold text-slate-900 truncate" title={person.fullName}>
            {person.fullName}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              #{person.membershipCardId}
            </span>
          </p>
        </div>
        
        {/* Contact Info */}
        <div className="mt-4 space-y-2">
          {person.city && (
            <div className="flex items-center text-sm text-slate-600">
              <MapPin className="h-4 w-4 mr-2 text-blue-600" />
              {person.city}
            </div>
          )}
          {person.phone && (
            <div className="flex items-center text-sm text-slate-600">
              <Phone className="h-4 w-4 mr-2 text-purple-600" />
              {person.phone}
            </div>
          )}
          {person.email && (
            <div className="flex items-center text-sm text-slate-600 truncate">
              <Mail className="h-4 w-4 mr-2 text-teal-500 flex-shrink-0" />
              <span className="truncate">{person.email}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
        <Link 
          href={`/directory/${person.id}`}
          className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          Виж профил →
        </Link>
        <span className={`text-xs font-medium ${
          person.status === 'Active' ? 'text-teal-600' : 'text-slate-500'
        }`}>
          {person.status === 'Active' ? '🟢 Активен' : '⚪ Неактивен'}
        </span>
      </div>
    </div>
  )
}
```

**Step 2: Проверка в браузър**

Run: `npm run dev`
Check: http://localhost:3000/directory

**Step 3: Commit**

```bash
git add components/directory/PersonCard.tsx
git commit -m "feat: redesign PersonCard with gradient modern style"
```

---

## Task 4: Рефакториране на FilterBar с Modern Стил

**Files:**
- Modify: `components/directory/FilterBar.tsx`

**Step 1: Обновяване на дизайна**

```typescript
// components/directory/FilterBar.tsx
'use client'

import { Search, MapPin, Briefcase, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export interface FilterBarProps {
  initialSearch?: string
  initialCity?: string
  initialRole?: string
}

export default function FilterBar({
  initialSearch = '',
  initialCity = '',
  initialRole = '',
}: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(initialSearch)
  const [city, setCity] = useState(initialCity)
  const [role, setRole] = useState(initialRole)

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (search) params.set('q', search)
      else params.delete('q')

      if (city && city !== 'all') params.set('city', city)
      else params.delete('city')

      if (role && role !== 'all') params.set('role', role)
      else params.delete('role')

      // Reset to page 1 on filter change
      params.set('page', '1')

      router.push(`/directory?${params.toString()}`)
    }, 500)

    return () => clearTimeout(handler)
  }, [search, city, role, router, searchParams])

  const hasFilters = search || (city && city !== 'all') || (role && role !== 'all')

  const clearFilters = () => {
    setSearch('')
    setCity('')
    setRole('')
    router.push('/directory')
  }

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative flex-grow w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-blue-600" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all sm:text-sm"
            placeholder="Търсене по име, ID, телефон..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* City Filter */}
        <div className="relative w-full md:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-purple-600" />
          </div>
          <select
            className="block w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl leading-5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all sm:text-sm appearance-none cursor-pointer"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="all">Всички Градове</option>
            <option value="София">София</option>
            <option value="Пловдив">Пловдив</option>
            <option value="Варна">Варна</option>
            <option value="Бургас">Бургас</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Role Filter */}
        <div className="relative w-full md:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Briefcase className="h-5 w-5 text-teal-500" />
          </div>
          <select
            className="block w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl leading-5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition-all sm:text-sm appearance-none cursor-pointer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="all">Всички Роли</option>
            <option value="Координатор">Координатор</option>
            <option value="Член">Член</option>
            <option value="Симпатизант">Симпатизант</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="w-full md:w-auto px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <X className="h-4 w-4" />
            Изчисти
          </button>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Проверка в браузър**

Run: `npm run dev`
Check: http://localhost:3000/directory

**Step 3: Commit**

```bash
git add components/directory/FilterBar.tsx
git commit -m "feat: redesign FilterBar with glassmorphism and gradient icons"
```

---

## Task 5: Обновяване на Directory Page Layout

**Files:**
- Modify: `app/directory/page.tsx`

**Step 1: Рефакториране на страницата**

```typescript
// app/directory/page.tsx
import { getPeople } from '@/app/actions/people'
import DirectoryGrid from '@/components/directory/DirectoryGrid'
import FilterBar from '@/components/directory/FilterBar'
import Link from 'next/link'
import { Plus, Users } from 'lucide-react'

export interface DirectoryPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DirectoryPage({ searchParams }: DirectoryPageProps) {
  const resolvedSearchParams = await searchParams
  const q = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : ''
  const role = typeof resolvedSearchParams.role === 'string' ? resolvedSearchParams.role : ''
  const city = typeof resolvedSearchParams.city === 'string' ? resolvedSearchParams.city : ''
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1

  const { people, total, totalPages, currentPage } = await getPeople({
    query: q,
    role,
    city,
    page,
    limit: 12,
  })

  return (
    <div className="min-h-screen bg-ocean-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold gradient-text">
                Картотека
              </h1>
            </div>
            <p className="text-slate-500">
              Управление на членове, доброволци и симпатизанти
            </p>
          </div>
          <Link
            href="/directory/new"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:brightness-110"
          >
            <Plus className="mr-2 h-5 w-5" />
            Нов Човек
          </Link>
        </div>

        {/* Filters */}
        <FilterBar initialSearch={q} initialRole={role} initialCity={city} />

        {/* Stats */}
        <div className="flex justify-between items-center mb-6 px-2">
          <span className="text-sm text-slate-600">
            Общо намерени: <span className="font-bold text-slate-900">{total}</span>
          </span>
          <span className="text-sm text-slate-500">
            Страница {currentPage} от {totalPages}
          </span>
        </div>

        {/* Grid */}
        <DirectoryGrid people={people} />

        {/* Bottom spacing */}
        <div className="pb-12" />
      </div>
    </div>
  )
}
```

**Step 2: Проверка в браузър**

Run: `npm run dev`
Check: http://localhost:3000/directory

**Step 3: Commit**

```bash
git add app/directory/page.tsx
git commit -m "feat: update directory page with gradient modern styling"
```

---

## Task 6: Създаване на Home Page Dashboard

**Files:**
- Create: `app/page.tsx` (замяна на съществуващия)

**Step 1: Създаване на нова начална страница**

```typescript
// app/page.tsx
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
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
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
```

**Step 2: Проверка в браузър**

Run: `npm run dev`
Check: http://localhost:3000

**Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: create modern home page with dashboard"
```

---

## Task 7: Финални Проверки и Тестове

**Files:**
- All modified files

**Step 1: Проверка на build**

Run: `npm run build`
Expected: Build успешен без грешки

**Step 2: Проверка на типовете**

Run: `npx tsc --noEmit`
Expected: Няма TypeScript грешки

**Step 3: Проверка на lint**

Run: `npm run lint`
Expected: Няма lint грешки (или само предупреждения)

**Step 4: Проверка на Cypress тестовете**

Run: `npm run cypress:run` или `npx cypress run`
Expected: Всички тестове минават

**Step 5: Финален review**

Провери в браузър:
- [ ] Header има gradient фон
- [ ] Home page има hero section с gradient
- [ ] Directory page има gradient текст заглавие
- [ ] Person cards имат gradient ring и hover ефекти
- [ ] Filter bar има glassmorphism ефект
- [ ] Бутоните имат gradient фон
- [ ] Всичко е responsive

**Step 6: Финален commit**

```bash
git add -A
git commit -m "feat: implement Gradient Modern UI design system"
```

---

## Бъдещи Подобрения (Опционални)

1. **Dark Mode** - Добавяне на dark theme с `dark:` класове
2. **Animations** - Добавяне на Framer Motion за по-плавни анимации
3. **Pagination** - Създаване на стилизирана pagination компонента
4. **Toast Notifications** - Градиентни toast известия
5. **Charts** - Dashboard с графики за статистика

## Резюме

След изпълнение на всички задачи:
- Приложението има модерен gradient дизайн
- Всички компоненти използват единна цветова палитра
- Приложението е responsive и mobile-friendly
- Всички съществуващи функционалности работят
