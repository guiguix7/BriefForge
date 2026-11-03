import { useParams } from 'react-router-dom'
import { useStore } from '@/store'
import { ProjectNotFound } from '@/components/project/project-layout'
import { TasksView } from '@/features/tasks/TasksView'

export function TasksPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { projects } = useStore()
  const project = projects.find((item) => item.id === projectId)

  if (!project || !projectId) return <ProjectNotFound />

  return <TasksView projectId={projectId} />
}
