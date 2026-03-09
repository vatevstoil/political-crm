# Political CRM — Claude Code Instructions

## Stack
- Next.js 16 (App Router, Turbopack, React Compiler)
- TypeScript 5 (strict)
- Prisma ORM + SQLite (`prisma/dev.db`)
- Tailwind CSS v4 (class-based dark mode)
- Chart.js + react-chartjs-2
- Leaflet + react-leaflet (maps)
- Lucide React (icons)
- Sonner (toast notifications)
- Cypress (E2E) + Jest (unit tests)

## Commands
```bash
npm run dev          # Dev server (port 3000)
npm run dev:test     # Dev server (port 3005, for testing)
npm run build        # Production build
npm test             # Jest unit tests
npx cypress run --headless  # Cypress E2E (requires dev:test running)
npm run test:all     # Lint + Jest + Cypress

# Prisma
npx prisma migrate dev --name description   # Create migration
npx prisma db seed                          # Seed database
npx prisma studio                           # DB browser
```

## Port Convention
- `dev:test` runs on port **3005**
- Cypress `baseUrl` is `http://localhost:3005`
- Do NOT use port 3000 (conflicts with StroyOffice Pro)

## Language
- **UI text:** Bulgarian (Български)
- **Code:** English (variable names, function names, comments)
- **Database fields:** English with `@map()` for snake_case table/column names

## Architecture
- Pages are Server Components by default
- Client components marked with `'use client'`
- Business logic in `app/actions/` (Server Actions with Zod validation)
- Shared utilities in `app/actions/shared/` (ActionResult type, personFilters)
- No REST API except `/api/people/[id]`
- Dynamic imports (`next/dynamic` with `ssr: false`) for Leaflet and Chart.js
- 21 Prisma models (see `prisma/schema.prisma`)
- 11 `loading.tsx` skeleton files across all routes

## ActionResult Pattern

Mutation actions in `groups.ts`, `tags.ts`, `relations.ts`, `reminders.ts`, `activities.ts` return:

```typescript
type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string }
```

Callers MUST check `result.success` before updating UI:

```tsx
const result = await createGroup(name, color, description)
if (!result.success) { toast.error(result.error); return }
```

## Shared Filters
`app/actions/shared/personFilters.ts` exports `buildPersonWhereClause(filters)`.
Used by: `people.ts`, `export.ts`, `messaging.ts` — do NOT duplicate filter logic.

## Import Aliases
```tsx
@/components/...   → components/
@/app/actions/...  → app/actions/
@/lib/...          → lib/
```

## Dark Mode Pattern
Always include dark variants when adding UI elements:
```
Page bg:     bg-slate-50 dark:bg-slate-900
Card bg:     bg-white dark:bg-slate-800
Input:       dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100
Badge:       bg-{color}-100 text-{color}-700 dark:bg-{color}-900/30 dark:text-{color}-400
Text:        text-slate-900 dark:text-slate-100  (primary)
             text-slate-600 dark:text-slate-400  (secondary)
Hover:       hover:bg-slate-100 dark:hover:bg-slate-700
Border:      border-slate-200 dark:border-slate-700
```

## Testing
- Cypress E2E: 5 specs, 24 tests in `cypress/e2e/`
- Jest unit: `__tests__/`
- Seed data: Иван Иванов (ID=1), Мария Петрова (ID=2)
- Always verify with `npx tsc --noEmit` before committing

## Reference Docs
- `docs/SITEMAP.md` — Routes and user flows
- `docs/PROJECT-MAP.md` — Full file structure
- `docs/COMPONENTS.md` — Component catalog
- `docs/ACTIONS-API.md` — Server Actions API reference
