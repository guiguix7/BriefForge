import * as React from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowRightLeft,
  CheckCircle2,
  Clock3,
  PencilLine,
  PlusCircle,
  Search,
  X,
  XCircle,
} from 'lucide-react'
import { useStore, type HistoryEvent } from '@/store'
import { ProjectNotFound } from '@/components/project/project-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { SectionHeading } from '@/components/ui/section-heading'
import { Select } from '@/components/ui/select'
import { HISTORY_TYPE, pluralize } from '@/lib/domain'
import { formatDateTime } from '@/lib/utils'

const TYPE_ICON: Record<HistoryEvent['type'], React.ElementType> = {
  criacao: PlusCircle,
  edicao: PencilLine,
  aprovacao: CheckCircle2,
  rejeicao: XCircle,
  conversao: ArrowRightLeft,
  alteracao: Clock3,
}

const dayFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function dayKey(value: string): string {
  const date = new Date(value)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function dayLabel(value: string): string {
  const date = startOfDay(new Date(value))
  const today = startOfDay(new Date())
  const difference = Math.round(
    (today.getTime() - date.getTime()) / 86_400_000
  )

  if (difference === 0) return 'Hoje'
  if (difference === 1) return 'Ontem'

  return dayFormatter.format(date)
}

interface HistoryGroup {
  key: string
  label: string
  events: HistoryEvent[]
}

function groupByDay(events: HistoryEvent[]): HistoryGroup[] {
  const groups = new Map<string, HistoryEvent[]>()

  for (const event of events) {
    const key = dayKey(event.createdAt)
    const group = groups.get(key)
    if (group) group.push(event)
    else groups.set(key, [event])
  }

  return [...groups.entries()].map(([key, groupEvents]) => ({
    key,
    label: dayLabel(groupEvents[0].createdAt),
    events: groupEvents,
  }))
}

function HistoryEntry({ event }: { event: HistoryEvent }) {
  const config = HISTORY_TYPE[event.type]
  const Icon = TYPE_ICON[event.type]

  return (
    <li className="relative pb-4 pl-7 last:pb-0">
      <span
        className="absolute -left-3 top-1 grid h-6 w-6 place-items-center rounded-full border border-line bg-surface text-ink-muted shadow-xs"
        aria-hidden="true"
      >
        <Icon className="h-3 w-3" />
      </span>

      <div className="rounded-lg border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <Badge tone={config.tone}>{config.label}</Badge>
          <time
            dateTime={event.createdAt}
            className="font-mono text-[0.6875rem] tabular text-ink-subtle"
          >
            {formatDateTime(event.createdAt)}
          </time>
        </div>
        <p className="mt-2 text-sm font-semibold leading-snug text-ink">
          {event.title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
          {event.description}
        </p>
      </div>
    </li>
  )
}

export function HistoryPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { projects, history } = useStore()
  const project = projects.find((item) => item.id === projectId)

  const [typeFilter, setTypeFilter] = React.useState<
    HistoryEvent['type'] | 'all'
  >('all')
  const [dateFrom, setDateFrom] = React.useState('')
  const [dateTo, setDateTo] = React.useState('')
  const [search, setSearch] = React.useState('')

  if (!project || !projectId) return <ProjectNotFound />

  const projectHistory = [...history]
    .filter((event) => event.projectId === projectId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

  const searchTerm = search.trim().toLowerCase()
  const fromBoundary = dateFrom
    ? new Date(`${dateFrom}T00:00:00`).getTime()
    : null
  const toBoundary = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null

  const filtered = projectHistory.filter((event) => {
    if (typeFilter !== 'all' && event.type !== typeFilter) return false

    const timestamp = new Date(event.createdAt).getTime()
    if (fromBoundary !== null && timestamp < fromBoundary) return false
    if (toBoundary !== null && timestamp > toBoundary) return false

    if (
      searchTerm &&
      !event.title.toLowerCase().includes(searchTerm) &&
      !event.description.toLowerCase().includes(searchTerm)
    ) {
      return false
    }

    return true
  })

  const groups = groupByDay(filtered)
  const hasFilters =
    typeFilter !== 'all' ||
    dateFrom !== '' ||
    dateTo !== '' ||
    searchTerm !== ''

  const clearFilters = () => {
    setTypeFilter('all')
    setDateFrom('')
    setDateTo('')
    setSearch('')
  }

  return (
    <div className="space-y-5">
      <SectionHeading
        title="Histórico de decisões"
        description="Registro cronológico do briefing, das revisões e da execução deste projeto."
        actions={
          <span className="font-mono text-xs tabular text-ink-muted">
            {pluralize(projectHistory.length, 'evento', 'eventos')}
          </span>
        }
      />

      <div className="rounded-lg border border-line bg-surface p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_11rem_9.5rem_9.5rem_auto] lg:items-end">
          <div className="space-y-1.5">
            <label
              htmlFor="history-search"
              className="block text-xs font-medium text-ink"
            >
              Buscar
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
                aria-hidden="true"
              />
              <Input
                id="history-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Título ou descrição..."
                className="pl-9 pr-9"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Limpar busca"
                  className="absolute right-1.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-sm text-ink-muted hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="history-type"
              className="block text-xs font-medium text-ink"
            >
              Tipo de evento
            </label>
            <Select
              id="history-type"
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value as HistoryEvent['type'] | 'all'
                )
              }
            >
              <option value="all">Todos os tipos</option>
              {Object.entries(HISTORY_TYPE).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="history-from"
              className="block text-xs font-medium text-ink"
            >
              De
            </label>
            <Input
              id="history-from"
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) => setDateFrom(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="history-to"
              className="block text-xs font-medium text-ink"
            >
              Até
            </label>
            <Input
              id="history-to"
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) => setDateTo(event.target.value)}
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={clearFilters}
            disabled={!hasFilters}
            className="justify-self-start lg:justify-self-end"
          >
            Limpar filtros
          </Button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {pluralize(filtered.length, 'evento exibido', 'eventos exibidos')}.
      </p>

      {projectHistory.length === 0 ? (
        <EmptyState
          icon={<Clock3 className="h-5 w-5" />}
          title="Nenhum evento registrado"
          description="As ações deste projeto ainda não geraram registros. O briefing, a análise e as decisões de revisão aparecem aqui conforme você avança."
          action={
            <Button asChild variant="secondary">
              <Link to={`/projetos/${projectId}/briefing`}>Abrir briefing</Link>
            </Button>
          }
          className="rounded-lg border border-line bg-surface"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-5 w-5" />}
          title="Nenhum evento neste filtro"
          description="Ajuste o tipo, o período ou o termo de busca para encontrar outras decisões e alterações."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              Limpar filtros
            </Button>
          }
          className="rounded-lg border border-line bg-surface"
        />
      ) : (
        <ol className="space-y-7">
          {groups.map((group) => (
            <li key={group.key}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h2 className="text-sm font-semibold capitalize text-ink">
                  {group.label}
                </h2>
                <span className="font-mono text-[0.6875rem] tabular text-ink-subtle">
                  {pluralize(group.events.length, 'evento', 'eventos')}
                </span>
              </div>

              <ol className="mt-3 border-l border-line">
                {group.events.map((event) => (
                  <HistoryEntry key={event.id} event={event} />
                ))}
              </ol>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
