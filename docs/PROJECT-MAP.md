# Political CRM — Файлова структура (Project Map)

## Технологии
- **Framework:** Next.js 16 (App Router)
- **Език:** TypeScript
- **База данни:** SQLite чрез Prisma ORM
- **Стилове:** Tailwind CSS v4 (class-based dark mode)
- **Карта:** Leaflet + react-leaflet
- **Графики:** Chart.js + react-chartjs-2
- **Икони:** Lucide React
- **Тестове:** Cypress (E2E) + Jest (unit)

## Структура на директориите

```
political-crm/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (Header, fonts, ThemeProvider)
│   ├── page.tsx                  # Dashboard (Табло)
│   ├── globals.css               # Глобални стилове, CSS променливи, dark mode
│   │
│   ├── actions/                  # Server Actions (бизнес логика)
│   │   ├── people.ts             # CRUD хора, филтри, import/export
│   │   ├── events.ts             # CRUD събития
│   │   ├── groups.ts             # CRUD групи + членство (→ ActionResult)
│   │   ├── tags.ts               # CRUD тагове (→ ActionResult)
│   │   ├── notes.ts              # Бележки към хора
│   │   ├── tasks.ts              # Задачи + dashboard задачи
│   │   ├── activities.ts         # История на взаимодействия (→ ActionResult)
│   │   ├── attendance.ts         # Присъствие на събития
│   │   ├── bulk.ts               # Масови операции (изтриване, статус, група)
│   │   ├── changelog.ts          # Audit trail (промени по полета)
│   │   ├── dashboard.ts          # Статистики за таблото (unstable_cache 5min)
│   │   ├── duplicates.ts         # Намиране и обединяване на дубликати
│   │   ├── engagement.ts         # Engagement score на човек
│   │   ├── export.ts             # CSV експорт
│   │   ├── header.ts             # Нотификации + бързо търсене
│   │   ├── mail.ts               # Изпращане на имейл (за 1 човек)
│   │   ├── map.ts                # Данни за картата
│   │   ├── messaging.ts          # Масово изпращане + история (Zod валидация)
│   │   ├── relations.ts          # Връзки между хора (→ ActionResult)
│   │   ├── reminders.ts          # Напомняния (→ ActionResult)
│   │   ├── savedFilters.ts       # Запазени филтри (Smart Lists)
│   │   ├── search.ts             # Глобално търсене (100 char cap)
│   │   ├── templates.ts          # Email + Telegram шаблони
│   │   └── shared/               # Споделени утилити
│   │       ├── types.ts          # ActionResult<T> тип
│   │       └── personFilters.ts  # buildPersonWhereClause() за DRY филтри
│   │
│   ├── api/
│   │   └── people/[id]/route.ts  # REST API за Person (GET)
│   │
│   ├── loading.tsx                # Dashboard skeleton
│   │
│   ├── directory/                # Страница "Картотека"
│   │   ├── page.tsx              # Списък с хора (Server Component)
│   │   ├── loading.tsx           # Directory skeleton
│   │   ├── new/page.tsx          # Нов човек
│   │   └── [id]/
│   │       ├── page.tsx          # Профил на човек (Server Component)
│   │       ├── PersonPageClient.tsx # Client wrapper за профила
│   │       ├── loading.tsx       # Person profile skeleton
│   │       └── edit/page.tsx     # Редакция на човек
│   │
│   ├── events/
│   │   ├── page.tsx              # Календар (Client Component)
│   │   ├── loading.tsx           # Events skeleton
│   │   ├── new/
│   │   │   └── loading.tsx       # New event skeleton
│   │   └── [id]/
│   │       └── loading.tsx       # Event detail skeleton
│   │
│   ├── groups/
│   │   ├── page.tsx              # Групи (Client Component)
│   │   └── loading.tsx           # Groups skeleton
│   │
│   ├── messaging/
│   │   ├── page.tsx              # Съобщения (Client Component)
│   │   └── loading.tsx           # Messaging skeleton
│   │
│   ├── map/
│   │   ├── page.tsx              # Карта (Server Component)
│   │   └── loading.tsx           # Map skeleton
│   │
│   └── settings/
│       ├── page.tsx              # Навигация настройки
│       ├── loading.tsx           # Settings skeleton
│       ├── tags/page.tsx         # Управление тагове
│       ├── templates/
│       │   ├── page.tsx          # Шаблони (Server)
│       │   ├── TemplatesClient.tsx
│       │   └── loading.tsx       # Templates skeleton
│       └── duplicates/page.tsx   # Дубликати
│
├── components/                   # Преизползваеми компоненти
│   ├── common/                   # Общи UI компоненти
│   │   ├── BackButton.tsx        # Бутон "Назад"
│   │   ├── ConfirmDialog.tsx     # Модал за потвърждение
│   │   ├── KeyboardShortcuts.tsx # Клавишни комбинации
│   │   ├── Pagination.tsx        # Пагинация
│   │   ├── PWAInstallPrompt.tsx  # PWA инсталация
│   │   └── Skeleton.tsx          # Loading скелетони
│   │
│   ├── layout/                   # Структурни компоненти
│   │   ├── Header.tsx            # Главен хедър + навигация
│   │   ├── GlobalSearch.tsx      # Глобално търсене (Ctrl+K)
│   │   ├── NotificationBell.tsx  # Нотификации
│   │   ├── QuickAdd.tsx          # Бързо добавяне (+)
│   │   └── ThemeToggle.tsx       # Превключване светла/тъмна тема
│   │
│   ├── dashboard/                # Компоненти за таблото
│   │   ├── DashboardClientSection.tsx  # Client wrapper (MapSection + ChartsSection)
│   │   ├── StatsCards.tsx        # Карти със статистики
│   │   ├── TaskStatsCards.tsx    # Статистики за задачи
│   │   ├── TaskLists.tsx         # Списъци задачи
│   │   ├── QuickActions.tsx      # Бързи действия
│   │   ├── GlobalSearch.tsx      # Търсачка в таблото
│   │   ├── RecentActivityFeed.tsx # Последна активност
│   │   ├── UpcomingBirthdays.tsx # Предстоящи рождени дни
│   │   ├── UpcomingEvents.tsx    # Предстоящи събития
│   │   ├── UpcomingReminders.tsx # Предстоящи напомняния
│   │   ├── PeopleByCityChart.tsx # Графика хора по градове
│   │   ├── AgeStructureChart.tsx # Възрастова структура
│   │   ├── StatusDistributionChart.tsx # Разпределение по статус
│   │   ├── MembershipGrowthChart.tsx   # Растеж на членството
│   │   └── MapVisualization.tsx  # Leaflet карта на таблото
│   │
│   ├── directory/                # Компоненти за картотеката
│   │   ├── DirectoryClient.tsx   # Главен client wrapper
│   │   ├── DirectoryGrid.tsx     # Грид изглед
│   │   ├── PersonCard.tsx        # Карта на човек
│   │   ├── PersonForm.tsx        # Форма за създаване/редакция
│   │   ├── FilterBar.tsx         # Филтри + SearchableSelect
│   │   ├── SavedFiltersBar.tsx   # Запазени филтри
│   │   ├── SaveFilterModal.tsx   # Модал за запазване на филтър
│   │   ├── EditableField.tsx     # Inline-edit поле в профила
│   │   ├── Timeline.tsx          # Времева линия на активности
│   │   ├── NoteForm.tsx          # Добавяне на бележка
│   │   ├── ActivityForm.tsx      # Добавяне на активност
│   │   ├── TaskForm.tsx          # Добавяне на задача
│   │   ├── TaskList.tsx          # Списък задачи на човек
│   │   ├── ReminderForm.tsx      # Добавяне на напомняне
│   │   ├── ReminderList.tsx      # Списък напомняния
│   │   ├── RelationsList.tsx     # Списък връзки
│   │   ├── AddRelationModal.tsx  # Модал за добавяне на връзка
│   │   ├── ChangeHistory.tsx     # История на промени (audit)
│   │   ├── EngagementStats.tsx   # Engagement score
│   │   └── EmailModal.tsx        # Модал за изпращане на имейл
│   │
│   ├── events/                   # Компоненти за календара
│   │   ├── CalendarGrid.tsx      # Календарна мрежа
│   │   ├── DayEventsPanel.tsx    # Панел със събития за деня
│   │   └── AttendancePanel.tsx   # Управление на присъствие
│   │
│   ├── communication/            # Комуникационни компоненти
│   │   ├── EmailComposeModal.tsx # Съставяне на имейл
│   │   ├── TelegramButton.tsx    # Telegram бутон
│   │   └── WhatsAppButton.tsx    # WhatsApp бутон
│   │
│   ├── map/                      # Карта компоненти
│   │   ├── MapContainerWrapper.tsx # Wrapper за Leaflet
│   │   └── MapViewClient.tsx     # Client-side карта
│   │
│   ├── messaging/                # Масови съобщения
│   │   ├── MessageHistory.tsx    # История на съобщения
│   │   └── RecipientPreview.tsx  # Преглед на получатели
│   │
│   ├── tags/                     # Таг компоненти
│   │   ├── TagBadge.tsx          # Визуализация на таг
│   │   ├── TagManager.tsx        # Управление на тагове
│   │   └── TagSelector.tsx       # Избор на тагове
│   │
│   └── duplicates/
│       └── DuplicateList.tsx     # Списък дубликати
│
├── lib/                          # Помощни библиотеки
│   ├── prisma.ts                 # Prisma client singleton
│   ├── mail.ts                   # Nodemailer конфигурация
│   ├── excel.ts                  # Excel import/export
│   ├── geo-data.ts               # Географски данни (координати)
│   └── mapCoordinates.ts         # Координати на градове
│
├── prisma/
│   ├── schema.prisma             # Database schema (21 модела)
│   ├── seed.ts                   # Seed данни
│   └── dev.db                    # SQLite база
│
├── cypress/                      # E2E тестове
│   ├── e2e/
│   │   ├── dashboard.cy.ts      # 5 теста
│   │   ├── directory.cy.ts      # 4 теста
│   │   ├── events.cy.ts         # 3 теста
│   │   ├── groups.cy.ts         # 4 теста
│   │   └── person.cy.ts         # 8 теста
│   └── support/
│       ├── commands.ts
│       └── e2e.ts
│
└── __tests__/
    └── Home.test.tsx             # Jest unit test
```

