# Profile Page: 3-Column Layout + Auto-Geocoding

**Date:** 2026-03-08
**Status:** Approved

## Problem

1. Left column in profile page is too long (10 sections, 18 EditableFields) — requires excessive scrolling
2. City/address changes don't reflect on the /map page without manual intervention

## Solution

### 1. 3-Column Layout

Redistribute profile sections across 3 columns:

| Left (col-span-3) | Middle (col-span-3) | Right (col-span-6) |
|---|---|---|
| Avatar + Name | Location (region, city, address) | Reminders |
| Role / Status | Elections (section, mobile ballot) | Chronology (ActivityForm) |
| Card # | Personal Data (DOB, gender, disability, pensioner) | Timeline (unified) |
| [Edit] [Print] | Education & Work (profession, employer, uni, specialty) | |
| EngagementStats | ChangeHistory | |
| Tags | | |
| Relations | | |
| Contacts (email, phone, telegram, action buttons) | | |

**Responsive breakpoints:**
- `lg` (1024px+): 3 columns — 3/3/6
- `md` (768-1023px): 2 columns — left+middle merge (6/6)
- Mobile (<768px): 1 column — stacked

### 2. Auto-Geocoding on City Save

When a user saves the "city" field via EditableField:
1. `handleUpdate('city', value)` saves to DB (existing behavior)
2. After save, call `revalidatePath('/map')` to invalidate map cache
3. `/map` page uses `getCoordinatesForCity()` — if city is in lookup table, person appears at correct location
4. If city is NOT in lookup table, show toast warning: "Градът не е намерен на картата"

No schema changes needed — coordinates are calculated dynamically from city field.

## Files to Modify

- `app/directory/[id]/PersonPageClient.tsx` — restructure from 2-col to 3-col grid
- `app/actions/people.ts` — add `revalidatePath('/map')` after city field update
- `lib/mapCoordinates.ts` — export `getCoordinatesForCity` (already exported, verify availability on client)

## No Changes Needed

- Prisma schema (no lat/lng columns needed)
- Map page components (already use dynamic city lookup)
- EditableField component (works as-is)
