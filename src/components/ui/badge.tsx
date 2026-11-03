import * as React from 'react'
import { cn } from '@/lib/utils'
import type { Tone } from '@/lib/domain'

const toneClasses: Record<Tone | 'outline', string> = {
  neutral: 'border-line bg-surface-muted text-ink-muted',
  accent: 'border-accent/20 bg-accent-soft text-accent',
  success: 'border-success/20 bg-success-soft text-success',
  warning: 'border-warning/20 bg-warning-soft text-warning',
  danger: 'border-danger/20 bg-danger-soft text-danger',
  info: 'border-info/20 bg-info-soft text-info',
  outline: 'border-line bg-transparent text-ink-muted',
}

const dotClasses: Record<Tone | 'outline', string> = {
  neutral: 'bg-ink-subtle',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  outline: 'bg-ink-subtle',
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone | 'outline'
  dot?: boolean
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone = 'neutral', dot = false, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5',
        'text-xs font-medium leading-4 whitespace-nowrap',
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotClasses[tone])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
)
Badge.displayName = 'Badge'

export { Badge, toneClasses }
