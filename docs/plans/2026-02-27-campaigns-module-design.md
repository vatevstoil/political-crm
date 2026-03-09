# Campaigns Module Design

## Overview
Campaign management module for organizing political initiatives — elections, recruitment drives, protests, petitions, fundraising, and outreach efforts.

## Data Models

### Campaign
| Field | Type | Description |
|-------|------|-------------|
| id | Int (autoincrement) | Primary key |
| name | String | Campaign name |
| description | String? | Details |
| type | String | election, recruitment, protest, petition, fundraising, outreach |
| status | String | planning, active, paused, completed, cancelled (default: planning) |
| startDate | DateTime | Start date |
| endDate | DateTime? | End date |
| goal | String? | Campaign goal text |
| budget | Float? | Budget amount |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### CampaignMember
| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| campaignId | Int | FK → Campaign |
| personId | Int | FK → Person |
| role | String | leader, coordinator, volunteer (default: volunteer) |
| joinedAt | DateTime | Auto |

Unique constraint: (campaignId, personId)

### CampaignNote
| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| campaignId | Int | FK → Campaign |
| content | String | Note text |
| createdAt | DateTime | Auto |

### Task linkage
Existing Task model gets optional `campaignId` field (FK → Campaign).

## Routes

| Route | Type | Description |
|-------|------|-------------|
| `/campaigns` | Server+Client | List all campaigns with status filter |
| `/campaigns/new` | Server | Create campaign form |
| `/campaigns/[id]` | Server | Campaign detail — team, tasks, notes, progress |
| `/campaigns/[id]/edit` | Server | Edit campaign form |

## Page Designs

### `/campaigns` — Campaign List
- Header: "Кампании" + "Нова кампания" button
- Status filter tabs: Всички / Планиране / Активни / Завършени
- Campaign cards in grid (2 cols desktop, 1 mobile):
  - Name, type badge, status badge
  - Date range, progress bar (tasks completed / total)
  - Team member count, task count
  - Click → detail page

### `/campaigns/[id]` — Campaign Detail
- Header: name, status badge, type badge, edit button
- Info bar: date range, budget, goal
- Progress bar (completed tasks / total tasks)
- 4 sections:
  1. **Екип** — leader shown first, then coordinators, then volunteers. Add member button → modal with person search
  2. **Задачи** — linked tasks with status toggles. Create new task button
  3. **Бележки** — timeline of notes with add form
  4. **Обзор** — stats cards (members, tasks done, days remaining)

### `/campaigns/new` and `/campaigns/[id]/edit`
- Form fields: name, description, type (select), status (select), startDate, endDate, goal, budget
- Same PersonForm pattern (server action + Zod validation)

## Server Actions (`app/actions/campaigns.ts`)

| Function | Params | Returns | Description |
|----------|--------|---------|-------------|
| getCampaigns(status?) | string? | Campaign[] | All or filtered |
| getCampaign(id) | number | CampaignWithDetails | Single with members, tasks, notes |
| createCampaign(formData) | FormData | CreateCampaignState | Create |
| updateCampaign(id, data) | number, Partial | Campaign | Update |
| deleteCampaign(id) | number | void | Delete |
| addCampaignMember(campaignId, personId, role) | number, number, string | void | Add member |
| removeCampaignMember(campaignId, personId) | number, number | void | Remove |
| updateCampaignMemberRole(campaignId, personId, role) | number, number, string | void | Change role |
| getCampaignMembers(campaignId) | number | CampaignMemberWithPerson[] | List members |
| addCampaignNote(campaignId, content) | number, string | CampaignNote | Add note |
| deleteCampaignNote(id, campaignId) | number, number | void | Delete note |
| linkTaskToCampaign(taskId, campaignId) | number, number | void | Link existing task |
| unlinkTaskFromCampaign(taskId) | number | void | Unlink task |
| getCampaignStats() | — | CampaignStats | For dashboard |
| getActiveCampaigns() | — | Campaign[] | For dashboard widget |

## Dashboard Integration
- New "Активни кампании" card in dashboard showing active campaigns with progress
- QuickAdd menu gets "Нова кампания" option

## Navigation
- New "Кампании" link in Header nav between "Групи" and "Съобщения"

## Dark Mode
Follow existing conventions from CLAUDE.md.

## Implementation Order
1. Prisma schema + migration
2. Server actions (campaigns.ts)
3. Campaign list page + CampaignCard component
4. Campaign form (new/edit)
5. Campaign detail page with sections
6. Dashboard integration
7. Navigation update
8. Tests
