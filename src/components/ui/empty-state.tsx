import * as React from 'react'
import { cn } from '@/lib/utils'

const EmptyState = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    icon?: React.ReactNode
    title: string
    description: string
    action?: React.ReactNode
    compact?: boolean
  }
>(({ className, icon, title, description, action, compact = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col items-center justify-center text-center',
      compact ? 'px-4 py-8' : 'px-6 py-14',
      className
    )}
    {...props}
  >
    {icon && (
      <div
        className="mb-4 grid h-11 w-11 place-items-center rounded-lg border border-line bg-surface-muted text-ink-muted"
        aria-hidden="true"
      >
        {icon}
      </div>
    )}
    <h3 className="text-sm font-semibold text-ink">{title}</h3>
    <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-muted">
      {description}
    </p>
    {action && <div className="mt-5">{action}</div>}
  </div>
))
EmptyState.displayName = 'EmptyState'

export { EmptyState }
