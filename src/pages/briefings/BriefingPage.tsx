import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ArrowLeft, FileText, Play, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { BRIEFING_EXEMPLO } from '@/data/seed'
import { useAiAnalysis } from '@/features/analysis/use-ai-analysis'
import * as React from 'react'

export function BriefingPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { projects, setProjectBriefing } = useStore()
  const { toast } = useToast()
  const { analyze, isAnalyzing, error, resetError } = useAiAnalysis(
    projectId || ''
  )

  const project = projects.find((p) => p.id === projectId)
  const [text, setText] = React.useState(project?.briefingText || '')
  const [charCount, setCharCount] = React.useState(text.length)

  if (!project || !projectId) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Projeto não encontrado</h1>
      </div>
    )
  }

  React.useEffect(() => {
    setCharCount(text.length)
  }, [text])

  const handleAnalyze = async () => {
    if (!text || text.trim().length < 30) {
      toast({
        title: 'Texto muito curto',
        description:
          'O briefing precisa ter pelo menos 30 caracteres para a IA analisar.',
        variant: 'destructive',
      })
      return
    }
    setProjectBriefing(projectId, text)
    await analyze(text)
  }

  const handleExample = () => {
    setText(BRIEFING_EXEMPLO)
    setProjectBriefing(projectId, BRIEFING_EXEMPLO)
    toast({
      title: 'Briefing de exemplo carregado',
      description: 'Você pode editar o texto antes de analisar.',
    })
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            onClick={(e) => {
              e.preventDefault()
              navigate(`/projetos/${projectId}`)
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao projeto
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Briefing</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{project.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 items-center justify-center text-center">
              <RotateCw className="h-8 w-8 text-danger animate-spin" />
              <h3 className="text-lg font-semibold">Erro na análise</h3>
              <p className="text-sm text-muted">
                {error.message || 'Não foi possível analisar o briefing.'}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  resetError()
                  handleAnalyze()
                }}
              >
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
            navigate(`/projetos/${projectId}`)
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao projeto
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Briefing</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{project.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col">
            <div className="border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted">
                <span>{charCount}</span>
                <span>/</span>
                <span>caracteres</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExample}
                disabled={isAnalyzing}
              >
                <FileText className="h-3 w-3 mr-1" />
                Usar briefing de exemplo
              </Button>
            </div>
            <Textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                setProjectBriefing(projectId, e.target.value)
              }}
              className="w-full h-[500px] p-4 font-mono text-sm text-muted resize-none focus:outline-none"
              placeholder="Cole aqui o briefing do cliente..."
              aria-label="Texto do briefing"
              disabled={isAnalyzing}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t border-border bg-surface p-4 flex items-center justify-between">
          <p className="text-xs text-muted">
            Rascunho salvo automaticamente.
          </p>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                isAnalyzing
                  ? 'warning'
                  : text.trim().length >= 30
                  ? 'success'
                  : 'default'
              }
            >
              {isAnalyzing
                ? 'Analisando...'
                : text.trim().length >= 30
                ? 'Pronto para analisar'
                : 'Texto muito curto (mín. 30 chars)'}
            </Badge>
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || text.trim().length < 30}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <RotateCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Analisar com IA
            </Button>
          </div>
        </CardFooter>
      </Card>

      {isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Análise em andamento</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <RotateCw className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted">
                Processando o briefing com a IA...
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
