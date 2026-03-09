# Political CRM — Каталог на компоненти

## Layout компоненти

### `Header` — `components/layout/Header.tsx`
Главен хедър с навигация, глобално търсене, нотификации, бързо добавяне, тема.
- Винаги видим на всяка страница
- Мобилно меню с hamburger
- Включва: GlobalSearch, QuickAdd, NotificationBell, ThemeToggle

### `ThemeToggle` — `components/layout/ThemeToggle.tsx`
Превключване между светла и тъмна тема.
- Добавя/премахва `.dark` клас на `<html>`
- Запазва в `localStorage('theme')`
- Иконки: Sun (светла) / Moon (тъмна)

### `GlobalSearch` — `components/layout/GlobalSearch.tsx`
Глобално търсене с Ctrl+K shortcut.
- Модален прозорец с текстово поле
- Търси по име, телефон, имейл
- Резултатите линкват към `/directory/[id]`

### `QuickAdd` — `components/layout/QuickAdd.tsx`
Бързо добавяне чрез "+" бутон в хедъра.
- Dropdown с опции: Нов човек, Ново събитие, Ново съобщение и др.

### `NotificationBell` — `components/layout/NotificationBell.tsx`
Нотификации за предстоящи задачи, напомняния, рождени дни.
- Badge с брой непрочетени
- Dropdown със списък

---

## Common компоненти

### `Pagination` — `components/common/Pagination.tsx`
Пагинация за списъци.
```tsx
<Pagination currentPage={1} totalPages={10} basePath="/directory" />
```

### `ConfirmDialog` — `components/common/ConfirmDialog.tsx`
Модал за потвърждение на действие (изтриване и др.).
```tsx
<ConfirmDialog open={true} title="Изтриване?" onConfirm={fn} onCancel={fn} />
```

### `BackButton` — `components/common/BackButton.tsx`
Бутон "Назад" с router.back().

### `Skeleton` — `components/common/Skeleton.tsx`
Loading скелетони (CardSkeleton, TableSkeleton, и др.).

### `KeyboardShortcuts` — `components/common/KeyboardShortcuts.tsx`
Глобални клавишни комбинации (Ctrl+K за търсене и др.).

### `PWAInstallPrompt` — `components/common/PWAInstallPrompt.tsx`
Подканване за инсталиране на Progressive Web App.

---

## Loading скелетони (loading.tsx)

Всяка route директория има `loading.tsx` файл с `animate-pulse` скелетон.
Tailwind класове: `bg-slate-200 dark:bg-slate-700 rounded`.

| Файл | Описание |
|------|----------|
| `app/loading.tsx` | Dashboard скелетон (stats cards + charts) |
| `app/directory/loading.tsx` | Картотека скелетон (filter bar + grid) |
| `app/directory/[id]/loading.tsx` | Профил скелетон |
| `app/events/loading.tsx` | Календар скелетон |
| `app/events/new/loading.tsx` | Нова събитие форма скелетон |
| `app/events/[id]/loading.tsx` | Събитие детайли скелетон |
| `app/groups/loading.tsx` | Групи скелетон |
| `app/messaging/loading.tsx` | Съобщения скелетон |
| `app/map/loading.tsx` | Карта скелетон |
| `app/settings/loading.tsx` | Настройки скелетон |
| `app/settings/templates/loading.tsx` | Шаблони скелетон |

---

## Dashboard компоненти

### `DashboardClientSection` — `components/dashboard/DashboardClientSection.tsx`
Client wrapper който експортва `MapSection` и `ChartsSection`.
- Динамичен import на Leaflet карта (ssr: false)
- Динамичен import на Chart.js графики

### `StatsCards` — `components/dashboard/StatsCards.tsx`
```tsx
<StatsCards stats={{ totalPeople, newThisMonth, activeCount, ... }} />
```

### `QuickActions` — `components/dashboard/QuickActions.tsx`
Бързи действия: Нов човек, Ново събитие, Съобщение, Групи, Експорт, Напомняния.

### `TaskLists` — `components/dashboard/TaskLists.tsx`
Показва overdue + upcoming задачи на таблото.

