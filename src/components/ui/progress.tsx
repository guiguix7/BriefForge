import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md'
  className?: string
  tone?: 'accent' | 'success'
}

export function Progress({
  value,
  label = 'Progresso',
  showValue = false,
  size = 'sm',
  className,
  tone = 'accent',
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)))

  return (
    <div className={cn('w-full', className)}>
      {(showValue || label) && (
        <div className="mb-1.5 flex items-center justify-between gap-3">
          {label && <span className="text-xs text-ink-muted">{label}</span>}
          {showValue && (
            <span className="text-meta text-ink-muted">{clamped}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label={label}
        className={cn(
          'w-full overflow-hidden rounded-full bg-surface-sunken',
          size === 'sm' ? 'h-1.5' : 'h-2'
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-out)]',
            tone === 'success' ? 'bg-success' : 'bg-accent'
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
