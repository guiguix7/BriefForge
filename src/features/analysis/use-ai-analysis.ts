import { useStore } from '@/store'
import { MockAiProvider } from '@/features/analysis/mock-ai-provider'
import type { Suggestion } from '@/store'
import { useToast } from '@/components/ui/toast'

const aiProvider = new MockAiProvider()

export function useAiAnalysis(projectId: string) {
  const { setProjectAnalysis, addHistory } = useStore()
  const { toast } = useToast()
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [error, setError] = React.useState<{ message: string } | null>(null)

  const analyze = async (briefing: string) => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const output = await aiProvider.analyze({ briefing })

      // Converte sugestões da IA para o formato do store
      const suggestions: Omit<Suggestion, 'id' | 'projectId' | 'status'>[] = [
        ...output.funcionalidades.map((s) => ({
          type: s.tipo,
          title: s.titulo,
          description: s.descricao,
          sourceQuote: s.descricao,
          priority: s.prioridade_sugerida || 'media',
        })),
        ...output.requisitos.map((s) => ({
          type: s.tipo,
          title: s.titulo,
          description: s.descricao,
          sourceQuote: s.descricao,
          priority: s.prioridade_sugerida || 'media',
        })),
        ...output.duvidas.map((s) => ({
          type: s.tipo,
          title: s.titulo,
          description: s.pergunta || s.descricao,
          sourceQuote: s.descricao,
          priority: s.prioridade_sugerida || 'media',
        })),
        ...output.riscos.map((s) => ({
          type: s.tipo,
          title: s.titulo,
          description: s.descricao,
          sourceQuote: s.descricao,
          priority: s.severidade || 'media',
        })),
        ...output.entregaveis.map((s) => ({
          type: s.tipo,
          title: s.titulo,
          description: s.descricao,
          sourceQuote: s.descricao,
          priority: s.prioridade_sugerida || 'media',
        })),
      ]

      setProjectAnalysis(projectId, suggestions)

      addHistory(projectId, {
        type: 'criacao',
        title: 'Análise de IA concluída',
        description: `${suggestions.length} sugestão(ões) gerada(s) a partir do briefing.`,
      })

      toast({
        title: 'Análise concluída',
        description: `${suggestions.length} sugestão(ões) gerada(s). Revise e aprove as que desejar.`,
      })

      setIsAnalyzing(false)
    } catch (err: any) {
      setIsAnalyzing(false)
      if (err.message === 'timeout') {
        setError({ message: 'A análise demorou demais. Verifique sua conexão e tente novamente.' })
        toast({
          title: 'Tempo esgotado',
          description: 'A análise da IA não respondeu a tempo. Tente novamente.',
          variant: 'destructive',
        })
      } else if (err.message === 'json-invalido') {
        setError({ message: 'A IA retornou um formato inválido. Tente novamente.' })
        toast({
          title: 'Resposta inválida',
          description: 'A IA retornou dados em formato inesperado. Tente novamente.',
          variant: 'destructive',
        })
      } else if (err.message === 'briefing-vazio') {
        setError({ message: 'O briefing está muito curto para ser analisado.' })
        toast({
          title: 'Texto muito curto',
          description: 'Adicione mais conteúdo ao briefing antes de analisar.',
          variant: 'destructive',
        })
      } else {
        setError({ message: 'Erro inesperado ao analisar o briefing.' })
        toast({
          title: 'Erro na análise',
          description: 'Não foi possível analisar o briefing. Tente novamente.',
          variant: 'destructive',
        })
      }
    }
  }

  const resetError = () => setError(null)

  return { analyze, isAnalyzing, error, resetError }
}

import * as React from 'react'
