import * as React from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive: 'border-transparent bg-danger text-danger-foreground',
  outline: 'border-input bg-transparent',
  success: 'border-transparent bg-status-done-bg text-status-done-text',
  warning: 'border-transparent bg-status-review-bg text-status-review-text',
}

type BadgeVariant = keyof typeof badgeVariants

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: BadgeVariant }
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-tighter transition-colors hover:border-accent/50',
      badgeVariants[variant || 'default'],
      className
    )}
    {...props}
  />
))
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
