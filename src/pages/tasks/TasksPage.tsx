import { useParams } from 'react-router-dom'
import { useStore } from '@/store'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TasksView } from '@/features/tasks/TasksView'
export function TasksPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { projects } = useStore()
  const project = projects.find((p) => p.id === projectId)

  if (!project || !projectId) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Projeto não encontrado</h1>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <a
            href={`/projetos/${projectId}`}
            onClick={(e) => {
              e.preventDefault()
              // Navegação tratada pelo router
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao projeto
          </a>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Tarefas</h1>
      </div>
      <TasksView projectId={projectId} />
    </div>
  )
}
