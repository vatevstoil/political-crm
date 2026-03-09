# Political CRM — Developer Guide

Практически наръчник за разработчика. Съдържа всичко необходимо за работа по проекта.

---

## Съдържание

1. [Бърз старт](#бърз-старт)
2. [Архитектура](#архитектура)
3. [Паттерни и конвенции](#паттерни-и-конвенции)
4. [Database / Prisma](#database--prisma)
5. [Dark Mode](#dark-mode)
6. [Компоненти — правила](#компоненти--правила)
7. [TypeScript](#typescript)
8. [Тестове](#тестове)
9. [Известни капани](#известни-капани)

---

## Бърз старт

```bash
cd political-crm
npm install
npx prisma generate
npm run dev:test          # http://localhost:3005
```

**НЕ** използвай порт 3000 — конфликт с StroyOffice Pro.

---

## Архитектура

```
Client (браузър)
    ↓ (Server Actions — директни извиквания)
Next.js Server Components / Route Handlers
    ↓ (Prisma ORM)
SQLite (prisma/dev.db)
```

### Правила

1. **Pages = Server Components** по подразбиране
2. `'use client'` само ако трябва interactivity (state, events, browser APIs)
3. **Бизнес логика = Server Actions** в `app/actions/`
4. **НЕ дублирай** filter логика — използвай `buildPersonWhereClause()`
5. **Нямаме REST API** освен `/api/people/[id]` (Leaflet нужда)

### Типичен flow

```
app/directory/page.tsx (Server)
    → import { getPeople } from '@/app/actions/people'
    → const { people, total } = await getPeople(filters)
    → <DirectoryClient people={people} ... />

components/directory/DirectoryClient.tsx ('use client')
    → useState, useTransition
    → import { deletePerson } from '@/app/actions/people'
    → startTransition(() => deletePerson(id))
    → toast.success / toast.error
```

---

## Паттерни и конвенции

### ActionResult паттерн

Частично приложен (groups, tags, relations, reminders, activities):

```typescript
// В action файл:
import { ActionResult } from '@/app/actions/shared/types'

export async function createGroup(name: string): Promise<ActionResult<Group>> {
  try {
    const group = await prisma.group.create({ data: { name } })
    return { success: true, data: group }
  } catch (error) {
    return { success: false, error: 'Грешка при създаване' }
  }
}

// В компонент:
const result = await createGroup(name)
if (!result.success) {
  toast.error(result.error)
  return
}
toast.success('Създадено!')
```

### useTransition за мутации

```tsx
const [isPending, startTransition] = useTransition()

const handleDelete = (id: number) => {
  startTransition(async () => {
    await deletePerson(id)
    toast.success('Изтрито!')
  })
}
```

### useActionState за форми

```tsx
const [state, action, isPending] = useActionState(createPerson, null)

return (
  <form action={action}>
    <input name="fullName" required />
    <button disabled={isPending}>Запази</button>
    {state?.error && <p>{state.error}</p>}
  </form>
)
```

### Toast нотификации

```tsx
import { toast } from 'sonner'

toast.success('Записано!')
toast.error('Грешка при запис')
toast.info('Информация')
toast.warning('Предупреждение')
```

### Dynamic imports (Leaflet / Chart.js)

```tsx
// ЗАДЪЛЖИТЕЛНО за компоненти с browser APIs
const MapViewClient = dynamic(() => import('@/components/map/MapViewClient'), {
  ssr: false,
  loading: () => <div>Зарежда карта...</div>
})
```

### Revalidation след мутация

```typescript
// ПРАВИЛНО — само root path или специфичен
revalidatePath('/')             // dashboard
revalidatePath('/directory')    // списък

// ГРЕШНО — причинява race condition в профила
// revalidatePath(`/directory/${personId}`)  ← НЕ правиш
```

---

## Database / Prisma

### Схема резюме

```
Person (главен модел)
  ├── Note[]           бележки
  ├── ActivityLog[]    история на взаимодействия
  ├── Task[]           задачи
  ├── Reminder[]       напомняния
  ├── ChangeLog[]      audit trail
  ├── PersonTag[]      M:N → Tag
  ├── GroupMember[]    M:N → Group
  ├── EventAttendance[] M:N → Event
  └── PersonRelation[] M:N → Person
```

### Команди

```bash
# Нова миграция след промяна на schema.prisma
npx prisma migrate dev --name add_field_name

# Само обнови Prisma client (без миграция)
npx prisma generate

# Приложи миграции на prod/Computer 2
npx prisma migrate deploy

# Преглед на данни
npx prisma studio
```

### Seed данни

Иван Иванов (ID=1) и Мария Петрова (ID=2) — използвани в Cypress тестове.

```bash
npx prisma db seed
```

### SQLite Gotchas

```
ПРОБЛЕМ: LIKE е case-sensitive за кирилица
НЕ работи: WHERE full_name LIKE '%иван%'

РЕШЕНИЕ: buildPersonWhereClause() е async —
  1. Взима всички хора
  2. Филтрира в JavaScript с .toLowerCase()
  3. Връща matching IDs → WHERE id IN [...]

Същото важи за LOWER() — работи само за ASCII!
```

---

## Dark Mode

### CSS конвенции

```tsx
// Page background
className="bg-slate-50 dark:bg-slate-900"

// Card
className="bg-white dark:bg-slate-800"

// Input
className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"

// Primary text
className="text-slate-900 dark:text-slate-100"

// Secondary text
className="text-slate-600 dark:text-slate-400"

// Badge
className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"

// Border
className="border-slate-200 dark:border-slate-700"

// Hover
className="hover:bg-slate-100 dark:hover:bg-slate-700"
```

### Как работи

```typescript
// ThemeToggle.tsx — toggle на .dark class върху <html>
document.documentElement.classList.toggle('dark')
localStorage.setItem('theme', isDark ? 'dark' : 'light')

// globals.css
@custom-variant dark (&:where(.dark, .dark *));
```

### Glassmorphism класове (globals.css)

```tsx
className="glass-panel"   // главни панели
className="glass-card"    // карти
className="glass-input"   // input полета
className="glass-button"  // бутони
```

---

## Компоненти — правила

### Модали с backdrop-blur

Модали, чийто parent има `backdrop-blur`, трябва да използват React Portal:

```tsx
import { createPortal } from 'react-dom'

// В компонента:
return createPortal(
  <div className="fixed inset-0 z-[9999] ...">
    {/* modal content */}
  </div>,
  document.body  // escape от stacking context
)
```

**Засяга:** AddRelationModal, EmailModal и всеки нов modal в glass-panel родител.

### EditableField

```tsx
<EditableField
  label="Град"
  value={person.city}
  onSave={async (v) => {
    await handleUpdate('city', v)  // ЗАДЪЛЖИТЕЛНО async + await
  }}
/>
```

`onSave` трябва да е `async (value: string) => Promise<void>` — TypeScript изисква!

### Icons

```tsx
import { User, Phone, MapPin, Edit } from 'lucide-react'
<User size={16} className="text-slate-400" />
```

---

## TypeScript

```bash
# Проверка преди commit
npx tsc --noEmit
```

### Чести грешки

```typescript
// ГРЕШНО — onSave трябва да е Promise<void>
onSave={(v) => handleUpdate('field', v)}

// ПРАВИЛНО
onSave={async (v) => { await handleUpdate('field', v) }}
```

```typescript
// Zod v4: z.record() изисква 2 аргумента
z.record(z.string(), z.unknown())  // ✅
z.record(z.unknown())              // ❌ грешка

// Zod v4: optional() не приема null
z.string().optional()   // само undefined
z.string().nullish()    // undefined | null ← правилно за Prisma nullable
```

---

## Тестове

### Cypress E2E

```bash
# Изисква dev:test сървър на 3005!
npm run dev:test &
npx cypress run --headless

# Или интерактивен режим
npx cypress open
```

**Спецификации:**
- `cypress/e2e/dashboard.cy.ts` — 5 теста
- `cypress/e2e/directory.cy.ts` — 4 теста
- `cypress/e2e/events.cy.ts` — 3 теста
- `cypress/e2e/groups.cy.ts` — 4 теста
- `cypress/e2e/person.cy.ts` — 8 теста

**Seed данни:** Иван Иванов (ID=1), Мария Петрова (ID=2)

### Jest unit

```bash
npm test

# Важно: jest.setup.ts mock-ва next/cache
// unstable_cache: (fn) => fn  ← мока за тестове
```

### Пълен suite

```bash
npm run test:all   # lint + jest + cypress
```

---

## Известни капани

| Капан | Проблем | Решение |
|-------|---------|---------|
| `revalidatePath('/directory/[id]')` | Race condition в профила | Използвай само `revalidatePath('/')` |
| `revalidateTag(tag, profile)` | Next.js 16 изисква 2 аргумента | Използвай `revalidatePath` |
| Leaflet / Chart.js в Server Component | Crash поради `window` | `dynamic(..., { ssr: false })` |
| Modal в glass-panel | backdrop-blur прекъсва stacking context | `createPortal(jsx, document.body)` |
| Кирилица с LIKE | SQLite LIKE е case-sensitive | Async filter в JS с `.toLowerCase()` |
| `.bat` файлове — кирилица | Encoding проблеми | `chcp 65001` в началото на файла |
| Zod `.optional()` reject-ва null | Prisma nullable → null | Използвай `.nullish()` |
| `npm run dev` на порт 3000 | Конфликт с StroyOffice Pro | `npm run dev:test` → порт 3005 |
| EGN onSave без async | TypeScript грешка | Добави `async` и `await` |
