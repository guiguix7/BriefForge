import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@/app/theme'
import { ToastProvider } from '@/components/ui/toast'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import './index.css'
import { router } from '@/app/routes'
import { useStore } from '@/store'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

useStore.getState().seedIfEmpty()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider delayDuration={350}>
        <ToastProvider>
          <ErrorBoundary>
            <RouterProvider router={router} />
          </ErrorBoundary>
        </ToastProvider>
      </TooltipProvider>
      <Analytics />
      <SpeedInsights />
    </ThemeProvider>
  </StrictMode>
)
