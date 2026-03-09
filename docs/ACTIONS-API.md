# Political CRM — Server Actions API Reference

Всички server actions се намират в `app/actions/`. Извикват се директно от компоненти чрез Next.js Server Actions (без REST endpoints).

---

## shared/ — Споделени утилити

### `shared/types.ts` — ActionResult тип

```typescript
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }
```

Използва се от: groups.ts, tags.ts, relations.ts, reminders.ts, activities.ts

**Важно за извикващите компоненти:**

```tsx
const result = await createGroup(name, color, description)
if (!result.success) {
  toast.error(result.error)
  return
}
// продължи при успех
```

### `shared/personFilters.ts` — Споделен филтър builder

```typescript
buildPersonWhereClause(filters: PersonFilterParams): Prisma.PersonWhereInput
```

Използва се от: people.ts, export.ts, messaging.ts — DRY конструкция на WHERE клаузи.

---

## people.ts — Хора (основен CRUD)

| Функция | Параметри | Връща | Описание |
|---------|-----------|-------|----------|
| `getPeople(params)` | `{query?, city?, role?, status?, profession?, gender?, groupId?, tagId?, ageMin?, ageMax?, page?, perPage?}` | `PeopleResponse` | Филтрирано търсене с пагинация |
| `createPerson(prevState, formData)` | FormData | `CreatePersonState` | Създаване на нов човек |
| `updatePerson(id, data)` | `number, Partial<Person>` | `Person` | Редакция на полета (+ changelog) |
| `deletePerson(id)` | `number` | void | Изтриване на човек |
| `getAllPeople()` | — | `{id, fullName}[]` | Всички хора (за dropdown-и) |
| `getUniqueCities()` | — | `string[]` | Уникални градове |
| `getUniqueProfessions()` | — | `string[]` | Уникални професии |
| `getUniqueRoles()` | — | `string[]` | Уникални роли |
| `exportPeople(params)` | `GetPeopleParams` | CSV данни | Експорт с филтри |
| `importPeople(data)` | `Record[]` | void | Импорт от Excel/CSV |

---

## events.ts — Събития

| Функция | Параметри | Връща | Описание |
|---------|-----------|-------|----------|
| `createEvent(data)` | `{title, description?, startTime, endTime?, location?}` | `EventWithId` | Ново събитие |
| `updateEvent(id, data)` | `number, Partial<Event>` | `EventWithId` | Редакция |
| `deleteEvent(id)` | `number` | void | Изтриване |
| `getEvents()` | — | `EventWithId[]` | Всички събития |
| `getEventsByMonth(year, month)` | `number, number` | `EventWithId[]` | Събития за месец |
| `getUpcomingEvents(days?)` | `number` (default 7) | `EventWithId[]` | Предстоящи |

---

## attendance.ts — Присъствие на събития

| Функция | Параметри | Връща | Описание |
|---------|-----------|-------|----------|
| `getEventAttendees(eventId)` | `number` | `EventAttendee[]` | Списък присъстващи |
| `getAttendanceStats(eventId)` | `number` | `AttendanceStats` | Статистики (invited/confirmed/attended/absent) |
| `invitePeopleToEvent(eventId, personIds)` | `number, number[]` | void | Масова покана |
| `updateAttendanceStatus(eventId, personId, status)` | `number, number, AttendanceStatus` | void | Промяна статус |
| `removeAttendee(eventId, personId)` | `number, number` | void | Премахване |

**Типове:**
- `AttendanceStatus`: `'invited' | 'confirmed' | 'attended' | 'absent'`

---

## groups.ts — Групи

