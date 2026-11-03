import * as React from 'react'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Tone } from '@/lib/domain'

const toneStyles: Record<
  Exclude<Tone, 'accent' | 'neutral'> | 'neutral',
  { container: string; icon: string; Icon: React.ElementType }
> = {
  neutral: {
    container: 'border-line bg-surface-muted text-ink',
    icon: 'text-ink-muted',
    Icon: Info,
  },
  info: {
    container: 'border-info/25 bg-info-soft text-ink',
    icon: 'text-info',
    Icon: Info,
  },
  success: {
    container: 'border-success/25 bg-success-soft text-ink',
    icon: 'text-success',
    Icon: CheckCircle2,
  },
  warning: {
    container: 'border-warning/30 bg-warning-soft text-ink',
    icon: 'text-warning',
    Icon: AlertTriangle,
  },
  danger: {
    container: 'border-danger/30 bg-danger-soft text-ink',
    icon: 'text-danger',
    Icon: XCircle,
  },
}

interface AlertProps {
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger'
  title?: string
  children?: React.ReactNode
  action?: React.ReactNode
  icon?: React.ReactNode
  className?: string
  role?: 'alert' | 'status'
}

export function Alert({
  tone = 'info',
  title,
  children,
  action,
  icon,
  className,
  role,
}: AlertProps) {
  const config = toneStyles[tone]
  const Icon = config.Icon

  return (
    <div
      role={role}
      className={cn(
        'flex items-start gap-3 rounded-lg border px-4 py-3',
        config.container,
        className
      )}
    >
      <span className={cn('mt-0.5 shrink-0', config.icon)} aria-hidden="true">
        {icon ?? <Icon className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-semibold leading-snug text-ink">{title}</p>}
        {children && (
          <div
            className={cn(
              'text-sm leading-relaxed text-ink-muted',
              title && 'mt-0.5'
            )}
          >
            {children}
          </div>
        )}
        {action && <div className="mt-2.5">{action}</div>}
      </div>
    </div>
  )
}
