import { beforeEach, describe, expect, it } from 'vitest'
import { useStore, type HistoryEvent, type Suggestion, type Task } from './index'

function suggestion(overrides: Partial<Suggestion> = {}): Suggestion {
  return {
    id: 'suggestion-1',
    projectId: 'project-1',
    type: 'requisito',
    title: 'Requisito',
    description: 'Descrição',
    priority: 'alta',
    status: 'pendente',
    ...overrides,
  }
}

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    projectId: 'project-1',
    title: 'Tarefa',
    description: 'Descrição',
    status: 'pendente',
    priority: 'media',
    createdAt: '2026-10-01T12:00:00.000Z',
    ...overrides,
  }
}

function event(overrides: Partial<HistoryEvent> = {}): HistoryEvent {
  return {
    id: 'event-1',
    projectId: 'project-1',
    type: 'criacao',
    title: 'Evento',
    description: 'Descrição',
    createdAt: '2026-10-01T12:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  useStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
    hasSeeded: true,
    clients: [
      {
        id: 'client-1',
        name: 'Cliente',
        email: 'cliente@example.com',
        projectCount: 1,
        createdAt: '2026-10-01T12:00:00.000Z',
      },
    ],
    projects: [
      {
        id: 'project-1',
        clientId: 'client-1',
        name: 'Projeto',
        status: 'ativo',
        briefingText: 'Briefing',
        createdAt: '2026-10-01T12:00:00.000Z',
      },
    ],
    suggestions: [],
    tasks: [],
    history: [],
  })
})

describe('setProjectAnalysis', () => {
  it('replaces pending proposals but keeps human decisions', () => {
    useStore.setState({
      suggestions: [
        suggestion({ id: 'pending', status: 'pendente' }),
        suggestion({ id: 'approved', status: 'aprovada', type: 'funcionalidade' }),
        suggestion({ id: 'rejected', status: 'rejeitada', type: 'risco' }),
        suggestion({ id: 'converted', status: 'convertida', type: 'entregavel' }),
        suggestion({ id: 'other-project', projectId: 'another', status: 'pendente' }),
      ],
    })

    useStore.getState().setProjectAnalysis('project-1', [
      {
        type: 'funcionalidade',
        title: 'Nova proposta',
        description: 'Gerada na reanálise.',
        priority: 'media',
      },
    ])

    const state = useStore.getState()
    const ids = state.suggestions.map((item) => item.id)

    expect(ids).not.toContain('pending')
    expect(ids).toContain('approved')
    expect(ids).toContain('rejected')
    expect(ids).toContain('converted')
    expect(ids).toContain('other-project')

    const created = state.suggestions.find(
      (item) => item.title === 'Nova proposta'
    )
    expect(created?.projectId).toBe('project-1')
    expect(created?.status).toBe('pendente')
    expect(created?.id).toBeTruthy()
  })
})

describe('task lifecycle', () => {
  it('sets completedAt when a task is created as completed', () => {
    const id = useStore.getState().addTask({
      projectId: 'project-1',
      title: 'Já concluída',
      description: 'Descrição',
      status: 'concluido',
      priority: 'alta',
    })

    const created = useStore
      .getState()
      .tasks.find((item) => item.id === id)

    expect(created?.completedAt).toBeTruthy()
  })

  it('tracks completion date when status changes and clears it on reopen', () => {
    useStore.setState({ tasks: [task()] })

    useStore.getState().updateTask('task-1', {
      status: 'concluido',
    })
    const completed = useStore.getState().tasks[0]
    expect(completed.completedAt).toBeTruthy()

    useStore.getState().updateTask('task-1', {
      status: 'andamento',
    })
    expect(useStore.getState().tasks[0].completedAt).toBeUndefined()
  })
})

describe('project cascades', () => {
  it('removes project data and updates the client counter', () => {
    useStore.setState({
      suggestions: [suggestion()],
      tasks: [task()],
      history: [event()],
    })

    useStore.getState().deleteProject('project-1')

    const state = useStore.getState()
    expect(state.projects).toHaveLength(0)
    expect(state.suggestions).toHaveLength(0)
    expect(state.tasks).toHaveLength(0)
    expect(state.history).toHaveLength(0)
    expect(state.clients[0].projectCount).toBe(0)
  })

  it('removes projects when their client is deleted', () => {
    useStore.setState({
      suggestions: [suggestion()],
      tasks: [task()],
      history: [event()],
    })

    useStore.getState().deleteClient('client-1')

    const state = useStore.getState()
    expect(state.clients).toHaveLength(0)
    expect(state.projects).toHaveLength(0)
    expect(state.suggestions).toHaveLength(0)
    expect(state.tasks).toHaveLength(0)
    expect(state.history).toHaveLength(0)
  })

  it('increments the client counter when a project is created', () => {
    const id = useStore.getState().addProject({
      clientId: 'client-1',
      name: 'Segundo projeto',
      status: 'ativo',
    })

    expect(id).toBeTruthy()
    expect(useStore.getState().clients[0].projectCount).toBe(2)
  })

  it('moves the counter when a project changes client', () => {
    useStore.setState((state) => ({
      clients: [
        ...state.clients,
        {
          id: 'client-2',
          name: 'Outro cliente',
          email: 'outro@example.com',
          projectCount: 0,
          createdAt: '2026-10-01T12:00:00.000Z',
        },
      ],
    }))

    useStore.getState().updateProject('project-1', { clientId: 'client-2' })

    const [first, second] = useStore.getState().clients
    expect(first.projectCount).toBe(0)
    expect(second.projectCount).toBe(1)
  })
})
