import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SectionHeading } from '@/components/ui/section-heading'
import {
  TASK_PRIORITY,
  TASK_STATUS,
  type Tone,
  pluralize,
} from '@/lib/domain'
import { formatDate, formatShortDate } from '@/lib/utils'
import type { Task } from '@/store'

const toneBar: Record<Tone, string> = {
  neutral: 'bg-ink-subtle',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
}

const toneDot: Record<Tone, string> = {
  neutral: 'bg-ink-subtle',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
}

interface DistributionRow {
  key: string
  label: string
  tone: Tone
  count: number
}

function DistributionTable({
  title,
  description,
  rows,
  total,
  emptyMessage,
}: {
  title: string
  description: string
  rows: DistributionRow[]
  total: number
  emptyMessage: string
}) {
  const headingId = `distribution-${title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')}`

  return (
    <section aria-labelledby={headingId} className="border-t border-line pt-5">
      <SectionHeading
        id={headingId}
        title={title}
        description={description}
      />

      {total === 0 ? (
        <p className="rounded-md border border-line bg-surface px-4 py-5 text-sm text-ink-muted">
          {emptyMessage}
        </p>
      ) : (
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            {title}. {description} Total de {total} tarefas.
          </caption>
          <thead>
            <tr className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              <th scope="col" className="pb-2 font-semibold">
                Categoria
              </th>
              <th scope="col" className="pb-2 text-right font-semibold">
                Tarefas
              </th>
              <th scope="col" className="hidden pb-2 pl-4 font-semibold sm:table-cell">
                Distribuição
              </th>
              <th scope="col" className="pb-2 pl-3 text-right font-semibold">
                Participação
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-subtle">
            {rows.map((row) => {
              const percentage = total > 0 ? Math.round((row.count / total) * 100) : 0

              return (
                <tr key={row.key} className="align-middle">
                  <th scope="row" className="py-2.5 pr-3 font-normal">
                    <span className="inline-flex items-center gap-2 text-ink">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${toneDot[row.tone]}`}
                        aria-hidden="true"
                      />
                      {row.label}
                    </span>
                  </th>
                  <td className="py-2.5 text-right font-mono text-xs tabular text-ink">
                    {row.count}
                  </td>
                  <td className="hidden py-2.5 pl-4 sm:table-cell">
                    <div
                      className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken"
                      aria-hidden="true"
                    >
                      <div
                        className={`h-full rounded-full ${toneBar[row.tone]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-2.5 pl-3 text-right font-mono text-xs tabular text-ink-muted">
                    {percentage}%
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </section>
  )
}

export function TasksByStatusChart({ tasks }: { tasks: Task[] }) {
  const rows: DistributionRow[] = (
    Object.keys(TASK_STATUS) as Task['status'][]
  )
    .sort((a, b) => TASK_STATUS[a].order - TASK_STATUS[b].order)
    .map((status) => ({
      key: status,
      label: TASK_STATUS[status].label,
      tone: TASK_STATUS[status].tone,
      count: tasks.filter((task) => task.status === status).length,
    }))

  return (
    <DistributionTable
      title="Status das tarefas"
      description="Onde o trabalho está agora, incluindo o que já foi concluído."
      rows={rows}
      total={tasks.length}
      emptyMessage="Nenhuma tarefa criada. As tarefas nascem de itens aprovados na revisão."
    />
  )
}

export function TasksByPriorityChart({ tasks }: { tasks: Task[] }) {
  const rows: DistributionRow[] = (
    Object.keys(TASK_PRIORITY) as Task['priority'][]
  )
    .sort((a, b) => TASK_PRIORITY[b].order - TASK_PRIORITY[a].order)
    .map((priority) => ({
      key: priority,
      label: TASK_PRIORITY[priority].label,
      tone: TASK_PRIORITY[priority].tone,
      count: tasks.filter((task) => task.priority === priority).length,
    }))

  return (
    <DistributionTable
      title="Prioridade das tarefas"
      description="Peso relativo do trabalho registrado neste projeto."
      rows={rows}
      total={tasks.length}
      emptyMessage="Nenhuma prioridade registrada enquanto não houver tarefas."
    />
  )
}

function startOfWeek(date: Date): Date {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - start.getDay())
  return start
}

export function CompletionByWeek({ tasks }: { tasks: Task[] }) {
  const completed = tasks.filter(
    (task) => task.status === 'concluido' && task.completedAt
  )

  const currentWeek = startOfWeek(new Date())
  const weeks = Array.from({ length: 6 }, (_, index) => {
    const start = new Date(currentWeek)
    start.setDate(start.getDate() - (5 - index) * 7)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)

    const count = completed.filter((task) => {
      const completion = new Date(task.completedAt as string)
      return completion >= start && completion < end
    }).length

    return { start, end, count }
  })

  const max = Math.max(1, ...weeks.map((week) => week.count))
  const averageDays =
    completed.length === 0
      ? null
      : Math.max(
          0,
          Math.round(
            completed.reduce((total, task) => {
              const start = new Date(task.createdAt).getTime()
              const end = new Date(task.completedAt as string).getTime()
              return total + Math.max(0, end - start) / 86_400_000
            }, 0) / completed.length
          )
        )

  return (
    <section aria-labelledby="completion-trend-title" className="border-t border-line pt-5">
      <SectionHeading
        id="completion-trend-title"
        title="Ritmo de conclusão"
        description="Tarefas concluídas nas últimas seis semanas, a partir da data de conclusão."
        actions={
          <Badge tone="neutral">
            {pluralize(completed.length, 'concluída', 'concluídas')}
          </Badge>
        }
      />

      {completed.length === 0 ? (
        <p className="rounded-md border border-line bg-surface px-4 py-5 text-sm text-ink-muted">
          Nenhuma tarefa concluída ainda. O ritmo aparece aqui quando a primeira
          tarefa for concluída.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_13rem]">
          <div>
            <p className="sr-only">
              Gráfico de tarefas concluídas por semana. Total de{' '}
              {completed.length} tarefas concluídas.
            </p>
            <div
              role="list"
              aria-label="Tarefas concluídas por semana"
              className="flex h-40 items-end gap-2 border-b border-line px-1 pb-0 sm:gap-3"
            >
              {weeks.map((week) => (
                <div
                  key={week.start.toISOString()}
                  role="listitem"
                  aria-label={`Semana de ${formatDate(week.start)} a ${formatDate(
                    new Date(week.end.getTime() - 86_400_000)
                  )}: ${week.count} ${
                    week.count === 1 ? 'tarefa concluída' : 'tarefas concluídas'
                  }`}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
                >
                  <span className="font-mono text-[0.6875rem] tabular text-ink">
                    {week.count}
                  </span>
                  <div
                    className={`w-full max-w-10 rounded-t-sm ${
                      week.count > 0 ? 'bg-accent/80' : 'bg-line-strong'
                    }`}
                    style={{
                      height:
                        week.count === 0
                          ? '2px'
                          : `${Math.max(10, (week.count / max) * 100)}%`,
                    }}
                    aria-hidden="true"
                  />
                  <span className="max-w-full truncate text-[0.625rem] leading-4 text-ink-muted">
                    {formatShortDate(week.start)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <dl className="divide-y divide-line border-y border-line lg:border-y-0 lg:border-l lg:border-line lg:pl-5">
            <div className="flex items-baseline justify-between gap-3 py-3 lg:block">
              <dt className="text-xs text-ink-muted">Tempo médio de conclusão</dt>
              <dd className="font-mono text-lg font-medium tabular text-ink lg:mt-1">
                {averageDays === null
                  ? '—'
                  : `${averageDays} ${averageDays === 1 ? 'dia' : 'dias'}`}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-3 lg:block">
              <dt className="text-xs text-ink-muted">Concluídas nas 6 semanas</dt>
              <dd className="font-mono text-lg font-medium tabular text-ink lg:mt-1">
                {completed.length}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-3 lg:block">
              <dt className="text-xs text-ink-muted">Abertas agora</dt>
              <dd className="font-mono text-lg font-medium tabular text-ink lg:mt-1">
                {tasks.filter((task) => task.status !== 'concluido').length}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  )
}

export function CriticalTasks({ tasks }: { tasks: Task[] }) {
  const openCritical = tasks
    .filter(
      (task) => task.priority === 'critica' && task.status !== 'concluido'
    )
    .sort(
      (a, b) =>
        TASK_STATUS[a.status].order - TASK_STATUS[b.status].order ||
        a.title.localeCompare(b.title)
    )

  return (
    <section aria-labelledby="critical-tasks-title" className="border-t border-line pt-5">
      <SectionHeading
        id="critical-tasks-title"
        title="Tarefas críticas em aberto"
        description="Prioridade crítica que ainda exige execução ou decisão."
        actions={
          openCritical.length > 0 ? (
            <Badge tone="danger" dot>
              {openCritical.length}
            </Badge>
          ) : undefined
        }
      />

      {openCritical.length === 0 ? (
        <div className="flex items-start gap-2.5 rounded-md border border-line bg-surface px-4 py-3">
          <CheckCircle2
            className="mt-0.5 h-4 w-4 shrink-0 text-success"
            aria-hidden="true"
          />
          <p className="text-sm text-ink-muted">
            Nenhuma tarefa crítica em aberto neste projeto.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line-subtle rounded-md border border-line bg-surface">
          {openCritical.map((task) => (
            <li
              key={task.id}
              className="flex flex-col gap-1.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <Link
                to={`/projetos/${task.projectId}/tarefas`}
                className="inline-flex items-start gap-2 text-sm font-medium text-ink underline-offset-4 hover:underline"
              >
                <AlertTriangle
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger"
                  aria-hidden="true"
                />
                {task.title}
              </Link>
              <span className="text-xs text-ink-muted">
                {TASK_STATUS[task.status].label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
