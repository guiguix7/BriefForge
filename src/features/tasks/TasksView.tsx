import { useStore } from '@/store'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import * as React from 'react'
import type { Task } from '@/store'

type TaskStatus = Task['status']
type TaskPriority = Task['priority']

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; variant: string }
> = {
  pendente: { label: 'Pendente', variant: 'default' },
  andamento: { label: 'Em andamento', variant: 'default' },
  revisao: { label: 'Revisão', variant: 'warning' },
  concluido: { label: 'Concluído', variant: 'success' },
}

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; variant: string }
> = {
  baixa: { label: 'Baixa', variant: 'secondary' },
  media: { label: 'Média', variant: 'default' },
  alta: { label: 'Alta', variant: 'warning' },
  critica: { label: 'Crítica', variant: 'destructive' },
}

const STATUS_ORDER: Record<TaskStatus, number> = {
  pendente: 0,
  andamento: 1,
  revisao: 2,
  concluido: 3,
}

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'pendente', label: 'Pendente' },
  { id: 'andamento', label: 'Em andamento' },
  { id: 'revisao', label: 'Revisão' },
  { id: 'concluido', label: 'Concluído' },
]

function TaskItem({
  task,
  onStatusChange,
  onOpenDetail,
}: {
  task: Task
  onStatusChange: (id: string, status: TaskStatus) => void
  onOpenDetail: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id })
  const status = STATUS_CONFIG[task.status]
  const priority = PRIORITY_CONFIG[task.priority]
  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'rounded-lg border border-border bg-surface p-3 mb-2 cursor-pointer shadow-sm transition-all',
        'group'
      )}
      onClick={() => onOpenDetail(task.id)}
    >
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full" />
        <span className="text-xs font-medium text-muted">{task.title}</span>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Badge variant={status.variant as any} className="text-xs">
          {status.label}
        </Badge>
        <Badge variant={priority.variant as any} className="text-xs">
          {priority.label}
        </Badge>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[10px] text-muted">
          <span className="w-2 h-2 rounded-full" />
          <span>Origem: sugestão</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="p-1 text-muted"
          onClick={(e) => {
            e.stopPropagation()
            onStatusChange(task.id, 'concluido')
          }}
          title="Marcar como concluído"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

