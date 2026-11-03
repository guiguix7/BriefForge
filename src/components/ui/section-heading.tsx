import * as React from 'react'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  title: string
  description?: string
  actions?: React.ReactNode
  as?: 'h2' | 'h3'
  className?: string
  id?: string
}

export function SectionHeading({
  title,
  description,
  actions,
  as: Heading = 'h2',
  className,
  id,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-line pb-2.5',
        className
      )}
    >
      <div className="min-w-0">
        <Heading
          id={id}
          className={cn(
            Heading === 'h2'
              ? 'text-section-title text-ink'
              : 'text-sm font-semibold text-ink'
          )}
        >
          {title}
        </Heading>
        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-muted">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
