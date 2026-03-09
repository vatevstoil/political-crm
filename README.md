# Political CRM

Платформа за управление на политически контакти и дейности. Създадена за нуждите на партийна структура — управление на членове, поддръжници, застъпници, събития и комуникация.

---

## Технологии

| Слой | Технология |
|------|-----------|
| Framework | Next.js 16 (App Router, `--webpack`) |
| Език | TypeScript 5 (strict) |
| База данни | SQLite чрез Prisma ORM |
| Стилове | Tailwind CSS v4 (class-based dark mode) |
| Карта | Leaflet + react-leaflet |
| Графики | Chart.js + react-chartjs-2 |
| Икони | Lucide React |
| Нотификации | Sonner (toast) |
| Тестове | Cypress E2E + Jest unit |

---

## Бърз старт

```bash
# Инсталиране
npm install

# Генериране на Prisma client
npx prisma generate

# Стартиране (порт 3005)
npm run dev:test

# Отваряне в браузър
http://localhost:3005
```

> **Важно:** Не използвай порт 3000 — конфликт с StroyOffice Pro.

---

## Команди

```bash
npm run dev:test          # Dev сървър на порт 3005
npm run build             # Production build
npm test                  # Jest unit тестове
npx cypress run --headless  # E2E тестове (изисква dev:test)
npm run test:all          # Lint + Jest + Cypress

# Prisma
npx prisma migrate dev --name <описание>  # Нова миграция
npx prisma db seed                        # Seed данни
npx prisma studio                         # DB браузър
npx tsc --noEmit                          # TypeScript проверка
```

---

## Модули

| Модул | Маршрут | Описание |
|-------|---------|----------|
| Табло | `/` | Статистики, графики, карта, задачи, рождени дни |
| Картотека | `/directory` | Списък на всички хора — филтри, търсене, bulk операции |
| Профил | `/directory/[id]` | Детайлна страница — контакти, timeline, бележки, задачи |
| Календар | `/events` | Събития с присъствие |
| Групи | `/groups` | Организационни групи и членство |
| Съобщения | `/messaging` | Масови имейли по сегменти |
| Карта | `/map` | Интерактивна карта по градове |
| Секции | `/sections` | Застъпници и членове на СИК по избирателни секции |
| Настройки | `/settings` | Тагове, шаблони, дубликати |

---

## Структура на проекта

```
political-crm/
├── app/                  # Next.js App Router (pages + server actions)
│   ├── actions/          # 24 server action файла (бизнес логика)
│   └── directory/        # Картотека + профили
├── components/           # 61 React компонента в 10 папки
├── lib/                  # Prisma, mail, excel, geo, voting sections
├── prisma/               # Schema (21 модела) + миграции
├── cypress/              # E2E тестове (5 spec, 24 теста)
└── docs/                 # Документация
    ├── ROADMAP.md        # Пътна карта
    ├── DEVELOPMENT.md    # Dev guide
    ├── GITHUB-WORKFLOW.md # GitHub sync между 2 компютъра
    ├── PROJECT-MAP.md    # Файлова структура
    ├── SITEMAP.md        # Маршрути и потоци
    ├── COMPONENTS.md     # Компонент каталог
    └── ACTIONS-API.md    # Server Actions API
```

---

## GitHub синхронизация

Кодът се пази в GitHub. Базата данни (`prisma/dev.db`) **не** се качва.

```bash
# Компютър 1 (разработка) — качване
PUSH-TO-GITHUB.bat

# Компютър 2 (данни) — изтегляне на промени
PULL-UPDATES.bat
```

Виж [docs/GITHUB-WORKFLOW.md](docs/GITHUB-WORKFLOW.md) за детайли.

---

## Документация

- [Пътна карта](docs/ROADMAP.md) — готово, в процес, планирано
- [Dev Guide](docs/DEVELOPMENT.md) — конвенции, паттерни, капани
- [Файлова структура](docs/PROJECT-MAP.md) — всички файлове
- [Маршрути](docs/SITEMAP.md) — pages и user flows
- [Компоненти](docs/COMPONENTS.md) — компонент каталог
- [Server Actions API](docs/ACTIONS-API.md) — всички server actions