function BoardColumn({
  label,
  tasks,
  onStatusChange,
  onOpenDetail,
}: {
  label: string
  tasks: Task[]
  onStatusChange: (id: string, status: TaskStatus) => void
  onOpenDetail: (id: string) => void
}) {
  const sorted = [...tasks].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
  )

  return (
    <div className="flex flex-col min-w-[240px]">
      <div className="flex items-center gap-2 px-2 py-2 border-b border-border bg-accent/50">
        <span className="text-xs font-semibold text-muted uppercase tracking-tighter">
          {label}
        </span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {tasks.length}
        </Badge>
      </div>
      <div className="p-2 min-h-[100px]">
        <SortableContext
          items={sorted.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sorted.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onStatusChange={onStatusChange}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

function TasksBoard({
  tasks,
  onStatusChange,
  onOpenDetail,
}: {
  tasks: Task[]
  onStatusChange: (id: string, status: TaskStatus) => void
  onOpenDetail: (id: string) => void
}) {
  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeTask = tasks.find((t) => t.id === String(active.id))
    if (!activeTask) return

    const overTask = tasks.find((t) => t.id === String(over.id))
    if (!overTask) return

    onStatusChange(String(active.id), overTask.status)
  }

  const tasksByStatus: Record<TaskStatus, Task[]> = {
    pendente: [],
    andamento: [],
    revisao: [],
    concluido: [],
  }

  tasks.forEach((t) => tasksByStatus[t.status].push(t))

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {COLUMNS.map((col) => (
            <BoardColumn
              key={col.id}
              label={col.label}
              tasks={tasksByStatus[col.id]}
              onStatusChange={onStatusChange}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      </div>
    </DndContext>
  )
}

function TasksList({
  tasks,
  onOpenDetail,
}: {
  tasks: Task[]
  onOpenDetail: (id: string) => void
}) {
  const PRIORITY_ORDER: Record<TaskPriority, number> = {
    baixa: 0,
    media: 1,
    alta: 2,
    critica: 3,
  }

  const sorted = [...tasks].sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]
  )

  return (
    <div className="divide-y divide-border/50">
      {sorted.map((task) => (
        <div key={task.id} className="p-3 hover:bg-accent/30 transition-colors">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm">{task.title}</h4>
            <Badge variant={STATUS_CONFIG[task.status].variant as any}>
              {STATUS_CONFIG[task.status].label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={PRIORITY_CONFIG[task.priority].variant as any}>
              {PRIORITY_CONFIG[task.priority].label}
            </Badge>
            <span className="text-[10px] text-muted">Origem: sugestão</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted">
              {new Date(task.createdAt).toLocaleDateString('pt-BR')}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={(e) => {
                e.stopPropagation()
                onOpenDetail(task.id)
              }}
            >
              Ver detalhes
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export function TasksView({ projectId }: { projectId: string }) {
  const { tasks, updateTask, addHistory } = useStore()
  const projTasks = tasks.filter((t) => t.projectId === projectId)

  const [view, setView] = React.useState<'list' | 'board'>('board')
  const [statusFilter, setStatusFilter] = React.useState<
    TaskStatus | 'all'
  >('all')
  const [priorityFilter, setPriorityFilter] = React.useState<
    TaskPriority | 'all'
  >('all')
  const [search, setSearch] = React.useState('')
  const [openDetailId, setOpenDetailId] = React.useState<string | null>(null)

  const filtered = projTasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()))
      return false
    return true
  })

  const handleStatusChange = (id: string, status: TaskStatus) => {
    updateTask(id, { status })
    addHistory(projectId, {
      type: 'alteracao',
      title: 'Status da tarefa alterado',
      description: `Tarefa "${id}" movida para ${status}.`,
    })
  }

  const detail = projTasks.find((t) => t.id === openDetailId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tarefas</h1>
          <p className="text-sm text-muted">
            Gerencie as tarefas do projeto
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('list')}
          >
            Lista
          </Button>
          <Button
            variant={view === 'board' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('board')}
          >
            Quadro
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="relative w-64">
          <input
            placeholder="Buscar tarefas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full pl-8 pr-3 rounded-md border border-border bg-surface text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as TaskStatus | 'all')
          }
          className="h-9 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <option value="all">Todos os status</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key as TaskStatus}>
              {cfg.label}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(e.target.value as TaskPriority | 'all')
          }
          className="h-9 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <option value="all">Todas as prioridades</option>
          {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key as TaskPriority}>
              {cfg.label}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {view === 'board' ? (
            <TasksBoard
              tasks={filtered}
              onStatusChange={handleStatusChange}
              onOpenDetail={setOpenDetailId}
            />
          ) : (
            <TasksList
              tasks={filtered}
              onOpenDetail={setOpenDetailId}
            />
          )}
        </CardContent>
      </Card>

      {/* Detalhe da tarefa em painel lateral */}
      {detail && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm"
            onClick={() => setOpenDetailId(null)}
          />
          <div className="fixed top-0 right-0 z-50 h-full w-full max-w-[420px] bg-surface border-l border-border shadow-xl flex flex-col">
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border bg-surface">
              <div>
                <h2 className="text-lg font-semibold">{detail.title}</h2>
                <p className="text-sm text-muted">{detail.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpenDetailId(null)}
              >
                Fechar
              </Button>
            </div>
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-xs text-muted block">Status</label>
                <Badge variant={STATUS_CONFIG[detail.status].variant as any}>
                  {STATUS_CONFIG[detail.status].label}
                </Badge>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted block">Prioridade</label>
                <Badge variant={PRIORITY_CONFIG[detail.priority].variant as any}>
                  {PRIORITY_CONFIG[detail.priority].label}
                </Badge>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted block">Origem</label>
                <span className="text-xs font-mono">
                  {detail.suggestionId ? 'Sugestão da IA' : 'Criada manualmente'}
                </span>
              </div>
              <Separator />
              <div className="space-y-2">
                <label className="text-xs text-muted block">Criado em</label>
                <span className="text-sm">
                  {new Date(detail.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {detail.completedAt && (
                <div className="space-y-2">
                  <label className="text-xs text-muted block">Concluído em</label>
                  <span className="text-sm">
                    {new Date(detail.completedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
