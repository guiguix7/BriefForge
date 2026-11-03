import * as React from 'react'
import { cn } from '@/lib/utils'
import type { HighlightKind } from '@/components/ui/highlight-tag'

export interface HighlightMarkProps extends React.HTMLAttributes<HTMLElement> {
  kind: HighlightKind
}

export function HighlightMark({
  kind,
  className,
  ...props
}: HighlightMarkProps) {
  return (
    <mark
      data-kind={kind}
      className={cn('highlight-mark', className)}
      {...props}
    />
  )
}
