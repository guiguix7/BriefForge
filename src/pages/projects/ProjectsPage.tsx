import * as React from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowRight,
  FolderKanban,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { useStore, type Project } from '@/store'
import { useToast } from '@/components/ui/toast'
import { Badge } from '@/components/ui/badge'
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
import { Form, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'
import { Progress } from '@/components/ui/progress'
import { SectionHeading } from '@/components/ui/section-heading'
import { Select } from '@/components/ui/select'
import { IconTooltip } from '@/components/ui/tooltip'
import {
  ProjectStatusBadge,
} from '@/components/domain-badges'
import {
  PROJECT_STATUS,
  nextProjectAction,
  pendingReviewCount,
  projectProgress,
} from '@/lib/domain'
import { formatDate } from '@/lib/utils'

const projectSchema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente.'),
  name: z.string().trim().min(2, 'Informe pelo menos 2 caracteres.'),
  status: z.enum(['ativo', 'pausado', 'concluido']),
})

type ProjectForm = z.infer<typeof projectSchema>
type StatusFilter = Project['status'] | 'all'

export function ProjectsPage() {
  const {
    clients,
    projects,
    suggestions,
    tasks,
    addProject,
    updateProject,
    deleteProject,
    addHistory,
  } = useStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [search, setSearch] = React.useState('')
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Project | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Project | null>(null)

  const statusParam = searchParams.get('status')
  const statusFilter: StatusFilter =
    statusParam === 'ativo' ||
    statusParam === 'pausado' ||
    statusParam === 'concluido'
      ? statusParam
      : 'all'

  const clientParam = searchParams.get('cliente') ?? 'all'
  const clientFilter = clients.some((client) => client.id === clientParam)
    ? clientParam
    : 'all'

  const setFilter = (key: 'status' | 'cliente', value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'all') next.delete(key)
    else next.set(key, value)
    setSearchParams(next, { replace: true })
  }

  const clearFilters = () => {
    setSearch('')
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      clientId: clients[0]?.id ?? '',
      name: '',
      status: 'ativo',
    },
  })

  const openCreate = React.useCallback(() => {
    if (clients.length === 0) {
      toast({
        title: 'Cadastre um cliente primeiro',
        description:
          'Todo projeto pertence a um cliente. Cadastre o cliente e volte para criar o projeto.',
        variant: 'warning',
      })
      return
    }
    setEditing(null)
    reset({
      clientId: clients[0]?.id ?? '',
      name: '',
      status: 'ativo',
    })
    setFormOpen(true)
  }, [clients, reset, toast])

  React.useEffect(() => {
    if (searchParams.get('novo') === '1') {
      openCreate()
      const next = new URLSearchParams(searchParams)
      next.delete('novo')
      setSearchParams(next, { replace: true })
    }
  }, [openCreate, searchParams, setSearchParams])

  const openEdit = (project: Project) => {
    setEditing(project)
    reset({
      clientId: project.clientId,
      name: project.name,
      status: project.status,
    })
    setFormOpen(true)
  }

  const onSubmit = (data: ProjectForm) => {
    if (editing) {
      const statusChanged = editing.status !== data.status
      const nameChanged = editing.name !== data.name
      updateProject(editing.id, data)
      if (statusChanged || nameChanged) {
        addHistory(editing.id, {
          type: 'edicao',
          title: 'Projeto atualizado',
          description: [
            nameChanged ? `nome alterado para "${data.name}"` : null,
            statusChanged
              ? `status alterado para ${PROJECT_STATUS[data.status].label.toLowerCase()}`
              : null,
          ]
            .filter(Boolean)
            .join('; '),
        })
      }
      toast({
        title: 'Projeto atualizado',
        description: 'As alterações foram salvas.',
        variant: 'success',
      })
      setFormOpen(false)
      setEditing(null)
      return
    }

    const id = addProject(data)
    addHistory(id, {
      type: 'criacao',
      title: 'Projeto criado',
      description: `Projeto "${data.name}" criado e vinculado ao cliente selecionado.`,
    })
    toast({
      title: 'Projeto criado',
      description: 'Agora cole o briefing do cliente para iniciar a análise.',
      variant: 'success',
    })
    setFormOpen(false)
    navigate(`/projetos/${id}/briefing`)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    const projectSuggestions = suggestions.filter(
      (suggestion) => suggestion.projectId === deleteTarget.id
    ).length
    const projectTasks = tasks.filter(
      (task) => task.projectId === deleteTarget.id
    ).length
    deleteProject(deleteTarget.id)
    toast({
      title: 'Projeto excluído',
      description: `${deleteTarget.name}, ${projectSuggestions} sugestões e ${projectTasks} tarefas foram removidos.`,
      variant: 'success',
    })
    setDeleteTarget(null)
  }

  const clientName = (id: string) =>
    clients.find((client) => client.id === id)?.name ?? 'Cliente removido'

  const filtered = projects.filter((project) => {
    if (statusFilter !== 'all' && project.status !== statusFilter) return false
    if (clientFilter !== 'all' && project.clientId !== clientFilter) return false
    const term = search.trim().toLowerCase()
    if (!term) return true
    return (
      project.name.toLowerCase().includes(term) ||
      clientName(project.clientId).toLowerCase().includes(term)
    )
  })

  const activeCount = projects.filter(
    (project) => project.status === 'ativo'
  ).length
  const hasFilters =
    search.trim() !== '' || statusFilter !== 'all' || clientFilter !== 'all'

  const deleteCounts = deleteTarget
    ? {
        suggestions: suggestions.filter(
          (suggestion) => suggestion.projectId === deleteTarget.id
        ).length,
        tasks: tasks.filter((task) => task.projectId === deleteTarget.id).length,
      }
    : { suggestions: 0, tasks: 0 }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projetos"
        description="Cada projeto é um dossiê: briefing, análise revisada, tarefas e histórico."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo projeto
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
        <span>
          {projects.length} {projects.length === 1 ? 'projeto' : 'projetos'}
        </span>
        <span aria-hidden="true">·</span>
        <span>{activeCount} ativos</span>
        <span aria-hidden="true">·</span>
        <span>{clients.length} clientes</span>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Filtrar por status"
          >
            {(
              [
                { value: 'all', label: 'Todos', count: projects.length },
                {
                  value: 'ativo',
                  label: 'Ativos',
                  count: projects.filter((project) => project.status === 'ativo')
                    .length,
                },
                {
                  value: 'pausado',
                  label: 'Pausados',
                  count: projects.filter(
                    (project) => project.status === 'pausado'
                  ).length,
                },
                {
                  value: 'concluido',
                  label: 'Concluídos',
                  count: projects.filter(
                    (project) => project.status === 'concluido'
                  ).length,
                },
              ] as const
            ).map((filter) => {
              const selected = statusFilter === filter.value
              return (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setFilter('status', filter.value)}
                  className={[
                    'inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
                    selected
                      ? 'border-accent/30 bg-accent-soft text-accent'
                      : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
                  ].join(' ')}
                >
                  {filter.label}
                  <span className="font-mono text-[0.6875rem] tabular opacity-70">
                    {filter.count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <label htmlFor="project-search" className="sr-only">
                Buscar projetos por nome ou cliente
              </label>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
                aria-hidden="true"
              />
              <Input
                id="project-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar projeto ou cliente..."
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

            <div className="w-full sm:w-52">
              <label htmlFor="project-client-filter" className="sr-only">
                Filtrar por cliente
              </label>
              <Select
                id="project-client-filter"
                value={clientFilter}
                onChange={(event) => setFilter('cliente', event.target.value)}
              >
                <option value="all">Todos os clientes</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
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
        </div>

        <p className="sr-only" aria-live="polite">
          {filtered.length} projetos encontrados.
        </p>

        {projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="h-5 w-5" />}
            title={
              clients.length === 0
                ? 'Comece por um cliente'
                : 'Nenhum projeto cadastrado'
            }
            description={
              clients.length === 0
                ? 'Todo projeto pertence a um cliente. Cadastre o primeiro cliente para continuar.'
                : 'Crie o primeiro projeto e cole o briefing recebido para iniciar a análise.'
            }
            action={
              clients.length === 0 ? (
                <Button asChild>
                  <Link to="/clientes?novo=1">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    Cadastrar cliente
                  </Link>
                </Button>
              ) : (
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Criar projeto
                </Button>
              )
            }
            className="rounded-lg border border-line bg-surface"
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Search className="h-5 w-5" />}
            title="Nenhum projeto neste filtro"
            description="Ajuste a busca, o status ou o cliente para ver outros projetos."
            action={
              <Button variant="secondary" onClick={clearFilters}>
                Limpar filtros
              </Button>
            }
            className="rounded-lg border border-line bg-surface"
          />
        ) : (
          <section aria-labelledby="projects-table-title">
            <SectionHeading
              title="Dossiês em andamento"
              description={`${filtered.length} ${
                filtered.length === 1 ? 'projeto exibido' : 'projetos exibidos'
              }.`}
            />

            <div className="hidden overflow-x-auto rounded-lg border border-line bg-surface lg:block">
              <table className="w-full min-w-[62rem] text-left text-sm">
                <caption className="sr-only">
                  Projetos com cliente, status, revisão, tarefas, progresso,
                  próximo passo e ações
                </caption>
                <thead className="border-b border-line bg-surface-muted/60">
                  <tr className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
                    <th scope="col" className="px-4 py-2.5">Projeto</th>
                    <th scope="col" className="px-4 py-2.5">Status</th>
                    <th scope="col" className="px-4 py-2.5">Revisão</th>
                    <th scope="col" className="px-4 py-2.5">Tarefas</th>
                    <th scope="col" className="px-4 py-2.5">Progresso</th>
                    <th scope="col" className="px-4 py-2.5">Próximo passo</th>
                    <th scope="col" className="px-4 py-2.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.map((project) => {
                    const pending = pendingReviewCount(project.id, suggestions)
                    const projectTasks = tasks.filter(
                      (task) => task.projectId === project.id
                    )
                    const openTasks = projectTasks.filter(
                      (task) => task.status !== 'concluido'
                    ).length
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
                            {clientName(project.clientId)} · criado em{' '}
                            {formatDate(project.createdAt)}
                          </span>
                        </th>
                        <td className="px-4 py-3">
                          <ProjectStatusBadge status={project.status} />
                        </td>
                        <td className="px-4 py-3">
                          {pending > 0 ? (
                            <Link
                              to={`/projetos/${project.id}/revisao`}
                              className="font-medium text-accent underline-offset-4 hover:underline"
                            >
                              {pending} pendentes
                            </Link>
                          ) : (
                            <span className="text-ink-muted">Em dia</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-ink-muted">
                          <span className="font-mono text-xs tabular">
                            {openTasks} / {projectTasks.length}
                          </span>
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
                            className="inline-flex items-center gap-1 font-medium text-ink underline-offset-4 hover:text-accent hover:underline"
                          >
                            {action.label}
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <IconTooltip label={`Editar ${project.name}`}>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => openEdit(project)}
                                aria-label={`Editar ${project.name}`}
                              >
                                <Pencil className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </IconTooltip>
                            <IconTooltip label={`Excluir ${project.name}`}>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setDeleteTarget(project)}
                                className="text-danger hover:bg-danger-soft hover:text-danger"
                                aria-label={`Excluir ${project.name}`}
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </IconTooltip>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-line rounded-lg border border-line bg-surface lg:hidden">
              {filtered.map((project) => {
                const pending = pendingReviewCount(project.id, suggestions)
                const projectTasks = tasks.filter(
                  (task) => task.projectId === project.id
                )
                const openTasks = projectTasks.filter(
                  (task) => task.status !== 'concluido'
                ).length
                const progress = projectProgress(project.id, tasks)
                const action = nextProjectAction(project, suggestions, tasks)
                return (
                  <li key={project.id} className="space-y-3 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          to={`/projetos/${project.id}`}
                          className="block truncate text-sm font-semibold text-ink"
                        >
                          {project.name}
                        </Link>
                        <p className="mt-0.5 truncate text-xs text-ink-muted">
                          {clientName(project.clientId)}
                        </p>
                      </div>
                      <ProjectStatusBadge status={project.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                      <span>
                        {openTasks} de {projectTasks.length} tarefas abertas
                      </span>
                      {pending > 0 && (
                        <Badge tone="accent">{pending} pendentes</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={progress} className="flex-1" />
                      <span className="text-meta text-ink-muted">{progress}%</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        to={action.href}
                        className="inline-flex items-center gap-1 text-sm font-medium text-accent"
                      >
                        {action.label}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(project)}
                          aria-label={`Editar ${project.name}`}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteTarget(project)}
                          className="text-danger hover:bg-danger-soft hover:text-danger"
                          aria-label={`Excluir ${project.name}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </div>

      <Drawer
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditing(null)
        }}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {editing ? 'Editar projeto' : 'Novo projeto'}
            </DrawerTitle>
            <DrawerDescription>
              {editing
                ? 'Ajuste o nome, o cliente ou o status do dossiê.'
                : 'Depois de criar, você será levado ao briefing para colar o material do cliente.'}
            </DrawerDescription>
          </DrawerHeader>
          <Form
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col space-y-0"
          >
            <DrawerBody className="space-y-5">
              <FormField
                label="Cliente"
                htmlFor="project-client"
                error={errors.clientId?.message}
                required
              >
                <Select
                  id="project-client"
                  aria-invalid={Boolean(errors.clientId)}
                  aria-describedby={
                    errors.clientId ? 'project-client-error' : undefined
                  }
                  {...register('clientId')}
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField
                label="Nome do projeto"
                htmlFor="project-name"
                error={errors.name?.message}
                required
              >
                <Input
                  id="project-name"
                  placeholder="Ex.: Site e cardápio online"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'project-name-error' : undefined}
                  {...register('name')}
                />
              </FormField>
              <FormField
                label="Status"
                htmlFor="project-status"
                hint="Projetos pausados continuam acessíveis, mas saem do foco da visão geral."
                error={errors.status?.message}
              >
                <Select
                  id="project-status"
                  aria-invalid={Boolean(errors.status)}
                  aria-describedby={
                    errors.status ? 'project-status-error' : 'project-status-hint'
                  }
                  {...register('status')}
                >
                  <option value="ativo">Ativo</option>
                  <option value="pausado">Pausado</option>
                  <option value="concluido">Concluído</option>
                </Select>
              </FormField>
            </DrawerBody>
            <DrawerFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setFormOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {editing ? 'Salvar alterações' : 'Criar projeto'}
              </Button>
            </DrawerFooter>
          </Form>
        </DrawerContent>
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Excluir projeto"
        description={
          deleteTarget ? (
            <>
              <span className="block">
                Excluir{' '}
                <strong className="text-ink">{deleteTarget.name}</strong> remove
                o dossiê inteiro.
              </span>
              <span className="mt-2 block">
                Serão excluídos {deleteCounts.suggestions}{' '}
                {deleteCounts.suggestions === 1 ? 'sugestão' : 'sugestões'},{' '}
                {deleteCounts.tasks} {deleteCounts.tasks === 1 ? 'tarefa' : 'tarefas'}{' '}
                e todo o histórico deste projeto.
              </span>
            </>
          ) : null
        }
        confirmLabel="Excluir projeto"
        onConfirm={confirmDelete}
        destructive
      />
    </div>
  )
}
