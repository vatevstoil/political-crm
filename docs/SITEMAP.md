# Political CRM — Карта на сайта (Sitemap)

## Публични маршрути (Routes)

| Маршрут | Файл | Тип | Описание |
|---------|------|-----|----------|
| `/` | `app/page.tsx` | Server | **Табло (Dashboard)** — Обща статистика, бързи действия, търсене, графики, карта |
| `/directory` | `app/directory/page.tsx` | Server | **Картотека** — Списък/грид на всички хора с филтри, пагинация, bulk действия |
| `/directory/new` | `app/directory/new/page.tsx` | Server | **Нов човек** — Форма за създаване на нов запис |
| `/directory/[id]` | `app/directory/[id]/page.tsx` | Server | **Профил** — Детайлна страница на човек с timeline, бележки, задачи |
| `/directory/[id]/edit` | `app/directory/[id]/edit/page.tsx` | Server | **Редактиране** — Форма за редакция на съществуващ запис |
| `/events` | `app/events/page.tsx` | Client | **Календар** — Календарна мрежа + списък на събития, CRUD |
| `/groups` | `app/groups/page.tsx` | Client | **Групи** — Управление на групи и членство |
| `/messaging` | `app/messaging/page.tsx` | Client | **Съобщения** — Масово изпращане на имейли по сегменти |
| `/map` | `app/map/page.tsx` | Server | **Карта** — Интерактивна Leaflet карта с маркери по градове |
| `/sections` | `app/sections/page.tsx` | Server | **Секции** — Преглед на застъпници и членове на СИК по избирателни секции |
| `/settings` | `app/settings/page.tsx` | Server | **Настройки** — Навигация към под-настройки |
| `/settings/tags` | `app/settings/tags/page.tsx` | Server | **Тагове** — CRUD на категории/тагове с цветове |
| `/settings/templates` | `app/settings/templates/page.tsx` | Server | **Шаблони** — Email + Telegram шаблони за съобщения |
| `/settings/duplicates` | `app/settings/duplicates/page.tsx` | Server | **Дубликати** — Намиране и обединяване на дублирани записи |

## API маршрути

| Маршрут | Метод | Файл | Описание |
|---------|-------|------|----------|
| `/api/people/[id]` | GET | `app/api/people/[id]/route.ts` | Връща JSON данни за конкретен човек |

## Навигационна йерархия

```
┌─────────────────────────────────────────────┐
│  Header (винаги видим)                      │
│  ┌─ Logo + "Political CRM"                 │
│  ├─ GlobalSearch (Ctrl+K)                   │
│  ├─ QuickAdd (+)                            │
│  ├─ NotificationBell                        │
│  ├─ ThemeToggle (☀/🌙)                      │
│  └─ Hamburger Menu (мобилен)                │
├─────────────────────────────────────────────┤
│  Основна навигация (от Header меню):        │
│  ├─ Табло          → /                      │
│  ├─ Картотека      → /directory             │
│  ├─ Календар       → /events                │
│  ├─ Групи          → /groups                │
│  ├─ Съобщения      → /messaging             │
│  ├─ Карта          → /map                   │
│  ├─ Секции         → /sections              │
│  └─ Настройки      → /settings              │
│       ├─ Тагове       → /settings/tags      │
│       ├─ Шаблони      → /settings/templates │
│       └─ Дубликати    → /settings/duplicates│
└─────────────────────────────────────────────┘
```

## Потоци на потребителя (User Flows)

### 1. Добавяне на нов човек
```
/ (Табло) → QuickAdd "Нов човек" → /directory/new → попълване → /directory/[id]
```

### 2. Преглед и редакция на профил
```
/directory → клик на PersonCard → /directory/[id] → "Редактирай" → /directory/[id]/edit
```

### 3. Създаване на събитие и покана
```
/events → "Ново Събитие" → попълване → Calendar day click → DayEventsPanel → AttendancePanel → покана
```

### 4. Масово съобщение
```
/messaging → избор на сегмент (група/филтър) → преглед получатели → съставяне → изпращане
```

### 5. Намиране на дубликати
```
/settings → Дубликати → /settings/duplicates → преглед → "Обедини"
```

### 6. Комуникация от профил
```
/directory/[id] → Имейл бутон → EmailModal → съставяне → изпращане
/directory/[id] → WhatsApp бутон → отваря чат в нов таб
/directory/[id] → Telegram бутон → отваря чат в нов таб
```

### 7. Управление на шаблони
```
/settings → Шаблони → /settings/templates → избор на тип (Email/Telegram) → нов/редакция → запис
```

### 8. Запазени филтри (Smart Lists)
```
/directory → FilterBar → настройка на филтри → "Запази" → SaveFilterModal → име + цвят → запис
/directory → SavedFiltersBar → клик на запазен филтър → зарежда филтри
```
