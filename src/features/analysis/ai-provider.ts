export interface AiAnalysisInput {
  briefing: string
}

export interface AiSuggestion {
  tipo: 'funcionalidade' | 'requisito' | 'duvida' | 'risco' | 'entregavel'
  titulo: string
  descricao: string
  /** Trecho literal do briefing que originou a sugestão. */
  trecho_origem?: string
  prioridade_sugerida?: 'baixa' | 'media' | 'alta' | 'critica'
  severidade?: 'baixa' | 'media' | 'alta' | 'critica'
  pergunta?: string
}

export interface AiAnalysisOutput {
  funcionalidades: AiSuggestion[]
  requisitos: AiSuggestion[]
  duvidas: AiSuggestion[]
  riscos: AiSuggestion[]
  entregaveis: AiSuggestion[]
}

export interface AiProvider {
  analyze(input: AiAnalysisInput): Promise<AiAnalysisOutput>
}

export type AiScenario = 'sucesso' | 'json-invalido' | 'timeout' | 'briefing-vazio'

export const AI_SCENARIOS: Array<{
  value: AiScenario
  label: string
  description: string
}> = [
  {
    value: 'sucesso',
    label: 'Análise normal',
    description: 'Resposta válida com propostas extraídas do briefing.',
  },
  {
    value: 'timeout',
    label: 'Tempo esgotado',
    description: 'Simula uma análise que não responde a tempo.',
  },
  {
    value: 'json-invalido',
    label: 'Resposta inválida',
    description: 'Simula uma resposta em formato inesperado.',
  },
  {
    value: 'briefing-vazio',
    label: 'Briefing vazio',
    description: 'Simula a recusa de um briefing sem conteúdo suficiente.',
  },
]
