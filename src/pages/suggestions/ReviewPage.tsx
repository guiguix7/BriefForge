import { useParams } from 'react-router-dom'
import { useStore } from '@/store'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ReviewLayout } from '@/features/suggestions/ReviewLayout'
import { useToast } from '@/components/ui/toast'
import { AlertTriangle } from 'lucide-react'
import * as React from 'react'

export function ReviewPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const {
    projects,
    suggestions,
    approveSuggestion,
    rejectSuggestion,
    updateSuggestion,
    addTask,
    addHistory,
  } = useStore()
  const { toast } = useToast()
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editDraft, setEditDraft] = React.useState<{
    title: string
    description: string
  } | null>(null)

  const project = projects.find((p) => p.id === projectId)
  const projSuggestions = suggestions.filter((s) => s.projectId === projectId)

  const approvedCount = projSuggestions.filter(
    (s) => s.status === 'aprovada'
  ).length
  const pendingCount = projSuggestions.filter(
    (s) => s.status === 'pendente'
  ).length
  const rejectedCount = projSuggestions.filter(
    (s) => s.status === 'rejeitada'
  ).length
  const totalToCreate = projSuggestions.filter(
    (s) => s.status === 'aprovada' && !s.convertedToTaskId
  ).length

  if (!project || !projectId) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Projeto não encontrado</h1>
      </div>
    )
  }

  // Atalhos de teclado: A aprova, E edita, R rejeita, setas navegam
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return
      const idx = projSuggestions.findIndex((s) => s.id === selectedId)
      if (idx === -1) return

      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        approveSuggestion(selectedId)
        addHistory(projectId, {
          type: 'aprovacao',
          title: 'Sugestão aprovada',
          description: `Sugestão "${projSuggestions[idx].title}" aprovada.`,
        })
        toast({ title: 'Aprovada', description: 'Sugestão aprovada com sucesso.' })
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        rejectSuggestion(selectedId)
        addHistory(projectId, {
          type: 'rejeicao',
          title: 'Sugestão rejeitada',
          description: `Sugestão "${projSuggestions[idx].title}" rejeitada.`,
        })
        toast({ title: 'Rejeitada', description: 'Sugestão rejeitada.' })
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault()
        setEditingId(selectedId)
        const s = projSuggestions[idx]
        setEditDraft({ title: s.title, description: s.description })
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        const next = projSuggestions[idx + 1]
        if (next) setSelectedId(next.id)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const prev = projSuggestions[idx - 1]
        if (prev) setSelectedId(prev.id)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, projSuggestions, projectId, approveSuggestion, rejectSuggestion, addHistory, toast])

  const handleApprove = (id: string) => {
    approveSuggestion(id)
    const s = projSuggestions.find((x) => x.id === id)
    addHistory(projectId, {
      type: 'aprovacao',
      title: 'Sugestão aprovada',
      description: `Sugestão "${s?.title}" aprovada.`,
    })
    toast({ title: 'Aprovada', description: 'Sugestão aprovada com sucesso.' })
  }

  const handleReject = (id: string) => {
    rejectSuggestion(id)
    const s = projSuggestions.find((x) => x.id === id)
    addHistory(projectId, {
      type: 'rejeicao',
      title: 'Sugestão rejeitada',
      description: `Sugestão "${s?.title}" rejeitada.`,
    })
    toast({ title: 'Rejeitada', description: 'Sugestão rejeitada.' })
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    const s = projSuggestions.find((x) => x.id === id)
    setEditDraft({ title: s?.title || '', description: s?.description || '' })
  }

  const handleSaveEdit = (id: string) => {
    if (!editDraft) return
    updateSuggestion(id, { title: editDraft.title, description: editDraft.description })
    addHistory(projectId, {
      type: 'alteracao',
      title: 'Sugestão editada',
      description: `Sugestão "${id}" editada.`,
    })
    setEditingId(null)
    setEditDraft(null)
    toast({ title: 'Salvo', description: 'Sugestão atualizada.' })
  }

  const handlePriorityChange = (id: string, priority: 'baixa' | 'media' | 'alta' | 'critica') => {
    updateSuggestion(id, { priority })
  }

  const handleCreateTasks = () => {
    const toCreate = projSuggestions.filter(
      (s) => s.status === 'aprovada' && !s.convertedToTaskId
    )
    if (toCreate.length === 0) return

    toCreate.forEach((s) => {
      addTask({
        projectId: projectId,
        suggestionId: s.id,
        title: s.title,
        description: s.description,
        status: 'pendente',
        priority: s.priority,
      })
      updateSuggestion(s.id, { status: 'convertida', convertedToTaskId: s.id })
    })

    addHistory(projectId, {
      type: 'conversao',
      title: 'Tarefas criadas',
      description: `${toCreate.length} tarefa(s) criada(s) a partir de sugestões aprovadas.`,
    })

    toast({
      title: 'Tarefas criadas',
      description: `${toCreate.length} tarefa(s) criada(s) com sucesso.`,
    })
  }

  const handleOpenBriefing = () => {
    // Navegaria para o briefing do projeto
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          asChild
          onClick={(e) => {
            e.preventDefault()
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao projeto
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Revisão de sugestões</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{project.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">
            {projSuggestions.length} sugestão(ões) recebida(s) da IA. Revise cada uma e aprove o que fizer sentido.
          </p>
          <p className="text-xs text-muted mt-2">
            Atalhos: <span className="font-medium">A</span> aprova ·
            <span className="font-medium">E</span> edita ·
            <span className="font-medium">R</span> rejeita ·
            setas navegam
          </p>
          <p className="text-xs text-muted mt-1">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              A IA pode errar. Revise antes de aprovar.
            </span>
          </p>
        </CardContent>
      </Card>

      <ReviewLayout
        suggestions={projSuggestions}
        onApprove={handleApprove}
        onReject={handleReject}
        onEdit={handleEdit}
        onPriorityChange={handlePriorityChange}
        onSelect={setSelectedId}
        selectedId={selectedId}
        approvedCount={approvedCount}
        pendingCount={pendingCount}
        rejectedCount={rejectedCount}
        totalToCreate={totalToCreate}
        onCreateTasks={handleCreateTasks}
        briefingText={project.briefingText}
        onOpenBriefing={handleOpenBriefing}
      />

      {/* Edição inline */}
      {editingId && editDraft && (
        <>
          <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm" onClick={() => { setEditingId(null); setEditDraft(null) }} />
          <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 shadow-xl">
            <CardHeader>
              <CardTitle className="text-sm">Editar sugestão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs text-muted block">Título</label>
                <input
                  value={editDraft.title}
                  onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                  className="w-full h-9 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted block">Descrição</label>
                <textarea
                  value={editDraft.description}
                  onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })}
                  className="w-full h-24 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => { setEditingId(null); setEditDraft(null) }}>
                Cancelar
              </Button>
              <Button onClick={() => handleSaveEdit(editingId)}>
                Salvar
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  )
}
