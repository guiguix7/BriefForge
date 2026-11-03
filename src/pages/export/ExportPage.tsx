import * as React from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Code2,
  Copy,
  Download,
  FileText,
  History as HistoryIcon,
  ListChecks,
  Printer,
  ScanSearch,
  ShieldCheck,
} from 'lucide-react'
import { useStore } from '@/store'
import { ProjectNotFound } from '@/components/project/project-layout'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { EmptyState } from '@/components/ui/empty-state'
import { Label } from '@/components/ui/label'
import { SectionHeading } from '@/components/ui/section-heading'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'
import {
  ScopePreview,
  type ScopePreviewOptions,
} from '@/features/export/scope-preview'
import { pluralize } from '@/lib/domain'
import {
  approvedByType,
  approvedScopeItems,
  buildScopeFilename,
  generateScopeMarkdown,
} from '@/lib/markdown'
import { cn } from '@/lib/utils'

type PreviewTab = 'documento' | 'markdown'

const DEFAULT_OPTIONS: ScopePreviewOptions = {
  includeSourceQuotes: true,
  includeDuvidas: true,
  includeRiscos: true,
  includeTasks: true,
  includeHistory: false,
}

function SummaryRow({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: number
  hint?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-surface-muted text-ink-muted"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink">{label}</p>
        {hint && <p className="text-xs text-ink-muted">{hint}</p>}
      </div>
      <span className="font-mono text-sm tabular text-ink">{value}</span>
    </div>
  )
}

function OptionToggle({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
      />
      <div className="min-w-0">
        <Label
          htmlFor={id}
          className={cn(
            'text-sm font-medium leading-snug',
            disabled && 'text-ink-muted'
          )}
        >
          {label}
        </Label>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
          {description}
        </p>
      </div>
    </div>
  )
}

