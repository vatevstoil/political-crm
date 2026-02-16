'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useSearchParams, usePathname } from 'next/navigation'

interface PaginationProps {
  totalPages: number
  currentPage: number
}

export default function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  // Generate page numbers to show
  const getPageNumbers = () => {
    const delta = 2 // Number of pages to show on each side of current page
    const range: (number | string)[] = []
    
    // Always show first page
    range.push(1)

    // Calculate start and end of range
    let start = Math.max(2, currentPage - delta)
    let end = Math.min(totalPages - 1, currentPage + delta)

    // Adjust if near start or end
    if (currentPage - delta <= 2) {
      end = Math.min(totalPages - 1, 5) // Show up to 5 if near start
    }
    if (currentPage + delta >= totalPages - 1) {
      start = Math.max(2, totalPages - 4) // Show last 5 if near end
    }

    // Add ellipsis before range if needed
    if (start > 2) {
      range.push('...')
    }

    // Add the range
    for (let i = start; i <= end; i++) {
        range.push(i)
    }

    // Add ellipsis after range if needed
    if (end < totalPages - 1) {
      range.push('...')
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      range.push(totalPages)
    }

    // If total pages is small (e.g. 1), just return [1]
    if (totalPages === 0) return []
    if (totalPages === 1) return [1]
    
    // Safety check: ensure unique and sorted
    // The logic above generally produces sorted unique, except for edge cases with small totals.
    // For small totals (under 7), we might just show all.
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    return range
  }


  if (totalPages <= 1) return null

  const pages = getPageNumbers()

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      {/* First Page */}
      <Link
        href={createPageURL(1)}
        className={`p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 transition-colors ${
          currentPage <= 1 ? 'pointer-events-none opacity-50' : ''
        }`}
        aria-label="First Page"
      >
        <ChevronsLeft className="h-5 w-5" />
      </Link>

      {/* Previous Page */}
      <Link
        href={createPageURL(currentPage - 1)}
        className={`p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 transition-colors ${
          currentPage <= 1 ? 'pointer-events-none opacity-50' : ''
        }`}
        aria-label="Previous Page"
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>

      {/* Page Numbers */}
      <div className="hidden sm:flex space-x-2">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-4 py-2 text-gray-500">
                ...
              </span>
            )
          }

          const isCurrent = page === currentPage
          return (
            <Link
              key={page}
              href={createPageURL(page)}
              className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                isCurrent
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </Link>
          )
        })}
      </div>
      
      {/* Mobile Page Indicator (Simple) */}
      <div className="sm:hidden text-sm text-gray-700 font-medium">
        {currentPage} / {totalPages}
      </div>

      {/* Next Page */}
      <Link
        href={createPageURL(currentPage + 1)}
        className={`p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 transition-colors ${
          currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''
        }`}
        aria-label="Next Page"
      >
        <ChevronRight className="h-5 w-5" />
      </Link>

      {/* Last Page */}
      <Link
        href={createPageURL(totalPages)}
        className={`p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 transition-colors ${
          currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''
        }`}
        aria-label="Last Page"
      >
        <ChevronsRight className="h-5 w-5" />
      </Link>
    </div>
  )
}
