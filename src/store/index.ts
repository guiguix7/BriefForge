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
  // Sessão
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => void
  logout: () => void
  seedIfEmpty: () => void

  // Dados
  clients: Client[]
  projects: Project[]
  suggestions: Suggestion[]
  tasks: Task[]
  history: HistoryEvent[]

  // Clientes
  addClient: (client: Omit<Client, 'id' | 'projectCount' | 'createdAt'>) => void
  updateClient: (id: string, data: Partial<Client>) => void
  deleteClient: (id: string) => void

  // Projetos
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void
  updateProject: (id: string, data: Partial<Project>) => void
  deleteProject: (id: string) => void

  // Briefing/análise
  setProjectBriefing: (projectId: string, text: string) => void
  setProjectAnalysis: (
    projectId: string,
    suggestions: Omit<Suggestion, 'id' | 'projectId' | 'status'>[]
  ) => void

  // Sugestões
  updateSuggestion: (id: string, data: Partial<Suggestion>) => void
  approveSuggestion: (id: string) => void
  rejectSuggestion: (id: string) => void

  // Tarefas
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: string, data: Partial<Task>) => void
  deleteTask: (id: string) => void

  // Histórico
  addHistory: (
    projectId: string,
    event: Omit<HistoryEvent, 'id' | 'projectId' | 'createdAt'>
  ) => void
}

const now = () => new Date().toISOString()

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Sessão
      user: null,
      token: null,
      isAuthenticated: false,
      login: (_email, _password) => {
        const user: User = { id: '1', name: 'Usuário Demo', email: 'demo@briefforge.com' }
        set({ user, token: 'demo-token', isAuthenticated: true })
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      // Dados (preenchidos via seed quando o localStorage estiver vazio)
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
            { ...client, id: crypto.randomUUID(), projectCount: 0, createdAt: now() },
          ],
        })),
      updateClient: (id, data) =>
        set((state) => ({
          clients: state.clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      deleteClient: (id) =>
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
          projects: state.projects.filter((p) => p.clientId !== id),
        })),

      // Projetos
      addProject: (project) =>
        set((state) => ({
          projects: [
            ...state.projects,
            { ...project, id: crypto.randomUUID(), createdAt: now() },
          ],
          clients: state.clients.map((c) =>
            c.id === project.clientId ? { ...c, projectCount: c.projectCount + 1 } : c
          ),
        })),
      updateProject: (id, data) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          suggestions: state.suggestions.filter((s) => s.projectId !== id),
          tasks: state.tasks.filter((t) => t.projectId !== id),
          history: state.history.filter((h) => h.projectId !== id),
        })),

      // Briefing/análise
      setProjectBriefing: (projectId, text) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, briefingText: text } : p
          ),
        })),
      setProjectAnalysis: (projectId, suggestions) =>
        set((state) => {
          const newSuggestions: Suggestion[] = suggestions.map((s) => ({
            ...s,
            id: crypto.randomUUID(),
            projectId,
            status: 'pendente',
          }))
          return {
            suggestions: [...state.suggestions, ...newSuggestions],
          }
        }),

      // Sugestões
      updateSuggestion: (id, data) =>
        set((state) => ({
          suggestions: state.suggestions.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
        })),
      approveSuggestion: (id) =>
        set((state) => ({
          suggestions: state.suggestions.map((s) =>
            s.id === id ? { ...s, status: 'aprovada', approvedAt: now() } : s
          ),
        })),
      rejectSuggestion: (id) =>
        set((state) => ({
          suggestions: state.suggestions.map((s) =>
            s.id === id ? { ...s, status: 'rejeitada', rejectedAt: now() } : s
          ),
        })),

      // Tarefas
      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, { ...task, id: crypto.randomUUID(), createdAt: now() }],
        })),
      updateTask: (id, data) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),
      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      // Histórico
      addHistory: (projectId, event) =>
        set((state) => ({
          history: [
            ...state.history,
            { ...event, id: crypto.randomUUID(), projectId, createdAt: now() },
          ],
        })),

      seedIfEmpty: () => {
        const state = useStore.getState()
        if (state.clients.length > 0) return

        const clientIds: string[] = []
        seedClients.forEach((c) => {
          const id = crypto.randomUUID()
          clientIds.push(id)
          set((s) => ({
            clients: [
              ...s.clients,
              { ...c, id, projectCount: 0, createdAt: now() },
            ],
          }))
        })

        const projectIds: string[] = []
        seedProjects.forEach((p, i) => {
          const id = crypto.randomUUID()
          projectIds.push(id)
          const clientId = clientIds[i % clientIds.length]
          set((s) => ({
            projects: [...s.projects, { ...p, id, clientId, createdAt: now() }],
            clients: s.clients.map((c) =>
              c.id === clientId ? { ...c, projectCount: c.projectCount + 1 } : c
            ),
          }))
        })

        seedSuggestions.forEach((s, i) => {
          const projectId = projectIds[i % projectIds.length]
          const id = crypto.randomUUID()
          set((st) => ({
            suggestions: [
              ...st.suggestions,
              { ...s, id, projectId, status: 'pendente' },
            ],
          }))
        })

        seedTasks.forEach((t, i) => {
          const projectId = projectIds[i % projectIds.length]
          const id = crypto.randomUUID()
          set((st) => ({
            tasks: [...st.tasks, { ...t, id, projectId, createdAt: now() }],
          }))
        })

        seedHistory.forEach((h, i) => {
          const projectId = projectIds[i % projectIds.length]
          const id = crypto.randomUUID()
          set((st) => ({
            history: [
              ...st.history,
              { ...h, id, projectId, createdAt: now() },
            ],
          }))
        })
      },
    }),
    {
      name: 'briefforge-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

