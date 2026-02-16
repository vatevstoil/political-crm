import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL)
  console.log('Start seeding ...')

  // Create Tags
  const tagExpert = await prisma.tag.upsert({
    where: { tagName: 'Експерт' },
    update: {},
    create: { tagName: 'Експерт', color: '#3b82f6' },
  })

  const tagVolunteer = await prisma.tag.upsert({
    where: { tagName: 'Доброволец' },
    update: {},
    create: { tagName: 'Доброволец', color: '#10b981' },
  })

  // Create People
  console.log('Upserting person 1...')
  const person1 = await prisma.person.upsert({
    where: { membershipCardId: '0001' },
    update: {},
    create: {
      membershipCardId: '0001',
      fullName: 'Иван Иванов',
      email: 'ivan@example.com',
      phone: '0888123456',
      city: 'София',
      role: 'Координатор',
      status: 'Active',
      profession: 'IT Специалист',
      notes: {
        create: {
          content: 'Първа среща премина отлично. Много мотивиран.',
        },
      },
      tags: {
        create: [
            { tag: { connect: { id: tagExpert.id } } }
        ]
      }
    },
  })

  console.log('Upserting person 2...')
  const person2 = await prisma.person.upsert({
    where: { membershipCardId: '0002' },
    update: {},
    create: {
      membershipCardId: '0002',
      fullName: 'Мария Петрова',
      email: 'maria@example.com',
      phone: '0888654321',
      city: 'Пловдив',
      role: 'Член',
      status: 'Active',
      profession: 'Лекар',
      tags: {
        create: [
            { tag: { connect: { id: tagVolunteer.id } } }
        ]
      }
    },
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
