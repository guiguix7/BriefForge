import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import { useTheme } from '@/app/theme'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  LogOut,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import * as React from 'react'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/projetos', label: 'Projetos', icon: Briefcase },
]

export function Layout() {
  const { user, logout } = useStore()
  const { toggleTheme, theme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const breadcrumbs = getBreadcrumbs(location.pathname)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Barra lateral desktop */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-surface transition-transform duration-300 transform -translate-x-full lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen && 'translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between gap-4 border-b border-border bg-surface p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                BF
              </div>
              <span className="font-semibold tracking-tight">BriefForge</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-muted hover:text-text"
              aria-label="Fechar menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted hover:text-text hover:bg-accent'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </nav>
          <div className="p-4 border-t border-border bg-surface">
            <button
              onClick={() => toggleTheme()}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-text hover:bg-accent transition-colors"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
              {theme === 'dark' ? 'Escuro' : 'Claro'}
            </button>
            <div className="mt-4 pt-4 border-t border-border">
              <button
                onClick={logout}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-accent transition-colors"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay do sidebar mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Área de conteúdo */}
      <div className={cn('flex-1 flex flex-col overflow-hidden lg:ml-64')}>
        {/* Topbar mobile */}
        <div className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-muted hover:text-text"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-sm font-semibold">{user?.name}</span>
            <button onClick={logout} className="p-1 text-danger" aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Conteúdo da rota */}
        <main className="flex-1 overflow-y-auto bg-bg p-4 lg:p-6">
          <Outlet context={{ breadcrumbs }} />
        </main>

        {/* Navegação inferior mobile */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface px-4 pb-2 lg:hidden">
          <div className="flex justify-around">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 text-sm',
                    isActive ? 'text-primary' : 'text-muted hover:text-text'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className={cn('text-[10px] font-medium', isActive ? 'font-semibold' : '')}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>

      <div id="toast-container" />
    </div>
  )
}

function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const crumbs: { label: string; href: string }[] = [{ label: 'Dashboard', href: '/' }]
  if (pathname.startsWith('/clientes')) crumbs.push({ label: 'Clientes', href: '/clientes' })
  if (pathname.startsWith('/projetos') && !pathname.match(/\/\d+\//)) {
    crumbs.push({ label: 'Projetos', href: '/projetos' })
  }
  if (pathname.match(/projetos\/(\d+)/)) {
    crumbs.push({ label: 'Projeto', href: '/projetos' })
  }
  if (pathname.startsWith('/briefings/')) crumbs.push({ label: 'Briefing', href: pathname })
  if (pathname.startsWith('/revisao/')) crumbs.push({ label: 'Revisão', href: pathname })
  if (pathname.startsWith('/tarefas/')) crumbs.push({ label: 'Tarefas', href: pathname })
  if (pathname.startsWith('/historico/')) crumbs.push({ label: 'Histórico', href: pathname })
  if (pathname.startsWith('/exportar/')) crumbs.push({ label: 'Exportar', href: pathname })
  return crumbs
}

export function Breadcrumb() {
  const location = useLocation()
  const crumbs = getBreadcrumbs(location.pathname)
  if (crumbs.length <= 1) return null
  return (
    <nav className="flex items-center gap-1 text-xs text-muted mb-4" aria-label="Navegação">
      {crumbs.map((crumb, i) => (
        <React.Fragment key={crumb.href}>
          {i > 0 && (
            <span className="mx-1">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
          <span
            className={cn(
              i === crumbs.length - 1 ? 'font-medium text-text' : 'hover:text-text underline underline-offset-4',
              'transition-colors'
            )}
          >
            {crumb.label}
          </span>
        </React.Fragment>
      ))}
    </nav>
  )
}
