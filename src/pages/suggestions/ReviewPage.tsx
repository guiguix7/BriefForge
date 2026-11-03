import * as React from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Check,
  FlaskConical,
  ListChecks,
  Pencil,
  Quote,
  RotateCcw,
  ScanSearch,
  Search,
  X,
} from 'lucide-react'
import { useStore, type Suggestion } from '@/store'
import { useToast } from '@/components/ui/toast'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Form, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SectionHeading } from '@/components/ui/section-heading'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  SuggestionStatusBadge,
  SuggestionTypeBadge,
} from '@/components/domain-badges'
import { ReviewLayout, type ReviewSummary } from '@/features/suggestions/ReviewLayout'
import {
  SUGGESTION_TYPE,
  SUGGESTION_TYPE_ORDER,
  TASK_PRIORITY,
  isConvertible,
  pluralize,
} from '@/lib/domain'
import { cn } from '@/lib/utils'

type StatusFilter = Suggestion['status'] | 'all'
type TypeFilter = Suggestion['type'] | 'all'

const priorityOrder: Record<Suggestion['priority'], number> = {
  critica: 0,
  alta: 1,
  media: 2,
  baixa: 3,
}

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'aprovada', label: 'Aprovadas' },
  { value: 'rejeitada', label: 'Rejeitadas' },
  { value: 'convertida', label: 'Convertidas' },
]

