/**
 * Import/update people from the handwritten PDF list.
 * Matches existing people by phone number (normalized).
 * Creates new entries for unmatched people.
 * Updates existing entries with additional data from the PDF.
 *
 * Usage: node scripts/import-pdf-people.mjs
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'

const prisma = new PrismaClient()

// Normalize phone for matching: strip spaces, dashes, dots
function normalizePhone(phone) {
  if (!phone) return ''
  return phone.replace(/[\s\-\.()]/g, '')
}

async function main() {
  const raw = readFileSync(new URL('./import-pdf-people.json', import.meta.url), 'utf-8')
  const people = JSON.parse(raw)

  // Load all existing people
  const existing = await prisma.person.findMany({
    select: { id: true, fullName: true, phone: true, email: true, membershipCardId: true,
              city: true, address: true, notes: true, role: true, status: true,
              isRepresentative: true, profession: true, birthDate: true, votingSection: true }
  })

  const phoneMap = new Map()
  for (const p of existing) {
    if (p.phone) {
      phoneMap.set(normalizePhone(p.phone), p)
    }
  }

  let created = 0
  let updated = 0
  let skipped = 0

  for (const person of people) {
    const fullName = [person.firstName, person.lastName].filter(Boolean).join(' ').trim()
    const normPhone = normalizePhone(person.phone)

    // Build notes with EGN if present
    let notesText = person.notes || ''
    if (person.egn) {
      notesText = notesText ? `${notesText} ЕГН: ${person.egn}` : `ЕГН: ${person.egn}`
    }

    // Check if exists by phone
    const match = phoneMap.get(normPhone)

    if (match) {
      // Update existing person with additional data
      const updateData = {}

      // Only update fields that are empty in existing record
      if (!match.email && person.email) updateData.email = person.email
      if (!match.city && person.city) updateData.city = person.city
      if (!match.address && person.address) updateData.address = person.address
      if (!match.membershipCardId && person.membershipCardId) updateData.membershipCardId = person.membershipCardId
      if (!match.profession && person.profession) updateData.profession = person.profession
      if (!match.birthDate && person.birthDate) updateData.birthDate = new Date(person.birthDate)
      if (!match.votingSection && person.votingSection) updateData.votingSection = person.votingSection

      // Always update isRepresentative if PDF says true
      if (person.isRepresentative && !match.isRepresentative) {
        updateData.isRepresentative = true
      }

      // Append notes if we have new info (EGN, etc.)
      if (notesText) {
        const existingNotes = match.notes || ''
        // Avoid duplicating notes
        if (!existingNotes) {
          // No notes at all — but notes is a relation, not a string field
          // Actually notes is a relation to Note model, not a text field on Person
          // We'll skip note appending for now
        }
      }

      if (Object.keys(updateData).length > 0) {
        try {
          await prisma.person.update({
            where: { id: match.id },
            data: updateData
          })
          console.log(`UPDATED [${match.id}] ${match.fullName}: ${JSON.stringify(updateData)}`)
          updated++
        } catch (err) {
          console.log(`ERROR updating ${match.fullName}: ${err.message}`)
          skipped++
        }
      } else {
        console.log(`SKIP (no new data) [${match.id}] ${match.fullName}`)
        skipped++
      }

      // Create a note with EGN and additional info if present
      if (notesText) {
        const existingNotes = await prisma.note.findMany({
          where: { personId: match.id },
          select: { content: true }
        })
        const alreadyHasNote = existingNotes.some(n => n.content.includes('ЕГН:') || n.content.includes('PDF импорт'))
        if (!alreadyHasNote && notesText) {
          await prisma.note.create({
            data: {
              personId: match.id,
              content: `[PDF импорт] ${notesText}`,
            }
          })
        }
      }
    } else {
      // Create new person
      const createData = {
        fullName,
        phone: person.phone || null,
        email: person.email || null,
        city: person.city || null,
        address: person.address || null,
        membershipCardId: person.membershipCardId || null,
        role: person.role || 'Supporter',
        status: 'Active',
        isRepresentative: person.isRepresentative || false,
        profession: person.profession || null,
      }

      if (person.birthDate) {
        createData.birthDate = new Date(person.birthDate)
      }

      try {
        const created_person = await prisma.person.create({ data: createData })
        console.log(`CREATED [${created_person.id}] ${fullName}`)

        // Add note with additional info
        if (notesText) {
          await prisma.note.create({
            data: {
              personId: created_person.id,
              content: `[PDF импорт] ${notesText}`,
            }
          })
        }

        created++
      } catch (err) {
        // Handle unique constraint errors (email/membershipCardId)
        if (err.code === 'P2002') {
          console.log(`DUPLICATE ${fullName}: ${err.meta?.target} already exists. Trying without unique fields...`)
          // Retry without unique fields that conflict
          if (createData.email) createData.email = null
          if (createData.membershipCardId) createData.membershipCardId = null
          try {
            const created_person = await prisma.person.create({ data: createData })
            console.log(`CREATED (retry) [${created_person.id}] ${fullName}`)
            if (notesText) {
              await prisma.note.create({
                data: {
                  personId: created_person.id,
                  content: `[PDF импорт] ${notesText}. Оригинален email: ${person.email || '-'}, карта: ${person.membershipCardId || '-'}`,
                }
              })
            }
            created++
          } catch (err2) {
            console.log(`ERROR creating ${fullName}: ${err2.message}`)
            skipped++
          }
        } else {
          console.log(`ERROR creating ${fullName}: ${err.message}`)
          skipped++
        }
      }
    }
  }

  console.log(`\n=== РЕЗУЛТАТ ===`)
  console.log(`Създадени: ${created}`)
  console.log(`Обновени: ${updated}`)
  console.log(`Пропуснати: ${skipped}`)
  console.log(`Общо в JSON: ${people.length}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
