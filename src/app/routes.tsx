import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/app/layout'
import { Login } from '@/pages/auth/Login'
import { Dashboard } from '@/pages/dashboard/Dashboard'
import { ClientsPage } from '@/pages/clients/ClientsPage'
import { ProjectsPage } from '@/pages/projects/ProjectsPage'
import { BriefingPage } from '@/pages/briefings/BriefingPage'
import { ReviewPage } from '@/pages/suggestions/ReviewPage'
import { TasksPage } from '@/pages/tasks/TasksPage'
import { HistoryPage } from '@/pages/history/HistoryPage'
import { ProjectDashboardPage } from '@/pages/projects/ProjectDashboardPage'
import { ExportPage } from '@/pages/export/ExportPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'clientes', element: <ClientsPage /> },
      { path: 'projetos', element: <ProjectsPage /> },
      { path: 'projetos/:id', element: <ProjectDashboardPage /> },
      { path: 'briefings/:projectId', element: <BriefingPage /> },
      { path: 'revisao/:projectId', element: <ReviewPage /> },
      { path: 'tarefas/:projectId', element: <TasksPage /> },
      { path: 'historico/:projectId', element: <HistoryPage /> },
      { path: 'exportar/:projectId', element: <ExportPage /> },
    ],
  },
  { path: '/login', element: <Login /> },
])
