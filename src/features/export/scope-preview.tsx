import type { HistoryEvent, Project, Suggestion, Task } from '@/store'
import {
  HistoryTypeBadge,
  ProjectStatusBadge,
  SuggestionPriorityBadge,
  TaskPriorityBadge,
  TaskStatusBadge,
} from '@/components/domain-badges'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { PROJECT_STATUS, TASK_STATUS, pluralize } from '@/lib/domain'
import { approvedByType, scopeSections } from '@/lib/markdown'
import { formatDate, formatDateTime } from '@/lib/utils'

export interface ScopePreviewOptions {
  includeSourceQuotes: boolean
  includeDuvidas: boolean
  includeRiscos: boolean
  includeTasks: boolean
  includeHistory: boolean
}

interface ScopePreviewProps {
  project: Project
  clientName: string
  suggestions: Suggestion[]
  tasks: Task[]
  history: HistoryEvent[]
  options: ScopePreviewOptions
  generatedAt: Date
}

function AnnexSection({
  id,
  title,
  items,
  showSeverity,
  includeSourceQuotes,
}: {
  id: string
  title: string
  items: Suggestion[]
  showSeverity?: boolean
  includeSourceQuotes: boolean
}) {
  if (items.length === 0) return null

  return (
    <section className="mt-7" aria-labelledby={id}>
      <div className="flex items-baseline justify-between gap-3">
        <h4 id={id} className="text-section-title text-ink">
          {title}
        </h4>
        <span className="font-mono text-xs tabular text-ink-subtle">
          {items.length}
        </span>
      </div>

      <ol className="mt-3 space-y-3">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="rounded-md border border-line-subtle bg-surface p-4"
          >
            <h5 className="text-sm font-semibold leading-snug text-ink">
              {index + 1}. {item.title}
            </h5>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              {item.description}
            </p>
            {showSeverity && (
              <div className="mt-2.5">
                <SuggestionPriorityBadge priority={item.priority} />
              </div>
            )}
            {includeSourceQuotes && item.sourceQuote && (
              <blockquote className="mt-3 border-l-2 border-accent/40 pl-3 text-xs italic leading-relaxed text-ink-muted">
                “{item.sourceQuote}”
              </blockquote>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

export function ScopePreview({
  project,
  clientName,
  suggestions,
  tasks,
  history,
  options,
  generatedAt,
}: ScopePreviewProps) {
  const sections = scopeSections(suggestions)
  const approvedScopeCount = sections.reduce(
    (total, section) => total + section.items.length,
    0
  )
  const duvidas = options.includeDuvidas
    ? approvedByType(suggestions, 'duvida')
    : []
  const riscos = options.includeRiscos
    ? approvedByType(suggestions, 'risco')
    : []
  const pending = suggestions.filter(
    (suggestion) => suggestion.status === 'pendente'
  ).length
  const sortedTasks = options.includeTasks
    ? [...tasks].sort(
        (a, b) =>
          TASK_STATUS[a.status].order - TASK_STATUS[b.status].order ||
          a.title.localeCompare(b.title)
      )
    : []
  const sortedHistory = options.includeHistory
    ? [...history].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : []

  return (
    <article aria-labelledby="scope-document-title" className="mx-auto max-w-3xl">
      <header className="border-b border-line pb-5">
        <p className="text-label text-accent">Documento de escopo</p>
        <h3
          id="scope-document-title"
          className="mt-2 text-2xl font-semibold leading-tight tracking-[var(--tracking-tight)] text-ink"
        >
          {project.name}
        </h3>

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-label text-ink-subtle">Cliente</dt>
            <dd className="mt-1 text-ink">{clientName}</dd>
          </div>
          <div>
            <dt className="text-label text-ink-subtle">Status do projeto</dt>
            <dd className="mt-1">
              <ProjectStatusBadge status={project.status} />
            </dd>
          </div>
          <div>
            <dt className="text-label text-ink-subtle">Gerado em</dt>
            <dd className="mt-1 font-mono text-xs text-ink">
              {formatDateTime(generatedAt)}
            </dd>
          </div>
        </dl>
      </header>

      <div className="mt-5">
        <Alert tone="info" title="Escopo definido por decisão humana">
          Este documento reúne {pluralize(approvedScopeCount, 'item aprovado', 'itens aprovados')} na
          revisão. Propostas pendentes ou rejeitadas não fazem parte do
          escopo.
          {pending > 0 && (
            <>
              {' '}
              {pluralize(pending, 'proposta aguarda', 'propostas aguardam')}{' '}
              revisão.
            </>
          )}
        </Alert>
      </div>

      {sections.map((section) => (
        <section
          key={section.type}
          className="mt-7"
          aria-labelledby={`scope-section-${section.type}`}
        >
          <div className="flex items-baseline justify-between gap-3">
            <h4
              id={`scope-section-${section.type}`}
              className="text-section-title text-ink"
            >
              {section.label}
            </h4>
            <span className="font-mono text-xs tabular text-ink-subtle">
              {section.items.length}
            </span>
          </div>

          <ol className="mt-3 space-y-3">
            {section.items.map((item, index) => (
              <li
                key={item.id}
                className="rounded-md border border-line-subtle bg-surface p-4"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 font-mono text-[0.6875rem] tabular text-ink-subtle"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-sm font-semibold leading-snug text-ink">
                      {item.title}
                    </h5>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                      {item.description}
                    </p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <SuggestionPriorityBadge priority={item.priority} />
                      {item.status === 'convertida' && (
                        <Badge tone="info">Convertida em tarefa</Badge>
                      )}
                    </div>
                    {options.includeSourceQuotes && item.sourceQuote && (
                      <blockquote className="mt-3 border-l-2 border-accent/40 pl-3 text-xs italic leading-relaxed text-ink-muted">
                        “{item.sourceQuote}”
                      </blockquote>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <AnnexSection
        id="scope-section-duvidas"
        title="Dúvidas aprovadas para o cliente"
        items={duvidas}
        includeSourceQuotes={options.includeSourceQuotes}
      />

      <AnnexSection
        id="scope-section-riscos"
        title="Riscos aprovados"
        items={riscos}
        showSeverity
        includeSourceQuotes={options.includeSourceQuotes}
      />

      {sortedTasks.length > 0 && (
        <section className="mt-7" aria-labelledby="scope-section-tarefas">
          <div className="flex items-baseline justify-between gap-3">
            <h4
              id="scope-section-tarefas"
              className="text-section-title text-ink"
            >
              Plano de tarefas
            </h4>
            <span className="font-mono text-xs tabular text-ink-subtle">
              {sortedTasks.length}
            </span>
          </div>

          <ul className="mt-3 divide-y divide-line-subtle rounded-md border border-line-subtle bg-surface">
            {sortedTasks.map((task) => (
              <li key={task.id} className="px-4 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug text-ink">
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    <TaskStatusBadge status={task.status} />
                    <TaskPriorityBadge priority={task.priority} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {sortedHistory.length > 0 && (
        <section className="mt-7" aria-labelledby="scope-section-historico">
          <div className="flex items-baseline justify-between gap-3">
            <h4
              id="scope-section-historico"
              className="text-section-title text-ink"
            >
              Histórico de decisões
            </h4>
            <span className="font-mono text-xs tabular text-ink-subtle">
              {sortedHistory.length}
            </span>
          </div>

          <ol className="mt-3 space-y-3">
            {sortedHistory.map((event) => (
              <li
                key={event.id}
                className="rounded-md border border-line-subtle bg-surface p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <HistoryTypeBadge type={event.type} />
                  <time
                    dateTime={event.createdAt}
                    className="font-mono text-[0.6875rem] tabular text-ink-subtle"
                  >
                    {formatDate(event.createdAt)}
                  </time>
                </div>
                <p className="mt-1.5 text-sm font-semibold text-ink">
                  {event.title}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">
                  {event.description}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <footer className="mt-8 border-t border-line pt-4">
        <p className="text-xs leading-relaxed text-ink-muted">
          Documento gerado pelo BriefForge em modo de demonstração. A análise de
          IA é simulada e o escopo reflete apenas decisões humanas de aprovação.
        </p>
        <p className="mt-1 font-mono text-[0.6875rem] text-ink-subtle">
          {PROJECT_STATUS[project.status].label} · {formatDate(generatedAt)}
        </p>
      </footer>
    </article>
  )
}
