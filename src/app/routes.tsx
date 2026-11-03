import { createBrowserRouter, Navigate, Outlet, useLocation, useParams } from 'react-router-dom'
import { Layout } from '@/app/layout'
import { useStore } from '@/store'
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
import { ProjectLayout } from '@/components/project/project-layout'
import { NotFoundPage } from '@/pages/NotFound'

function RequireAuth() {
  const isAuthenticated = useStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  return <Outlet />
}

function LegacyProjectRedirect({ segment }: { segment: string }) {
  const { projectId } = useParams<{ projectId: string }>()
  return <Navigate to={`/projetos/${projectId}/${segment}`} replace />
}

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <Layout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'clientes', element: <ClientsPage /> },
          { path: 'projetos', element: <ProjectsPage /> },
          {
            path: 'projetos/:projectId',
            element: <ProjectLayout />,
            children: [
              { index: true, element: <ProjectDashboardPage /> },
              { path: 'briefing', element: <BriefingPage /> },
              { path: 'revisao', element: <ReviewPage /> },
              { path: 'tarefas', element: <TasksPage /> },
              { path: 'historico', element: <HistoryPage /> },
              { path: 'exportar', element: <ExportPage /> },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      {
        path: '/briefings/:projectId',
        element: <LegacyProjectRedirect segment="briefing" />,
      },
      {
        path: '/revisao/:projectId',
        element: <LegacyProjectRedirect segment="revisao" />,
      },
      {
        path: '/tarefas/:projectId',
        element: <LegacyProjectRedirect segment="tarefas" />,
      },
      {
        path: '/historico/:projectId',
        element: <LegacyProjectRedirect segment="historico" />,
      },
      {
        path: '/exportar/:projectId',
        element: <LegacyProjectRedirect segment="exportar" />,
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