function SuggestionCard({
  suggestion,
  selected,
  onSelect,
  onApprove,
  onReject,
  onEdit,
  onPriorityChange,
  onConvert,
  onReopen,
}: {
  suggestion: Suggestion
  selected: boolean
  onSelect: (suggestion: Suggestion) => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onEdit: (suggestion: Suggestion) => void
  onPriorityChange: (id: string, priority: Suggestion['priority']) => void
  onConvert: (suggestion: Suggestion) => void
  onReopen: (id: string) => void
}) {
  const headingId = `proposal-${suggestion.id}-title`
  const priorityId = `proposal-${suggestion.id}-priority`
  const convertible = isConvertible(suggestion)
  const isDecisionOnly =
    suggestion.status === 'aprovada' &&
    (suggestion.type === 'duvida' || suggestion.type === 'risco')

  return (
    <article
      aria-labelledby={headingId}
      className={cn(
        'rounded-lg border bg-surface px-4 py-4 transition-colors',
        selected
          ? 'border-accent/45 ring-1 ring-accent/20'
          : 'border-line hover:border-line-strong'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <SuggestionTypeBadge type={suggestion.type} />
          <SuggestionStatusBadge status={suggestion.status} />
          {convertible && (
            <Badge tone="success" dot>
              Pronta para tarefa
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <label
            htmlFor={priorityId}
            className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-ink-subtle"
          >
            Prioridade
          </label>
          <Select
            id={priorityId}
            value={suggestion.priority}
            onChange={(event) =>
              onPriorityChange(
                suggestion.id,
                event.target.value as Suggestion['priority']
              )
            }
            className="h-7 w-28 py-0 text-xs"
            aria-label={`Prioridade de ${suggestion.title}`}
          >
            {Object.entries(TASK_PRIORITY).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <h4
        id={headingId}
        className="mt-2.5 text-sm font-semibold leading-snug text-ink"
      >
        {suggestion.title}
      </h4>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
        {suggestion.description}
      </p>

      {suggestion.sourceQuote && (
        <blockquote className="mt-3 border-t border-line-subtle pt-2.5">
          <p className="flex gap-2 text-xs italic leading-relaxed text-ink-muted">
            <Quote
              className="mt-0.5 h-3 w-3 shrink-0 text-ink-subtle"
              aria-hidden="true"
            />
            “{suggestion.sourceQuote}”
          </p>
        </blockquote>
      )}

      {isDecisionOnly && (
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          Decisão registrada no escopo. Dúvidas e riscos não geram tarefas.
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line-subtle pt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onSelect(suggestion)}
        >
          <Quote className="h-3.5 w-3.5" aria-hidden="true" />
          Ver origem
        </Button>

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {suggestion.status === 'pendente' && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onReject(suggestion.id)}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Rejeitar
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onEdit(suggestion)}
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Editar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => onApprove(suggestion.id)}
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Aprovar
              </Button>
            </>
          )}

          {suggestion.status === 'aprovada' && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onReopen(suggestion.id)}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reabrir
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onEdit(suggestion)}
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Editar
              </Button>
              {convertible && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onConvert(suggestion)}
                >
                  <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                  Criar tarefa
                </Button>
              )}
            </>
          )}

          {suggestion.status === 'rejeitada' && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onReopen(suggestion.id)}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reabrir
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onEdit(suggestion)}
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Editar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => onApprove(suggestion.id)}
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Aprovar
              </Button>
            </>
          )}

          {suggestion.status === 'convertida' && (
            <Button asChild variant="secondary" size="sm">
              <Link to={`/projetos/${suggestion.projectId}/tarefas`}>
                <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                Ver tarefas
              </Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}

export function ReviewPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const {
    projects,
    suggestions,
    approveSuggestion,
    rejectSuggestion,
    updateSuggestion,
    addTask,
    addHistory,
  } = useStore()
  const { toast } = useToast()

  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [sourceOpen, setSourceOpen] = React.useState(false)
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>('all')
  const [search, setSearch] = React.useState('')
  const [editing, setEditing] = React.useState<Suggestion | null>(null)
  const [editDraft, setEditDraft] = React.useState({
    title: '',
    description: '',
  })

  const project = projects.find((item) => item.id === projectId)
  const projectSuggestions = suggestions.filter(
    (suggestion) => suggestion.projectId === projectId
  )

  const counts: Record<StatusFilter, number> = {
    all: projectSuggestions.length,
    pendente: projectSuggestions.filter((s) => s.status === 'pendente').length,
    aprovada: projectSuggestions.filter((s) => s.status === 'aprovada').length,
    rejeitada: projectSuggestions.filter((s) => s.status === 'rejeitada').length,
    convertida: projectSuggestions.filter((s) => s.status === 'convertida')
      .length,
  }

  const summary: ReviewSummary = {
    pending: counts.pendente,
    approved: counts.aprovada,
    rejected: counts.rejeitada,
    converted: counts.convertida,
    convertible: projectSuggestions.filter(isConvertible).length,
    total: counts.all,
  }

  const filtered = projectSuggestions
    .filter((suggestion) => {
      if (statusFilter !== 'all' && suggestion.status !== statusFilter)
        return false
      if (typeFilter !== 'all' && suggestion.type !== typeFilter) return false
      const term = search.trim().toLowerCase()
      if (!term) return true
      return (
        suggestion.title.toLowerCase().includes(term) ||
        suggestion.description.toLowerCase().includes(term) ||
        (suggestion.sourceQuote ?? '').toLowerCase().includes(term)
      )
    })
    .sort(
      (a, b) =>
        SUGGESTION_TYPE_ORDER.indexOf(a.type) -
          SUGGESTION_TYPE_ORDER.indexOf(b.type) ||
        priorityOrder[a.priority] - priorityOrder[b.priority] ||
        a.title.localeCompare(b.title)
    )

  const selected =
    projectSuggestions.find((suggestion) => suggestion.id === selectedId) ??
    null
  const hasFilters =
    statusFilter !== 'all' || typeFilter !== 'all' || search.trim() !== ''

  React.useEffect(() => {
    setSelectedId(null)
    setSourceOpen(false)
    setStatusFilter('all')
    setTypeFilter('all')
    setSearch('')
    setEditing(null)
  }, [projectId])

  React.useEffect(() => {
    if (selectedId) return
    const first =
      projectSuggestions.find((item) => item.status === 'pendente') ??
      projectSuggestions[0]
    if (first) setSelectedId(first.id)
  }, [projectId, projectSuggestions.length, selectedId])

  if (!project || !projectId) return null

  const recordHistory = (
    type: 'aprovacao' | 'rejeicao' | 'conversao' | 'alteracao',
    title: string,
    description: string
  ) => {
    addHistory(projectId, { type, title, description })
  }

  const handleApprove = (id: string) => {
    const suggestion = projectSuggestions.find((item) => item.id === id)
    if (!suggestion || suggestion.status === 'aprovada') return

    approveSuggestion(id)
    setSelectedId(id)
    recordHistory(
      'aprovacao',
      'Proposta aprovada',
      `"${suggestion.title}" aprovada por decisão humana.`
    )
    toast({
      title: 'Proposta aprovada',
      description: isConvertible({ ...suggestion, status: 'aprovada' })
        ? 'Ela já pode ser convertida em tarefa.'
        : 'A decisão foi registrada no escopo.',
      variant: 'success',
    })
  }

  const handleReject = (id: string) => {
    const suggestion = projectSuggestions.find((item) => item.id === id)
    if (!suggestion) return

    rejectSuggestion(id)
    setSelectedId(id)
    recordHistory(
      'rejeicao',
      'Proposta rejeitada',
      `"${suggestion.title}" rejeitada. O item não entra no escopo.`
    )
    toast({
      title: 'Proposta rejeitada',
      description: 'O item permanece no dossiê e pode ser reaberto.',
    })
  }

  const handleReopen = (id: string) => {
    const suggestion = projectSuggestions.find((item) => item.id === id)
    if (!suggestion || suggestion.status === 'convertida') return

    updateSuggestion(id, {
      status: 'pendente',
      approvedAt: undefined,
      rejectedAt: undefined,
    })
    setSelectedId(id)
    recordHistory(
      'alteracao',
      'Proposta reaberta',
      `"${suggestion.title}" voltou para a fila de revisão.`
    )
    toast({
      title: 'Proposta reaberta',
      description: 'A decisão anterior foi removida.',
    })
  }

  const handleOpenEdit = (suggestion: Suggestion) => {
    setEditing(suggestion)
    setEditDraft({
      title: suggestion.title,
      description: suggestion.description,
    })
  }

  const handleSaveEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editing) return

    const title = editDraft.title.trim()
    const description = editDraft.description.trim()
    if (!title || !description) return

    updateSuggestion(editing.id, { title, description })
    recordHistory(
      'alteracao',
      'Proposta editada',
      `"${editing.title}" foi revisada e agora se chama "${title}".`
    )
    toast({
      title: 'Proposta atualizada',
      description: 'Título e descrição foram salvos no dossiê.',
      variant: 'success',
    })
    setEditing(null)
  }

  const handlePriorityChange = (
    id: string,
    priority: Suggestion['priority']
  ) => {
    const suggestion = projectSuggestions.find((item) => item.id === id)
    if (!suggestion || suggestion.priority === priority) return

    updateSuggestion(id, { priority })
    recordHistory(
      'alteracao',
      'Prioridade alterada',
      `"${suggestion.title}" passou de ${
        TASK_PRIORITY[suggestion.priority].label
      } para ${TASK_PRIORITY[priority].label}.`
    )
    toast({
      title: 'Prioridade atualizada',
      description: `${suggestion.title}: ${TASK_PRIORITY[priority].label}.`,
    })
  }

  const convertSuggestion = (suggestion: Suggestion) => {
    const taskId = addTask({
      projectId,
      suggestionId: suggestion.id,
      title: suggestion.title,
      description: suggestion.description,
      status: 'pendente',
      priority: suggestion.priority,
    })
    updateSuggestion(suggestion.id, {
      status: 'convertida',
      convertedToTaskId: taskId,
    })
    recordHistory(
      'conversao',
      'Tarefa criada',
      `"${suggestion.title}" convertida em tarefa a partir de proposta aprovada.`
    )
    toast({
      title: 'Tarefa criada',
      description: `"${suggestion.title}" agora está na lista de tarefas.`,
      variant: 'success',
    })
  }

  const handleConvert = (suggestion: Suggestion) => {
    if (!isConvertible(suggestion)) return
    convertSuggestion(suggestion)
  }

  const handleConvertAll = () => {
    const convertible = projectSuggestions.filter(isConvertible)
    if (convertible.length === 0) return

    convertible.forEach((suggestion) => {
      const taskId = addTask({
        projectId,
        suggestionId: suggestion.id,
        title: suggestion.title,
        description: suggestion.description,
        status: 'pendente',
        priority: suggestion.priority,
      })
      updateSuggestion(suggestion.id, {
        status: 'convertida',
        convertedToTaskId: taskId,
      })
    })

    recordHistory(
      'conversao',
      'Tarefas criadas em lote',
      `${convertible.length} ${
        convertible.length === 1
          ? 'item aprovado foi convertido'
          : 'itens aprovados foram convertidos'
      } em tarefas.`
    )
    toast({
      title: pluralize(convertible.length, 'tarefa criada', 'tarefas criadas'),
      description: 'Os itens aprovados agora aparecem na lista de tarefas.',
      variant: 'success',
    })
  }

  const handleSelect = (suggestion: Suggestion) => {
    setSelectedId(suggestion.id)
    if (window.matchMedia('(max-width: 1023px)').matches) {
      setSourceOpen(true)
    }
  }

  const clearFilters = () => {
    setStatusFilter('all')
    setTypeFilter('all')
    setSearch('')
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Revisão de propostas"
        description="A análise propõe; você decide o que entra no escopo. Nenhum item vira tarefa sem aprovação humana."
        actions={
          <Badge tone={summary.pending > 0 ? 'accent' : 'neutral'} dot>
            {summary.pending > 0
              ? `${summary.pending} aguardando decisão`
              : 'Todas as propostas decididas'}
          </Badge>
        }
      />

      <Alert
        tone="neutral"
        icon={<FlaskConical className="h-4 w-4" />}
        title="Propostas de uma análise simulada"
      >
        O provedor é determinístico e local. Trate cada item como hipótese:
        confira o trecho de origem antes de aprovar.
      </Alert>

      {projectSuggestions.length === 0 ? (
        <EmptyState
          icon={<ScanSearch className="h-5 w-5" />}
          title="Nenhuma proposta para revisar"
          description={
            project.briefingText?.trim()
              ? 'O briefing está salvo, mas ainda não foi analisado. Execute a análise para receber propostas.'
              : 'Registre o briefing do cliente e execute a análise para receber propostas.'
          }
          action={
            <Button asChild>
              <Link to={`/projetos/${projectId}/briefing`}>
                <ScanSearch className="h-4 w-4" aria-hidden="true" />
                {project.briefingText?.trim()
                  ? 'Analisar briefing'
                  : 'Registrar briefing'}
              </Link>
            </Button>
          }
          className="rounded-lg border border-line bg-surface"
        />
      ) : (
        <ReviewLayout
          projectId={projectId}
          briefingText={project.briefingText}
          selected={selected}
          sourceOpen={sourceOpen}
          onSourceOpenChange={setSourceOpen}
          summary={summary}
          onConvertAll={handleConvertAll}
        >
          <div className="space-y-3">
            <div
              className="flex flex-wrap items-center gap-1.5"
              role="group"
              aria-label="Filtrar propostas por status"
            >
              {STATUS_FILTERS.map((filter) => {
                const selectedFilter = statusFilter === filter.value
                return (
                  <button
                    key={filter.value}
                    type="button"
                    aria-pressed={selectedFilter}
                    onClick={() => setStatusFilter(filter.value)}
                    className={[
                      'inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-sm font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
                      selectedFilter
                        ? 'border-accent/30 bg-accent-soft text-accent'
                        : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
                    ].join(' ')}
                  >
                    {filter.label}
                    <span className="font-mono text-[0.6875rem] tabular opacity-70">
                      {counts[filter.value]}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:flex-1">
                <label htmlFor="review-search" className="sr-only">
                  Buscar propostas por título, descrição ou trecho de origem
                </label>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
                  aria-hidden="true"
                />
                <Input
                  id="review-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar nas propostas..."
                  className="pl-9 pr-9"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-sm text-ink-muted hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                    aria-label="Limpar busca"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="w-full sm:w-48">
                <label htmlFor="review-type" className="sr-only">
                  Filtrar por tipo
                </label>
                <Select
                  id="review-type"
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(event.target.value as TypeFilter)
                  }
                >
                  <option value="all">Todos os tipos</option>
                  {SUGGESTION_TYPE_ORDER.map((type) => (
                    <option key={type} value={type}>
                      {SUGGESTION_TYPE[type].plural}
                    </option>
                  ))}
                </Select>
              </div>

              {hasFilters && (
                <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar
                </Button>
              )}
            </div>

            <p className="sr-only" aria-live="polite">
              {filtered.length}{' '}
              {filtered.length === 1 ? 'proposta exibida' : 'propostas exibidas'}.
            </p>
            <p className="sr-only" aria-live="polite">
              {selected
                ? `Origem selecionada: ${selected.title}.`
                : 'Nenhuma origem selecionada.'}
            </p>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Search className="h-5 w-5" />}
              title="Nenhuma proposta neste filtro"
              description="Ajuste o status, o tipo ou o termo de busca para ver outras propostas."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              }
              className="mt-4 rounded-lg border border-line bg-surface"
            />
          ) : (
            <div className="mt-5 space-y-6">
              {SUGGESTION_TYPE_ORDER.map((type) => {
                const items = filtered.filter(
                  (suggestion) => suggestion.type === type
                )
                if (items.length === 0) return null

                return (
                  <section
                    key={type}
                    aria-labelledby={`review-group-${type}`}
                  >
                    <div className="mb-2.5 flex items-baseline justify-between gap-3 border-b border-line pb-1.5">
                      <h3
                        id={`review-group-${type}`}
                        className="text-sm font-semibold text-ink"
                      >
                        {SUGGESTION_TYPE[type].plural}
                      </h3>
                      <span className="font-mono text-xs tabular text-ink-muted">
                        {items.length}
                      </span>
                    </div>
                    <ul className="space-y-3">
                      {items.map((suggestion) => (
                        <li key={suggestion.id}>
                          <SuggestionCard
                            suggestion={suggestion}
                            selected={selectedId === suggestion.id}
                            onSelect={handleSelect}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onEdit={handleOpenEdit}
                            onPriorityChange={handlePriorityChange}
                            onConvert={handleConvert}
                            onReopen={handleReopen}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          )}
        </ReviewLayout>
      )}

      <Dialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar proposta</DialogTitle>
            <DialogDescription>
              A alteração fica registrada no histórico. O trecho de origem não é
              reescrito.
            </DialogDescription>
          </DialogHeader>

          <Form onSubmit={handleSaveEdit}>
            <FormField label="Título" htmlFor="edit-title" required>
              <Input
                id="edit-title"
                value={editDraft.title}
                onChange={(event) =>
                  setEditDraft((draft) => ({
                    ...draft,
                    title: event.target.value,
                  }))
                }
                autoFocus
                maxLength={120}
              />
            </FormField>
            <FormField
              label="Descrição"
              htmlFor="edit-description"
              hint="Descreva o item como ele deve aparecer no escopo."
              required
            >
              <Textarea
                id="edit-description"
                value={editDraft.description}
                onChange={(event) =>
                  setEditDraft((draft) => ({
                    ...draft,
                    description: event.target.value,
                  }))
                }
                className="min-h-28"
              />
            </FormField>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  editDraft.title.trim().length === 0 ||
                  editDraft.description.trim().length === 0
                }
              >
                Salvar alterações
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
