import {
  ArrowRight,
  CalendarDays,
  FileQuestion,
  FileText,
  FolderKanban,
  History,
  ListChecks,
  ScanSearch,
  Building2,
  Download,
} from 'lucide-react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Progress } from '@/components/ui/progress'
import {
  ProjectStatusBadge,
} from '@/components/domain-badges'
import {
  nextProjectAction,
  pendingReviewCount,
  projectProgress,
} from '@/lib/domain'
import { formatDate } from '@/lib/utils'
import { useStore } from '@/store'

export function ProjectNotFound() {
  return (
    <div className="mx-auto max-w-xl py-10">
      <EmptyState
        icon={<FileQuestion className="h-5 w-5" />}
        title="Projeto não encontrado"
        description="Este projeto não existe mais ou o endereço está incorreto. Volte para a lista de projetos para continuar."
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button asChild>
              <Link to="/projetos">Ver projetos</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/">Ir para a visão geral</Link>
            </Button>
          </div>
        }
        className="rounded-lg border border-line bg-surface"
      />
    </div>
  )
}

const TABS = [
  { segment: '', label: 'Visão geral', icon: FolderKanban },
  { segment: 'briefing', label: 'Briefing', icon: FileText },
  { segment: 'revisao', label: 'Revisão', icon: ScanSearch },
  { segment: 'tarefas', label: 'Tarefas', icon: ListChecks },
  { segment: 'historico', label: 'Histórico', icon: History },
  { segment: 'exportar', label: 'Exportar', icon: Download },
]

export function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>()
  const { projects, clients, suggestions, tasks, history } = useStore()
  const project = projects.find((item) => item.id === projectId)

  if (!project || !projectId) return <ProjectNotFound />

  const client = clients.find((item) => item.id === project.clientId)
  const pending = pendingReviewCount(project.id, suggestions)
  const projectTaskList = tasks.filter((task) => task.projectId === project.id)
  const openTasks = projectTaskList.filter(
    (task) => task.status !== 'concluido'
  ).length
  const historyCount = history.filter(
    (event) => event.projectId === project.id
  ).length
  const progress = projectProgress(project.id, tasks)
  const nextAction = nextProjectAction(project, suggestions, tasks)
  const approvedCount = suggestions.filter(
    (item) => item.projectId === project.id && item.status === 'aprovada'
  ).length

  const counts: Record<string, number> = {
    revisao: pending,
    tarefas: openTasks,
    historico: historyCount,
  }

  return (
    <div className="space-y-5">
      <header className="no-print space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                {client?.name ?? 'Cliente removido'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                Criado em {formatDate(project.createdAt)}
              </span>
              {approvedCount > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{approvedCount} itens aprovados</span>
                </>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-page-title text-ink">{project.name}</h1>
              <ProjectStatusBadge status={project.status} />
            </div>
          </div>

          <Button asChild className="w-full shrink-0 sm:w-auto">
            <Link to={nextAction.href}>
              {nextAction.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <Progress
            value={progress}
            label="Progresso das tarefas"
            showValue
            className="sm:max-w-xs"
          />
          <p className="text-xs text-ink-muted">
            {projectTaskList.length === 0
              ? 'Nenhuma tarefa criada ainda.'
              : `${projectTaskList.length - openTasks} de ${projectTaskList.length} tarefas concluídas.`}
          </p>
          {pending > 0 && (
            <Badge tone="accent" dot className="w-fit">
              {pending} {pending === 1 ? 'decisão pendente' : 'decisões pendentes'}
            </Badge>
          )}
        </div>
      </header>

      <nav
        aria-label="Seções do projeto"
        className="no-print no-scrollbar -mx-1 overflow-x-auto border-b border-line"
      >
        <ul className="flex min-w-max items-center gap-0.5 px-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const to =
              tab.segment === ''
                ? `/projetos/${project.id}`
                : `/projetos/${project.id}/${tab.segment}`
            const count = counts[tab.segment]

            return (
              <li key={tab.segment || 'overview'}>
                <NavLink
                  to={to}
                  end={tab.segment === ''}
                  className={({ isActive }) =>
                    [
                      'inline-flex h-10 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
                      isActive
                        ? 'border-accent text-ink'
                        : 'border-transparent text-ink-muted hover:border-line-strong hover:text-ink',
                    ].join(' ')
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                  {typeof count === 'number' && count > 0 && (
                    <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[0.625rem] font-semibold leading-none text-ink-muted">
                      {count}
                    </span>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <Outlet />
    </div>
  )
}