export function ExportPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { projects, clients, suggestions, tasks, history } = useStore()
  const { toast } = useToast()

  const [tab, setTab] = React.useState<PreviewTab>('documento')
  const [generatedAt] = React.useState(() => new Date())
  const [options, setOptions] =
    React.useState<ScopePreviewOptions>(DEFAULT_OPTIONS)
  const [copyState, setCopyState] = React.useState<
    'idle' | 'copied' | 'error'
  >('idle')
  const resetTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const project = projects.find((item) => item.id === projectId)

  React.useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current)
    },
    []
  )

  if (!project || !projectId) return <ProjectNotFound />

  const client = clients.find((item) => item.id === project.clientId)
  const clientName = client?.name ?? 'Cliente removido'
  const projectSuggestions = suggestions.filter(
    (suggestion) => suggestion.projectId === projectId
  )
  const projectTasks = tasks.filter((task) => task.projectId === projectId)
  const projectHistory = history.filter(
    (event) => event.projectId === projectId
  )

  const scopeItems = approvedScopeItems(projectSuggestions)
  const duvidas = approvedByType(projectSuggestions, 'duvida')
  const riscos = approvedByType(projectSuggestions, 'risco')
  const pendingCount = projectSuggestions.filter(
    (suggestion) => suggestion.status === 'pendente'
  ).length
  const quoteCount = projectSuggestions.filter(
    (suggestion) =>
      (suggestion.status === 'aprovada' ||
        suggestion.status === 'convertida') &&
      Boolean(suggestion.sourceQuote)
  ).length

  const effectiveOptions: ScopePreviewOptions = {
    includeSourceQuotes: options.includeSourceQuotes && quoteCount > 0,
    includeDuvidas: options.includeDuvidas && duvidas.length > 0,
    includeRiscos: options.includeRiscos && riscos.length > 0,
    includeTasks: options.includeTasks && projectTasks.length > 0,
    includeHistory: options.includeHistory && projectHistory.length > 0,
  }

  const markdown = generateScopeMarkdown({
    project,
    clientName,
    suggestions: projectSuggestions,
    tasks: projectTasks,
    history: projectHistory,
    includeSourceQuotes: effectiveOptions.includeSourceQuotes,
    includeDuvidas: effectiveOptions.includeDuvidas,
    includeRiscos: effectiveOptions.includeRiscos,
    includeTasks: effectiveOptions.includeTasks,
    includeHistory: effectiveOptions.includeHistory,
    generatedAt,
  })

  const filename = buildScopeFilename(project.name, generatedAt)
  const sizeKb = Math.max(
    1,
    Math.round((new TextEncoder().encode(markdown).length / 1024) * 10) / 10
  )
  const canExport = scopeItems.length > 0

  const setOption = (key: keyof ScopePreviewOptions, value: boolean) => {
    setOptions((previous) => ({ ...previous, [key]: value }))
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopyState('copied')
      toast({
        title: 'Markdown copiado',
        description: 'O escopo está na área de transferência.',
        variant: 'success',
      })
    } catch {
      setCopyState('error')
      toast({
        title: 'Não foi possível copiar',
        description:
          'Selecione o texto na aba Markdown ou use o download do arquivo.',
        variant: 'destructive',
      })
    }

    if (resetTimer.current) clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => setCopyState('idle'), 2500)
  }

  const handleDownload = () => {
    const blob = new Blob([markdown], {
      type: 'text/markdown;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)

    toast({
      title: 'Download iniciado',
      description: filename,
      variant: 'success',
    })
  }

  const handlePrint = () => {
    setTab('documento')
    window.setTimeout(() => window.print(), 60)
  }

  return (
    <div className="space-y-5">
      <div className="print-hidden">
        <SectionHeading
          title="Exportar escopo"
          description="Gere o documento final a partir das decisões aprovadas na revisão. Nada pendente entra no escopo."
          actions={
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success-soft px-2.5 py-1 text-xs font-medium text-success">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Somente aprovados
            </span>
          }
        />
      </div>

      {!canExport ? (
        <div className="space-y-4">
          <Alert
            tone="warning"
            title="Exportação indisponível"
            action={
              <Button asChild size="sm">
                <Link to={`/projetos/${projectId}/revisao`}>
                  Abrir revisão
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            }
          >
            {pendingCount > 0
              ? `Há ${pluralize(pendingCount, 'proposta pendente', 'propostas pendentes')} de revisão no projeto. Aprove requisitos, funcionalidades ou entregáveis para compor o documento.`
              : 'Aprove ao menos um requisito, funcionalidade ou entregável na revisão para gerar o documento de escopo.'}
          </Alert>

          <Card>
            <CardContent className="p-0">
              <EmptyState
                icon={<FileText className="h-5 w-5" />}
                title="Nenhum item aprovado no escopo"
                description="O documento final é montado apenas com propostas aprovadas. Itens pendentes ou rejeitados continuam disponíveis na revisão, mas não são exportados."
                action={
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button asChild>
                      <Link to={`/projetos/${projectId}/revisao`}>
                        Revisar propostas
                      </Link>
                    </Button>
                    <Button asChild variant="secondary">
                      <Link to={`/projetos/${projectId}/briefing`}>
                        Abrir briefing
                      </Link>
                    </Button>
                  </div>
                }
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[19rem_minmax(0,1fr)]">
          <aside className="space-y-4 print-hidden">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resumo do documento</CardTitle>
                <CardDescription>
                  O que entra no escopo deste projeto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-1">
                <SummaryRow
                  icon={<ShieldCheck className="h-3.5 w-3.5" />}
                  label="Itens de escopo"
                  value={scopeItems.length}
                  hint="Requisitos, funcionalidades e entregáveis"
                />
                <SummaryRow
                  icon={<ListChecks className="h-3.5 w-3.5" />}
                  label="Tarefas"
                  value={projectTasks.length}
                />
                <SummaryRow
                  icon={<HistoryIcon className="h-3.5 w-3.5" />}
                  label="Decisões registradas"
                  value={projectHistory.length}
                />
                <SummaryRow
                  icon={<ScanSearch className="h-3.5 w-3.5" />}
                  label="Pendentes de revisão"
                  value={pendingCount}
                />

                {pendingCount > 0 && (
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between"
                  >
                    <Link to={`/projetos/${projectId}/revisao`}>
                      Revisar pendentes
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Conteúdo do documento</CardTitle>
                <CardDescription>
                  Escolha as seções que acompanham o escopo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-1">
                <OptionToggle
                  id="export-source-quotes"
                  label="Trechos de origem"
                  description={
                    quoteCount > 0
                      ? `Citações do briefing em ${pluralize(quoteCount, 'item aprovado', 'itens aprovados')}.`
                      : 'Nenhum item aprovado tem trecho citado.'
                  }
                  checked={options.includeSourceQuotes && quoteCount > 0}
                  onCheckedChange={(value) =>
                    setOption('includeSourceQuotes', value)
                  }
                  disabled={quoteCount === 0}
                />
                <OptionToggle
                  id="export-duvidas"
                  label="Dúvidas aprovadas"
                  description={
                    duvidas.length > 0
                      ? `${pluralize(duvidas.length, 'pergunta', 'perguntas')} para o cliente.`
                      : 'Nenhuma dúvida aprovada.'
                  }
                  checked={options.includeDuvidas && duvidas.length > 0}
                  onCheckedChange={(value) => setOption('includeDuvidas', value)}
                  disabled={duvidas.length === 0}
                />
                <OptionToggle
                  id="export-riscos"
                  label="Riscos aprovados"
                  description={
                    riscos.length > 0
                      ? `${pluralize(riscos.length, 'risco', 'riscos')} com severidade.`
                      : 'Nenhum risco aprovado.'
                  }
                  checked={options.includeRiscos && riscos.length > 0}
                  onCheckedChange={(value) => setOption('includeRiscos', value)}
                  disabled={riscos.length === 0}
                />
                <OptionToggle
                  id="export-tasks"
                  label="Plano de tarefas"
                  description={
                    projectTasks.length > 0
                      ? `${pluralize(projectTasks.length, 'tarefa', 'tarefas')} com status e prioridade.`
                      : 'Nenhuma tarefa criada.'
                  }
                  checked={options.includeTasks && projectTasks.length > 0}
                  onCheckedChange={(value) => setOption('includeTasks', value)}
                  disabled={projectTasks.length === 0}
                />
                <OptionToggle
                  id="export-history"
                  label="Histórico de decisões"
                  description={
                    projectHistory.length > 0
                      ? `${pluralize(projectHistory.length, 'evento', 'eventos')} do projeto.`
                      : 'Nenhum evento registrado.'
                  }
                  checked={options.includeHistory && projectHistory.length > 0}
                  onCheckedChange={(value) => setOption('includeHistory', value)}
                  disabled={projectHistory.length === 0}
                />
              </CardContent>
            </Card>

            <p className="px-1 text-xs leading-relaxed text-ink-muted">
              A prévia e o arquivo usam a mesma fonte de dados. Itens pendentes
              ou rejeitados não são exportados em nenhuma opção.
            </p>
          </aside>

          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as PreviewTab)}
            className="min-w-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 print-hidden">
              <TabsList aria-label="Formato da prévia">
                <TabsTrigger value="documento">
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  Documento
                </TabsTrigger>
                <TabsTrigger value="markdown">
                  <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Markdown
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copyState === 'copied' ? (
                    <Check className="h-4 w-4 text-success" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copyState === 'copied'
                    ? 'Copiado'
                    : copyState === 'error'
                      ? 'Tentar novamente'
                      : 'Copiar Markdown'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handlePrint}
                >
                  <Printer className="h-4 w-4" aria-hidden="true" />
                  Imprimir
                </Button>
                <Button type="button" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Baixar .md
                </Button>
              </div>
            </div>

            <span className="sr-only" aria-live="polite">
              {copyState === 'copied'
                ? 'Markdown copiado para a área de transferência.'
                : copyState === 'error'
                  ? 'Não foi possível copiar o Markdown.'
                  : ''}
            </span>

            <TabsContent value="documento">
              <div className="rounded-lg border border-line bg-surface-raised p-5 shadow-xs sm:p-7 print-surface">
                <ScopePreview
                  project={project}
                  clientName={clientName}
                  suggestions={projectSuggestions}
                  tasks={projectTasks}
                  history={projectHistory}
                  options={effectiveOptions}
                  generatedAt={generatedAt}
                />
              </div>
            </TabsContent>

            <TabsContent value="markdown">
              <div className="overflow-hidden rounded-lg border border-line bg-surface">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-muted/60 px-4 py-2">
                  <span className="font-mono text-xs text-ink">{filename}</span>
                  <span className="font-mono text-[0.6875rem] tabular text-ink-muted">
                    {sizeKb} KB
                  </span>
                </div>
                <pre
                  tabIndex={0}
                  aria-label="Conteúdo Markdown do escopo"
                  className="max-h-[70vh] overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-relaxed text-ink"
                >
                  {markdown}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
