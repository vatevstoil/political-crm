# Multi-Phone, EGN Field, Tag Dropdown Fix

**Date:** 2026-03-08
**Status:** Approved

## 1. Multiple Phone Numbers (JSON Array)

**Storage:** `phone` field stays `String?`, stores JSON array `["number1", "number2"]`.
First number is "primary" (shown in table, WhatsApp button).

**Backward compatibility:** If value is not valid JSON array, treat as `[value]`. Zero schema migration.

**Profile UI (Contacts section):**
- Show all numbers in a list
- "+" button to add new number
- "×" button to remove a number
- First number is primary — shown in list view and WhatsApp button

**Table/list view:** Shows only first number (same as before).

**Search:** Already JS-based — will search across all numbers.

**Helper functions needed:**
- `parsePhones(phone: string | null): string[]` — parse JSON or single value
- `serializePhones(phones: string[]): string | null` — serialize to JSON or null

**Files to modify:**
- `app/directory/[id]/PersonPageClient.tsx` — multi-phone UI in contacts section
- `app/actions/people.ts` — update/create to handle JSON array, search across all phones
- `components/directory/DirectoryGrid.tsx` — parse first phone for display
- `app/actions/export.ts` — export first phone or all phones

## 2. EGN Field

**Schema:** New field `egn String? @unique` in Person model. Migration required.

**Profile UI:** EditableField in "Personal Data" section (middle column), below birth date.
Label: "ЕГН". Validation: exactly 10 digits.

**Files to modify:**
- `prisma/schema.prisma` — add `egn` field
- `app/directory/[id]/PersonPageClient.tsx` — add EditableField
- `app/directory/[id]/page.tsx` — include egn in select
- `app/actions/people.ts` — add egn to updatePerson, createPerson

## 3. Tag Dropdown Z-Index Fix

**Problem:** "Add tag" dropdown overlaps with "Relations" section below it.

**Fix:** Add `z-index` or `relative` positioning to tag section container so dropdown renders above subsequent sections.

**Files to modify:**
- `app/directory/[id]/PersonPageClient.tsx` — tag section container styles
