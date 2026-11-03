import * as React from 'react'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastVariant = 'default' | 'success' | 'warning' | 'destructive'

export type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: ToastVariant
}

type ToastActionType = {
  toast: (props: Omit<ToastProps, 'id'>) => string
  dismiss: (id?: string) => void
}

const TOAST_LIMIT = 4
const TOAST_REMOVE_DELAY = 5000

const createToast = (props: Omit<ToastProps, 'id'>): ToastProps => ({
  id: crypto.randomUUID(),
  ...props,
})

const ToastContext = React.createContext<ToastActionType | null>(null)

export function useToast(): ToastActionType {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider')
  }
  return context
}

function ToastIcon({ variant }: { variant: ToastVariant }) {
  if (variant === 'success') {
    return <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
  }
  if (variant === 'destructive' || variant === 'warning') {
    return (
      <AlertTriangle
        className={cn(
          'h-4 w-4',
          variant === 'destructive' ? 'text-danger' : 'text-warning'
        )}
        aria-hidden="true"
      />
    )
  }
  return <Info className="h-4 w-4 text-info" aria-hidden="true" />
}

export function ToastProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement | null {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const toast = React.useCallback((props: Omit<ToastProps, 'id'>) => {
    const newToast = createToast(props)
    setToasts((previous) => [...previous, newToast].slice(-TOAST_LIMIT))
    return newToast.id
  }, [])

  const dismiss = React.useCallback((id?: string) => {
    setToasts((previous) =>
      id ? previous.filter((item) => item.id !== id) : []
    )
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[var(--z-toast)] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:bottom-5 sm:right-5"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((item) => (
          <Toast key={item.id} {...item} dismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function Toast({
  id,
  title,
  description,
  action,
  variant = 'default',
  dismiss,
}: ToastProps & { dismiss: (id: string) => void }): React.ReactElement {
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    timer.current = setTimeout(() => dismiss(id), TOAST_REMOVE_DELAY)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [id, dismiss])

  return (
    <div
      role={variant === 'destructive' ? 'alert' : 'status'}
      className={cn(
        'toast-item pointer-events-auto flex items-start gap-3 rounded-lg border bg-surface p-3.5 shadow-md',
        variant === 'destructive' && 'border-danger/40',
        variant === 'success' && 'border-success/30',
        variant === 'warning' && 'border-warning/30',
        variant === 'default' && 'border-line'
      )}
    >
      <span className="mt-0.5 shrink-0">
        <ToastIcon variant={variant} />
      </span>
      <div className="min-w-0 flex-1">
        {title && (
          <p className="text-sm font-semibold leading-snug text-ink">{title}</p>
        )}
        {description && (
          <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">
            {description}
          </p>
        )}
        {action && (
          <div className="mt-2 text-sm font-medium text-accent">{action}</div>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismiss(id)}
        className="-mr-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-md text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        aria-label="Fechar notificação"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}

export { Toast }
