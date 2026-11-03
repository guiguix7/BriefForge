import * as React from 'react'
import { Link } from 'react-router-dom'
import {
  Columns3,
  GripVertical,
  List,
  ListChecks,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore, type Task } from '@/store'
import { useToast } from '@/components/ui/toast'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { SectionHeading } from '@/components/ui/section-heading'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  TaskPriorityBadge,
  TaskStatusBadge,
} from '@/components/domain-badges'
import {
  TASK_PRIORITY,
  TASK_STATUS,
  pluralize,
} from '@/lib/domain'
import { cn, formatDate, formatDateTime } from '@/lib/utils'

type TaskStatus = Task['status']
type TaskPriority = Task['priority']
type StatusFilter = TaskStatus | 'all'
type PriorityFilter = TaskPriority | 'all'
type ViewMode = 'list' | 'board'

const STATUS_ORDER: TaskStatus[] = ['pendente', 'andamento', 'revisao', 'concluido']

const priorityOrder: Record<TaskPriority, number> = {
  critica: 0,
  alta: 1,
  media: 2,
  baixa: 3,
}

function TaskCard({
  task,
  onOpen,
}: {
  task: Task
  onOpen: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { status: task.status } })

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'rounded-md border border-line bg-surface px-3 py-2.5 shadow-xs',
        isDragging && 'z-20 opacity-60 shadow-md'
      )}
    >
      <div className="flex items-start gap-2">
        <button
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Mover ${task.title}`}
          className="-ml-1 mt-0.5 grid h-6 w-6 shrink-0 cursor-grab place-items-center rounded-sm text-ink-subtle hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring active:cursor-grabbing"
        >
          <GripVertical className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onOpen(task.id)}
            className="block w-full text-left text-sm font-medium leading-snug text-ink underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            {task.title}
          </button>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <TaskPriorityBadge priority={task.priority} />
            <span className="text-[0.6875rem] text-ink-subtle">
              {task.suggestionId ? 'Da revisão' : 'Manual'}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

function BoardColumn({
  status,
  tasks,
  onOpen,
}: {
  status: TaskStatus
  tasks: Task[]
  onOpen: (id: string) => void
}) {
  const config = TASK_STATUS[status]
  const { setNodeRef, isOver } = useDroppable({ id: `column-${status}` })
  const sorted = [...tasks].sort(
    (a, b) =>
      priorityOrder[a.priority] - priorityOrder[b.priority] ||
      a.title.localeCompare(b.title)
  )

  return (
    <section
      aria-labelledby={`board-column-${status}`}
      className="flex min-w-[15rem] flex-1 flex-col"
    >
      <div className="flex items-center justify-between gap-2 border-b border-line pb-2">
        <h3
          id={`board-column-${status}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted"
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              config.tone === 'success' && 'bg-success',
              config.tone === 'warning' && 'bg-warning',
              config.tone === 'info' && 'bg-info',
              config.tone === 'neutral' && 'bg-ink-subtle',
              config.tone === 'danger' && 'bg-danger',
              config.tone === 'accent' && 'bg-accent'
            )}
            aria-hidden="true"
          />
          {config.shortLabel}
        </h3>
        <span className="font-mono text-xs tabular text-ink-muted">
          {sorted.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'mt-2 min-h-[13rem] rounded-md border border-dashed p-2 transition-colors',
          isOver
            ? 'border-accent/50 bg-accent-soft/40'
            : 'border-line-subtle bg-surface-muted/20'
        )}
      >
        <SortableContext
          items={sorted.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sorted.map((task) => (
              <TaskCard key={task.id} task={task} onOpen={onOpen} />
            ))}
          </div>
        </SortableContext>
        {sorted.length === 0 && (
          <p className="px-2 py-6 text-center text-xs leading-relaxed text-ink-subtle">
            {isOver
              ? 'Solte a tarefa aqui.'
              : 'Nenhuma tarefa neste estágio.'}
          </p>
        )}
      </div>
    </section>
  )
}

