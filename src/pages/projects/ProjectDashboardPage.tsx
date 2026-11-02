import { useParams } from 'react-router-dom'
import { useStore } from '@/store'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  TasksByStatusChart,
  TasksByPriorityChart,
  CriticalTasks,
  CompletionByWeek,
  AvgCompletionTime,
} from '@/features/dashboard/charts'

export function ProjectDashboardPage() {
  const { id } = useParams<{ id: string }>()
  const { projects, tasks } = useStore()
  const project = projects.find((p) => p.id === id)
  const projTasks = tasks.filter((t) => t.projectId === id)

  if (!project || !id) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Projeto não encontrado</h1>
      </div>
    )
  }

  const total = projTasks.length
  const done = projTasks.filter((t) => t.status === 'concluido').length
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <a
            href="/projetos"
            onClick={(e) => {
              e.preventDefault()
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </a>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{project.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Progresso</span>
                <span className="ml-auto text-xs font-medium">{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full border border-border bg-accent/50">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted">
              {done} de {total} tarefa(s) concluída(s)
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-4">
        <CriticalTasks tasks={projTasks} />
        <AvgCompletionTime tasks={projTasks} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TasksByStatusChart tasks={projTasks} />
        <TasksByPriorityChart tasks={projTasks} />
      </div>

      <CompletionByWeek tasks={projTasks} />

      {projTasks.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-semibold text-sm">Sem tarefas ainda</h3>
              <p className="text-sm text-muted max-w-xs mx-auto">
                Aprove sugestões na revisão para criar as primeiras tarefas deste projeto.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