### `PeopleByCityChart` — `components/dashboard/PeopleByCityChart.tsx`
Chart.js bar chart — хора по градове.

### `AgeStructureChart` — `components/dashboard/AgeStructureChart.tsx`
Chart.js bar chart — възрастова структура.

### `StatusDistributionChart` — `components/dashboard/StatusDistributionChart.tsx`
Chart.js doughnut chart — разпределение по статус.

### `MembershipGrowthChart` — `components/dashboard/MembershipGrowthChart.tsx`
Chart.js line chart — растеж на членството.

### `MapVisualization` — `components/dashboard/MapVisualization.tsx`
Leaflet карта с маркери по градове + clustering.

---

## Directory компоненти

### `DirectoryClient` — `components/directory/DirectoryClient.tsx`
Главен client wrapper за картотеката.
```tsx
<DirectoryClient initialData={people} filters={...} />
```
- Управлява bulk selection, bulk actions
- Включва FilterBar, DirectoryGrid/PersonCard

### `FilterBar` — `components/directory/FilterBar.tsx`
Лента с филтри: город, роля, статус, професия, пол, група, таг.
- `SearchableSelect` — dropdown с търсене вътре
- Запазени филтри (saved filters)
- Бутони: Експорт, Запази филтър, Изчисти

### `PersonCard` — `components/directory/PersonCard.tsx`
Карта с основна информация за човек в грид изглед.
- Аватар, име, роля, статус badge, контакти, тагове
- Checkbox за bulk selection

### `PersonForm` — `components/directory/PersonForm.tsx`
Форма за създаване/редакция на човек.
- Всички полета от Person модела
- Валидация, таг избор, група избор

### `EditableField` — `components/directory/EditableField.tsx`
Inline-edit поле в профилната страница.
```tsx
<EditableField label="Имейл" value={email} field="email" personId={1} />
```
- Кликване → input → запис + changelog

### `Timeline` — `components/directory/Timeline.tsx`
Времева линия с всички активности на човек (бележки, обаждания, имейли, срещи).
```tsx
<Timeline personId={1} activities={[...]} onRefresh={fn} />
```

### `NoteForm` / `ActivityForm` / `TaskForm` / `ReminderForm`

Форми за добавяне на бележка/активност/задача/напомняне към профил.

- `ReminderForm`: toast при успешно създаване и при грешка
- `TaskForm`: toast при грешка при зареждане на хора

### `TaskList` — `components/directory/TaskList.tsx`

Списък задачи за конкретен човек с toggle complete и delete.

- `group` клас на wrapper за `group-hover:opacity-100` на бутон изтриване
- Toast при грешка при зареждане

### `ReminderList` — `components/directory/ReminderList.tsx`
Списък напомняния за конкретен човек.

### `RelationsList` / `AddRelationModal`
Списък връзки между хора (семейство, колега, ментор...) + модал за добавяне.

### `ChangeHistory` — `components/directory/ChangeHistory.tsx`
Audit trail — история на промените по полета на човек.

### `EngagementStats` — `components/directory/EngagementStats.tsx`
Engagement score визуализация — колко активен е човекът.

### `SavedFiltersBar` / `SaveFilterModal`
Лента с бързи филтри + модал за създаване на нов запазен филтър.

---

## Events компоненти

### `CalendarGrid` — `components/events/CalendarGrid.tsx`
Месечна календарна мрежа.
```tsx
<CalendarGrid onEventChanged={fn} />
```
- Навигация по месеци, "Днес" бутон
- Точки за дни със събития
- Клик на ден → DayEventsPanel

### `DayEventsPanel` — `components/events/DayEventsPanel.tsx`
Панел със събитията за избран ден.
```tsx
<DayEventsPanel day={27} month={1} year={2026} events={[...]} onClose={fn} onEventChanged={fn} />
```
- Показва събитията с час, локация, описание
- Подчертава текущото събитие (isNow)