export function TasksView({ projectId }: { projectId: string }) {
  const { tasks, updateTask, deleteTask, addHistory } = useStore()
  const { toast } = useToast()

  const [view, setView] = React.useState<ViewMode>('list')
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all')
  const [priorityFilter, setPriorityFilter] =
    React.useState<PriorityFilter>('all')
  const [search, setSearch] = React.useState('')
  const [openDetailId, setOpenDetailId] = React.useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Task | null>(null)

  const projectTasks = tasks.filter((task) => task.projectId === projectId)
  const [announcement, setAnnouncement] = React.useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const filtered = projectTasks.filter((task) => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false
    const term = search.trim().toLowerCase()
    if (!term) return true
    return (
      task.title.toLowerCase().includes(term) ||
      task.description.toLowerCase().includes(term)
    )
  })

  const sorted = [...filtered].sort(
    (a, b) =>
      TASK_STATUS[a.status].order - TASK_STATUS[b.status].order ||
      priorityOrder[a.priority] - priorityOrder[b.priority] ||
      a.title.localeCompare(b.title)
  )

  const detail = projectTasks.find((task) => task.id === openDetailId) ?? null
  const open = projectTasks.filter((task) => task.status !== 'concluido').length
  const done = projectTasks.length - open
  const hasFilters =
    statusFilter !== 'all' || priorityFilter !== 'all' || search.trim() !== ''

  const tasksByStatus: Record<TaskStatus, Task[]> = {
    pendente: [],
    andamento: [],
    revisao: [],
    concluido: [],
  }
  filtered.forEach((task) => tasksByStatus[task.status].push(task))

  const recordStatusChange = (task: Task, status: TaskStatus) => {
    if (task.status === status) return
    updateTask(task.id, { status })
    addHistory(projectId, {
      type: 'alteracao',
      title: 'Status da tarefa alterado',
      description: `"${task.title}" passou de ${TASK_STATUS[
        task.status
      ].label.toLowerCase()} para ${TASK_STATUS[status].label.toLowerCase()}.`,
    })
  }

  const handleStatusChange = (id: string, status: TaskStatus) => {
    const task = projectTasks.find((item) => item.id === id)
    if (!task) return
    recordStatusChange(task, status)
  }

  const handlePriorityChange = (id: string, priority: TaskPriority) => {
    const task = projectTasks.find((item) => item.id === id)
    if (!task || task.priority === priority) return
    updateTask(id, { priority })
    addHistory(projectId, {
      type: 'alteracao',
      title: 'Prioridade da tarefa alterada',
      description: `"${task.title}" passou de ${TASK_PRIORITY[
        task.priority
      ].label} para ${TASK_PRIORITY[priority].label}.`,
    })
    toast({
      title: 'Prioridade atualizada',
      description: `${task.title}: ${TASK_PRIORITY[priority].label}.`,
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    const title = deleteTarget.title
    deleteTask(deleteTarget.id)
    addHistory(projectId, {
      type: 'alteracao',
      title: 'Tarefa excluída',
      description: `"${title}" foi removida do projeto.`,
    })
    toast({
      title: 'Tarefa excluída',
      description: `"${title}" foi removida.`,
      variant: 'success',
    })
    setDeleteTarget(null)
    setOpenDetailId(null)
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return
    const task = projectTasks.find((item) => item.id === String(active.id))
    if (!task) return

    const overId = String(over.id)
    const nextStatus: TaskStatus | undefined = overId.startsWith('column-')
      ? (overId.replace('column-', '') as TaskStatus)
      : projectTasks.find((item) => item.id === overId)?.status

    if (!nextStatus || nextStatus === task.status) return
    recordStatusChange(task, nextStatus)
    setAnnouncement(
      `"${task.title}" movida para ${TASK_STATUS[nextStatus].label}.`
    )
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) => {
      const task = projectTasks.find((item) => item.id === String(active.id))
      return task
        ? `Tarefa "${task.title}" selecionada. Use as setas para escolher a coluna e pressione espaço para soltar.`
        : 'Tarefa selecionada.'
    },
    onDragOver: ({ active, over }) => {
      if (!over) return undefined
      const task = projectTasks.find((item) => item.id === String(active.id))
      const overId = String(over.id)
      const target = overId.startsWith('column-')
        ? TASK_STATUS[overId.replace('column-', '') as TaskStatus]?.label
        : projectTasks.find((item) => item.id === overId)?.title
      return task && target
        ? `"${task.title}" sobre ${target}.`
        : undefined
    },
    onDragEnd: ({ active, over }) => {
      if (!over) return 'Movimentação cancelada.'
      const task = projectTasks.find((item) => item.id === String(active.id))
      return task
        ? `"${task.title}" solta.`
        : 'Tarefa solta.'
    },
    onDragCancel: () => 'Movimentação cancelada.',
  }

  const clearFilters = () => {
    setStatusFilter('all')
    setPriorityFilter('all')
    setSearch('')
  }

  if (projectTasks.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeading
          title="Tarefas"
          description="Execução do escopo aprovado, estágio por estágio."
        />
        <EmptyState
          icon={<ListChecks className="h-5 w-5" />}
          title="Nenhuma tarefa neste projeto"
          description="As tarefas nascem de propostas aprovadas na revisão. Aprove itens de requisito, funcionalidade ou entregável para começar."
          action={
            <Button asChild>
              <Link to={`/projetos/${projectId}/revisao`}>
                Abrir revisão
              </Link>
            </Button>
          }
          className="rounded-lg border border-line bg-surface"
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          title="Tarefas"
          description="Execução do escopo aprovado. Mude o status na lista ou arraste no quadro."
          className="mb-0 flex-1"
        />
        <div
          role="group"
          aria-label="Modo de visualização"
          className="inline-flex shrink-0 rounded-md border border-line bg-surface p-0.5"
        >
          {[
            { value: 'list' as const, label: 'Lista', icon: List },
            { value: 'board' as const, label: 'Quadro', icon: Columns3 },
          ].map((mode) => {
            const Icon = mode.icon
            return (
              <button
                key={mode.value}
                type="button"
                aria-pressed={view === mode.value}
                onClick={() => setView(mode.value)}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-sm px-3 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
                  view === mode.value
                    ? 'bg-surface-muted text-ink shadow-xs'
                    : 'text-ink-muted hover:text-ink'
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {mode.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
        <span>{pluralize(projectTasks.length, 'tarefa', 'tarefas')}</span>
        <span aria-hidden="true">·</span>
        <span>{open} em aberto</span>
        <span aria-hidden="true">·</span>
        <span>{done} concluídas</span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <label htmlFor="task-search" className="sr-only">
            Buscar tarefas por título ou descrição
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
            aria-hidden="true"
          />
          <Input
            id="task-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar tarefa..."
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

        <div className="w-full sm:w-44">
          <label htmlFor="task-status-filter" className="sr-only">
            Filtrar por status
          </label>
          <Select
            id="task-status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
          >
            <option value="all">Todos os status</option>
            {STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {TASK_STATUS[status].label}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-full sm:w-44">
          <label htmlFor="task-priority-filter" className="sr-only">
            Filtrar por prioridade
          </label>
          <Select
            id="task-priority-filter"
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value as PriorityFilter)
            }
          >
            <option value="all">Todas as prioridades</option>
            {Object.entries(TASK_PRIORITY).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </div>

        {hasFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            Limpar filtros
          </Button>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'tarefa exibida' : 'tarefas exibidas'}.
      </p>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-5 w-5" />}
          title="Nenhuma tarefa neste filtro"
          description="Ajuste o status, a prioridade ou o termo de busca para ver outras tarefas."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              Limpar filtros
            </Button>
          }
          className="rounded-lg border border-line bg-surface"
        />
      ) : view === 'list' ? (
        <>
          <div className="hidden overflow-x-auto rounded-lg border border-line bg-surface md:block">
            <table className="w-full min-w-[52rem] text-left text-sm">
              <caption className="sr-only">
                Tarefas com status, prioridade, origem, datas e ação de detalhe
              </caption>
              <thead className="border-b border-line bg-surface-muted/60">
                <tr className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  <th scope="col" className="px-4 py-2.5">Tarefa</th>
                  <th scope="col" className="px-4 py-2.5">Status</th>
                  <th scope="col" className="px-4 py-2.5">Prioridade</th>
                  <th scope="col" className="px-4 py-2.5">Origem</th>
                  <th scope="col" className="px-4 py-2.5">Criada</th>
                  <th scope="col" className="px-4 py-2.5">Concluída</th>
                  <th scope="col" className="px-4 py-2.5 text-right">
                    Detalhe
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {sorted.map((task) => (
                  <tr
                    key={task.id}
                    className="transition-colors hover:bg-surface-muted/40"
                  >
                    <th scope="row" className="px-4 py-3 font-normal">
                      <button
                        type="button"
                        onClick={() => setOpenDetailId(task.id)}
                        className="block max-w-[22rem] text-left text-sm font-medium text-ink underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                      >
                        {task.title}
                      </button>
                      <span className="mt-0.5 block max-w-[24rem] truncate text-xs text-ink-muted">
                        {task.description}
                      </span>
                    </th>
                    <td className="px-4 py-3">
                      <label htmlFor={`task-status-${task.id}`} className="sr-only">
                        Status de {task.title}
                      </label>
                      <Select
                        id={`task-status-${task.id}`}
                        value={task.status}
                        onChange={(event) =>
                          handleStatusChange(
                            task.id,
                            event.target.value as TaskStatus
                          )
                        }
                        className="h-7 w-36 py-0 text-xs"
                      >
                        {STATUS_ORDER.map((status) => (
                          <option key={status} value={status}>
                            {TASK_STATUS[status].label}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <TaskPriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-muted">
                      {task.suggestionId ? (
                        <Link
                          to={`/projetos/${projectId}/revisao`}
                          className="underline-offset-4 hover:text-ink hover:underline"
                        >
                          Revisão
                        </Link>
                      ) : (
                        'Manual'
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-muted">
                      <time dateTime={task.createdAt}>
                        {formatDate(task.createdAt)}
                      </time>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-muted">
                      {task.completedAt ? (
                        <time dateTime={task.completedAt}>
                          {formatDate(task.completedAt)}
                        </time>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenDetailId(task.id)}
                      >
                        Abrir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-line rounded-lg border border-line bg-surface md:hidden">
            {sorted.map((task) => (
              <li key={task.id} className="space-y-2.5 px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenDetailId(task.id)}
                    className="min-w-0 text-left text-sm font-medium text-ink underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                  >
                    {task.title}
                  </button>
                  <TaskPriorityBadge priority={task.priority} />
                </div>
                <p className="line-clamp-2 text-xs leading-relaxed text-ink-muted">
                  {task.description}
                </p>
                <div className="flex items-center gap-2">
                  <label htmlFor={`task-mobile-status-${task.id}`} className="sr-only">
                    Status de {task.title}
                  </label>
                  <Select
                    id={`task-mobile-status-${task.id}`}
                    value={task.status}
                    onChange={(event) =>
                      handleStatusChange(
                        task.id,
                        event.target.value as TaskStatus
                      )
                    }
                    className="h-8 flex-1 text-xs"
                  >
                    {STATUS_ORDER.map((status) => (
                      <option key={status} value={status}>
                        {TASK_STATUS[status].label}
                      </option>
                    ))}
                  </Select>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setOpenDetailId(task.id)}
                  >
                    Detalhes
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="space-y-2">
          <p className="text-xs leading-relaxed text-ink-muted">
            Arraste pelo ícone de alça. Com teclado: foque a alça, use as setas
            para escolher a coluna e espaço para soltar.
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
            accessibility={{
              announcements,
              screenReaderInstructions: {
                draggable:
                  'Para mover uma tarefa, foque a alça de arraste e pressione espaço. Use as setas para escolher a coluna e espaço para soltar. Escape cancela.',
              },
            }}
          >
            <div className="flex gap-3 overflow-x-auto pb-2">
              {STATUS_ORDER.map((status) => (
                <BoardColumn
                  key={status}
                  status={status}
                  tasks={tasksByStatus[status]}
                  onOpen={setOpenDetailId}
                />
              ))}
            </div>
          </DndContext>
        </div>
      )}

      <Drawer
        open={Boolean(detail)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setOpenDetailId(null)
        }}
      >
        <DrawerContent>
          {detail && (
            <>
              <DrawerHeader>
                <DrawerTitle>{detail.title}</DrawerTitle>
                <DrawerDescription>{detail.description}</DrawerDescription>
              </DrawerHeader>

              <DrawerBody className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="detail-status"
                      className="text-xs font-medium text-ink"
                    >
                      Status
                    </label>
                    <Select
                      id="detail-status"
                      value={detail.status}
                      onChange={(event) =>
                        handleStatusChange(
                          detail.id,
                          event.target.value as TaskStatus
                        )
                      }
                    >
                      {STATUS_ORDER.map((status) => (
                        <option key={status} value={status}>
                          {TASK_STATUS[status].label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="detail-priority"
                      className="text-xs font-medium text-ink"
                    >
                      Prioridade
                    </label>
                    <Select
                      id="detail-priority"
                      value={detail.priority}
                      onChange={(event) =>
                        handlePriorityChange(
                          detail.id,
                          event.target.value as TaskPriority
                        )
                      }
                    >
                      {Object.entries(TASK_PRIORITY).map(([value, config]) => (
                        <option key={value} value={value}>
                          {config.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <TaskStatusBadge status={detail.status} />
                  <TaskPriorityBadge priority={detail.priority} />
                </div>

                <dl className="divide-y divide-line-subtle border-y border-line text-sm">
                  <div className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-ink-muted">Origem</dt>
                    <dd className="text-right text-ink">
                      {detail.suggestionId ? (
                        <Link
                          to={`/projetos/${projectId}/revisao`}
                          className="underline-offset-4 hover:underline"
                        >
                          Proposta aprovada
                        </Link>
                      ) : (
                        'Criada manualmente'
                      )}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-ink-muted">Criada em</dt>
                    <dd className="text-right text-ink">
                      <time dateTime={detail.createdAt}>
                        {formatDateTime(detail.createdAt)}
                      </time>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-ink-muted">Concluída em</dt>
                    <dd className="text-right text-ink">
                      {detail.completedAt ? (
                        <time dateTime={detail.completedAt}>
                          {formatDateTime(detail.completedAt)}
                        </time>
                      ) : (
                        'Ainda não'
                      )}
                    </dd>
                  </div>
                </dl>

                <Alert tone="neutral" title="Rastreabilidade">
                  Alterações de status e prioridade são registradas no histórico
                  do projeto. A tarefa mantém o vínculo com a proposta que a
                  originou.
                </Alert>

                <Separator />

                <div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setDeleteTarget(detail)}
                    className="text-danger hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Excluir tarefa
                  </Button>
                  <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                    A proposta original continua no dossiê. A exclusão não pode
                    ser desfeita.
                  </p>
                </div>
              </DrawerBody>

              <DrawerFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpenDetailId(null)}
                >
                  Fechar
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDeleteTarget(null)
        }}
        title="Excluir tarefa"
        description={
          deleteTarget ? (
            <>
              Excluir <strong className="text-ink">{deleteTarget.title}</strong>{' '}
              remove a tarefa do projeto. A proposta original e o histórico de
              decisões permanecem no dossiê.
            </>
          ) : null
        }
        confirmLabel="Excluir tarefa"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  )
}
