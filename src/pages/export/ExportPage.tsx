import { useParams } from 'react-router-dom'
import { useStore } from '@/store'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Download,
  Copy,
  Printer as Print,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { generateScopeMarkdown } from '@/lib/markdown'
import * as React from 'react'

export function ExportPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { projects, suggestions, tasks, history } = useStore()
  const project = projects.find((p) => p.id === projectId)
  const projSuggestions = suggestions.filter((s) => s.projectId === projectId)
  const projTasks = tasks.filter((t) => t.projectId === projectId)
  const projHistory = history.filter((h) => h.projectId === projectId)

  const [includeDuvidas, setIncludeDuvidas] = React.useState(true)
  const [includeRiscos, setIncludeRiscos] = React.useState(true)
  const [copiado, setCopiado] = React.useState(false)

  if (!project || !projectId) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Projeto não encontrado</h1>
      </div>
    )
  }

  const markdown = generateScopeMarkdown({
    project: { name: project.name, clientId: project.clientId },
    suggestions: projSuggestions,
    tasks: projTasks,
    history: projHistory,
    includeDuvidas,
    includeRiscos,
  })

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `escopo-${project.name.toLowerCase().replace(/\s+/g, '-')}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          asChild
          onClick={(e) => {
            e.preventDefault()
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao projeto
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Exportar escopo</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{project.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs text-muted uppercase tracking-tighter font-semibold">
                Conteúdo a incluir
              </p>
              <div className="flex items-center gap-2">
                <input
                  id="incluir-duvidas"
                  type="checkbox"
                  checked={includeDuvidas}
                  onChange={(e) => setIncludeDuvidas(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-focus-ring"
                />
                <label htmlFor="incluir-duvidas" className="text-sm cursor-select-none">
                  Incluir dúvidas para o cliente
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="incluir-riscos"
                  type="checkbox"
                  checked={includeRiscos}
                  onChange={(e) => setIncludeRiscos(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-focus-ring"
                />
                <label htmlFor="incluir-riscos" className="text-sm cursor-select-none">
                  Incluir riscos identificados
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted uppercase tracking-tighter font-semibold">
                Resumo
              </p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm">{projSuggestions.length} sugestão(ões)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success" />
                <span className="text-sm">{projTasks.length} tarefa(s)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-muted" />
                <span className="text-sm">{projHistory.length} evento(s) no histórico</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-xs text-muted uppercase tracking-tighter font-semibold">
              Pré-visualização do escopo (Markdown)
            </p>
            <div className="relative overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
              <pre className="p-4 text-xs font-mono text-muted overflow-y-auto max-h-[300px] whitespace-pre-wrap">
{markdown}
              </pre>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-border bg-surface p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted">
              <FileText className="h-3 w-3" />
              <span>Formato: Markdown (.md)</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Baixar .md
              </Button>
              <Button
                variant="outline"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                {copiado ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiado ? 'Copiado!' : 'Copiar Markdown'}
              </Button>
              <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
                <Print className="h-4 w-4" />
                Imprimir/PDF
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Aviso sobre a IA */}
      <Card className="border border-border/50 bg-accent/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
            <div className="text-sm text-muted">
              <p className="font-medium mb-1">Aviso sobre a IA</p>
              <p className="text-sm">
                O conteúdo deste escopo foi gerado com base em sugestões da IA
                simulada. Revise e valide todas as informações antes de usar em
                produção.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