### `AttendancePanel` — `components/events/AttendancePanel.tsx`
Управление на присъствие за събитие.
```tsx
<AttendancePanel eventId={1} />
```
- Разгъваем панел с статистики (поканени, потвърдени, присъствали, отсъствали)
- Списък с attendees + промяна на статус
- Модал за добавяне на нови участници

---

## Communication компоненти

### `EmailComposeModal` — `components/communication/EmailComposeModal.tsx`
Модал за съставяне на имейл с шаблони.

### `TelegramButton` / `WhatsAppButton`
Бутони за отваряне на Telegram/WhatsApp чат с конкретен човек.

---

## Messaging компоненти

### `RecipientPreview` — `components/messaging/RecipientPreview.tsx`
Показва списък на получателите преди изпращане.

### `MessageHistory` — `components/messaging/MessageHistory.tsx`
История на изпратените масови съобщения.

---

## Tags компоненти

### `TagBadge` — `components/tags/TagBadge.tsx`
Визуализация на таг (цветен badge).

### `TagManager` — `components/tags/TagManager.tsx`
Пълен CRUD за тагове (създаване, редакция, изтриване).

### `TagSelector` — `components/tags/TagSelector.tsx`

Dropdown за избор и премахване на тагове в профила на човек.

- Проверява `ActionResult` от `addTagToPerson` / `removeTagFromPerson`
- Toast при грешка или успех

---

## Map компоненти

### `MapContainerWrapper` — `components/map/MapContainerWrapper.tsx`
SSR-safe wrapper за Leaflet.

### `MapViewClient` — `components/map/MapViewClient.tsx`
Client-side Leaflet карта с маркери и clustering.

---

## Стилови конвенции

### CSS класове (globals.css)
| Клас | Описание |
|------|----------|
| `.glass-panel` | Glassmorphism панел (blur + полупрозрачен фон) |
| `.glass-card` | Glassmorphism карта (по-малък blur) |
| `.glass-input` | Стилизиран input за glassmorphism |
| `.glass-button` | Стилизиран бутон за glassmorphism |
| `.gradient-primary` | Основен градиент (синьо → лилаво) |
| `.gradient-text` | Текст с градиент |
| `.task-completed` | Зелен индикатор за завършена задача |
| `.task-pending` | Жълт индикатор за чакаща задача |
| `.task-overdue` | Червен индикатор за просрочена задача |

## Settings компоненти

### `TemplatesClient` — `app/settings/templates/TemplatesClient.tsx`

Client wrapper за управление на Email и Telegram шаблони.

- Табове: Email шаблони / Telegram шаблони
- CRUD операции за всеки тип шаблон
- Линк "Назад" → `/settings`

---

## Duplicates компоненти

### `DuplicateList` — `components/duplicates/DuplicateList.tsx`
Списък с потенциални дубликати. Показва двойки с процент на съвпадение.
- Match типове: exact (зелен), high (жълт), medium (оранжев)
- Бутон "Обедини" за merge на записи

---

### Dark mode
- Управлява се чрез `.dark` клас на `<html>` (ThemeToggle)
- Tailwind `dark:` variant е class-based (`@custom-variant dark` в globals.css)
- CSS променливи в `:root` (светла) и `.dark` (тъмна)

**Конвенции по елементи:**

| Елемент | Светла тема | Тъмна тема |
|---------|-------------|------------|
| Page background | `bg-slate-50` | `dark:bg-slate-900` |
| Card/Panel | `bg-white` или `bg-white/60` | `dark:bg-slate-800` или `dark:bg-slate-800/60` |
| Input field | `bg-white border-slate-200` | `dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100` |
| Primary text | `text-slate-900` | `dark:text-slate-100` |
| Secondary text | `text-slate-600` | `dark:text-slate-400` |
| Muted text | `text-slate-500` | `dark:text-slate-500` |
| Colored badge | `bg-{color}-100 text-{color}-700` | `dark:bg-{color}-900/30 dark:text-{color}-400` |
| Hover state | `hover:bg-slate-100` | `dark:hover:bg-slate-700` |
| Border | `border-slate-200` | `dark:border-slate-700` |
| Divider | `border-slate-200` | `dark:border-slate-700` |
