import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PersonPageClient from './PersonPageClient'

interface PersonPageProps {
  params: Promise<{ id: string }>
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { id } = await params
  const personId = parseInt(id)

  if (isNaN(personId)) {
    notFound()
  }

  const person = await prisma.person.findUnique({
    where: { id: personId },
  })

  if (!person) {
    notFound()
  }

  return <PersonPageClient person={person} personId={personId} />
}
