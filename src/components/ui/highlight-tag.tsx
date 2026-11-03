import * as React from 'react'
import { cn } from '@/lib/utils'

export type HighlightKind =
  | 'requisito'
  | 'duvida'
  | 'risco'
  | 'entregavel'
  | 'aprovado'
  | 'neutro'

export interface HighlightTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  kind: HighlightKind
}

export function HighlightTag({
  kind,
  className,
  ...props
}: HighlightTagProps) {
  return (
    <span
      data-kind={kind}
      className={cn('highlight-tag', className)}
      {...props}
    />
  )
}
