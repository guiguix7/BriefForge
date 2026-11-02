export function generateScopeMarkdown({
  project,
  suggestions,
  tasks,
  history,
  includeDuvidas = true,
  includeRiscos = true,
}: {
  project: { name: string; clientId: string }
  suggestions: Array<{
    type: string
    title: string
    description: string
    priority: string
    status: string
  }>
  tasks: Array<{
    title: string
    description: string
    status: string
    priority: string
  }>
  history: Array<{
    type: string
    title: string
    description: string
    createdAt: string
  }>
  includeDuvidas?: boolean
  includeRiscos?: boolean
}): string {
  const linhas: string[] = []

  linhas.push(`# Escopo do Projeto: ${project.name}`)
  linhas.push('')
  linhas.push(`**Cliente:** ${project.clientId}`)
  linhas.push(`**Gerado em:** ${new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`)
  linhas.push('')

  // Requisitos
  const requisitos = suggestions.filter((s) => s.type === 'requisito')
  if (requisitos.length > 0) {
    linhas.push('## Requisitos')
    linhas.push('')
    requisitos.forEach((r, i) => {
      linhas.push(`### ${i + 1}. ${r.title}`)
      linhas.push('')
      linhas.push(r.description)
      linhas.push('')
      linhas.push(`**Prioridade sugerida:** ${r.priority}`)
      linhas.push(`**Status:** ${r.status}`)
      linhas.push('')
    })
  }

  // Funcionalidades
  const funcionalidades = suggestions.filter((s) => s.type === 'funcionalidade')
  if (funcionalidades.length > 0) {
    linhas.push('## Funcionalidades')
    linhas.push('')
    funcionalidades.forEach((f, i) => {
      linhas.push(`### ${i + 1}. ${f.title}`)
      linhas.push('')
      linhas.push(f.description)
      linhas.push('')
      linhas.push(`**Prioridade sugerida:** ${f.priority}`)
      linhas.push(`**Status:** ${f.status}`)
      linhas.push('')
    })
  }

  // Entregáveis
  const entregaveis = suggestions.filter((s) => s.type === 'entregavel')
  if (entregaveis.length > 0) {
    linhas.push('## Entregáveis')
    linhas.push('')
    entregaveis.forEach((e, i) => {
      linhas.push(`### ${i + 1}. ${e.title}`)
      linhas.push('')
      linhas.push(e.description)
      linhas.push('')
      linhas.push(`**Prioridade sugerida:** ${e.priority}`)
      linhas.push(`**Status:** ${e.status}`)
      linhas.push('')
    })
  }

  // Dúvidas
  if (includeDuvidas) {
    const duvidas = suggestions.filter((s) => s.type === 'duvida')
    if (duvidas.length > 0) {
      linhas.push('## Dúvidas para o cliente')
      linhas.push('')
      duvidas.forEach((d, i) => {
        linhas.push(`### ${i + 1}. ${d.title}`)
        linhas.push('')
        linhas.push(d.description)
        linhas.push('')
      })
    }
  }

  // Riscos
  if (includeRiscos) {
    const riscos = suggestions.filter((s) => s.type === 'risco')
    if (riscos.length > 0) {
      linhas.push('## Riscos')
      linhas.push('')
      riscos.forEach((r, i) => {
        linhas.push(`### ${i + 1}. ${r.title}`)
        linhas.push('')
        linhas.push(r.description)
        linhas.push('')
        linhas.push(`**Severidade:** ${r.priority}`)
        linhas.push('')
      })
    }
  }

  // Tarefas aprovadas
  const tarefasAprovadas = tasks.filter((t) => t.status === 'concluido')
  if (tarefasAprovadas.length > 0) {
    linhas.push('## Tarefas Concluídas')
    linhas.push('')
    tarefasAprovadas.forEach((t, i) => {
      linhas.push(`### ${i + 1}. ${t.title}`)
      linhas.push('')
      linhas.push(t.description)
      linhas.push('')
      linhas.push(`**Status:** ${t.status}`)
      linhas.push(`**Prioridade:** ${t.priority}`)
      linhas.push('')
    })
  }

  // Histórico
  if (history.length > 0) {
    linhas.push('## Histórico de Alterações')
    linhas.push('')
    history
      .slice()
      .reverse()
      .forEach((h) => {
        linhas.push(`- **${new Date(h.createdAt).toLocaleDateString('pt-BR')}** — ${h.title}: ${h.description}`)
      })
    linhas.push('')
  }

  linhas.push('---')
  linhas.push('')
  linhas.push('*Gerado por BriefForge — protótipo front-end.*')

  return linhas.join('\n')
}