## Зависимости между модули

```
app/page.tsx (Dashboard)
  ├── actions/dashboard.ts    → getDashboardStats
  ├── actions/people.ts       → getPeople (byCity, byAgeGroup)
  ├── actions/events.ts       → getUpcomingEvents
  ├── actions/reminders.ts    → getUpcomingReminders, getOverdueReminders
  ├── actions/tasks.ts        → getTasksForDashboard, getTaskStats
  ├── actions/map.ts          → getMapData
  └── components/dashboard/*  → StatsCards, Charts, Map, QuickActions

app/directory/page.tsx (Картотека)
  ├── actions/people.ts       → getPeople (с филтри и пагинация)
  ├── actions/savedFilters.ts → getSavedFilters
  └── components/directory/*  → DirectoryClient, FilterBar, PersonCard

app/directory/[id]/page.tsx (Профил)
  ├── actions/notes.ts        → getNotes, createNote, deleteNote
  ├── actions/activities.ts   → getActivities, addActivity
  ├── actions/tasks.ts        → getTasks, createTask, toggleTask
  ├── actions/tags.ts         → getPersonTags, addTagToPerson
  ├── actions/reminders.ts    → getPersonReminders
  ├── actions/relations.ts    → getPersonRelations
  ├── actions/changelog.ts    → getPersonChangeLogs
  ├── actions/engagement.ts   → getPersonEngagement
  └── components/directory/*  → EditableField, Timeline, NoteForm, TaskList...

app/events/page.tsx (Календар)
  ├── actions/events.ts       → CRUD + getEventsByMonth
  ├── actions/attendance.ts   → присъствие
  └── components/events/*     → CalendarGrid, DayEventsPanel, AttendancePanel

app/groups/page.tsx (Групи)
  ├── actions/groups.ts       → CRUD групи + членство
  └── actions/people.ts       → getAllPeople (за добавяне)

app/messaging/page.tsx (Съобщения)
  ├── actions/messaging.ts    → getSegmentRecipients, sendBulkEmail
  ├── actions/groups.ts       → getGroups (за сегментиране)
  ├── actions/templates.ts    → getTemplates
  └── components/messaging/*  → RecipientPreview, MessageHistory
```

