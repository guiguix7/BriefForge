import { z } from 'zod'
import type {
  AiAnalysisInput,
  AiAnalysisOutput,
  AiProvider,
  AiScenario,
} from './ai-provider'

const AiSuggestionSchema = z.object({
  tipo: z.enum(['funcionalidade', 'requisito', 'duvida', 'risco', 'entregavel']),
  titulo: z.string().min(1),
  descricao: z.string().min(1),
  prioridade_sugerida: z
    .enum(['baixa', 'media', 'alta', 'critica'])
    .optional(),
  severidade: z.enum(['baixa', 'media', 'alta', 'critica']).optional(),
  pergunta: z.string().optional(),
})

const AiAnalysisSchema = z.object({
  funcionalidades: z.array(AiSuggestionSchema),
  requisitos: z.array(AiSuggestionSchema),
  duvidas: z.array(AiSuggestionSchema),
  riscos: z.array(AiSuggestionSchema),
  entregaveis: z.array(AiSuggestionSchema),
})

type AiSuggestionType = z.infer<typeof AiSuggestionSchema>
type RawAiOutput = z.infer<typeof AiAnalysisSchema>

export class MockAiProvider implements AiProvider {
  private scenario: AiScenario = 'sucesso'
  private delayMs = 2500

  setScenario(scenario: AiScenario) {
    this.scenario = scenario
  }

  setDelay(ms: number) {
    this.delayMs = ms
  }

  async analyze(input: AiAnalysisInput): Promise<AiAnalysisOutput> {
    if (!input.briefing || input.briefing.trim().length < 30) {
      throw new Error('briefing-vazio')
    }

    await this.sleep(this.delayMs)

    switch (this.scenario) {
      case 'timeout':
        throw new Error('timeout')
      case 'json-invalido':
        return {
          funcionalidades: null as unknown as AiSuggestionType[],
          requisitos: [],
          duvidas: [],
          riscos: [],
          entregaveis: [],
        } as unknown as AiAnalysisOutput
      case 'sucesso':
      default:
        const raw = this.generateMockOutput(input.briefing)
        const validated = AiAnalysisSchema.safeParse(raw)
        if (!validated.success) {
          throw new Error('json-invalido')
        }
        return validated.data
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private generateMockOutput(briefing: string): RawAiOutput {
    const lower = briefing.toLowerCase()

    const funcionalidades: AiSuggestionType[] = []
    const requisitos: AiSuggestionType[] = []
    const duvidas: AiSuggestionType[] = []
    const riscos: AiSuggestionType[] = []
    const entregaveis: AiSuggestionType[] = []

    if (lower.includes('site') || lower.includes('página')) {
      funcionalidades.push({
        tipo: 'funcionalidade',
        titulo: 'Site institucional responsivo',
        descricao: 'Página principal com informações do negócio.',
        prioridade_sugerida: 'alta',
      })
      entregaveis.push({
        tipo: 'entregavel',
        titulo: 'Site publicado',
        descricao: 'Site hospedado e acessível em domínio próprio.',
        prioridade_sugerida: 'alta',
      })
    }

    if (lower.includes('cardápio') || lower.includes('cardapio')) {
      funcionalidades.push({
        tipo: 'funcionalidade',
        titulo: 'Cardápio online com fotos',
        descricao: 'Exibição de produtos com imagens, preços e descrições.',
        prioridade_sugerida: 'alta',
      })
    }

    if (lower.includes('pix') || lower.includes('pagamento')) {
      requisitos.push({
        tipo: 'requisito',
        titulo: 'Pagamento por Pix',
        descricao: 'Geração de QR Code Pix para pagamento de pedidos.',
        prioridade_sugerida: 'alta',
      })
      entregaveis.push({
        tipo: 'entregavel',
        titulo: 'QR Code Pix',
        descricao: 'Código QR para pagamento presencial ou delivery.',
        prioridade_sugerida: 'media',
      })
    }

    if (lower.includes('instagram')) {
      riscos.push({
        tipo: 'risco',
        titulo: 'Integração com Instagram',
        descricao: 'A API do Instagram pode limitar exibição automática de fotos.',
        severidade: 'alta',
      })
      duvidas.push({
        tipo: 'duvida',
        titulo: 'Integração com Instagram',
        descricao: 'Dúvida sobre a integração com Instagram.',
        pergunta: 'É obrigatória a integração com Instagram ou apenas sugestão?',
        prioridade_sugerida: 'media',
      })
    }

    if (lower.includes('orçamento') || lower.includes('budget')) {
      duvidas.push({
        tipo: 'duvida',
        titulo: 'Orçamento disponível',
        descricao: 'Dúvida sobre o orçamento disponível para o projeto.',
        pergunta: 'Qual o valor máximo que o cliente pretende investir?',
        prioridade_sugerida: 'alta',
      })
    }

    if (lower.includes('prazo') || lower.includes('urgente')) {
      duvidas.push({
        tipo: 'duvida',
        titulo: 'Prazo de entrega',
        descricao: 'Dúvida sobre o prazo de entrega do projeto.',
        pergunta: 'Qual o prazo máximo necessário para entrega?',
        prioridade_sugerida: 'media',
      })
    }

    if (lower.includes('administr') || lower.includes('admin')) {
      funcionalidades.push({
        tipo: 'funcionalidade',
        titulo: 'Área administrativa',
        descricao: 'Painel para atualização de preços e produtos.',
        prioridade_sugerida: 'media',
      })
    }

    if (lower.includes('contato')) {
      funcionalidades.push({
        tipo: 'funcionalidade',
        titulo: 'Formulário de contato',
        descricao: 'Campo para clientes enviarem mensagens.',
        prioridade_sugerida: 'media',
      })
    }

    return { funcionalidades, requisitos, duvidas, riscos, entregaveis }
  }
}
