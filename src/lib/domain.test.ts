import { describe, expect, it } from 'vitest'
import type { Project, Suggestion, Task } from '@/store'
import {
  isApprovedSuggestion,
  isConvertible,
  nextProjectAction,
  pendingReviewCount,
  pluralize,
  projectProgress,
} from './domain'

function suggestion(overrides: Partial<Suggestion> = {}): Suggestion {
  return {
    id: 'suggestion-1',
    projectId: 'project-1',
    type: 'requisito',
    title: 'Cadastro de clientes',
    description: 'O sistema deve permitir cadastrar clientes.',
    priority: 'alta',
    status: 'pendente',
    ...overrides,
  }
}

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    projectId: 'project-1',
    title: 'Implementar cadastro',
    description: 'Criar o fluxo de cadastro.',
    status: 'pendente',
    priority: 'alta',
    createdAt: '2026-10-01T12:00:00.000Z',
    ...overrides,
  }
}

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 'project-1',
    clientId: 'client-1',
    name: 'Projeto de teste',
    status: 'ativo',
    briefingText: 'Briefing registrado.',
    createdAt: '2026-10-01T12:00:00.000Z',
    ...overrides,
  }
}

describe('isConvertible', () => {
  it('accepts an approved requirement that is not linked to a task', () => {
    expect(isConvertible(suggestion({ status: 'aprovada' }))).toBe(true)
  })

  it('rejects pending, rejected and converted proposals', () => {
    expect(isConvertible(suggestion({ status: 'pendente' }))).toBe(false)
    expect(isConvertible(suggestion({ status: 'rejeitada' }))).toBe(false)
    expect(isConvertible(suggestion({ status: 'convertida' }))).toBe(false)
  })

  it('rejects approved proposals that already have a task', () => {
    expect(
      isConvertible(
        suggestion({ status: 'aprovada', convertedToTaskId: 'task-1' })
      )
    ).toBe(false)
  })

  it('rejects proposal types that do not become tasks', () => {
    expect(isConvertible(suggestion({ type: 'duvida', status: 'aprovada' }))).toBe(
      false
    )
    expect(isConvertible(suggestion({ type: 'risco', status: 'aprovada' }))).toBe(
      false
    )
  })
})

describe('isApprovedSuggestion', () => {
  it('treats aprovada and convertida as approved decisions', () => {
    expect(isApprovedSuggestion(suggestion({ status: 'aprovada' }))).toBe(true)
    expect(isApprovedSuggestion(suggestion({ status: 'convertida' }))).toBe(true)
  })

  it('does not treat pendencias or rejections as approved', () => {
    expect(isApprovedSuggestion(suggestion({ status: 'pendente' }))).toBe(false)
    expect(isApprovedSuggestion(suggestion({ status: 'rejeitada' }))).toBe(false)
  })
})

describe('project metrics', () => {
  it('calculates progress from completed tasks only', () => {
    const tasks = [
      task({ id: '1', status: 'concluido' }),
      task({ id: '2', status: 'concluido' }),
      task({ id: '3', status: 'andamento' }),
      task({ id: '4', status: 'pendente' }),
      task({ id: '5', projectId: 'another', status: 'concluido' }),
    ]

    expect(projectProgress('project-1', tasks)).toBe(50)
    expect(projectProgress('empty', tasks)).toBe(0)
  })

  it('counts only pending proposals from the selected project', () => {
    const suggestions = [
      suggestion({ id: '1', status: 'pendente' }),
      suggestion({ id: '2', status: 'pendente' }),
      suggestion({ id: '3', status: 'aprovada' }),
      suggestion({ id: '4', projectId: 'another', status: 'pendente' }),
    ]

    expect(pendingReviewCount('project-1', suggestions)).toBe(2)
  })
})

describe('nextProjectAction', () => {
  it('asks for a briefing when none exists', () => {
    expect(
      nextProjectAction(project({ briefingText: '' }), [], []).label
    ).toBe('Registrar briefing')
  })

  it('prioritizes pending review after a briefing', () => {
    expect(
      nextProjectAction(project(), [suggestion({ status: 'pendente' })], [])
        .label
    ).toBe('Revisar análise')
  })

  it('asks for task creation when there are no tasks', () => {
    expect(
      nextProjectAction(
        project(),
        [suggestion({ status: 'aprovada' })],
        []
      ).label
    ).toBe('Gerar tarefas')
  })

  it('tracks open tasks and then suggests export', () => {
    expect(
      nextProjectAction(
        project(),
        [suggestion({ status: 'aprovada' })],
        [task({ status: 'andamento' })]
      ).label
    ).toBe('Acompanhar tarefas')

    expect(
      nextProjectAction(
        project(),
        [suggestion({ status: 'aprovada' })],
        [task({ status: 'concluido' })]
      ).label
    ).toBe('Exportar escopo')
  })
})

describe('pluralize', () => {
  it('uses the singular for one and the plural otherwise', () => {
    expect(pluralize(1, 'tarefa', 'tarefas')).toBe('1 tarefa')
    expect(pluralize(2, 'tarefa', 'tarefas')).toBe('2 tarefas')
    expect(pluralize(0, 'evento')).toBe('0 eventos')
  })
})
