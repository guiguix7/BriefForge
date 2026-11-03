import type { HistoryEvent, Project, Suggestion, Task } from '@/store'
import {
  HISTORY_TYPE,
  PROJECT_STATUS,
  SUGGESTION_TYPE,
  TASK_PRIORITY,
  TASK_STATUS,
  isApprovedSuggestion,
} from '@/lib/domain'
import { formatFileDate, slugify } from '@/lib/utils'

const SCOPED_TYPES: Suggestion['type'][] = [
  'requisito',
  'funcionalidade',
  'entregavel',
]

const generatedAtFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
  timeStyle: 'short',
})

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function oneLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function sourceQuote(quote: string): string {
  return `> Trecho do briefing: \u201c${oneLine(quote)}\u201d`
}

export interface ScopeMarkdownInput {
  project: Pick<Project, 'name' | 'status'>
  clientName: string
  suggestions: Suggestion[]
  tasks: Task[]
  history: HistoryEvent[]
  includeSourceQuotes?: boolean
  includeDuvidas?: boolean
  includeRiscos?: boolean
  includeTasks?: boolean
  includeHistory?: boolean
  generatedAt?: Date
}

export function approvedByType(
  suggestions: Suggestion[],
  type: Suggestion['type']
): Suggestion[] {
  return suggestions.filter(
    (suggestion) =>
      suggestion.type === type && isApprovedSuggestion(suggestion)
  )
}

export function approvedScopeItems(suggestions: Suggestion[]): Suggestion[] {
  return SCOPED_TYPES.flatMap((type) => approvedByType(suggestions, type))
}

export interface ScopeSection {
  type: Suggestion['type']
  label: string
  items: Suggestion[]
}

export function scopeSections(suggestions: Suggestion[]): ScopeSection[] {
  return SCOPED_TYPES.map((type) => ({
    type,
    label: SUGGESTION_TYPE[type].plural,
    items: approvedByType(suggestions, type),
  })).filter((section) => section.items.length > 0)
}

/**
 * Builds the client-facing scope document from approved proposals only.
 * Pending or rejected proposals never appear in the exported body.
 */
export function generateScopeMarkdown({
  project,
  clientName,
  suggestions,
  tasks,
  history,
  includeSourceQuotes = true,
  includeDuvidas = true,
  includeRiscos = true,
  includeTasks = true,
  includeHistory = false,
  generatedAt = new Date(),
}: ScopeMarkdownInput): string {
  const lines: string[] = []
  const scopeItems = approvedScopeItems(suggestions)
  const pending = suggestions.filter(
    (suggestion) => suggestion.status === 'pendente'
  ).length

  lines.push(`# Escopo do projeto — ${project.name}`)
  lines.push('')
  lines.push(`**Cliente:** ${clientName}  `)
  lines.push(`**Status do projeto:** ${PROJECT_STATUS[project.status].label}  `)
  lines.push(`**Gerado em:** ${generatedAtFormatter.format(generatedAt)}`)
  lines.push('')
  lines.push(
    '> Documento baseado apenas em propostas aprovadas na revisão humana. Itens pendentes ou rejeitados não fazem parte do escopo.'
  )

  if (pending > 0) {
    lines.push('')
    lines.push(
      `> ${pending} ${pending === 1 ? 'proposta aguarda' : 'propostas aguardam'} revisão e ${pending === 1 ? 'não está incluída' : 'não estão incluídas'} neste documento.`
    )
  }

  lines.push('')

  if (scopeItems.length === 0) {
    lines.push('## Escopo aprovado')
    lines.push('')
    lines.push(
      'Nenhuma proposta de requisito, funcionalidade ou entregável foi aprovada até o momento. Aprove itens na revisão para compor este documento.'
    )
    lines.push('')
  }

  for (const type of SCOPED_TYPES) {
    const items = approvedByType(suggestions, type)
    if (items.length === 0) continue

    lines.push(`## ${SUGGESTION_TYPE[type].plural}`)
    lines.push('')

    items.forEach((item, index) => {
      lines.push(`### ${index + 1}. ${item.title}`)
      lines.push('')
      lines.push(item.description)
      lines.push('')
      lines.push(`**Prioridade:** ${TASK_PRIORITY[item.priority].label}`)
      if (includeSourceQuotes && item.sourceQuote) {
        lines.push('')
        lines.push(sourceQuote(item.sourceQuote))
      }
      lines.push('')
    })
  }

  if (includeDuvidas) {
    const duvidas = approvedByType(suggestions, 'duvida')
    if (duvidas.length > 0) {
      lines.push('## Dúvidas aprovadas para o cliente')
      lines.push('')
      duvidas.forEach((item, index) => {
        lines.push(`### ${index + 1}. ${item.title}`)
        lines.push('')
        lines.push(item.description)
        lines.push('')
        if (includeSourceQuotes && item.sourceQuote) {
          lines.push(sourceQuote(item.sourceQuote))
          lines.push('')
        }
      })
    }
  }

  if (includeRiscos) {
    const riscos = approvedByType(suggestions, 'risco')
    if (riscos.length > 0) {
      lines.push('## Riscos aprovados')
      lines.push('')
      riscos.forEach((item, index) => {
        lines.push(`### ${index + 1}. ${item.title}`)
        lines.push('')
        lines.push(item.description)
        lines.push('')
        lines.push(`**Severidade:** ${TASK_PRIORITY[item.priority].label}`)
        if (includeSourceQuotes && item.sourceQuote) {
          lines.push('')
          lines.push(sourceQuote(item.sourceQuote))
        }
        lines.push('')
      })
    }
  }

  if (includeTasks && tasks.length > 0) {
    lines.push('## Plano de tarefas')
    lines.push('')
    for (const task of tasks) {
      const checked = task.status === 'concluido' ? 'x' : ' '
      lines.push(
        `- [${checked}] **${task.title}** — ${TASK_STATUS[task.status].label} · prioridade ${TASK_PRIORITY[task.priority].label}`
      )
      if (task.description.trim()) {
        lines.push(`  ${oneLine(task.description)}`)
      }
    }
    lines.push('')
  }

  if (includeHistory && history.length > 0) {
    lines.push('## Histórico de decisões')
    lines.push('')
    for (const event of history) {
      lines.push(
        `- **${shortDateFormatter.format(new Date(event.createdAt))}** · ${HISTORY_TYPE[event.type].label} — ${event.title}: ${oneLine(event.description)}`
      )
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push(
    '*Gerado por BriefForge em modo de demonstração. A análise de IA é simulada; o escopo reflete apenas decisões humanas de aprovação.*'
  )

  return lines.join('\n')
}

export function buildScopeFilename(
  projectName: string,
  date = new Date()
): string {
  const slug = slugify(projectName) || 'projeto'
  return `escopo-${slug}-${formatFileDate(date)}.md`
}
