import * as React from 'react'
import { useStore } from '@/store'
import { MockAiProvider } from '@/features/analysis/mock-ai-provider'
import type { AiScenario } from '@/features/analysis/ai-provider'
import type { Suggestion } from '@/store'
import { useToast } from '@/components/ui/toast'

const aiProvider = new MockAiProvider()

export type AnalysisErrorCode =
  | 'timeout'
  | 'json-invalido'
  | 'briefing-vazio'
  | 'desconhecido'

export interface AnalysisError {
  code: AnalysisErrorCode
  message: string
}

const ERROR_MESSAGES: Record<AnalysisErrorCode, string> = {
  timeout:
    'A análise demorou mais do que o esperado. O briefing foi preservado; tente novamente.',
  'json-invalido':
    'A análise retornou um formato inesperado. Tente novamente ou revise o briefing.',
  'briefing-vazio':
    'O briefing precisa ter pelo menos 30 caracteres para ser analisado.',
  desconhecido:
    'Não foi possível concluir a análise. O briefing foi preservado; tente novamente.',
}

const ERROR_TITLES: Record<AnalysisErrorCode, string> = {
  timeout: 'Tempo esgotado',
  'json-invalido': 'Resposta inválida',
  'briefing-vazio': 'Briefing insuficiente',
  desconhecido: 'Erro na análise',
}

function toErrorCode(error: unknown): AnalysisErrorCode {
  if (error instanceof Error) {
    if (error.message === 'timeout') return 'timeout'
    if (error.message === 'json-invalido') return 'json-invalido'
    if (error.message === 'briefing-vazio') return 'briefing-vazio'
  }

  return 'desconhecido'
}

export function useAiAnalysis(projectId: string) {
  const { setProjectAnalysis, addHistory } = useStore()
  const { toast } = useToast()
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [error, setError] = React.useState<AnalysisError | null>(null)

  const analyze = async (
    briefing: string,
    scenario: AiScenario = 'sucesso'
  ): Promise<number | null> => {
    setIsAnalyzing(true)
    setError(null)
    aiProvider.setScenario(scenario)

    try {
      const output = await aiProvider.analyze({ briefing })

      const suggestions: Omit<Suggestion, 'id' | 'projectId' | 'status'>[] = [
        ...output.funcionalidades.map((item) => ({
          type: item.tipo,
          title: item.titulo,
          description: item.descricao,
          sourceQuote: item.trecho_origem,
          priority: item.prioridade_sugerida ?? 'media',
        })),
        ...output.requisitos.map((item) => ({
          type: item.tipo,
          title: item.titulo,
          description: item.descricao,
          sourceQuote: item.trecho_origem,
          priority: item.prioridade_sugerida ?? 'media',
        })),
        ...output.duvidas.map((item) => ({
          type: item.tipo,
          title: item.titulo,
          description: item.pergunta ?? item.descricao,
          sourceQuote: item.trecho_origem,
          priority: item.prioridade_sugerida ?? 'media',
        })),
        ...output.riscos.map((item) => ({
          type: item.tipo,
          title: item.titulo,
          description: item.descricao,
          sourceQuote: item.trecho_origem,
          priority: item.severidade ?? 'media',
        })),
        ...output.entregaveis.map((item) => ({
          type: item.tipo,
          title: item.titulo,
          description: item.descricao,
          sourceQuote: item.trecho_origem,
          priority: item.prioridade_sugerida ?? 'media',
        })),
      ]

      setProjectAnalysis(projectId, suggestions)

      const total = suggestions.length
      const byType = suggestions.reduce<Record<string, number>>(
        (accumulator, suggestion) => {
          accumulator[suggestion.type] = (accumulator[suggestion.type] ?? 0) + 1
          return accumulator
        },
        {}
      )
      const summary = [
        byType.requisito ? `${byType.requisito} requisitos` : null,
        byType.funcionalidade ? `${byType.funcionalidade} funcionalidades` : null,
        byType.entregavel ? `${byType.entregavel} entregáveis` : null,
        byType.duvida ? `${byType.duvida} dúvidas` : null,
        byType.risco ? `${byType.risco} riscos` : null,
      ]
        .filter(Boolean)
        .join(', ')

      addHistory(projectId, {
        type: 'criacao',
        title: 'Análise simulada concluída',
        description:
          total === 0
            ? 'A análise não identificou itens com as palavras-chave do provedor de demonstração.'
            : `${total} ${total === 1 ? 'proposta gerada' : 'propostas geradas'} (${summary}). Todas aguardam revisão humana.`,
      })

      toast({
        title:
          total === 0 ? 'Análise concluída sem propostas' : 'Análise concluída',
        description:
          total === 0
            ? 'O provedor de demonstração não encontrou os termos que reconhece. Ajuste o briefing e tente novamente.'
            : `${total} ${total === 1 ? 'proposta aguarda' : 'propostas aguardam'} sua revisão.`,
        variant: total === 0 ? 'warning' : 'success',
      })

      setIsAnalyzing(false)
      return total
    } catch (caught) {
      const code = toErrorCode(caught)
      setError({ code, message: ERROR_MESSAGES[code] })
      toast({
        title: ERROR_TITLES[code],
        description: ERROR_MESSAGES[code],
        variant: 'destructive',
      })
      setIsAnalyzing(false)
      return null
    }
  }

  const resetError = React.useCallback(() => setError(null), [])

  return { analyze, isAnalyzing, error, resetError }
}
