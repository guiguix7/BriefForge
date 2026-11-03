import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

const Form = React.forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement>
>(({ className, ...props }, ref) => (
  <form ref={ref} className={cn('space-y-5', className)} {...props} />
))
Form.displayName = 'Form'

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: FormFieldProps) {
  const errorId = `${htmlFor}-error`
  const hintId = `${htmlFor}-hint`

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {hint && !error && (
        <p id={hintId} className="text-xs leading-relaxed text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium leading-relaxed text-danger"
        >
          {error}
        </p>
      )}
    </div>
  )
}

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    role="alert"
    className={cn('mt-1.5 text-xs font-medium text-danger', className)}
    {...props}
  >
    {children}
  </p>
))
FormMessage.displayName = 'FormMessage'

const FormHint = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('mt-1.5 text-xs text-ink-muted', className)}
    {...props}
  />
))
FormHint.displayName = 'FormHint'

export { Form, FormField, FormMessage, FormHint }
