import {
  AlertTriangle,
  ArrowUpRight,
  Flag,
  HelpCircle,
  Layers,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  HISTORY_TYPE,
  PROJECT_STATUS,
  SUGGESTION_STATUS,
  SUGGESTION_TYPE,
  TASK_PRIORITY,
  TASK_STATUS,
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
  const config = TASK_STATUS[status]
  return (
    <Badge tone={config.tone} dot className={className}>
      {config.label}
    </Badge>
  )
}

export function TaskPriorityBadge({
  priority,
  className,
}: {
  priority: Task['priority']
  className?: string
}) {
  const config = TASK_PRIORITY[priority]
  return (
    <Badge tone={config.tone} className={className}>
      {config.label}
    </Badge>
  )
}

export function SuggestionPriorityBadge({
  priority,
  className,
}: {
  priority: Suggestion['priority']
  className?: string
}) {
  const config = TASK_PRIORITY[priority]
  return (
    <Badge tone={config.tone} className={className}>
      {config.label}
    </Badge>
  )
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
    <Badge tone={config.tone} className={cn('gap-1.5', className)}>
      <SuggestionTypeIcon type={type} className="h-3 w-3" />
      {config.label}
    </Badge>
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
