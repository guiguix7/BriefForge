export interface AiAnalysisInput {
  briefing: string
}

export interface AiSuggestion {
  tipo: 'funcionalidade' | 'requisito' | 'duvida' | 'risco' | 'entregavel'
  titulo: string
  descricao: string
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
