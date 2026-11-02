import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Separator } from '@/components/ui/separator'
import { Plus, Search, Edit2, Trash2, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import type { Client } from '@/store'

const clientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

export function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient } = useStore()
  const [search, setSearch] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Client | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(
    null
  )
  const [confirmDeleteName, setConfirmDeleteName] = React.useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: '', email: '', phone: '' },
  })

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalProjects = clients.reduce((sum, c) => sum + c.projectCount, 0)

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', email: '', phone: '' })
    setOpen(true)
  }

  const openEdit = (client: Client) => {
    setEditing(client)
    reset({ name: client.name, email: client.email, phone: client.phone || '' })
    setOpen(true)
  }

  const onSubmit = (data: ClientFormData) => {
    if (editing) {
      updateClient(editing.id, data)
    } else {
      addClient(data)
    }
    setOpen(false)
  }

  const confirmDelete = (id: string, name: string) => {
    setConfirmDeleteId(id)
    setConfirmDeleteName(name)
  }

  const doDelete = () => {
    if (confirmDeleteId) {
      deleteClient(confirmDeleteId)
      setConfirmDeleteId(null)
      setConfirmDeleteName('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted">
            Gerencie seus clientes e projetos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Novo cliente
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted" />
          <Input
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {filtered.length} cliente(s)
          </CardTitle>
          <Badge variant="secondary" className="ml-auto">
            {totalProjects} projeto(s) no total
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto border-b border-border">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-accent/50 text-sm text-muted">
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium">E-mail</th>
                  <th className="p-4 font-medium text-right">Projetos</th>
                  <th className="p-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length > 0 ? (
                  filtered.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-accent/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted text-sm font-medium">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{client.name}</div>
                            <div className="text-xs text-muted">
                              {new Date(client.createdAt).toLocaleDateString(
                                'pt-BR'
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted">
                        {client.email}
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-medium">
                          {client.projectCount}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          onClick={() => openEdit(client)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="p-2 text-danger"
                          onClick={() =>
                            confirmDelete(client.id, client.name)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted">
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Drawer criar/editar cliente */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {editing ? 'Editar cliente' : 'Novo cliente'}
            </DrawerTitle>
            <DrawerDescription>
              {editing
                ? 'Altere os dados do cliente.'
                : 'Preencha os dados para cadastrar um novo cliente.'}
            </DrawerDescription>
            <DrawerClose />
          </DrawerHeader>
          <Form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <FormField>
              <FormLabel>Nome</FormLabel>
              <FormItem>
                <Input {...register('name')} placeholder="Ex.: Confeitaria Doce Massa" />
              </FormItem>
              {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
            </FormField>
            <FormField>
              <FormLabel>E-mail</FormLabel>
              <FormItem>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="contato@empresa.com.br"
                />
              </FormItem>
              {errors.email && <FormMessage>{errors.email.message}</FormMessage>}
            </FormField>
            <FormField>
              <FormLabel>Telefone (opcional)</FormLabel>
              <FormItem>
                <Input
                  {...register('phone')}
                  placeholder="(11) 99999-9999"
                />
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
              <Button
                type="submit"
                disabled={editing ? false : false}
              >
                <Save className="h-4 w-4 mr-2" />
                {editing ? 'Salvar alterações' : 'Criar cliente'}
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
              <DrawerTitle>Excluir cliente</DrawerTitle>
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
                Todos os projetos vinculados a este cliente também serão excluídos.
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
              <Button
                variant="destructive"
                onClick={doDelete}
              >
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


