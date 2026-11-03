import * as React from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Moon,
  Sun,
} from 'lucide-react'
import { useStore } from '@/store'
import { useTheme } from '@/app/theme'
import { useToast } from '@/components/ui/toast'
import { BrandLockup } from '@/components/brand-mark'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Form, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { IconTooltip } from '@/components/ui/tooltip'

const schema = z.object({
  email: z.string().min(1, 'Informe seu e-mail.').email('Use um e-mail válido.'),
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres.'),
})

type LoginForm = z.infer<typeof schema>

const DEMO_EMAIL = 'demo@briefforge.com'
const DEMO_PASSWORD = 'demo123'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useStore()
  const { toast } = useToast()
  const { theme, toggleTheme } = useTheme()
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const from =
    (location.state as { from?: string } | null)?.from ?? '/'

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const onSubmit = (data: LoginForm) => {
    setError(null)
    try {
      login(data.email, data.password)
      toast({
        title: 'Sessão iniciada',
        description: 'Bem-vindo de volta ao BriefForge.',
        variant: 'success',
      })
      navigate(from, { replace: true })
    } catch {
      setError('Não foi possível iniciar a sessão. Tente novamente.')
    }
  }

  const enterDemo = () => {
    setError(null)
    login(DEMO_EMAIL, DEMO_PASSWORD)
    toast({
      title: 'Conta de demonstração',
      description: 'Dados de exemplo carregados neste navegador.',
      variant: 'success',
    })
    navigate(from, { replace: true })
  }

  return (
    <div className="grid min-h-dvh bg-canvas lg:grid-cols-[1.08fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-sidebar px-12 py-12 text-sidebar-ink lg:flex lg:flex-col">
        <div className="relative z-10 flex h-full max-w-lg flex-col">
          <BrandLockup tone="dark" size="md" showTagline />
          <div className="my-auto py-12">
            <p className="max-w-md text-[2.5rem] font-semibold leading-[1.12] tracking-[var(--tracking-tight)] text-sidebar-ink">
              Do briefing ao escopo acordado.
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-sidebar-muted">
              Um dossiê de projeto que mantém cada requisito ligado ao trecho do
              briefing, à decisão tomada e à tarefa que nasceu dela.
            </p>

            <ol className="mt-10 space-y-0 border-t border-sidebar-line">
              {[
                {
                  title: 'Cole o briefing do cliente',
                  body: 'Texto livre, do jeito que ele chegou.',
                },
                {
                  title: 'Revise cada proposta',
                  body: 'Aprove, edite ou rejeite antes de confiar.',
                },
                {
                  title: 'Leve o escopo para a entrega',
                  body: 'Tarefas rastreáveis e documento exportável.',
                },
              ].map((step, index) => (
                <li
                  key={step.title}
                  className="flex gap-4 border-b border-sidebar-line py-4"
                >
                  <span className="mt-0.5 font-mono text-xs text-sidebar-accent">
                    0{index + 1}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-sidebar-ink">
                      {step.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-sidebar-muted">
                      {step.body}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-lg border border-sidebar-line bg-sidebar-surface/70 p-4">
            <p className="text-xs font-semibold text-sidebar-ink">
              Protótipo local, sem promessas de produção
            </p>
            <p className="mt-1 text-xs leading-relaxed text-sidebar-muted">
              Os dados ficam neste navegador. A análise de IA é uma simulação
              determinística e está identificada como tal em todo o produto.
            </p>
          </div>
        </div>

        <div
          className="pointer-events-none absolute -right-24 top-1/4 h-[34rem] w-[34rem] rounded-full border border-sidebar-line/60"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-10 top-1/3 h-[20rem] w-[20rem] rounded-full border border-sidebar-line/50"
          aria-hidden="true"
        />
      </aside>

      <main className="relative flex min-h-dvh flex-col px-5 py-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-4">
          <div className="lg:hidden">
            <BrandLockup size="sm" />
          </div>
          <p className="hidden text-xs text-ink-muted lg:block">
            Sessão local · sem servidor de identidade
          </p>
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
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <div>
            <h1 className="text-page-title text-ink">Entrar no BriefForge</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Continue de onde parou. Sua sessão e seus projetos ficam neste
              navegador.
            </p>
          </div>

          <Form onSubmit={handleSubmit(onSubmit)} className="mt-8">
            <FormField
              label="E-mail"
              htmlFor="email"
              error={errors.email?.message}
              required
            >
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@empresa.com"
                  className="pl-9"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
              </div>
            </FormField>

            <FormField
              label="Senha"
              htmlFor="password"
              error={errors.password?.message}
              hint="Mínimo de 6 caracteres. Não há recuperação de senha neste protótipo."
              required
            >
              <div className="relative">
                <LockKeyhole
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  className="pl-9 pr-10"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? 'password-error' : 'password-hint'
                  }
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-sm text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </FormField>

            {error && (
              <Alert tone="danger" role="alert">
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Entrar
              {!isSubmitting && (
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </Form>

          <div className="my-6 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
              ou
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <Button type="button" variant="secondary" onClick={enterDemo} className="w-full">
            Entrar com a conta de demonstração
          </Button>
          <p className="mt-2 text-center text-xs leading-relaxed text-ink-muted">
            {DEMO_EMAIL} · senha {DEMO_PASSWORD}
          </p>

          <p className="mt-8 border-t border-line pt-4 text-xs leading-relaxed text-ink-muted">
            Este é um protótipo front-end. Nenhuma conta é criada, nenhum dado é
            enviado a um servidor e a análise de IA é simulada.
          </p>
        </div>
      </main>
    </div>
  )
}
