import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  seedClients,
  seedProjects,
  seedSuggestions,
  seedTasks,
  seedHistory,
} from '@/data/seed'

export interface User {
  id: string
  name: string
  email: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  projectCount: number
  createdAt: string
}

export interface Project {
  id: string
  clientId: string
  name: string
  status: 'ativo' | 'pausado' | 'concluido'
  briefingText?: string
  createdAt: string
}

export interface Suggestion {
  id: string
  projectId: string
  type: 'funcionalidade' | 'requisito' | 'duvida' | 'risco' | 'entregavel'
  title: string
  description: string
  sourceQuote?: string
  priority: 'baixa' | 'media' | 'alta' | 'critica'
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'convertida'
  approvedAt?: string
  rejectedAt?: string
  convertedToTaskId?: string
}

export interface Task {
  id: string
  projectId: string
  suggestionId?: string
  title: string
  description: string
  status: 'pendente' | 'andamento' | 'revisao' | 'concluido'
  priority: 'baixa' | 'media' | 'alta' | 'critica'
  createdAt: string
  completedAt?: string
}

export interface HistoryEvent {
  id: string
  projectId: string
  type: 'criacao' | 'edicao' | 'aprovacao' | 'rejeicao' | 'conversao' | 'alteracao'
  title: string
  description: string
  createdAt: string
}

interface AppState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  hasSeeded: boolean

  login: (email: string, password: string) => void
  logout: () => void
  seedIfEmpty: () => void

  clients: Client[]
  projects: Project[]
  suggestions: Suggestion[]
  tasks: Task[]
  history: HistoryEvent[]

  addClient: (client: Omit<Client, 'id' | 'projectCount' | 'createdAt'>) => void
  updateClient: (id: string, data: Partial<Client>) => void
  deleteClient: (id: string) => void

  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => string
  updateProject: (id: string, data: Partial<Project>) => void
  deleteProject: (id: string) => void

  setProjectBriefing: (projectId: string, text: string) => void
  setProjectAnalysis: (
    projectId: string,
    suggestions: Omit<Suggestion, 'id' | 'projectId' | 'status'>[]
  ) => void

  updateSuggestion: (id: string, data: Partial<Suggestion>) => void
  approveSuggestion: (id: string) => void
  rejectSuggestion: (id: string) => void

  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => string
  updateTask: (id: string, data: Partial<Task>) => void
  deleteTask: (id: string) => void

  addHistory: (
    projectId: string,
    event: Omit<HistoryEvent, 'id' | 'projectId' | 'createdAt'>
  ) => void
}

const now = () => new Date().toISOString()

const daysAgo = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(9 + (days % 8), (days * 7) % 60, 0, 0)
  return date.toISOString()
}

