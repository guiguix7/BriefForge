import * as React from 'react'
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  Users,
  X,
} from 'lucide-react'
import { useStore } from '@/store'
import { useTheme } from '@/app/theme'
import { BrandLockup } from '@/components/brand-mark'
import { Avatar } from '@/components/ui/avatar'
import { Breadcrumbs, type Crumb } from '@/components/ui/breadcrumbs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconTooltip } from '@/components/ui/tooltip'
import { PROJECT_STATUS } from '@/lib/domain'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/clientes', label: 'Clientes', icon: Users, end: false },
  { to: '/projetos', label: 'Projetos', icon: FolderKanban, end: false },
]

const SUBPAGE_LABELS: Record<string, string> = {
  briefing: 'Briefing',
  revisao: 'Revisão',
  tarefas: 'Tarefas',
  historico: 'Histórico',
  exportar: 'Exportar',
}

function useCrumbs(): Crumb[] {
  const { pathname } = useLocation()
  const projects = useStore((state) => state.projects)

  if (pathname === '/') return [{ label: 'Visão geral' }]
  if (pathname.startsWith('/clientes')) return [{ label: 'Clientes' }]

  if (pathname.startsWith('/projetos')) {
    const match = pathname.match(/^\/projetos\/([^/]+)(?:\/([^/]+))?/)
    if (!match) return [{ label: 'Projetos' }]

    const project = projects.find((item) => item.id === match[1])
    const subpage = match[2] ? SUBPAGE_LABELS[match[2]] : undefined
    const crumbs: Crumb[] = [{ label: 'Projetos', href: '/projetos' }]

    crumbs.push({
      label: project?.name ?? 'Projeto não encontrado',
      href: subpage ? `/projetos/${match[1]}` : undefined,
    })

    if (subpage) crumbs.push({ label: subpage })
    return crumbs
  }

  return [{ label: 'Página não encontrada' }]
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout, projects, clients } = useStore()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const recentProjects = React.useMemo(() => {
    const active = projects.filter((project) => project.status === 'ativo')
    const rest = projects.filter((project) => project.status !== 'ativo')
    return [...active, ...rest].slice(0, 5)
  }, [projects])

  const clientName = (clientId: string) =>
    clients.find((client) => client.id === clientId)?.name ?? 'Cliente removido'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-ink">
      <div className="flex h-[var(--topbar-height)] shrink-0 items-center justify-between gap-3 border-b border-sidebar-line px-4">
        <Link
          to="/"
          onClick={onNavigate}
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-accent focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
          aria-label="BriefForge — ir para a visão geral"
        >
          <BrandLockup tone="dark" showTagline />
        </Link>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="grid h-8 w-8 place-items-center rounded-md text-sidebar-muted transition-colors hover:bg-sidebar-surface hover:text-sidebar-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-accent"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <nav
        className="min-h-0 flex-1 overflow-y-auto px-3 py-4"
        aria-label="Navegação principal"
      >
        <p className="px-2 pb-2 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-sidebar-muted/75">
          Workspace
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-accent',
                      isActive
                        ? 'bg-sidebar-surface text-sidebar-ink'
                        : 'text-sidebar-muted hover:bg-sidebar-surface/70 hover:text-sidebar-ink'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isActive ? 'text-sidebar-accent' : 'text-sidebar-muted'
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                      {isActive && (
                        <span
                          className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-accent"
                          aria-hidden="true"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>

        <div className="mt-6">
          <div className="flex items-center justify-between px-2 pb-2">
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-sidebar-muted/75">
              Projetos recentes
            </p>
            <Link
              to="/projetos"
              onClick={onNavigate}
              className="rounded-sm text-[0.6875rem] font-medium text-sidebar-muted transition-colors hover:text-sidebar-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-accent"
            >
              Ver todos
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <p className="px-2 py-2 text-xs leading-relaxed text-sidebar-muted">
              Nenhum projeto ainda.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {recentProjects.map((project) => {
                const active =
                  location.pathname === `/projetos/${project.id}` ||
                  location.pathname.startsWith(`/projetos/${project.id}/`)
                const status = PROJECT_STATUS[project.status]
                return (
                  <li key={project.id}>
                    <Link
                      to={`/projetos/${project.id}`}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group flex items-start gap-2 rounded-md px-2 py-2 transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-accent',
                        active
                          ? 'bg-sidebar-surface'
                          : 'hover:bg-sidebar-surface/70'
                      )}
                    >
                      <span
                        className={cn(
                          'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                          project.status === 'ativo'
                            ? 'bg-sidebar-accent'
                            : project.status === 'pausado'
                              ? 'bg-warning'
                              : 'bg-sidebar-muted/60'
                        )}
                        title={status.label}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-[0.8125rem] font-medium leading-5 text-sidebar-ink">
                          {project.name}
                        </span>
                        <span className="block truncate text-[0.6875rem] leading-4 text-sidebar-muted">
                          {clientName(project.clientId)}
                        </span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </nav>

      <div className="shrink-0 border-t border-sidebar-line p-3">
        <div className="flex items-center gap-2.5 rounded-md bg-sidebar-surface/70 px-2.5 py-2">
          <Avatar
            name={user?.name ?? 'Conta'}
            size="sm"
            className="border-sidebar-line bg-sidebar text-sidebar-ink"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.8125rem] font-medium text-sidebar-ink">
              {user?.name ?? 'Conta local'}
            </p>
            <p className="truncate text-[0.6875rem] text-sidebar-muted">
              {user?.email ?? 'sessão de demonstração'}
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-8 flex-1 items-center gap-2 rounded-md px-2 text-xs font-medium text-sidebar-muted transition-colors hover:bg-sidebar-surface hover:text-sidebar-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-accent"
          >
            {theme === 'dark' ? (
              <Sun className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Moon className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
          </button>
          <IconTooltip label="Sair da sessão">
            <button
              type="button"
              onClick={handleLogout}
              className="grid h-8 w-8 place-items-center rounded-md text-sidebar-muted transition-colors hover:bg-sidebar-surface hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-accent"
              aria-label="Sair da sessão"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </IconTooltip>
        </div>
        <p className="mt-2 px-1 text-[0.625rem] leading-relaxed text-sidebar-muted/80">
          Demonstração local · dados no navegador
        </p>
      </div>
    </div>
  )
}

export function Layout() {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const { user, logout } = useStore()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const crumbs = useCrumbs()

  React.useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const currentLabel = crumbs[crumbs.length - 1]?.label ?? 'BriefForge'

  return (
    <div className="min-h-dvh bg-canvas">
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>

      <aside className="no-print fixed inset-y-0 left-0 z-[var(--z-sidebar)] hidden w-[var(--sidebar-width)] lg:block">
        <SidebarBody />
      </aside>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent
          hideClose
          className="mobile-nav fixed left-0 top-0 h-dvh w-[min(18rem,86vw)] max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-0 border-r border-sidebar-line bg-sidebar p-0 shadow-lg"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">Menu de navegação</DialogTitle>
          <SidebarBody onNavigate={() => setMobileOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="flex min-h-dvh flex-col lg:pl-[var(--sidebar-width)] print:pl-0">
        <header className="no-print sticky top-0 z-[var(--z-sticky)] flex h-[var(--topbar-height)] shrink-0 items-center gap-3 border-b border-line bg-surface/92 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="-ml-1 grid h-9 w-9 place-items-center rounded-md text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring lg:hidden"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="lg:hidden">
            <BrandLockup size="sm" />
          </div>

          <div className="hidden min-w-0 flex-1 lg:block">
            <Breadcrumbs items={crumbs} compact />
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-line bg-surface-muted px-2.5 py-1 text-[0.6875rem] font-medium text-ink-muted sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              Demonstração
            </span>

            <IconTooltip
              label={theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={toggleTheme}
                aria-label={
                  theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'
                }
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </IconTooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 items-center gap-2 rounded-md border border-transparent px-1.5 text-sm transition-colors hover:border-line hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                  aria-label="Abrir menu da conta"
                >
                  <Avatar name={user?.name ?? 'Conta'} size="sm" />
                  <span className="hidden max-w-32 truncate text-sm font-medium text-ink md:inline">
                    {user?.name ?? 'Conta'}
                  </span>
                  <ChevronDown
                    className="hidden h-3.5 w-3.5 text-ink-muted md:block"
                    aria-hidden="true"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <span className="block truncate text-sm font-semibold text-ink">
                    {user?.name ?? 'Conta local'}
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-normal text-ink-muted">
                    {user?.email ?? 'sessão de demonstração'}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={toggleTheme}>
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Moon className="h-4 w-4" aria-hidden="true" />
                  )}
                  {theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={handleLogout}
                  className="text-danger focus:text-danger"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sair da sessão
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <span className="sr-only" aria-live="polite">
            Página atual: {currentLabel}
          </span>
        </header>

        <main
          id="conteudo"
          tabIndex={-1}
          className="flex-1 print:block"
        >
          <div className="mx-auto w-full max-w-[var(--content-max)] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 print:max-w-none print:p-0">
            <Outlet />
          </div>
        </main>

        <footer className="no-print border-t border-line px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[0.6875rem] text-ink-muted">
            <p>
              BriefForge · protótipo front-end com dados locais e análise
              simulada.
            </p>
            <p className="font-mono">v0.1 · sem backend</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
