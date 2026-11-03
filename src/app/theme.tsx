import * as React from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = React.createContext<{
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
} | null>(null)

const STORAGE_KEY = 'briefforge-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'

  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(getInitialTheme)
  const hasSavedPreference = React.useRef(
    typeof window !== 'undefined' &&
      (window.localStorage.getItem(STORAGE_KEY) === 'light' ||
        window.localStorage.getItem(STORAGE_KEY) === 'dark')
  )

  React.useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.style.colorScheme = theme

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#101512' : '#f3f4ef')
    }

    if (hasSavedPreference.current) {
      window.localStorage.setItem(STORAGE_KEY, theme)
    }
  }, [theme])

  React.useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event: MediaQueryListEvent) => {
      if (hasSavedPreference.current) return
      setThemeState(event.matches ? 'dark' : 'light')
    }

    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  const setTheme = React.useCallback((next: Theme) => {
    hasSavedPreference.current = true
    setThemeState(next)
  }, [])

  const toggleTheme = React.useCallback(() => {
    hasSavedPreference.current = true
    setThemeState((current) => (current === 'light' ? 'dark' : 'light'))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  }
  return context
}