const nameFromEmail = (email: string): string => {
  const local = email.split('@')[0]?.replace(/[._-]+/g, ' ').trim()
  if (!local) return 'Minha conta'
  return local
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Sessão
      user: null,
      token: null,
      isAuthenticated: false,
      hasSeeded: false,

      login: (email, _password) => {
        const user: User = {
          id: crypto.randomUUID(),
          name: nameFromEmail(email),
          email,
        }
        set({ user, token: crypto.randomUUID(), isAuthenticated: true })
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      // Dados
      clients: [],
      projects: [],
      suggestions: [],
      tasks: [],
      history: [],

      // Clientes
      addClient: (client) =>
        set((state) => ({
          clients: [
            ...state.clients,
            {
              ...client,
              id: crypto.randomUUID(),
              projectCount: 0,
              createdAt: now(),
            },
          ],
        })),
      updateClient: (id, data) =>
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === id ? { ...client, ...data } : client
          ),
        })),
      deleteClient: (id) =>
        set((state) => {
          const projectIds = new Set(
            state.projects
              .filter((project) => project.clientId === id)
              .map((project) => project.id)
          )

          return {
            clients: state.clients.filter((client) => client.id !== id),
            projects: state.projects.filter(
              (project) => project.clientId !== id
            ),
            suggestions: state.suggestions.filter(
              (suggestion) => !projectIds.has(suggestion.projectId)
            ),
            tasks: state.tasks.filter((task) => !projectIds.has(task.projectId)),
            history: state.history.filter(
              (event) => !projectIds.has(event.projectId)
            ),
          }
        }),

      // Projetos
      addProject: (project) => {
        const id = crypto.randomUUID()
        set((state) => ({
          projects: [
            ...state.projects,
            {
              ...project,
              id,
              createdAt: now(),
            },
          ],
          clients: state.clients.map((client) =>
            client.id === project.clientId
              ? { ...client, projectCount: client.projectCount + 1 }
              : client
          ),
        }))
        return id
      },
      updateProject: (id, data) =>
        set((state) => {
          const previous = state.projects.find((project) => project.id === id)
          const projects = state.projects.map((project) =>
            project.id === id ? { ...project, ...data } : project
          )

          // Keep the client project counters correct when a project changes owner.
          if (previous && data.clientId && data.clientId !== previous.clientId) {
            return {
              projects,
              clients: state.clients.map((client) => {
                if (client.id === previous.clientId) {
                  return {
                    ...client,
                    projectCount: Math.max(0, client.projectCount - 1),
                  }
                }
                if (client.id === data.clientId) {
                  return { ...client, projectCount: client.projectCount + 1 }
                }
                return client
              }),
            }
          }

          return { projects }
        }),
      deleteProject: (id) =>
        set((state) => {
          const project = state.projects.find((item) => item.id === id)
          return {
            projects: state.projects.filter((item) => item.id !== id),
            suggestions: state.suggestions.filter(
              (suggestion) => suggestion.projectId !== id
            ),
            tasks: state.tasks.filter((task) => task.projectId !== id),
            history: state.history.filter((event) => event.projectId !== id),
            clients: project
              ? state.clients.map((client) =>
                  client.id === project.clientId
                    ? {
                        ...client,
                        projectCount: Math.max(0, client.projectCount - 1),
                      }
                    : client
                )
              : state.clients,
          }
        }),

      // Briefing/análise
      setProjectBriefing: (projectId, text) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? { ...project, briefingText: text }
              : project
          ),
        })),
      setProjectAnalysis: (projectId, suggestions) =>
        set((state) => {
          const newSuggestions: Suggestion[] = suggestions.map((suggestion) => ({
            ...suggestion,
            id: crypto.randomUUID(),
            projectId,
            status: 'pendente',
          }))

          // A re-analysis replaces the previous pending proposals, but never
          // discards decisions the user already made.
          const preserved = state.suggestions.filter(
            (suggestion) =>
              suggestion.projectId !== projectId ||
              suggestion.status !== 'pendente'
          )

          return {
            suggestions: [...preserved, ...newSuggestions],
          }
        }),

      // Sugestões
      updateSuggestion: (id, data) =>
        set((state) => ({
          suggestions: state.suggestions.map((suggestion) =>
            suggestion.id === id ? { ...suggestion, ...data } : suggestion
          ),
        })),
      approveSuggestion: (id) =>
        set((state) => ({
          suggestions: state.suggestions.map((suggestion) =>
            suggestion.id === id
              ? {
                  ...suggestion,
                  status: 'aprovada',
                  approvedAt: now(),
                  rejectedAt: undefined,
                }
              : suggestion
          ),
        })),
      rejectSuggestion: (id) =>
        set((state) => ({
          suggestions: state.suggestions.map((suggestion) =>
            suggestion.id === id
              ? {
                  ...suggestion,
                  status: 'rejeitada',
                  rejectedAt: now(),
                  approvedAt: undefined,
                }
              : suggestion
          ),
        })),

      // Tarefas
      addTask: (task) => {
        const id = crypto.randomUUID()
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id,
              createdAt: now(),
              completedAt: task.status === 'concluido' ? now() : undefined,
            },
          ],
        }))
        return id
      },
      updateTask: (id, data) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task

            const nextStatus = data.status ?? task.status
            const completedAt =
              nextStatus === 'concluido'
                ? task.completedAt ?? now()
                : undefined

            return { ...task, ...data, completedAt }
          }),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      // Histórico
      addHistory: (projectId, event) =>
        set((state) => ({
          history: [
            ...state.history,
            { ...event, id: crypto.randomUUID(), projectId, createdAt: now() },
          ],
        })),

      seedIfEmpty: () => {
        const state = get()
        if (state.hasSeeded) return

        if (state.clients.length > 0) {
          set({ hasSeeded: true })
          return
        }

        const clientIds: string[] = []
        const clients: Client[] = seedClients.map((client, index) => {
          const id = crypto.randomUUID()
          clientIds.push(id)
          return {
            ...client,
            id,
            projectCount: 0,
            createdAt: daysAgo(45 - index * 10),
          }
        })

        // Seed projects point at a client by position. The two Doce Massa
        // projects are intentionally owned by the same client.
        const projectClientIndex = [0, 1, 2, 0]
        const projectIds: string[] = []
        const projects: Project[] = seedProjects.map((project, index) => {
          const id = crypto.randomUUID()
          projectIds.push(id)
          return {
            name: project.name,
            status: project.status,
            briefingText: project.briefingText,
            id,
            clientId:
              clientIds[projectClientIndex[index] ?? index % clientIds.length],
            createdAt: daysAgo(project.createdDaysAgo),
          }
        })

        const withProjectCounts = clients.map((client) => ({
          ...client,
          projectCount: projects.filter(
            (project) => project.clientId === client.id
          ).length,
        }))

        const suggestionIdByProjectAndTitle = new Map<string, string>()
        const suggestions: Suggestion[] = seedSuggestions.map((suggestion) => {
          const id = crypto.randomUUID()
          suggestionIdByProjectAndTitle.set(
            `${suggestion.projectIndex}:${suggestion.title}`,
            id
          )
          const {
            projectIndex,
            decidedDaysAgo,
            status = 'pendente',
            ...data
          } = suggestion
          const decidedAt =
            decidedDaysAgo === undefined ? undefined : daysAgo(decidedDaysAgo)

          return {
            ...data,
            id,
            projectId: projectIds[projectIndex],
            status,
            approvedAt:
              status === 'aprovada' || status === 'convertida'
                ? decidedAt
                : undefined,
            rejectedAt: status === 'rejeitada' ? decidedAt : undefined,
            convertedToTaskId: undefined,
          }
        })

        const tasks: Task[] = seedTasks.map((task) => {
          const {
            projectIndex,
            createdDaysAgo,
            completedDaysAgo,
            suggestionTitle,
            ...data
          } = task
          const id = crypto.randomUUID()
          const suggestionId = suggestionTitle
            ? suggestionIdByProjectAndTitle.get(
                `${projectIndex}:${suggestionTitle}`
              )
            : undefined

          return {
            ...data,
            id,
            projectId: projectIds[projectIndex],
            suggestionId,
            createdAt: daysAgo(createdDaysAgo),
            completedAt:
              task.status === 'concluido'
                ? daysAgo(
                    completedDaysAgo ??
                      Math.max(1, Math.min(createdDaysAgo - 1, 2))
                  )
                : undefined,
          }
        })

        const taskIdBySuggestionId = new Map(
          tasks
            .filter(
              (task): task is Task & { suggestionId: string } =>
                Boolean(task.suggestionId)
            )
            .map((task) => [task.suggestionId, task.id])
        )

        const suggestionsWithTaskLinks = suggestions.map((suggestion) => {
          if (suggestion.status !== 'convertida') return suggestion
          const taskId = taskIdBySuggestionId.get(suggestion.id)
          return taskId
            ? { ...suggestion, convertedToTaskId: taskId }
            : suggestion
        })

        const history: HistoryEvent[] = seedHistory.map((event) => {
          const {
            projectIndex,
            daysAgo: eventAge,
            ...data
          } = event
          return {
            ...data,
            id: crypto.randomUUID(),
            projectId: projectIds[projectIndex],
            createdAt: daysAgo(eventAge),
          }
        })

        set({
          hasSeeded: true,
          clients: withProjectCounts,
          projects,
          suggestions: suggestionsWithTaskLinks,
          tasks,
          history,
        })
      },
    }),
    {
      name: 'briefforge-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        hasSeeded: state.hasSeeded,
        clients: state.clients,
        projects: state.projects,
        suggestions: state.suggestions,
        tasks: state.tasks,
        history: state.history,
      }),
    }
  )
)
