import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  DrawerFooter,
} from '@/components/ui/drawer'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Plus, Search, Edit2, Trash2, Save, Briefcase } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import * as React from 'react'

const projectSchema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  status: z.enum(['ativo', 'pausado', 'concluido']),
})

type ProjectFormData = z.infer<typeof projectSchema>

export function ProjectsPage() {
  const {
    clients,
    projects,
    addProject,
    updateProject,
    deleteProject,
  } = useStore()
  const [search, setSearch] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Project | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(
    null
  )
  const [confirmDeleteName, setConfirmDeleteName] = React.useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      clientId: '',
      name: '',
      status: 'ativo' as const,
    },
  })

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const clientById = (id: string) =>
    clients.find((c) => c.id === id)

  const openCreate = () => {
    setEditing(null)
    reset({ clientId: '', name: '', status: 'ativo' })
    setOpen(true)
  }

  const openEdit = (project: Project) => {
    setEditing(project)
    reset({
      clientId: project.clientId,
      name: project.name,
      status: project.status as 'ativo' | 'pausado' | 'concluido',
    })
    setOpen(true)
  }

  const onSubmit = (data: ProjectFormData) => {
    if (editing) {
      updateProject(editing.id, data)
    } else {
      addProject(data)
    }
    setOpen(false)
  }

  const confirmDelete = (id: string, name: string) => {
    setConfirmDeleteId(id)
    setConfirmDeleteName(name)
  }

  const doDelete = () => {
    if (confirmDeleteId) {
      deleteProject(confirmDeleteId)
      setConfirmDeleteId(null)
      setConfirmDeleteName('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projetos</h1>
          <p className="text-sm text-muted">
            Gerencie seus projetos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Novo projeto
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted" />
          <Input
            placeholder="Buscar projeto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {filtered.length} projeto(s)
          </CardTitle>
          <Badge variant="secondary" className="ml-auto">
            {clients.length} cliente(s)
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto border-b border-border">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-accent/50 text-sm text-muted">
                  <th className="p-4 font-medium">Projeto</th>
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length > 0 ? (
                  filtered.map((project) => {
                    const client = clientById(project.clientId)
                    return (
                      <tr
                        key={project.id}
                        className="hover:bg-accent/30 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-medium">{project.name}</div>
                          <div className="text-xs text-muted">
                            {new Date(project.createdAt).toLocaleDateString(
                              'pt-BR'
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-muted">
                          {client?.name || project.clientId}
                        </td>
                        <td className="p-4">
                          <span
                            className={cn(
                              'px-2 py-1 rounded text-xs font-medium border',
                              project.status === 'ativo'
                                ? 'border-primary/20 bg-primary/10 text-primary'
                                : project.status === 'pausado'
                                ? 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            )}
                          >
                            {project.status === 'ativo'
                              ? 'Ativo'
                              : project.status === 'pausado'
                              ? 'Pausado'
                              : 'Concluído'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2"
                            asChild
                            onClick={() => {}}
                          >
                            <a
                              href={`/projetos/${project.id}`}
                              onClick={(e) => {
                                e.preventDefault()
                                // navegação seria feita pelo router
                              }}
                            >
                              <Briefcase className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2"
                            onClick={() => openEdit(project)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="p-2 text-danger"
                            onClick={() =>
                              confirmDelete(project.id, project.name)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted">
                      Nenhum projeto encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Drawer criar/editar projeto */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {editing ? 'Editar projeto' : 'Novo projeto'}
            </DrawerTitle>
            <DrawerDescription>
              {editing
                ? 'Altere os dados do projeto.'
                : 'Preencha os dados para cadastrar um novo projeto.'}
            </DrawerDescription>
            <DrawerClose />
          </DrawerHeader>
          <Form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <FormField>
              <FormLabel>Cliente</FormLabel>
              <FormItem>
                <select
                  {...register('clientId')}
                  className="h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </FormItem>
              {errors.clientId && (
                <FormMessage>{errors.clientId.message}</FormMessage>
              )}
            </FormField>
            <FormField>
              <FormLabel>Nome do projeto</FormLabel>
              <FormItem>
                <Input
                  {...register('name')}
                  placeholder="Ex.: Site e Cardápio Online"
                />
              </FormItem>
              {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
            </FormField>
            <FormField>
              <FormLabel>Status</FormLabel>
              <FormItem>
                <select
                  {...register('status')}
                  className="h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  <option value="ativo">Ativo</option>
                  <option value="pausado">Pausado</option>
                  <option value="concluido">Concluído</option>
                </select>
              </FormItem>
            </FormField>
            <Separator />
            <DrawerFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {editing ? 'Salvar alterações' : 'Criar projeto'}
              </Button>
            </DrawerFooter>
          </Form>
        </DrawerContent>
      </Drawer>

      {/* Confirmação de exclusão */}
      {confirmDeleteId && (
        <Drawer open={true} onOpenChange={() => setConfirmDeleteId(null)}>
          <DrawerContent className="max-w-[420px]">
            <DrawerHeader>
              <DrawerTitle>Excluir projeto</DrawerTitle>
              <DrawerDescription>
                Esta ação não pode ser desfeita.
              </DrawerDescription>
              <DrawerClose />
            </DrawerHeader>
            <DrawerContent className="p-6 space-y-4">
              <p className="text-sm">
                Tem certeza de que deseja excluir <strong>"{confirmDeleteName}"</strong>?
              </p>
              <p className="text-sm text-muted">
                Todos os briefings, sugestões, tarefas e histórico deste projeto serão excluídos.
              </p>
              <Separator />
            </DrawerContent>
            <DrawerFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={doDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Sim, excluir
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}

interface Project {
  id: string
  clientId: string
  name: string
  status: string
  createdAt: string
}
