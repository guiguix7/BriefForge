import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface BrandMarkProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const markSizes = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
}

/**
 * A small forged binder: two ruled pages held by a copper spine.
 * Drawn geometry, not an illustration.
 */
export function BrandMark({ className, size = 'md' }: BrandMarkProps) {
  return (
    <span
      className={cn(
        'relative inline-grid shrink-0 place-items-center overflow-hidden rounded-md border border-accent/60 bg-accent text-accent-foreground',
        markSizes[size],
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 32 32"
        className="h-full w-full"
        fill="none"
        focusable="false"
      >
        <path d="M8 7.5h13.5a2.5 2.5 0 0 1 0 5H13" stroke="currentColor" strokeWidth="2.4" />
        <path d="M8 16h16" stroke="currentColor" strokeWidth="2.4" />
        <path d="M8 24h11" stroke="currentColor" strokeWidth="2.4" />
        <path d="M8 5v22" stroke="currentColor" strokeWidth="1.2" opacity=".55" />
      </svg>
    </span>
  )
}

interface BrandLockupProps {
  tone?: 'light' | 'dark'
  size?: 'sm' | 'md'
  showTagline?: boolean
  className?: string
}

export function BrandLockup({
  tone = 'light',
  size = 'md',
  showTagline = false,
  className,
}: BrandLockupProps) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2.5', className)}>
      <BrandMark size={size === 'sm' ? 'sm' : 'md'} />
      <span className="min-w-0">
        <span
          className={cn(
            'block truncate font-semibold tracking-[var(--tracking-snug)]',
            size === 'sm' ? 'text-sm' : 'text-base',
            tone === 'light' ? 'text-ink' : 'text-sidebar-ink'
          )}
        >
          BriefForge
        </span>
        {showTagline && (
          <span
            className={cn(
              'block truncate text-[0.625rem] font-medium uppercase tracking-[0.12em]',
              tone === 'light' ? 'text-ink-muted' : 'text-sidebar-muted'
            )}
          >
            do briefing ao escopo
          </span>
        )}
      </span>
    </span>
  )
}

export function BrandLink({
  tone = 'light',
  showTagline = false,
  className,
}: Omit<BrandLockupProps, 'size'>) {
  return (
    <Link
      to="/"
      className={cn(
        'inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
        tone === 'light' ? 'focus-visible:ring-offset-canvas' : 'focus-visible:ring-offset-sidebar',
        className
      )}
      aria-label="BriefForge — ir para a visão geral"
    >
      <BrandLockup tone={tone} showTagline={showTagline} />
    </Link>
  )
}
