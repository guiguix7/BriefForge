import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useStore()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  })

  if (isAuthenticated) navigate('/')

  const onSubmit = (data: z.infer<typeof schema>) => {
    setError(null)
    try {
      login(data.email, data.password)
      toast({ title: 'Bem-vindo', description: 'Login realizado com sucesso' })
      navigate('/')
    } catch {
      setError('Não foi possível entrar. Tente novamente.')
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-bg">
      <Card className="w-full sm:w-[420px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Entrar no BriefForge</CardTitle>
          <CardDescription>
            Transforme briefings desorganizados em requisitos, tarefas e entregáveis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                {...register('email')}
                placeholder="nome@empresa.com"
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-sm text-danger">{errors.email.message}</p>}
            </div>
            <div className="relative space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-8 p-1 text-muted hover:text-text"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7-1.274-4.057-5.064-7-9.542-7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              {errors.password && <p className="text-sm text-danger">{errors.password.message}</p>}
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                <AlertTriangle className="h-4 w-4" /> {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isAuthenticated}>
              Entrar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="border-t border-border bg-surface/50 p-4">
          <p className="text-xs text-muted text-center">
            Credenciais de teste: qualquer e-mail/senha válidos (mín. 6 chars)
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              login('demo@briefforge.com', 'demo')
              toast({ title: 'Bem-vindo', description: 'Conta de demonstração' })
              navigate('/')
            }}
          >
            Entrar com conta de demonstração
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
