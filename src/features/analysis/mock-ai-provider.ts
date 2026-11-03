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
  trecho_origem: z.string().min(1).optional(),
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

/**
 * Divide o briefing em frases preservando o texto original. O provedor usa
 * esse recorte para que cada proposta aponte para uma passagem real, em vez
 * de repetir a própria descrição como se fosse citação.
 */
function splitSentences(briefing: string): string[] {
  return briefing
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

function quoteFor(briefing: string, keywords: string[]): string | undefined {
  const sentences = splitSentences(briefing)
  const normalized = sentences.map((sentence) => sentence.toLowerCase())
  const index = normalized.findIndex((sentence) =>
    keywords.some((keyword) => sentence.includes(keyword))
  )
  return index >= 0 ? sentences[index] : undefined
}

export class MockAiProvider implements AiProvider {
  private scenario: AiScenario = 'sucesso'
  private delayMs = 1800

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
        throw new Error('json-invalido')
      case 'sucesso':
      default: {
        const raw = this.generateMockOutput(input.briefing)
        const validated = AiAnalysisSchema.safeParse(raw)
        if (!validated.success) {
          throw new Error('json-invalido')
        }
        return validated.data
      }
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
        trecho_origem: quoteFor(briefing, ['site', 'página']),
        prioridade_sugerida: 'alta',
      })
      entregaveis.push({
        tipo: 'entregavel',
        titulo: 'Site publicado',
        descricao: 'Site hospedado e acessível em domínio próprio.',
        trecho_origem: quoteFor(briefing, ['site', 'domínio', 'publicado']),
        prioridade_sugerida: 'alta',
      })
    }

    if (lower.includes('cardápio') || lower.includes('cardapio')) {
      funcionalidades.push({
        tipo: 'funcionalidade',
        titulo: 'Cardápio online com fotos',
        descricao: 'Exibição de produtos com imagens, preços e descrições.',
        trecho_origem: quoteFor(briefing, ['cardápio', 'cardapio']),
        prioridade_sugerida: 'alta',
      })
    }

    if (lower.includes('pix') || lower.includes('pagamento')) {
      requisitos.push({
        tipo: 'requisito',
        titulo: 'Pagamento por Pix',
        descricao: 'Geração de QR Code Pix para pagamento de pedidos.',
        trecho_origem: quoteFor(briefing, ['pix', 'pagamento']),
        prioridade_sugerida: 'alta',
      })
      entregaveis.push({
        tipo: 'entregavel',
        titulo: 'QR Code Pix',
        descricao: 'Código QR para pagamento presencial ou delivery.',
        trecho_origem: quoteFor(briefing, ['pix', 'pagamento']),
        prioridade_sugerida: 'media',
      })
    }

    if (lower.includes('instagram')) {
      riscos.push({
        tipo: 'risco',
        titulo: 'Dependência da API do Instagram',
        descricao: 'A API do Instagram pode limitar a exibição automática de fotos.',
        trecho_origem: quoteFor(briefing, ['instagram']),
        severidade: 'alta',
      })
      duvidas.push({
        tipo: 'duvida',
        titulo: 'Integração com Instagram',
        descricao: 'É obrigatória a integração com Instagram ou apenas uma sugestão?',
        trecho_origem: quoteFor(briefing, ['instagram']),
        pergunta: 'É obrigatória a integração com Instagram ou apenas sugestão?',
        prioridade_sugerida: 'media',
      })
    }

    if (lower.includes('orçamento') || lower.includes('budget')) {
      duvidas.push({
        tipo: 'duvida',
        titulo: 'Orçamento disponível',
        descricao: 'Qual o valor máximo que o cliente pretende investir?',
        trecho_origem: quoteFor(briefing, ['orçamento', 'budget']),
        pergunta: 'Qual o valor máximo que o cliente pretende investir?',
        prioridade_sugerida: 'alta',
      })
    }

    if (lower.includes('prazo') || lower.includes('urgente')) {
      duvidas.push({
        tipo: 'duvida',
        titulo: 'Prazo de entrega',
        descricao: 'Qual o prazo máximo necessário para entrega?',
        trecho_origem: quoteFor(briefing, ['prazo', 'urgente']),
        pergunta: 'Qual o prazo máximo necessário para entrega?',
        prioridade_sugerida: 'media',
      })
    }

    if (lower.includes('administr') || lower.includes('admin')) {
      funcionalidades.push({
        tipo: 'funcionalidade',
        titulo: 'Área administrativa',
        descricao: 'Painel para atualização de preços e produtos.',
        trecho_origem: quoteFor(briefing, ['administr', 'admin']),
        prioridade_sugerida: 'media',
      })
    }

    if (lower.includes('contato')) {
      funcionalidades.push({
        tipo: 'funcionalidade',
        titulo: 'Formulário de contato',
        descricao: 'Campo para clientes enviarem mensagens.',
        trecho_origem: quoteFor(briefing, ['contato']),
        prioridade_sugerida: 'media',
      })
    }

    if (lower.includes('agendamento') || lower.includes('agendar')) {
      funcionalidades.push({
        tipo: 'funcionalidade',
        titulo: 'Agendamento online',
        descricao: 'Pacientes escolhem horário e profissional sem ligar.',
        trecho_origem: quoteFor(briefing, ['agendamento', 'agendar']),
        prioridade_sugerida: 'alta',
      })
    }

    if (lower.includes('prontuário') || lower.includes('prontuario')) {
      requisitos.push({
        tipo: 'requisito',
        titulo: 'Prontuário digital',
        descricao: 'Registro do atendimento vinculado ao paciente.',
        trecho_origem: quoteFor(briefing, ['prontuário', 'prontuario']),
        prioridade_sugerida: 'alta',
      })
    }

    if (lower.includes('lgpd') || lower.includes('dados sensíveis')) {
      requisitos.push({
        tipo: 'requisito',
        titulo: 'Conformidade com a LGPD',
        descricao: 'Controle de acesso e registro de consentimento dos pacientes.',
        trecho_origem: quoteFor(briefing, ['lgpd', 'dados sensíveis', 'dados sensiveis']),
        prioridade_sugerida: 'critica',
      })
    }

    if (lower.includes('rastreamento') || lower.includes('tempo real')) {
      funcionalidades.push({
        tipo: 'funcionalidade',
        titulo: 'Rastreamento em tempo real',
        descricao: 'Acompanhamento da entrega pelo cliente e pela central.',
        trecho_origem: quoteFor(briefing, ['rastreamento', 'tempo real']),
        prioridade_sugerida: 'alta',
      })
    }

    if (lower.includes('sms') || lower.includes('notificação')) {
      funcionalidades.push({
        tipo: 'funcionalidade',
        titulo: 'Notificação ao cliente',
        descricao: 'Avisos automáticos quando a entrega sair para distribuição.',
        trecho_origem: quoteFor(briefing, ['sms', 'notificação', 'notificacao']),
        prioridade_sugerida: 'media',
      })
    }

    if (lower.includes('offline')) {
      requisitos.push({
        tipo: 'requisito',
        titulo: 'Funcionamento offline',
        descricao: 'O app deve registrar entregas mesmo sem conexão.',
        trecho_origem: quoteFor(briefing, ['offline', 'conexão', 'conexao']),
        prioridade_sugerida: 'alta',
      })
    }

    if (lower.includes('relatório') || lower.includes('relatorio')) {
      entregaveis.push({
        tipo: 'entregavel',
        titulo: 'Relatórios de entrega',
        descricao: 'Relatórios semanais de desempenho por rota e motorista.',
        trecho_origem: quoteFor(briefing, ['relatório', 'relatorio']),
        prioridade_sugerida: 'media',
      })
    }

    return { funcionalidades, requisitos, duvidas, riscos, entregaveis }
  }
}
