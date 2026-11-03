import { Link, useParams } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  ListChecks,
  Plus,
  ScanSearch,
} from 'lucide-react'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { SectionHeading } from '@/components/ui/section-heading'
import { TaskPriorityBadge } from '@/components/domain-badges'
import {
  CompletionByWeek,
  CriticalTasks,
  TasksByPriorityChart,
  TasksByStatusChart,
} from '@/features/dashboard/charts'
import { HISTORY_TYPE, pluralize } from '@/lib/domain'
import { cn, formatDate, formatRelativeDate } from '@/lib/utils'

export function ProjectDashboardPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { projects, suggestions, tasks, history } = useStore()
  const project = projects.find((item) => item.id === projectId)

  if (!project || !projectId) return null

  const projectSuggestions = suggestions.filter(
    (suggestion) => suggestion.projectId === projectId
  )
  const projectTasks = tasks.filter((task) => task.projectId === projectId)
  const projectHistory = [...history]
    .filter((event) => event.projectId === projectId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

  const pending = projectSuggestions.filter(
    (suggestion) => suggestion.status === 'pendente'
  ).length
  const approved = projectSuggestions.filter(
    (suggestion) =>
      suggestion.status === 'aprovada' || suggestion.status === 'convertida'
  ).length
  const converted = projectSuggestions.filter(
    (suggestion) => suggestion.status === 'convertida'
  ).length
  const rejected = projectSuggestions.filter(
    (suggestion) => suggestion.status === 'rejeitada'
  ).length
  const reviewed = projectSuggestions.length - pending
  const openTasks = projectTasks.filter((task) => task.status !== 'concluido')
  const hasMaterial =
    Boolean(project.briefingText?.trim()) ||
    projectSuggestions.length > 0 ||
    projectTasks.length > 0 ||
    projectHistory.length > 0

  if (!hasMaterial) {
    return (
      <div className="space-y-6">
        <section aria-labelledby="empty-dossier-title">
          <SectionHeading
            id="empty-dossier-title"
            title="Este dossiê ainda está em branco"
            description="O BriefForge não inventa escopo. Ele parte do que o cliente escreveu e mantém cada decisão rastreável."
          />

          <div className="rounded-lg border border-line bg-surface p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line bg-surface-muted text-accent">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-ink">
                    Registre o briefing do cliente
                  </h2>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-muted">
                    Cole o texto recebido, sem precisar organizar antes. A análise
                    simulada propõe requisitos, funcionalidades, dúvidas, riscos e
                    entregáveis para você revisar.
                  </p>
                </div>
              </div>
              <Button asChild className="shrink-0">
                <Link to={`/projetos/${projectId}/briefing`}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Começar pelo briefing
                </Link>
              </Button>
            </div>

            <ol className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Briefing',
                  body: 'O material bruto do cliente fica salvo no projeto.',
                },
                {
                  step: '02',
                  title: 'Revisão',
                  body: 'Cada proposta recebe aprovação, edição ou rejeição humana.',
                },
                {
                  step: '03',
                  title: 'Tarefas e escopo',
                  body: 'Só o que foi aprovado vira tarefa e documento exportável.',
                },
              ].map((item) => (
                <li key={item.step} className="flex gap-3">
                  <span className="font-mono text-xs text-accent">{item.step}</span>
                  <span>
                    <span className="block text-sm font-medium text-ink">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
                      {item.body}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    )
  }

  const briefingExcerpt = project.briefingText?.trim() ?? ''
  const briefingPreview =
    briefingExcerpt.length > 420
      ? `${briefingExcerpt.slice(0, 420).trimEnd()}…`
      : briefingExcerpt
  const briefingWords = briefingExcerpt
    ? briefingExcerpt.split(/\s+/).filter(Boolean).length
    : 0

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="min-w-0 space-y-8">
        <section aria-labelledby="briefing-preview-title">
          <SectionHeading
            id="briefing-preview-title"
            title="Briefing do cliente"
            description="A fonte original do dossiê. Toda proposta deve apontar para uma passagem daqui."
            actions={
              <Button asChild size="sm" variant="ghost">
                <Link to={`/projetos/${projectId}/briefing`}>
                  Abrir briefing
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </Button>
            }
          />

          {briefingExcerpt ? (
            <div className="rounded-lg border border-line bg-surface px-5 py-5">
              <blockquote className="relative">
                <span
                  className="pointer-events-none absolute -left-1 -top-3 text-4xl leading-none text-accent/25"
                  aria-hidden="true"
                >
                  “
                </span>
                <p className="prose-measure pl-4 text-sm leading-relaxed text-ink">
                  {briefingPreview}
                </p>
              </blockquote>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line-subtle pl-4 pt-3 text-xs text-ink-muted">
                <span>
                  {pluralize(briefingWords, 'palavra', 'palavras')}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Registrado em{' '}
                  <time dateTime={project.createdAt}>
                    {formatDate(project.createdAt)}
                  </time>
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-line-strong bg-surface px-5 py-6">
              <p className="text-sm font-medium text-ink">
                Briefing ainda não registrado
              </p>
              <p className="mt-1 max-w-lg text-sm leading-relaxed text-ink-muted">
                Sem o texto do cliente, a análise não pode propor nada com
                rastreabilidade.
              </p>
              <Button asChild size="sm" className="mt-3">
                <Link to={`/projetos/${projectId}/briefing`}>
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  Registrar briefing
                </Link>
              </Button>
            </div>
          )}
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <TasksByStatusChart tasks={projectTasks} />
          <TasksByPriorityChart tasks={projectTasks} />
        </div>

        <CompletionByWeek tasks={projectTasks} />
        <CriticalTasks tasks={projectTasks} />
      </div>

      <aside className="min-w-0 space-y-8">
        <section aria-labelledby="scope-ledger-title">
          <SectionHeading
            id="scope-ledger-title"
            title="Escopo em números"
            actions={
              <span className="text-meta text-ink-subtle">
                {reviewed}/{projectSuggestions.length} decididos
              </span>
            }
          />

          <div className="rounded-lg border border-line bg-surface px-4 py-4">
            <Progress
              value={
                projectSuggestions.length > 0
                  ? (reviewed / projectSuggestions.length) * 100
                  : 0
              }
              label="Itens com decisão humana"
              showValue
            />

            <dl className="mt-4 divide-y divide-line-subtle border-t border-line-subtle">
              {[
                {
                  label: 'Propostas analisadas',
                  value: projectSuggestions.length,
                },
                { label: 'Aguardando decisão', value: pending },
                { label: 'Aprovadas no escopo', value: approved },
                { label: 'Convertidas em tarefa', value: converted },
                { label: 'Rejeitadas', value: rejected },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <dt className="text-sm text-ink-muted">{row.label}</dt>
                  <dd className="font-mono text-sm font-medium tabular text-ink">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="secondary" className="flex-1">
                <Link to={`/projetos/${projectId}/revisao`}>
                  <ScanSearch className="h-3.5 w-3.5" aria-hidden="true" />
                  Revisar
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="flex-1">
                <Link to={`/projetos/${projectId}/tarefas`}>
                  <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                  Tarefas
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section aria-labelledby="open-work-title">
          <SectionHeading id="open-work-title" title="Trabalho em aberto" />
          {openTasks.length === 0 ? (
            <div className="flex items-start gap-2.5 rounded-lg border border-line bg-surface px-4 py-3">
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-success"
                aria-hidden="true"
              />
              <p className="text-sm leading-relaxed text-ink-muted">
                {projectTasks.length === 0
                  ? 'Nenhuma tarefa criada. Aprove itens na revisão para começar a execução.'
                  : 'Todas as tarefas deste projeto estão concluídas.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line-subtle rounded-lg border border-line bg-surface">
              {openTasks.slice(0, 5).map((task) => (
                <li key={task.id}>
                  <Link
                    to={`/projetos/${projectId}/tarefas`}
                    className="flex items-start justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-surface-muted/50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">
                        {task.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-muted">
                        {task.description}
                      </span>
                    </span>
                    <TaskPriorityBadge
                      priority={task.priority}
                      className="shrink-0"
                    />
                  </Link>
                </li>
              ))}
              {openTasks.length > 5 && (
                <li className="px-4 py-2.5 text-xs text-ink-muted">
                  + {openTasks.length - 5} outras tarefas abertas
                </li>
              )}
            </ul>
          )}
        </section>

        <section aria-labelledby="recent-activity-title">
          <SectionHeading
            id="recent-activity-title"
            title="Atividade recente"
            actions={
              <Button asChild size="sm" variant="ghost">
                <Link to={`/projetos/${projectId}/historico`}>Ver tudo</Link>
              </Button>
            }
          />

          {projectHistory.length === 0 ? (
            <p className="text-sm leading-relaxed text-ink-muted">
              As decisões e mudanças deste projeto aparecerão aqui.
            </p>
          ) : (
            <ol className="ml-1.5 space-y-4 border-l border-line pl-4">
              {projectHistory.slice(0, 6).map((event) => {
                const meta = HISTORY_TYPE[event.type]
                return (
                  <li key={event.id} className="relative">
                    <span
                      className={cn(
                        'absolute -left-[1.3rem] top-1.5 h-2 w-2 rounded-full border border-line bg-surface',
                        event.type === 'aprovacao' && 'bg-success',
                        event.type === 'rejeicao' && 'bg-danger',
                        event.type === 'conversao' && 'bg-accent'
                      )}
                      aria-hidden="true"
                    />
                    <p className="text-xs text-ink-subtle">
                      <time dateTime={event.createdAt}>
                        {formatRelativeDate(event.createdAt)}
                      </time>{' '}
                      · {meta.label}
                    </p>
                    <p className="mt-0.5 text-sm font-medium leading-snug text-ink">
                      {event.title}
                    </p>
                    <p className="mt-0.5 line-clamp-3 text-xs leading-relaxed text-ink-muted">
                      {event.description}
                    </p>
                  </li>
                )
              })}
            </ol>
          )}
        </section>
      </aside>
    </div>
  )
}
