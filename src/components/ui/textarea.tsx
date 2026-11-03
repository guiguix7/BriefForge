import * as React from 'react'
import { cn } from '@/lib/utils'
import { inputBase } from '@/components/ui/input'

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(inputBase, 'min-h-24 resize-y py-2 leading-relaxed', className)}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export { Textarea }
