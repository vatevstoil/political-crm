
import PersonForm from '@/components/directory/PersonForm'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

interface EditPersonPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPersonPage({ params }: EditPersonPageProps) {
  const { id } = await params
  const personId = parseInt(id, 10)

  if (isNaN(personId)) {
    notFound()
  }
  
  const person = await prisma.person.findUnique({
    where: { id: personId },
  })

  if (!person) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Редактиране на профил</h1>
          <p className="mt-1 text-sm text-gray-500">
             Променете данните за {person.fullName}.
          </p>
        </div>
        
        <PersonForm initialData={person} />
      </div>
    </div>
  )
}