| Функция | Параметри | Връща | Описание |
|---------|-----------|-------|----------|
| `getGroups()` | — | `GroupWithMemberCount[]` | Всички групи с брой членове |
| `createGroup(name, color?, description?)` | `string, string?, string?` | `ActionResult<Group>` | Нова група |
| `updateGroup(id, data)` | `number, Partial` | `ActionResult<Group>` | Редакция |
| `deleteGroup(id)` | `number` | `ActionResult` | Изтриване |
| `getGroupMembers(groupId)` | `number` | `GroupMemberWithPerson[]` | Членове на група |
| `addMemberToGroup(groupId, personId)` | `number, number` | `ActionResult` | Добавяне на 1 член |
| `addMembersToGroup(groupId, personIds)` | `number, number[]` | `ActionResult` | Масово добавяне |
| `removeMemberFromGroup(groupId, personId)` | `number, number` | `ActionResult` | Премахване |
| `getPersonGroups(personId)` | `number` | `Group[]` | Групите на човек |

---

## tags.ts — Тагове/Категории

| Функция | Параметри | Връща | Описание |
|---------|-----------|-------|----------|
| `getTags()` | — | `TagWithCount[]` | Всички тагове с брой хора |
| `createTag(name, color)` | `string, string` | `ActionResult<Tag>` | Нов таг |
| `updateTag(id, name, color)` | `number, string, string` | `ActionResult<Tag>` | Редакция |
| `deleteTag(id)` | `number` | `ActionResult` | Изтриване |
| `addTagToPerson(personId, tagId)` | `number, number` | `ActionResult` | Добавяне на таг |
| `removeTagFromPerson(personId, tagId)` | `number, number` | `ActionResult` | Премахване на таг |
| `getPersonTags(personId)` | `number` | `Tag[]` | Таговете на човек |

---

## notes.ts — Бележки

| Функция | Параметри | Връща | Описание |
|---------|-----------|-------|----------|
| `createNote(prevState, formData)` | FormData (personId, content) | `CreateNoteState` | Нова бележка |
| `getNotes(personId)` | `number` | `Note[]` | Бележки на човек |
| `deleteNote(noteId, personId)` | `number, number` | void | Изтриване |

---

## activities.ts — Активности/Взаимодействия

| Функция | Параметри | Връща | Описание |
|---------|-----------|-------|----------|
| `addActivity(personId, type, content, dateStr?)` | `number, string, string, string?` | `ActivityLog` | Нова активност |
| `getActivities(personId)` | `number` | `ActivityLog[]` | Активности на човек |
| `deleteActivity(id, personId)` | `number, number` | void | Изтриване |

**Типове activity:** `'note' | 'call' | 'email' | 'meeting' | 'task'`
- `task` тип автоматично създава Task запис вместо ActivityLog

---

## tasks.ts — Задачи

| Функция | Параметри | Връща | Описание |
|---------|-----------|-------|----------|
| `createTask(prevState, formData)` | FormData | `CreateTaskState` | Нова задача |
| `toggleTask(taskId, personId)` | `number, number` | void | Маркиране complete/incomplete |
| `deleteTask(taskId, personId)` | `number, number` | void | Изтриване |
| `getTasks(personId)` | `number` | `Task[]` | Задачи на човек |
| `getTasksForDashboard(filters?)` | `TaskFilters?` | `TaskWithAssignees[]` | За таблото |
| `getTaskStats()` | — | `TaskStats` | Обща статистика |
| `getOverdueTasks()` | — | `TaskWithAssignees[]` | Просрочени задачи |
| `getTasksDueSoon(days?)` | `number` | `TaskWithAssignees[]` | Наближаващи |

---

## reminders.ts — Напомняния

| Функция | Параметри | Връща | Описание |
|---------|-----------|-------|----------|
| `createReminder(data)` | `{personId, title, description?, dueDate, type?}` | `Reminder` | Ново напомняне |
| `toggleReminder(id, personId)` | `number, number` | void | Complete/incomplete |
| `deleteReminder(id, personId)` | `number, number` | void | Изтриване |
| `getPersonReminders(personId)` | `number` | `Reminder[]` | За конкретен човек |
| `getUpcomingReminders(days?)` | `number` | `ReminderWithPerson[]` | Предстоящи |
| `getOverdueReminders()` | — | `ReminderWithPerson[]` | Просрочени |

---

## relations.ts — Връзки между хора

