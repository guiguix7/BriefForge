import { useStore } from '@/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
export function Dashboard() {
  const { clients, projects, tasks, suggestions } = useStore()

  const openTasks = tasks.filter((t) => t.status !== 'concluido').length
  const criticalTasks = tasks.filter((t) => t.priority === 'critica' && t.status !== 'concluido').length
  const doneThisWeek = tasks.filter((t) => t.status === 'concluido').length

  const needsAttention = suggestions.filter((s) => s.status === 'pendente').slice(0, 5)
  const criticalLate = tasks.filter((t) => t.priority === 'critica' && t.status !== 'concluido').slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted">Visão geral do seu trabalho</p>
        </div>
        <Button className="hidden sm:flex" asChild>
          <Link to="/projetos">
            <FileText className="h-4 w-4 mr-2" /> Novo briefing
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Badge variant="secondary" className="ml-auto">
              {clients.length}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{clients.length}</p>
            <p className="text-xs text-muted">clientes cadastrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos ativos</CardTitle>
            <Badge variant="default" className="ml-auto">
              {projects.filter((p) => p.status === 'ativo').length}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{projects.length}</p>
            <p className="text-xs text-muted">projetos no total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas abertas</CardTitle>
            <Badge variant="default" className="ml-auto">
              {openTasks}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{openTasks}</p>
            <p className="text-xs text-muted">em andamento ou pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas críticas</CardTitle>
            <Badge variant="destructive" className="ml-auto">
              {criticalTasks}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{criticalTasks}</p>
            <p className="text-xs text-muted">prioridade crítica em aberto</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisa da sua atenção</CardTitle>
            <Badge variant="default" className="ml-auto">
              {needsAttention.length + criticalLate.length}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {needsAttention.length > 0 || criticalLate.length > 0 ? (
              <div className="space-y-3">
                {needsAttention.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-2">
                    <span className="text-sm">{s.title}</span>
                    <Badge variant="default" className="text-xs">
                      Pendente
                    </Badge>
                  </div>
                ))}
                {criticalLate.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-danger">{t.title}</span>
                    <Badge variant="destructive" className="text-xs">
                      Crítica
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">Tudo em dia. Nenhuma sugestão pendente ou crítica em aberto.</p>
            )}
            <div className="pt-2">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/projetos">Ver projetos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas na semana</CardTitle>
            <Badge variant="success" className="ml-auto">
              {doneThisWeek}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{doneThisWeek}</p>
            <p className="text-xs text-muted">tarefas finalizadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atalho rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted mb-4">
              Comece um novo projeto colando o briefing do cliente.
            </p>
            <Button className="w-full" asChild>
              <Link to="/projetos">Criar projeto e briefing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
