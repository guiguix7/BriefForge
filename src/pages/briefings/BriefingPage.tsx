import * as React from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  FlaskConical,
  Loader2,
  Save,
  ScanSearch,
  Sparkles,
} from 'lucide-react'
import { useStore } from '@/store'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { SectionHeading } from '@/components/ui/section-heading'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { BRIEFING_EXEMPLO } from '@/data/seed'
import {
  AI_SCENARIOS,
  type AiScenario,
} from '@/features/analysis/ai-provider'
import { useAiAnalysis } from '@/features/analysis/use-ai-analysis'
import { pluralize } from '@/lib/domain'
import { formatDateTime } from '@/lib/utils'

type SaveState = 'idle' | 'saving' | 'saved'

const MINIMUM_LENGTH = 30

export function BriefingPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { projects, suggestions, history, setProjectBriefing } = useStore()
  const { toast } = useToast()
  const project = projects.find((item) => item.id === projectId)

  const [text, setText] = React.useState(project?.briefingText ?? '')
  const [saveState, setSaveState] = React.useState<SaveState>('idle')
  const [savedAt, setSavedAt] = React.useState<Date | null>(null)
  const [scenario, setScenario] = React.useState<AiScenario>('sucesso')
  const [confirmExample, setConfirmExample] = React.useState(false)
  const [lastRun, setLastRun] = React.useState<{
    total: number
  } | null>(null)
  const savedText = React.useRef(project?.briefingText ?? '')

  const { analyze, isAnalyzing, error, resetError } = useAiAnalysis(
    projectId ?? ''
  )

  const projectSuggestions = suggestions.filter(
    (suggestion) => suggestion.projectId === projectId
  )
  const pending = projectSuggestions.filter(
    (suggestion) => suggestion.status === 'pendente'
  ).length
  const approved = projectSuggestions.filter(
    (suggestion) =>
      suggestion.status === 'aprovada' || suggestion.status === 'convertida'
  ).length
  const lastAnalysis = [...history]
    .filter(
      (event) =>
        event.projectId === projectId &&
        event.title.toLowerCase().includes('análise')
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0]

  // Reset the editor when the route changes to another project.
  React.useEffect(() => {
    const initial = projects.find((item) => item.id === projectId)?.briefingText ?? ''
    setText(initial)
    savedText.current = initial
    setSaveState('idle')
    setSavedAt(null)
    setLastRun(null)
    resetError()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  // Debounced local autosave. The store persists to localStorage; this delay
  // keeps every keystroke from rewriting the whole project record.
  React.useEffect(() => {
    if (!projectId || text === savedText.current) return

    setSaveState('saving')
    const timer = window.setTimeout(() => {
      setProjectBriefing(projectId, text)
      savedText.current = text
      setSaveState('saved')
      setSavedAt(new Date())
    }, 650)

    return () => window.clearTimeout(timer)
  }, [text, projectId, setProjectBriefing])

  if (!project || !projectId) return null

  const charCount = text.length
  const wordCount = text.split(/\s+/).filter(Boolean).length
  const canAnalyze = text.trim().length >= MINIMUM_LENGTH

  const saveLabel =
    saveState === 'saving'
      ? 'Salvando rascunho…'
      : saveState === 'saved' && savedAt
        ? `Salvo às ${savedAt.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}`
        : 'Rascunho salvo localmente'

  const persistNow = (value: string) => {
    setProjectBriefing(projectId, value)
    savedText.current = value
    setSaveState('saved')
    setSavedAt(new Date())
  }

  const loadExample = () => {
    setConfirmExample(false)
    setText(BRIEFING_EXEMPLO)
    persistNow(BRIEFING_EXEMPLO)
    resetError()
    setLastRun(null)
    toast({
      title: 'Briefing de exemplo carregado',
      description:
        'O texto é um relato fictício de cliente. Edite ou analise como quiser.',
    })
  }

  const handleExample = () => {
    if (text.trim() && text !== BRIEFING_EXEMPLO) {
      setConfirmExample(true)
      return
    }
    loadExample()
  }

  const handleAnalyze = async () => {
    if (!canAnalyze) {
      toast({
        title: 'Briefing muito curto',
        description: `Adicione pelo menos ${MINIMUM_LENGTH} caracteres antes de analisar.`,
        variant: 'destructive',
      })
      return
    }

    persistNow(text)
    resetError()
    setLastRun(null)
    const total = await analyze(text, scenario)
    if (total !== null) {
      setLastRun({ total })
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="min-w-0 space-y-5">
        <SectionHeading
          title="Briefing do cliente"
          description="Cole o material bruto. O rascunho é salvo neste navegador enquanto você escreve."
          actions={
            <Badge tone={canAnalyze ? 'success' : 'warning'} dot>
              {canAnalyze
                ? 'Pronto para analisar'
                : `Mínimo de ${MINIMUM_LENGTH} caracteres`}
            </Badge>
          }
        />

        <div className="overflow-hidden rounded-lg border border-line bg-surface focus-within:ring-2 focus-within:ring-accent/20">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-muted/30 px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              Texto integral
            </div>
            <p
              className="inline-flex items-center gap-1.5 text-xs text-ink-muted"
              role="status"
              aria-live="polite"
            >
              {saveState === 'saving' ? (
                <Loader2
                  className="h-3.5 w-3.5 animate-spin text-accent"
                  aria-hidden="true"
                />
              ) : (
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {saveLabel}
            </p>
          </div>

          <label htmlFor="briefing-text" className="sr-only">
            Texto do briefing do cliente
          </label>
          <Textarea
            id="briefing-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            disabled={isAnalyzing}
            aria-describedby="briefing-text-hint"
            placeholder="Cole aqui o briefing do cliente, do jeito que ele chegou. Pode conter áudios transcritos, e-mails e anotações de reunião."
            className="min-h-[30rem] resize-y rounded-none border-0 bg-transparent px-5 py-4 text-base leading-relaxed shadow-none hover:border-transparent focus-visible:border-transparent focus-visible:ring-0 disabled:opacity-60"
          />

          <div className="flex flex-col gap-3 border-t border-line bg-surface-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p id="briefing-text-hint" className="text-xs text-ink-muted">
              {pluralize(wordCount, 'palavra', 'palavras')} ·{' '}
              {pluralize(charCount, 'caractere', 'caracteres')}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleExample}
                disabled={isAnalyzing}
              >
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                Usar exemplo
              </Button>
              <Button
                type="button"
                onClick={handleAnalyze}
                loading={isAnalyzing}
                disabled={isAnalyzing || !canAnalyze}
              >
                {!isAnalyzing && (
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                )}
                Analisar briefing
              </Button>
            </div>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-ink-muted">
          A análise é uma simulação determinística local. Ela não envia o
          briefing para nenhum serviço e não substitui a leitura humana.
        </p>
      </div>

      <aside className="min-w-0 space-y-8">
        <section aria-labelledby="analysis-status-title">
          <SectionHeading id="analysis-status-title" title="Análise" />

          {isAnalyzing ? (
            <div
              className="rounded-lg border border-line bg-surface px-4 py-4"
              role="status"
              aria-live="polite"
            >
              <p className="flex items-center gap-2 text-sm font-medium text-ink">
                <Loader2
                  className="h-4 w-4 animate-spin text-accent"
                  aria-hidden="true"
                />
                Lendo o briefing
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                O provedor de demonstração está extraindo propostas. O rascunho
                permanece salvo.
              </p>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-sunken">
                <div className="indeterminate-bar h-full" />
              </div>
            </div>
          ) : error ? (
            <Alert
              tone="danger"
              role="alert"
              title="A análise não foi concluída"
              action={
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" onClick={handleAnalyze}>
                    Tentar novamente
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={resetError}
                  >
                    Dispensar
                  </Button>
                </div>
              }
            >
              {error.message}
            </Alert>
          ) : lastRun ? (
            <Alert
              tone={lastRun.total > 0 ? 'success' : 'warning'}
              title={
                lastRun.total > 0
                  ? 'Análise concluída'
                  : 'Nenhuma proposta encontrada'
              }
              role="status"
              action={
                lastRun.total > 0 ? (
                  <Button asChild size="sm">
                    <Link to={`/projetos/${projectId}/revisao`}>
                      Revisar propostas
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </Button>
                ) : undefined
              }
            >
              {lastRun.total > 0
                ? `${pluralize(lastRun.total, 'proposta foi gerada', 'propostas foram geradas')} e aguarda decisão humana.`
                : 'O provedor de demonstração não reconheceu termos do briefing. Ajuste o texto e tente novamente.'}
            </Alert>
          ) : projectSuggestions.length > 0 ? (
            <div className="rounded-lg border border-line bg-surface px-4 py-4">
              <p className="text-sm font-medium text-ink">
                Este briefing já foi analisado
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                {pluralize(projectSuggestions.length, 'proposta registrada', 'propostas registradas')}
                {pending > 0
                  ? `, ${pending} ainda sem decisão.`
                  : ', todas com decisão humana.'}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-line-subtle pt-3 text-xs">
                <div>
                  <dt className="text-ink-muted">Aprovadas</dt>
                  <dd className="mt-0.5 font-mono text-sm text-ink">{approved}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Pendentes</dt>
                  <dd className="mt-0.5 font-mono text-sm text-ink">{pending}</dd>
                </div>
              </dl>
              {lastAnalysis && (
                <p className="mt-3 text-[0.6875rem] text-ink-subtle">
                  Última análise em{' '}
                  <time dateTime={lastAnalysis.createdAt}>
                    {formatDateTime(lastAnalysis.createdAt)}
                  </time>
                </p>
              )}
              <Button asChild size="sm" variant="secondary" className="mt-3 w-full">
                <Link to={`/projetos/${projectId}/revisao`}>
                  <ScanSearch className="h-3.5 w-3.5" aria-hidden="true" />
                  Abrir revisão
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-line bg-surface px-4 py-4">
              <p className="text-sm font-medium text-ink">
                Nenhuma análise registrada
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                Cole o briefing e execute a análise para receber propostas. Nada
                é aprovado automaticamente.
              </p>
            </div>
          )}
        </section>

        <section aria-labelledby="analysis-next-title">
          <SectionHeading id="analysis-next-title" title="O que acontece depois" />
          <ol className="space-y-3">
            {[
              {
                title: 'Você revisa',
                body: 'Aprova, edita, muda a prioridade ou rejeita cada proposta.',
              },
              {
                title: 'Você decide o escopo',
                body: 'Só itens aprovados podem virar tarefa.',
              },
              {
                title: 'O dossiê registra',
                body: 'Decisões e conversões ficam no histórico do projeto.',
              },
            ].map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line font-mono text-[0.625rem] text-ink-muted">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-sm font-medium text-ink">
                    {step.title}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
                    {step.body}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <details className="group rounded-lg border border-line bg-surface">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-ink-muted" aria-hidden="true" />
              Opções de demonstração
            </span>
            <span className="text-xs text-ink-muted group-open:hidden">Abrir</span>
            <span className="hidden text-xs text-ink-muted group-open:inline">
              Fechar
            </span>
          </summary>
          <div className="border-t border-line px-4 py-3">
            <label
              htmlFor="analysis-scenario"
              className="text-xs font-medium text-ink"
            >
              Comportamento do provedor
            </label>
            <Select
              id="analysis-scenario"
              value={scenario}
              onChange={(event) => setScenario(event.target.value as AiScenario)}
              className="mt-1.5"
              disabled={isAnalyzing}
            >
              {AI_SCENARIOS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
              {AI_SCENARIOS.find((item) => item.value === scenario)?.description}
            </p>
          </div>
        </details>

        <div className="rounded-lg border border-line bg-surface-muted/50 px-4 py-3">
          <p className="flex items-center gap-2 text-xs font-semibold text-ink">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" />
            Dados locais
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            O briefing e as decisões ficam no armazenamento do navegador. Não há
            backend, autenticação real ou envio para terceiros.
          </p>
        </div>
      </aside>

      <ConfirmDialog
        open={confirmExample}
        onOpenChange={setConfirmExample}
        title="Substituir o briefing atual?"
        description="O texto que está no editor será trocado pelo briefing de exemplo. O rascunho atual não poderá ser recuperado por esta tela."
        confirmLabel="Carregar exemplo"
        onConfirm={loadExample}
      />
    </div>
  )
}
