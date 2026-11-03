import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { inputBase } from '@/components/ui/input'

/**
 * Native select with the design-system surface. Native controls keep the
 * platform keyboard model and screen-reader behavior intact.
 */
const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        inputBase,
        'h-9 appearance-none py-1.5 pr-9',
        className
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
      aria-hidden="true"
    />
  </div>
))
Select.displayName = 'Select'

export { Select }
