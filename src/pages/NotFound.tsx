import { Link } from 'react-router-dom'
import { ArrowLeft, FolderKanban, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-5 py-16">
      <p className="text-meta text-ink-subtle">Erro 404</p>
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-line bg-surface text-ink-muted">
          <SearchX className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-page-title text-ink">Esta página não existe</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            O endereço acessado não faz parte deste workspace. Verifique o link
            ou volte para uma das áreas de trabalho.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Visão geral
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/projetos">
            <FolderKanban className="h-4 w-4" aria-hidden="true" />
            Projetos
          </Link>
        </Button>
      </div>
    </div>
  )
}
