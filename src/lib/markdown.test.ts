import { describe, expect, it } from 'vitest'
import type { HistoryEvent, Project, Suggestion, Task } from '@/store'
import {
  approvedScopeItems,
  buildScopeFilename,
  generateScopeMarkdown,
  scopeSections,
} from './markdown'

const project: Pick<Project, 'name' | 'status'> = {
  name: 'Portal de Atendimento',
  status: 'ativo',
}

function suggestion(overrides: Partial<Suggestion> = {}): Suggestion {
  return {
    id: 'suggestion-1',
    projectId: 'project-1',
    type: 'requisito',
    title: 'Requisito aprovado',
    description: 'Descrição do requisito aprovado.',
    priority: 'alta',
    status: 'aprovada',
    ...overrides,
  }
}

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    projectId: 'project-1',
    title: 'Tarefa do projeto',
    description: 'Descrição da tarefa.',
    status: 'pendente',
    priority: 'media',
    createdAt: '2026-10-01T12:00:00.000Z',
    ...overrides,
  }
}

function event(overrides: Partial<HistoryEvent> = {}): HistoryEvent {
  return {
    id: 'event-1',
    projectId: 'project-1',
    type: 'aprovacao',
    title: 'Proposta aprovada',
    description: 'Uma proposta foi aprovada.',
    createdAt: '2026-10-02T12:00:00.000Z',
    ...overrides,
  }
}

const generatedAt = new Date(2026, 10, 2, 14, 30)

function generate(overrides: Partial<Parameters<typeof generateScopeMarkdown>[0]> = {}) {
  return generateScopeMarkdown({
    project,
    clientName: 'Clínica Teste',
    suggestions: [],
    tasks: [],
    history: [],
    generatedAt,
    ...overrides,
  })
}

describe('approved proposal selection', () => {
  it('collects approved and converted proposals in section order', () => {
    const suggestions = [
      suggestion({ id: '1', type: 'entregavel', title: 'Entregável' }),
      suggestion({ id: '2', type: 'requisito', title: 'Requisito' }),
      suggestion({
        id: '3',
        type: 'funcionalidade',
        title: 'Funcionalidade',
        status: 'convertida',
      }),
      suggestion({
        id: '4',
        type: 'duvida',
        title: 'Dúvida',
        status: 'pendente',
      }),
    ]

    expect(approvedScopeItems(suggestions).map((item) => item.title)).toEqual([
      'Requisito',
      'Funcionalidade',
      'Entregável',
    ])

    expect(scopeSections(suggestions).map((section) => section.label)).toEqual([
      'Requisitos',
      'Funcionalidades',
      'Entregáveis',
    ])
  })
})

describe('generateScopeMarkdown', () => {
  it('includes the client name and only approved proposals', () => {
    const markdown = generate({
      suggestions: [
        suggestion({ id: '1', title: 'Cadastro aprovado' }),
        suggestion({
          id: '2',
          title: 'Ideia pendente',
          status: 'pendente',
        }),
        suggestion({
          id: '3',
          title: 'Ideia rejeitada',
          status: 'rejeitada',
        }),
        suggestion({
          id: '4',
          type: 'funcionalidade',
          title: 'Busca convertida',
          status: 'convertida',
        }),
      ],
    })

    expect(markdown).toContain('# Escopo do projeto — Portal de Atendimento')
    expect(markdown).toContain('**Cliente:** Clínica Teste')
    expect(markdown).toContain('## Requisitos')
    expect(markdown).toContain('Cadastro aprovado')
    expect(markdown).toContain('## Funcionalidades')
    expect(markdown).toContain('Busca convertida')
    expect(markdown).not.toContain('Ideia pendente')
    expect(markdown).not.toContain('Ideia rejeitada')
    expect(markdown).toContain('1 proposta aguarda revisão')
  })

  it('includes source quotes by default and can omit them', () => {
    const suggestions = [
      suggestion({ sourceQuote: 'O cliente pediu cadastro rápido.' }),
    ]

    expect(generate({ suggestions })).toContain('Trecho do briefing')
    expect(generate({ suggestions })).toContain(
      'O cliente pediu cadastro rápido.'
    )
    expect(
      generate({ suggestions, includeSourceQuotes: false })
    ).not.toContain('Trecho do briefing')
  })

  it('includes doubts and risks only when requested', () => {
    const suggestions = [
      suggestion({ id: '1', type: 'duvida', title: 'Dúvida aprovada' }),
      suggestion({ id: '2', type: 'risco', title: 'Risco aprovado' }),
    ]

    const complete = generate({ suggestions })
    expect(complete).toContain('Dúvidas aprovadas para o cliente')
    expect(complete).toContain('Riscos aprovados')
    expect(complete).toContain('Dúvida aprovada')
    expect(complete).toContain('Risco aprovado')

    const scopeOnly = generate({
      suggestions,
      includeDuvidas: false,
      includeRiscos: false,
    })
    expect(scopeOnly).not.toContain('Dúvidas aprovadas')
    expect(scopeOnly).not.toContain('Riscos aprovados')
  })

  it('includes tasks by default with completion state', () => {
    const markdown = generate({
      suggestions: [suggestion()],
      tasks: [
        task({ id: '1', title: 'Tarefa aberta', status: 'andamento' }),
        task({
          id: '2',
          title: 'Tarefa pronta',
          status: 'concluido',
          completedAt: '2026-10-10T12:00:00.000Z',
        }),
      ],
    })

    expect(markdown).toContain('## Plano de tarefas')
    expect(markdown).toContain('- [ ] **Tarefa aberta**')
    expect(markdown).toContain('- [x] **Tarefa pronta**')
    expect(markdown).not.toContain('## Histórico de decisões')

    expect(generate({ suggestions: [suggestion()], includeTasks: false })).not.toContain(
      '## Plano de tarefas'
    )
  })

  it('includes the decision history only when requested', () => {
    const markdown = generate({
      suggestions: [suggestion()],
      history: [event({ title: 'Decisão registrada' })],
      includeHistory: true,
    })

    expect(markdown).toContain('## Histórico de decisões')
    expect(markdown).toContain('Decisão registrada')
    expect(markdown).toContain('Aprovação')
  })

  it('explains when no scope item has been approved', () => {
    const markdown = generate({
      suggestions: [
        suggestion({ status: 'pendente', title: 'Ainda pendente' }),
      ],
    })

    expect(markdown).toContain('## Escopo aprovado')
    expect(markdown).toContain('Nenhuma proposta de requisito')
    expect(markdown).toContain('1 proposta aguarda revisão')
    expect(markdown).not.toContain('Ainda pendente')
  })

  it('always labels the document as a simulation', () => {
    expect(generate()).toContain('A análise de IA é simulada')
    expect(generate()).toContain('modo de demonstração')
  })
})

describe('buildScopeFilename', () => {
  it('slugifies the project and adds the generation date', () => {
    expect(buildScopeFilename('Portal de Atendimento', generatedAt)).toBe(
      'escopo-portal-de-atendimento-2026-11-02.md'
    )
  })

  it('falls back to a generic name when the project has no slug', () => {
    expect(buildScopeFilename('***', generatedAt)).toBe(
      'escopo-projeto-2026-11-02.md'
    )
  })
})
