import type {
  HistoryEvent,
  Project,
  Suggestion,
  Task,
} from '@/store'

export type Tone =
  | 'neutral'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'

export const PROJECT_STATUS: Record<
  Project['status'],
  { label: string; tone: Tone }
> = {
  ativo: { label: 'Ativo', tone: 'success' },
  pausado: { label: 'Pausado', tone: 'warning' },
  concluido: { label: 'Concluído', tone: 'neutral' },
}

export const TASK_STATUS: Record<
  Task['status'],
  { label: string; shortLabel: string; tone: Tone; order: number }
> = {
  pendente: {
    label: 'Pendente',
    shortLabel: 'Pendente',
    tone: 'neutral',
    order: 0,
  },
  andamento: {
    label: 'Em andamento',
    shortLabel: 'Andamento',
    tone: 'info',
    order: 1,
  },
  revisao: {
    label: 'Em revisão',
    shortLabel: 'Revisão',
    tone: 'warning',
    order: 2,
  },
  concluido: {
    label: 'Concluído',
    shortLabel: 'Concluído',
    tone: 'success',
    order: 3,
  },
}

export const TASK_PRIORITY: Record<
  Task['priority'],
  { label: string; tone: Tone; order: number }
> = {
  baixa: { label: 'Baixa', tone: 'neutral', order: 0 },
  media: { label: 'Média', tone: 'info', order: 1 },
  alta: { label: 'Alta', tone: 'warning', order: 2 },
  critica: { label: 'Crítica', tone: 'danger', order: 3 },
}

export const SUGGESTION_TYPE: Record<
  Suggestion['type'],
  { label: string; plural: string; tone: Tone; description: string }
> = {
  funcionalidade: {
    label: 'Funcionalidade',
    plural: 'Funcionalidades',
    tone: 'info',
    description: 'Comportamentos e recursos que o produto deve oferecer.',
  },
  requisito: {
    label: 'Requisito',
    plural: 'Requisitos',
    tone: 'accent',
    description: 'Condições e regras que precisam ser atendidas.',
  },
  duvida: {
    label: 'Dúvida',
    plural: 'Dúvidas',
    tone: 'warning',
    description: 'Pontos que precisam de confirmação do cliente.',
  },
  risco: {
    label: 'Risco',
    plural: 'Riscos',
    tone: 'danger',
    description: 'Fatores que podem afetar prazo, custo ou escopo.',
  },
  entregavel: {
    label: 'Entregável',
    plural: 'Entregáveis',
    tone: 'success',
    description: 'Resultados concretos que o projeto deve produzir.',
  },
}

export const SUGGESTION_STATUS: Record<
  Suggestion['status'],
  { label: string; tone: Tone }
> = {
  pendente: { label: 'Pendente', tone: 'neutral' },
  aprovada: { label: 'Aprovada', tone: 'success' },
  rejeitada: { label: 'Rejeitada', tone: 'danger' },
  convertida: { label: 'Convertida em tarefa', tone: 'info' },
}

export const HISTORY_TYPE: Record<
  HistoryEvent['type'],
  { label: string; tone: Tone }
> = {
  criacao: { label: 'Criação', tone: 'accent' },
  edicao: { label: 'Edição', tone: 'info' },
  aprovacao: { label: 'Aprovação', tone: 'success' },
  rejeicao: { label: 'Rejeição', tone: 'danger' },
  conversao: { label: 'Conversão', tone: 'warning' },
  alteracao: { label: 'Alteração', tone: 'neutral' },
}

export const SUGGESTION_TYPE_ORDER: Suggestion['type'][] = [
  'requisito',
  'funcionalidade',
  'entregavel',
  'duvida',
  'risco',
]

export const CONVERTIBLE_TYPES: Suggestion['type'][] = [
  'requisito',
  'funcionalidade',
  'entregavel',
]

export function isConvertible(suggestion: Suggestion): boolean {
  return (
    CONVERTIBLE_TYPES.includes(suggestion.type) &&
    suggestion.status === 'aprovada' &&
    !suggestion.convertedToTaskId
  )
}

export function isReviewable(suggestion: Suggestion): boolean {
  return suggestion.status === 'pendente'
}

export function isApprovedSuggestion(suggestion: Suggestion): boolean {
  return (
    suggestion.status === 'aprovada' || suggestion.status === 'convertida'
  )
}

export function projectTasks(projectId: string, tasks: Task[]): Task[] {
  return tasks.filter((task) => task.projectId === projectId)
}

export function projectProgress(projectId: string, tasks: Task[]): number {
  const items = projectTasks(projectId, tasks)
  if (items.length === 0) return 0
  const done = items.filter((task) => task.status === 'concluido').length
  return Math.round((done / items.length) * 100)
}

export function pendingReviewCount(
  projectId: string,
  suggestions: Suggestion[]
): number {
  return suggestions.filter(
    (suggestion) =>
      suggestion.projectId === projectId && suggestion.status === 'pendente'
  ).length
}

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`
): string {
  return `${count} ${count === 1 ? singular : plural}`
}

export function nextProjectAction(
  project: Project,
  suggestions: Suggestion[],
  tasks: Task[]
): { label: string; href: string; description: string } {
  const pending = pendingReviewCount(project.id, suggestions)
  const hasBriefing = Boolean(project.briefingText?.trim())
  const projectTaskList = projectTasks(project.id, tasks)
  const openTasks = projectTaskList.filter(
    (task) => task.status !== 'concluido'
  ).length

  if (!hasBriefing) {
    return {
      label: 'Registrar briefing',
      href: `/projetos/${project.id}/briefing`,
      description: 'Cole o material do cliente para iniciar a análise.',
    }
  }

  if (pending > 0) {
    return {
      label: 'Revisar análise',
      href: `/projetos/${project.id}/revisao`,
      description: `${pluralize(pending, 'item pendente', 'itens pendentes')} de revisão.`,
    }
  }

  if (projectTaskList.length === 0) {
    return {
      label: 'Gerar tarefas',
      href: `/projetos/${project.id}/revisao`,
      description: 'Aprove os itens que devem entrar no escopo.',
    }
  }

  if (openTasks > 0) {
    return {
      label: 'Acompanhar tarefas',
      href: `/projetos/${project.id}/tarefas`,
      description: `${pluralize(openTasks, 'tarefa aberta', 'tarefas abertas')}.`,
    }
  }

  return {
    label: 'Exportar escopo',
    href: `/projetos/${project.id}/exportar`,
    description: 'O trabalho está concluído. Gere o documento final.',
  }
}