| Функция | Параметри | Връща | Описание |
|---------|-----------|-------|----------|
| `addRelation(personId, relatedId, type, description?)` | `number, number, string, string?` | void | Нова връзка |
| `removeRelation(id, personId)` | `number, number` | void | Премахване |
| `getPersonRelations(personId)` | `number` | `PersonRelationWithDetails[]` | Връзки на човек |

**Типове:** `'family' | 'colleague' | 'referral' | 'mentor' | 'neighbor' | 'party'`

---

## messaging.ts — Масови съобщения

| Функция | Параметри | Връща | Описание |
|---------|-----------|-------|----------|
| `getSegmentRecipients(filters)` | `SegmentFilters` | `RecipientPreviewData` | Преглед получатели по сегмент |
| `sendBulkEmail(data)` | `{groupId?, subject, body, ...}` | void | Изпращане на масов имейл |
| `getMessageHistory()` | — | `MessageLogEntry[]` | История на съобщения |

---

## bulk.ts — Масови операции

| Функция | Параметри | Връща | Описание |
|---------|-----------|-------|----------|
| `deletePeople(ids)` | `number[]` | void | Масово изтриване |
| `updatePeopleStatus(ids, status)` | `number[], string` | void | Масова промяна статус |
| `addPeopleToGroup(ids, groupId)` | `number[], number` | void | Масово добавяне в група |
| `removePeopleFromGroup(ids, groupId)` | `number[], number` | void | Масово премахване от група |

---

## Помощни actions

### dashboard.ts
| `getDashboardStats()` | — | `DashboardStats` | Обща статистика (total, new, active, birthday) |

### changelog.ts
| `logFieldChange(personId, field, oldValue, newValue)` | | void | Записва промяна |
| `logFieldChanges(personId, changes[])` | | void | Записва множество промени |
| `getPersonChangeLogs(personId)` | `number` | `ChangeLogEntry[]` | Audit trail |

### duplicates.ts
| `findDuplicates()` | — | `DuplicatePair[]` | Намиране на дубликати |
| `mergePeople(keepId, removeId)` | `number, number` | void | Обединяване |

### engagement.ts
| `getPersonEngagement(personId)` | `number` | `PersonEngagement` | Engagement score |

### export.ts
| `exportPeopleToCSV(filters)` | `ExportPeopleParams` | `string` (CSV) | Генериране CSV |

### header.ts
| `getNotificationCounts()` | — | `NotificationCounts` | Брой нотификации |
| `getNotificationItems()` | — | `NotificationItem[]` | Списък нотификации |
| `quickSearch(query)` | `string` | `QuickSearchResult[]` | Бързо търсене |

### mail.ts
| `sendEmailAction(personId, subject, body)` | `number, string, string` | void | Имейл до 1 човек |

### map.ts
| `getMapData()` | — | `MapMarkerData[]` | Маркери за картата |

### savedFilters.ts
| `getSavedFilters()` | — | `SavedFilterWithId[]` | Всички запазени филтри |
| `createSavedFilter(name, color, filters)` | | `SavedFilter` | Нов запазен филтър |
| `updateSavedFilter(id, data)` | | `SavedFilter` | Редакция |
| `deleteSavedFilter(id)` | `number` | void | Изтриване |

### search.ts
| `searchPeople(query)` | `string` | `Person[]` | Глобално търсене |

### templates.ts
| `getTemplates()` | — | `EmailTemplate[]` | Email шаблони |
| `getTelegramTemplates()` | — | `TelegramTemplate[]` | Telegram шаблони |
| `createTemplate(name, subject, body)` | | `EmailTemplate` | Нов email шаблон |
| `createTelegramTemplate(name, message)` | | `TelegramTemplate` | Нов telegram шаблон |
| `updateTemplate(id, name, subject, body)` | | `EmailTemplate` | Редакция |
| `updateTelegramTemplate(id, name, message)` | | `TelegramTemplate` | Редакция |
| `deleteTemplate(id)` | `number` | void | Изтриване email шаблон |
| `deleteTelegramTemplate(id)` | `number` | void | Изтриване telegram шаблон |
