'use client'

import { X } from 'lucide-react'

interface TagBadgeProps {
  tagName: string
  color: string
  onRemove?: () => void
  size?: 'sm' | 'md'
}

export default function TagBadge({ tagName, color, onRemove, size = 'sm' }: TagBadgeProps) {
  const sizeClasses = size === 'sm'
    ? 'text-[11px] px-2 py-0.5'
    : 'text-xs px-2.5 py-1'

  return (
    <span
      className={`inline-flex items-center gap-1 ${sizeClasses} rounded-full font-medium transition-colors`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      {tagName}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-0.5 hover:opacity-70 transition-opacity"
          aria-label={`Премахни таг ${tagName}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  )
}
