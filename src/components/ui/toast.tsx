import * as React from 'react'
import { X } from 'lucide-react'

export type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: 'default' | 'destructive'
}

type ToastActionType = {
  toast: (props: Omit<ToastProps, 'id'>) => string
  dismiss: (id?: string) => void
}

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 4000

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

export function ToastProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement | null {
  const [state, setState] = React.useState<{ toasts: ToastProps[] }>({
    toasts: [],
  })

  const toast = React.useCallback(
    (props: Omit<ToastProps, 'id'>) => {
      const newToast = createToast(props)
      setState((prev) => ({
        toasts: [...prev.toasts, newToast].slice(-TOAST_LIMIT),
      }))
      return newToast.id
    },
    []
  )

  const dismiss = React.useCallback((id?: string) => {
    setState((prev) => ({
      toasts: id ? prev.toasts.filter((t) => t.id !== id) : [],
    }))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastViewport toasts={state.toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

function ToastViewport({
  toasts,
  dismiss,
}: {
  toasts: ToastProps[]
  dismiss: (id?: string) => void
}): React.ReactElement | null {
  return (
    <div
      className="fixed top-24 right-2 z-50 flex flex-col gap-2 sm:bottom-24 sm:right-2 sm:top-auto"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((t) => (
        <Toast key={t.id} {...t} dismiss={dismiss} />
      ))}
    </div>
  )
}

function Toast({
  id,
  title,
  description,
  action,
  variant,
  dismiss,
}: ToastProps & { dismiss: (id: string) => void }): React.ReactElement | null {
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    timer.current = setTimeout(() => dismiss(id), TOAST_REMOVE_DELAY)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [id, dismiss])

  const classes = React.useMemo(
    () =>
      `flex items-center gap-3 w-full max-w-xs rounded-lg border border-border bg-surface p-4 shadow-lg animate-in fade-in slide-in-from-right-2 duration-300 ${
        variant === 'destructive' ? 'border-danger' : ''
      }`,
    [variant]
  )

  return (
    <div className={classes}>
      <div className="h-4 w-4 shrink-0" />
      <div className="flex flex-col gap-1">
        {title && <h4 className="text-sm font-semibold">{title}</h4>}
        {description && (
          <p className="text-sm text-muted">{description}</p>
        )}
      </div>
      {action && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            dismiss(id)
          }}
          className="text-xs font-medium underline text-primary"
        >
          {action}
        </button>
      )}
      <button
        onClick={() => dismiss(id)}
        className="ml-auto shrink-0 opacity-70 hover:opacity-100 rounded p-1"
        aria-label="Descartar notificação"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export { Toast }
