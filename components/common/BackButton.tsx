'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface BackButtonProps {
  href?: string
  label?: string
}

export default function BackButton({ href, label = 'Назад' }: BackButtonProps) {
  const router = useRouter()

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {label}
      </Link>
    )
  }

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </button>
  )
}
