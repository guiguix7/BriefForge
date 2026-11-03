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

/** The two-line wordmark symbol: the second line is the product's marker. */
export function BrandMark({ className, size = 'md' }: BrandMarkProps) {
  return (
    <span
      className={cn(
        'relative inline-grid shrink-0 place-items-center overflow-hidden rounded-[3px] border border-white/10 bg-[var(--marker-ink)]',
        markSizes[size],
        className
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="h-full w-full" fill="none" focusable="false">
        <path d="M6.5 10h19" stroke="#F5F6F8" strokeWidth="3" strokeLinecap="square" />
        <rect x="6.5" y="16" width="19" height="8" rx="1" fill="#FFE45C" />
        <path d="M9 20h12.5" stroke="#12263A" strokeWidth="1.8" strokeLinecap="square" />
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
            'block truncate font-[700] tracking-[var(--tracking-snug)]',
            size === 'sm' ? 'text-sm' : 'text-base',
            tone === 'light' ? 'text-ink' : 'text-sidebar-ink'
          )}
        >
          BriefForge
        </span>
        {showTagline && (
          <span
            className={cn(
              'block truncate text-xs font-medium',
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
