import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  FlaskConical,
  FolderKanban,
  ListChecks,
  Plus,
  ScanSearch,
  Users,
} from 'lucide-react'
import { useStore } from '@/store'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { Progress } from '@/components/ui/progress'
import { SectionHeading } from '@/components/ui/section-heading'
import {
  ProjectStatusBadge,
  SuggestionPriorityBadge,
  SuggestionTypeBadge,
  SuggestionTypeIcon,
  TaskPriorityBadge,
  TaskStatusBadge,
} from '@/components/domain-badges'
import {
  HISTORY_TYPE,
  SUGGESTION_TYPE,
  nextProjectAction,
  pendingReviewCount,
  projectProgress,
  pluralize,
} from '@/lib/domain'
import { formatDate, formatRelativeDate } from '@/lib/utils'

const priorityOrder = { critica: 0, alta: 1, media: 2, baixa: 3 } as const

export function Dashboard() {
  const { clients, projects, suggestions, tasks, history, user } = useStore()

  const pendingSuggestions = suggestions
    .filter((suggestion) => suggestion.status === 'pendente')
    .sort(
      (a, b) =>
        priorityOrder[a.priority] - priorityOrder[b.priority] ||
        a.title.localeCompare(b.title)
    )
  const openTasks = tasks.filter((task) => task.status !== 'concluido')
  const criticalTasks = openTasks
    .filter((task) => task.priority === 'critica')
    .slice(0, 5)
  const recentHistory = [...history]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 6)
  const activeProjects = projects.filter(
    (project) => project.status === 'ativo'
  )
  const completedLastWeek = tasks.filter((task) => {
    if (task.status !== 'concluido' || !task.completedAt) return false
    return (
      Date.now() - new Date(task.completedAt).getTime() <
      7 * 24 * 60 * 60 * 1000
    )
  }).length

  const projectName = (id: string) =>
    projects.find((project) => project.id === id)?.name ?? 'Projeto removido'
  const clientName = (id: string) =>
    clients.find((client) => client.id === id)?.name ?? 'Cliente removido'

  const firstName = user?.name.split(' ')[0] ?? 'você'
  const hasWorkspace = clients.length > 0 || projects.length > 0

  return (
    <div className="space-y-8">
      <PageHeader
        title="Visão geral"
        description={`O que precisa de decisão agora, ${firstName}. Todos os projetos em um só lugar.`}
        meta={
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDate(new Date())}
            </span>
            <span aria-hidden="true">·</span>
            <Badge tone="neutral" dot>
              Demonstração local
            </Badge>
          </div>
        }
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/clientes">
                <Users className="h-4 w-4" aria-hidden="true" />
                Clientes
              </Link>
            </Button>
            <Button asChild>
              <Link to="/projetos?novo=1">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Novo projeto
              </Link>
            </Button>
          </>
        }
      />

      {!hasWorkspace ? (
        <section aria-labelledby="start-title">
          <SectionHeading
            title="Comece pelo material do cliente"
            description="O BriefForge não inventa escopo. Ele parte do que o cliente escreveu."
          />
          <ol className="divide-y divide-line rounded-lg border border-line bg-surface">
            {[
              {
                title: 'Cadastre o cliente',
                body: 'Nome e contato são suficientes para começar.',
                href: '/clientes?novo=1',
                action: 'Cadastrar cliente',
              },
              {
                title: 'Crie o projeto',
                body: 'Cada projeto tem seu próprio briefing, revisão e tarefas.',
                href: '/projetos?novo=1',
                action: 'Criar projeto',
              },
              {
                title: 'Cole o briefing e analise',
                body: 'A análise simulada propõe itens para você revisar.',
                href: '/projetos',
                action: 'Ver projetos',
              },
            ].map((step, index) => (
              <li
                key={step.title}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line font-mono text-xs text-ink-muted">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{step.title}</p>
                  <p className="mt-0.5 text-sm text-ink-muted">{step.body}</p>
                </div>
                <Button asChild size="sm" variant="secondary">
                  <Link to={step.href}>{step.action}</Link>
                </Button>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <>
          <section aria-labelledby="attention-title">
            <SectionHeading
              title="Precisa da sua decisão"
              description="Itens extraídos da análise que ainda não receberam uma decisão humana."
              actions={
                pendingSuggestions.length > 0 ? (
                  <Badge tone="accent" dot>
                    {pluralize(pendingSuggestions.length, 'item', 'itens')}
                  </Badge>
                ) : undefined
              }
            />
            {pendingSuggestions.length === 0 ? (
              <div className="flex items-start gap-3 rounded-lg border border-line bg-surface px-4 py-4">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-success"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium text-ink">
                    Nenhuma decisão pendente
                  </p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    Toda sugestão analisada já foi aprovada, rejeitada ou
                    convertida em tarefa.
                  </p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
                {pendingSuggestions.slice(0, 6).map((suggestion) => {
                  const project = projects.find(
                    (item) => item.id === suggestion.projectId
                  )
                  return (
                    <li
                      key={suggestion.id}
                      className="grid gap-2 px-4 py-3 transition-colors hover:bg-surface-muted/40 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-center"
                    >
                      <div className="flex min-w-0 items-start gap-2.5">
                        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border border-line bg-surface-muted text-ink-muted">
                          <SuggestionTypeIcon
                            type={suggestion.type}
                            className="h-3.5 w-3.5"
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">
                            {suggestion.title}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-ink-muted">
                            {project?.name ?? 'Projeto removido'} ·{' '}
                            {SUGGESTION_TYPE[suggestion.type].label}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:justify-start">
                        <SuggestionTypeBadge type={suggestion.type} className="sm:hidden" />
                        <SuggestionPriorityBadge priority={suggestion.priority} />
                      </div>
                      <Button asChild size="sm" variant="ghost" className="justify-self-start sm:justify-self-end">
                        <Link to={`/projetos/${suggestion.projectId}/revisao`}>
                          Revisar
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_21rem]">
            <div className="min-w-0 space-y-8">
              <section aria-labelledby="projects-title">
                <SectionHeading
                  title="Projetos"
                  description="Andamento, pendências e o próximo passo de cada projeto."
                  actions={
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/projetos">Ver todos</Link>
                    </Button>
                  }
                />
                {projects.length === 0 ? (
                  <EmptyState
                    icon={<FolderKanban className="h-5 w-5" />}
                    title="Nenhum projeto ainda"
                    description="Crie o primeiro projeto para transformar um briefing em escopo."
                    action={
                      <Button asChild>
                        <Link to="/projetos?novo=1">
                          <Plus className="h-4 w-4" aria-hidden="true" />
                          Criar projeto
                        </Link>
                      </Button>
                    }
                    className="rounded-lg border border-line bg-surface"
                  />
                ) : (
                  <>
                    <div className="hidden overflow-x-auto rounded-lg border border-line bg-surface md:block">
                      <table className="w-full min-w-[46rem] text-left text-sm">
                        <caption className="sr-only">
                          Projetos, status, pendências de revisão, progresso e
                          próximo passo
                        </caption>
                        <thead className="border-b border-line bg-surface-muted/60">
                          <tr className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
                            <th scope="col" className="px-4 py-2.5">Projeto</th>
                            <th scope="col" className="px-4 py-2.5">Status</th>
                            <th scope="col" className="px-4 py-2.5">Revisão</th>
                            <th scope="col" className="px-4 py-2.5">Progresso</th>
                            <th scope="col" className="px-4 py-2.5">Próximo passo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {projects.map((project) => {
                            const pending = pendingReviewCount(
                              project.id,
                              suggestions
                            )
                            const progress = projectProgress(project.id, tasks)
                            const action = nextProjectAction(
                              project,
                              suggestions,
                              tasks
                            )
                            return (
                              <tr
                                key={project.id}
                                className="transition-colors hover:bg-surface-muted/40"
                              >
                                <th scope="row" className="px-4 py-3 font-normal">
                                  <Link
                                    to={`/projetos/${project.id}`}
                                    className="font-medium text-ink underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                                  >
                                    {project.name}
                                  </Link>
                                  <span className="mt-0.5 block text-xs text-ink-muted">
                                    {clientName(project.clientId)}
                                  </span>
                                </th>
                                <td className="px-4 py-3">
                                  <ProjectStatusBadge status={project.status} />
                                </td>
                                <td className="px-4 py-3">
                                  {pending > 0 ? (
                                    <Link
                                      to={`/projetos/${project.id}/revisao`}
                                      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent underline-offset-4 hover:underline"
                                    >
                                      {pending} pendentes
                                    </Link>
                                  ) : (
                                    <span className="text-ink-muted">Em dia</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <Progress
                                      value={progress}
                                      label={undefined}
                                      className="w-20"
                                    />
                                    <span className="text-meta text-ink-muted">
                                      {progress}%
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <Link
                                    to={action.href}
                                    className="inline-flex items-center gap-1 text-sm font-medium text-ink underline-offset-4 hover:text-accent hover:underline"
                                  >
                                    {action.label}
                                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                  </Link>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    <ul className="divide-y divide-line rounded-lg border border-line bg-surface md:hidden">
                      {projects.map((project) => {
                        const pending = pendingReviewCount(
                          project.id,
                          suggestions
                        )
                        const progress = projectProgress(project.id, tasks)
                        const action = nextProjectAction(
                          project,
                          suggestions,
                          tasks
                        )
                        return (
                          <li key={project.id} className="space-y-2.5 px-4 py-3.5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <Link
                                  to={`/projetos/${project.id}`}
                                  className="block truncate text-sm font-medium text-ink"
                                >
                                  {project.name}
                                </Link>
                                <p className="mt-0.5 truncate text-xs text-ink-muted">
                                  {clientName(project.clientId)}
                                </p>
                              </div>
                              <ProjectStatusBadge status={project.status} />
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={progress} className="flex-1" />
                              <span className="text-meta text-ink-muted">
                                {progress}%
                              </span>
                              {pending > 0 && (
                                <Badge tone="accent">{pending} pendentes</Badge>
                              )}
                            </div>
                            <Link
                              to={action.href}
                              className="inline-flex items-center gap-1 text-sm font-medium text-accent"
                            >
                              {action.label}
                              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </>
                )}
              </section>

              <section aria-labelledby="critical-title">
                <SectionHeading
                  title="Tarefas críticas em aberto"
                  description="Prioridade crítica ainda não concluída. Sem prazo cadastrado neste protótipo."
                  actions={
                    criticalTasks.length > 0 ? (
                      <Badge tone="danger">{criticalTasks.length}</Badge>
                    ) : undefined
                  }
                />
                {criticalTasks.length === 0 ? (
                  <p className="rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink-muted">
                    Nenhuma tarefa crítica em aberto.
                  </p>
                ) : (
                  <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
                    {criticalTasks.map((task) => (
                      <li
                        key={task.id}
                        className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <Link
                            to={`/projetos/${task.projectId}/tarefas`}
                            className="block truncate text-sm font-medium text-ink underline-offset-4 hover:underline"
                          >
                            {task.title}
                          </Link>
                          <p className="mt-0.5 truncate text-xs text-ink-muted">
                            {projectName(task.projectId)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <TaskPriorityBadge priority={task.priority} />
                          <TaskStatusBadge status={task.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <aside className="space-y-8">
              <section aria-labelledby="summary-title">
                <SectionHeading
                  title="Resumo do workspace"
                  actions={
                    <span className="text-meta text-ink-subtle">
                      {activeProjects.length} ativos
                    </span>
                  }
                />
                <dl className="divide-y divide-line rounded-lg border border-line bg-surface px-4">
                  {[
                    {
                      label: 'Clientes',
                      value: clients.length,
                      href: '/clientes',
                    },
                    {
                      label: 'Projetos',
                      value: projects.length,
                      href: '/projetos',
                    },
                    {
                      label: 'Decisões pendentes',
                      value: pendingSuggestions.length,
                      href: '/projetos',
                    },
                    {
                      label: 'Tarefas abertas',
                      value: openTasks.length,
                      href: '/projetos',
                    },
                    {
                      label: 'Concluídas em 7 dias',
                      value: completedLastWeek,
                      href: '/projetos',
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-3 py-2.5"
                    >
                      <dt className="text-sm text-ink-muted">
                        <Link
                          to={row.href}
                          className="underline-offset-4 hover:text-ink hover:underline"
                        >
                          {row.label}
                        </Link>
                      </dt>
                      <dd className="font-mono text-sm font-medium tabular text-ink">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section aria-labelledby="activity-title">
                <SectionHeading title="Atividade recente" />
                {recentHistory.length === 0 ? (
                  <p className="text-sm text-ink-muted">
                    As ações do projeto aparecerão aqui.
                  </p>
                ) : (
                  <ol className="ml-1.5 space-y-4 border-l border-line pl-4">
                    {recentHistory.map((event) => {
                      const config = HISTORY_TYPE[event.type]
                      return (
                        <li key={event.id} className="relative">
                          <span
                            className="absolute -left-[1.3rem] top-1.5 h-2 w-2 rounded-full border border-line bg-surface"
                            aria-hidden="true"
                          />
                          <p className="text-xs text-ink-subtle">
                            <time dateTime={event.createdAt}>
                              {formatRelativeDate(event.createdAt)}
                            </time>{' '}
                            · {config.label}
                          </p>
                          <p className="mt-0.5 text-sm font-medium leading-snug text-ink">
                            {event.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-muted">
                            {event.description}
                          </p>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </section>

              <Alert
                tone="neutral"
                icon={<FlaskConical className="h-4 w-4" />}
                title="Sobre esta demonstração"
              >
                Os dados vêm de um seed local e ficam no seu navegador. A análise
                de IA é simulada; o app não tem backend.
              </Alert>

              <div className="rounded-lg border border-line bg-surface-muted/60 px-4 py-3">
                <p className="flex items-center gap-2 text-sm font-medium text-ink">
                  <ScanSearch className="h-4 w-4 text-accent" aria-hidden="true" />
                  Próxima decisão
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  {pendingSuggestions.length > 0
                    ? `${pluralize(pendingSuggestions.length, 'item aguarda', 'itens aguardam')} revisão antes de virar tarefa.`
                    : openTasks.length > 0
                      ? `${pluralize(openTasks.length, 'tarefa aberta', 'tarefas abertas')} em execução.`
                      : 'Nada em aberto. Exporte um escopo ou crie um novo projeto.'}
                </p>
                {pendingSuggestions.length > 0 && (
                  <Button asChild size="sm" className="mt-3 w-full">
                    <Link
                      to={`/projetos/${pendingSuggestions[0].projectId}/revisao`}
                    >
                      <ListChecks className="h-4 w-4" aria-hidden="true" />
                      Abrir revisão
                    </Link>
                  </Button>
                )}
              </div>
            </aside>
          </div>
        </>
      )}

      {suggestions.length === 0 && projects.length > 0 && (
        <Alert
          tone="info"
          icon={<CircleAlert className="h-4 w-4" />}
          title="Nenhuma análise registrada"
        >
          Abra o briefing de um projeto e execute a análise simulada para gerar
          propostas de requisitos, funcionalidades, dúvidas, riscos e
          entregáveis.
        </Alert>
      )}
    </div>
  )
}
