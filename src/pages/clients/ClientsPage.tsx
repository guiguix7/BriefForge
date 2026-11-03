import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowUpRight,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { useStore, type Client } from '@/store'
import { useToast } from '@/components/ui/toast'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
} from '@/components/ui/drawer'
import { EmptyState } from '@/components/ui/empty-state'
import { Form, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'
import { Select } from '@/components/ui/select'
import { SectionHeading } from '@/components/ui/section-heading'
import { IconTooltip } from '@/components/ui/tooltip'
import { formatDate } from '@/lib/utils'

const clientSchema = z.object({
  name: z.string().trim().min(2, 'Informe pelo menos 2 caracteres.'),
  email: z.string().trim().min(1, 'Informe um e-mail.').email('Use um e-mail válido.'),
  phone: z.string().trim().optional(),
})

type ClientForm = z.infer<typeof clientSchema>

export function ClientsPage() {
  const {
    clients,
    projects,
    suggestions,
    tasks,
    addClient,
    updateClient,
    deleteClient,
  } = useStore()
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const [search, setSearch] = React.useState('')
  const [sortBy, setSortBy] = React.useState<'recent' | 'name' | 'projects'>(
    'recent'
  )
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Client | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Client | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: '', email: '', phone: '' },
  })

  const openCreate = React.useCallback(() => {
    setEditing(null)
    reset({ name: '', email: '', phone: '' })
    setFormOpen(true)
  }, [reset])

  React.useEffect(() => {
    if (searchParams.get('novo') === '1') {
      openCreate()
      const next = new URLSearchParams(searchParams)
      next.delete('novo')
      setSearchParams(next, { replace: true })
    }
  }, [openCreate, searchParams, setSearchParams])

  const openEdit = (client: Client) => {
    setEditing(client)
    reset({
      name: client.name,
      email: client.email,
      phone: client.phone ?? '',
    })
    setFormOpen(true)
  }

  const onSubmit = (data: ClientForm) => {
    if (editing) {
      updateClient(editing.id, {
        name: data.name,
        email: data.email,
        phone: data.phone?.trim() || undefined,
      })
      toast({
        title: 'Cliente atualizado',
        description: `Os dados de ${data.name} foram salvos.`,
        variant: 'success',
      })
    } else {
      addClient({
        name: data.name,
        email: data.email,
        phone: data.phone?.trim() || undefined,
      })
      toast({
        title: 'Cliente cadastrado',
        description: `${data.name} já pode receber um projeto.`,
        variant: 'success',
      })
    }
    setFormOpen(false)
    setEditing(null)
    reset()
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    const projectCount = projects.filter(
      (project) => project.clientId === deleteTarget.id
    ).length
    deleteClient(deleteTarget.id)
    toast({
      title: 'Cliente excluído',
      description:
        projectCount > 0
          ? `${deleteTarget.name} e ${projectCount} projeto(s) vinculado(s) foram removidos.`
          : `${deleteTarget.name} foi removido.`,
      variant: 'success',
    })
    setDeleteTarget(null)
  }

  const projectCount = (clientId: string) =>
    projects.filter((project) => project.clientId === clientId).length
  const activeProjectCount = (clientId: string) =>
    projects.filter(
      (project) => project.clientId === clientId && project.status === 'ativo'
    ).length

  const filtered = clients
    .filter((client) => {
      const term = search.trim().toLowerCase()
      if (!term) return true
      return (
        client.name.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        (client.phone ?? '').toLowerCase().includes(term)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'projects')
        return projectCount(b.id) - projectCount(a.id)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const deleteProjectIds = deleteTarget
    ? projects
        .filter((project) => project.clientId === deleteTarget.id)
        .map((project) => project.id)
    : []
  const deleteSuggestionCount = suggestions.filter((suggestion) =>
    deleteProjectIds.includes(suggestion.projectId)
  ).length
  const deleteTaskCount = tasks.filter((task) =>
    deleteProjectIds.includes(task.projectId)
  ).length

  const activeClients = clients.filter(
    (client) => activeProjectCount(client.id) > 0
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Quem contrata o trabalho. Cada cliente reúne seus projetos, briefings e escopos."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo cliente
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          <span>
            {clients.length} {clients.length === 1 ? 'cliente' : 'clientes'}
          </span>
          <span aria-hidden="true">·</span>
          <span>{activeClients} com projeto ativo</span>
          <span aria-hidden="true">·</span>
          <Link
            to="/projetos"
            className="font-medium text-ink underline-offset-4 hover:underline"
          >
            Ver projetos
          </Link>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <label htmlFor="client-search" className="sr-only">
              Buscar clientes por nome, e-mail ou telefone
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
              aria-hidden="true"
            />
            <Input
              id="client-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar cliente..."
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
          <div className="w-full sm:w-40">
            <label htmlFor="client-sort" className="sr-only">
              Ordenar clientes
            </label>
            <Select
              id="client-sort"
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value as typeof sortBy)
              }
            >
              <option value="recent">Mais recentes</option>
              <option value="name">Nome A–Z</option>
              <option value="projects">Mais projetos</option>
            </Select>
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {filtered.length} clientes encontrados.
      </p>

      {clients.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="Nenhum cliente cadastrado"
          description="Cadastre o primeiro cliente para criar um projeto e começar pelo briefing."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Cadastrar primeiro cliente
            </Button>
          }
          className="rounded-lg border border-line bg-surface"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-5 w-5" />}
          title="Nenhum cliente encontrado"
          description="A busca não retornou resultados. Ajuste o termo ou limpe o filtro."
          action={
            <Button variant="secondary" onClick={() => setSearch('')}>
              Limpar busca
            </Button>
          }
          className="rounded-lg border border-line bg-surface"
        />
      ) : (
        <section aria-labelledby="clients-list-title">
          <SectionHeading
            title="Carteira de clientes"
            description={`${filtered.length} ${
              filtered.length === 1 ? 'registro' : 'registros'
            } ${search ? 'para a busca atual' : 'no workspace'}.`}
          />

          <div className="hidden overflow-x-auto rounded-lg border border-line bg-surface md:block">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <caption className="sr-only">
                Clientes com contato, projetos e ações
              </caption>
              <thead className="border-b border-line bg-surface-muted/60">
                <tr className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  <th scope="col" className="px-4 py-2.5">Cliente</th>
                  <th scope="col" className="px-4 py-2.5">Contato</th>
                  <th scope="col" className="px-4 py-2.5">Projetos</th>
                  <th scope="col" className="px-4 py-2.5">Cadastro</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((client) => {
                  const total = projectCount(client.id)
                  const active = activeProjectCount(client.id)
                  return (
                    <tr
                      key={client.id}
                      className="transition-colors hover:bg-surface-muted/40"
                    >
                      <th scope="row" className="px-4 py-3 font-normal">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={client.name} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">
                              {client.name}
                            </p>
                            {client.phone && (
                              <p className="mt-0.5 truncate text-xs text-ink-muted md:hidden">
                                {client.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </th>
                      <td className="px-4 py-3">
                        <a
                          href={`mailto:${client.email}`}
                          className="inline-flex max-w-56 items-center gap-1.5 truncate text-ink-muted underline-offset-4 hover:text-ink hover:underline"
                        >
                          <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span className="truncate">{client.email}</span>
                        </a>
                        {client.phone && (
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-subtle">
                            <Phone className="h-3 w-3" aria-hidden="true" />
                            {client.phone}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {total === 0 ? (
                          <span className="text-ink-muted">Nenhum</span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <span className="font-medium tabular text-ink">
                              {total}
                            </span>
                            {active > 0 && (
                              <Badge tone="success" dot>
                                {active} ativo{active === 1 ? '' : 's'}
                              </Badge>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">
                        <time dateTime={client.createdAt}>
                          {formatDate(client.createdAt)}
                        </time>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <IconTooltip label={`Editar ${client.name}`}>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEdit(client)}
                              aria-label={`Editar ${client.name}`}
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </IconTooltip>
                          <IconTooltip label={`Excluir ${client.name}`}>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeleteTarget(client)}
                              className="text-danger hover:bg-danger-soft hover:text-danger"
                              aria-label={`Excluir ${client.name}`}
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

          <ul className="divide-y divide-line rounded-lg border border-line bg-surface md:hidden">
            {filtered.map((client) => {
              const total = projectCount(client.id)
              const active = activeProjectCount(client.id)
              return (
                <li key={client.id} className="space-y-3 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={client.name} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {client.name}
                      </p>
                      <a
                        href={`mailto:${client.email}`}
                        className="mt-0.5 block truncate text-xs text-ink-muted underline-offset-4 hover:underline"
                      >
                        {client.email}
                      </a>
                      {client.phone && (
                        <p className="mt-0.5 text-xs text-ink-subtle">
                          {client.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                    <span>
                      {total} {total === 1 ? 'projeto' : 'projetos'}
                    </span>
                    {active > 0 && (
                      <Badge tone="success" dot>
                        {active} ativo{active === 1 ? '' : 's'}
                      </Badge>
                    )}
                    <span className="ml-auto">
                      desde {formatDate(client.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEdit(client)}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Editar
                    </Button>
                    {total > 0 && (
                      <Button asChild variant="ghost" size="sm" className="flex-1">
                        <Link to={`/projetos?cliente=${client.id}`}>
                          Ver projetos
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteTarget(client)}
                      className="text-danger hover:bg-danger-soft hover:text-danger"
                      aria-label={`Excluir ${client.name}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

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
              {editing ? 'Editar cliente' : 'Novo cliente'}
            </DrawerTitle>
            <DrawerDescription>
              {editing
                ? 'Atualize os dados de contato deste cliente.'
                : 'O cliente precisa existir antes de receber um projeto.'}
            </DrawerDescription>
          </DrawerHeader>
          <Form
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col space-y-0"
          >
            <DrawerBody className="space-y-5">
              <FormField
                label="Nome do cliente"
                htmlFor="client-name"
                error={errors.name?.message}
                required
              >
                <Input
                  id="client-name"
                  placeholder="Ex.: Confeitaria Doce Massa"
                  autoComplete="organization"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'client-name-error' : undefined}
                  {...register('name')}
                />
              </FormField>
              <FormField
                label="E-mail"
                htmlFor="client-email"
                error={errors.email?.message}
                required
              >
                <Input
                  id="client-email"
                  type="email"
                  placeholder="contato@empresa.com.br"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'client-email-error' : undefined}
                  {...register('email')}
                />
              </FormField>
              <FormField
                label="Telefone"
                htmlFor="client-phone"
                hint="Opcional. Use o formato que o cliente prefere."
                error={errors.phone?.message}
              >
                <Input
                  id="client-phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={
                    errors.phone ? 'client-phone-error' : 'client-phone-hint'
                  }
                  {...register('phone')}
                />
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
                {editing ? 'Salvar alterações' : 'Cadastrar cliente'}
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
        title="Excluir cliente"
        description={
          deleteTarget ? (
            <>
              <span className="block">
                Excluir <strong className="text-ink">{deleteTarget.name}</strong>{' '}
                é permanente.
              </span>
              {deleteProjectIds.length > 0 ? (
                <span className="mt-2 block">
                  Também serão excluídos {deleteProjectIds.length}{' '}
                  {deleteProjectIds.length === 1 ? 'projeto' : 'projetos'},{' '}
                  {deleteSuggestionCount}{' '}
                  {deleteSuggestionCount === 1 ? 'sugestão' : 'sugestões'} e{' '}
                  {deleteTaskCount}{' '}
                  {deleteTaskCount === 1 ? 'tarefa' : 'tarefas'} vinculados.
                </span>
              ) : (
                <span className="mt-2 block">
                  Este cliente não possui projetos vinculados.
                </span>
              )}
            </>
          ) : null
        }
        confirmLabel="Excluir cliente"
        onConfirm={confirmDelete}
        destructive
      />
    </div>
  )
}
