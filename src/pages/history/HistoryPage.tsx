import { useParams } from 'react-router-dom'
import { useStore } from '@/store'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  PlusCircle,
  Edit3,
  X as XIcon,
  RefreshCw,
  CheckCircle2,
  Clock,
  Calendar,
} from 'lucide-react'
import * as React from 'react'
import type { HistoryEvent } from '@/store'

const TYPE_CONFIG: Record<
  HistoryEvent['type'],
  { label: string; color: string; icon: React.ElementType }
> = {
  criacao: { label: 'Criação', color: '#4F46E5', icon: PlusCircle },
  edicao: { label: 'Edição', color: '#1D4ED8', icon: Edit3 },
  aprovacao: { label: 'Aprovação', color: '#166534', icon: CheckCircle2 },
  rejeicao: { label: 'Rejeição', color: '#B91C1C', icon: XIcon },
  conversao: { label: 'Conversão', color: '#92400E', icon: RefreshCw },
  alteracao: { label: 'Alteração', color: '#475569', icon: Clock },
}

interface HistoryEventItemProps {
  event: HistoryEvent
}

function HistoryEventItem({ event }: HistoryEventItemProps) {
  const config = TYPE_CONFIG[event.type]
  const Icon = config.icon

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-2 h-2 rounded-full" />
      <div className="relative">
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-border bg-surface" />
        <div className="w-8 h-8 rounded-full border border-border bg-surface flex items-center justify-center text-xs">
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="text-[10px] uppercase tracking-tighter">
            {config.label}
          </Badge>
          <span className="text-[10px] text-muted">
            {new Date(event.createdAt).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-sm font-semibold">{event.title}</span>
          <p className="text-sm text-muted">{event.description}</p>
        </div>
      </div>
    </div>
  )
}

export function HistoryPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { projects, history } = useStore()
  const project = projects.find((p) => p.id === projectId)
  const projHistory = history.filter((h) => h.projectId === projectId)

  const [typeFilter, setTypeFilter] = React.useState<HistoryEvent['type'] | 'all'>(
    'all'
  )
  const [dateFrom, setDateFrom] = React.useState<string>('')
  const [dateTo, setDateTo] = React.useState<string>('')
  const [search, setSearch] = React.useState('')

  const filtered = projHistory.filter((event) => {
    if (typeFilter !== 'all' && event.type !== typeFilter) return false
    if (dateFrom && new Date(event.createdAt) < new Date(dateFrom)) return false
    if (dateTo && new Date(event.createdAt) > new Date(dateTo)) return false
    if (
      search &&
      !event.title.toLowerCase().includes(search.toLowerCase()) &&
      !event.description.toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  if (!project || !projectId) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Projeto não encontrado</h1>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <a
            href={`/projetos/${projectId}`}
            onClick={(e) => {
              e.preventDefault()
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao projeto
          </a>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Histórico</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{project.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="relative w-64">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                placeholder="Buscar no histórico..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full pl-8 pr-3 rounded-md border border-border bg-surface text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as HistoryEvent['type'] | 'all')
              }
              className="h-9 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <option value="all">Todos os tipos</option>
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key as HistoryEvent['type']}>
                  {cfg.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                placeholder="De"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                placeholder="Até"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {filtered.length > 0 ? (
            <div className="border-l border-border pl-4">
              {filtered.map((event) => (
                <HistoryEventItem key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-sm">Sem eventos encontrados</h3>
                <p className="text-sm text-muted max-w-xs mx-auto">
                  Ajuste os filtros ou as ações no projeto aparecerão aqui.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