## Database Schema (опростена)

```
Person (1) ──┬── (N) Note
             ├── (N) ActivityLog
             ├── (N) Task           + TaskAssignee (M:N)
             ├── (N) Reminder
             ├── (N) ChangeLog
             ├── (M:N) Tag          чрез PersonTag
             ├── (M:N) Group        чрез GroupMember
             ├── (M:N) Event        чрез EventAttendance
             └── (M:N) Person       чрез PersonRelation

Event (1) ──── (N) EventAttendance
Group (1) ──── (N) GroupMember
Tag   (1) ──── (N) PersonTag
Task  (1) ──── (N) TaskAssignee

Campaign (1) ──┬── (N) CampaignMember
               └── (N) CampaignNote

EmailTemplate    (standalone)
TelegramTemplate (standalone)
SavedFilter      (standalone)
MessageLog       (standalone)

Общо 21 модела: Person, Note, Tag, PersonTag, Event, EventAttendance,
Task, TaskAssignee, Group, GroupMember, ActivityLog, Reminder,
PersonRelation, ChangeLog, EmailTemplate, TelegramTemplate,
SavedFilter, MessageLog, Campaign, CampaignMember, CampaignNote
```

## Ключови конфигурации

| Файл | Описание |
|------|----------|
| `package.json` | npm scripts: `dev`, `dev:test` (port 3005), `build`, `test` |
| `prisma/schema.prisma` | 21 Prisma модела, SQLite |
| `cypress.config.ts` | baseUrl: `http://localhost:3005` |
| `.env` | `DATABASE_URL`, `SMTP_*`, `EMAIL_FROM` |
| `app/globals.css` | CSS vars, dark mode (`@custom-variant dark`), glassmorphism |
