import {
  AlertTriangle,
  ArrowUpRight,
  Flag,
  HelpCircle,
  Layers,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { HighlightTag, type HighlightKind } from '@/components/ui/highlight-tag'
import { TaskPriorityGlyph, TaskStatusGlyph } from '@/components/domain-glyphs'
import {
  HISTORY_TYPE,
  PROJECT_STATUS,
  SUGGESTION_STATUS,
  SUGGESTION_TYPE,
} from '@/lib/domain'
import type {
  HistoryEvent,
  Project,
  Suggestion,
  Task,
} from '@/store'
import { cn } from '@/lib/utils'

export function ProjectStatusBadge({
  status,
  className,
}: {
  status: Project['status']
  className?: string
}) {
  const config = PROJECT_STATUS[status]
  return (
    <Badge tone={config.tone} dot className={className}>
      {config.label}
    </Badge>
  )
}

export function TaskStatusBadge({
  status,
  className,
}: {
  status: Task['status']
  className?: string
}) {
  const label = {
    pendente: 'Pendente',
    andamento: 'Em andamento',
    revisao: 'Em revisão',
    concluido: 'Concluído',
  }[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted', className)}>
      <TaskStatusGlyph status={status} />
      <span>{label}</span>
    </span>
  )
}

export function TaskPriorityBadge({
  priority,
  className,
}: {
  priority: Task['priority']
  className?: string
}) {
  const label = { baixa: 'Baixa', media: 'Média', alta: 'Alta', critica: 'Crítica' }[priority]
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted', className)}>
      <TaskPriorityGlyph priority={priority} />
      <span>{label}</span>
    </span>
  )
}

export function SuggestionPriorityBadge({
  priority,
  className,
}: {
  priority: Suggestion['priority']
  className?: string
}) {
  const label = { baixa: 'Baixa', media: 'Média', alta: 'Alta', critica: 'Crítica' }[priority]
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted', className)}>
      <TaskPriorityGlyph priority={priority} />
      <span>{label}</span>
    </span>
  )
}

const HIGHLIGHT_KIND: Record<Suggestion['type'], HighlightKind> = {
  requisito: 'requisito',
  funcionalidade: 'neutro',
  duvida: 'duvida',
  risco: 'risco',
  entregavel: 'entregavel',
}

export function SuggestionTypeBadge({
  type,
  className,
}: {
  type: Suggestion['type']
  className?: string
}) {
  const config = SUGGESTION_TYPE[type]
  return (
    <HighlightTag kind={HIGHLIGHT_KIND[type]} className={cn('gap-1.5', className)}>
      <SuggestionTypeIcon type={type} className="h-3 w-3" />
      {config.label}
    </HighlightTag>
  )
}

export function SuggestionStatusBadge({
  status,
  className,
}: {
  status: Suggestion['status']
  className?: string
}) {
  const config = SUGGESTION_STATUS[status]
  return (
    <Badge tone={config.tone} dot className={className}>
      {config.label}
    </Badge>
  )
}

export function HistoryTypeBadge({
  type,
  className,
}: {
  type: HistoryEvent['type']
  className?: string
}) {
  const config = HISTORY_TYPE[type]
  return (
    <Badge tone={config.tone} className={className}>
      {config.label}
    </Badge>
  )
}

export function SuggestionTypeIcon({
  type,
  className,
}: {
  type: Suggestion['type']
  className?: string
}) {
  const Icon =
    type === 'requisito'
      ? Flag
      : type === 'funcionalidade'
        ? Layers
        : type === 'duvida'
          ? HelpCircle
          : type === 'risco'
            ? AlertTriangle
            : ArrowUpRight

  return <Icon className={className} aria-hidden="true" />
}
