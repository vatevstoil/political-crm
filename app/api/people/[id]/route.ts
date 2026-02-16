import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const personId = parseInt(id)

  if (isNaN(personId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    const body = await request.json()

    const updateData: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(body)) {
      if (key === 'birthDate' && value && typeof value === 'string') {
        updateData[key] = new Date(value)
      } else if (value !== undefined && value !== '') {
        updateData[key] = value
      }
    }

    const person = await prisma.person.update({
      where: { id: personId },
      data: updateData,
    })

    return NextResponse.json(person)
  } catch (error) {
    console.error('Failed to update person:', error)
    return NextResponse.json({ error: 'Failed to update person' }, { status: 500 })
  }
}
