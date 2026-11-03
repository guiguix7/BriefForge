import * as React from 'react'
import { cn } from '@/lib/utils'

const inputBase = [
  'flex w-full rounded-[var(--radius-control)] border border-line bg-surface-raised px-3 text-sm text-ink',
  'shadow-xs transition-[border-color,box-shadow,background-color]',
  'placeholder:text-ink-muted/80',
  'hover:border-line-strong',
  'focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20',
  'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60',
  'aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:border-danger aria-[invalid=true]:focus-visible:ring-danger/20',
].join(' ')

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = 'text', ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(inputBase, 'h-9 py-1.5', className)}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input, inputBase }
