import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'

import {
  CheckCircle2,
  X as XIcon,
  Edit3,
  AlertTriangle,
  MessageSquare,
  Flag,
  Package,
  ArrowUpRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import * as React from 'react'
import type { Suggestion } from '@/store'

type SuggestionType = Suggestion['type']

const TYPE_LABEL: Record<SuggestionType, string> = {
  funcionalidade: 'Funcionalidade',
  requisito: 'Requisito',
  duvida: 'Dúvida',
  risco: 'Risco',
  entregavel: 'Entregável',
}

const TYPE_ICON: Record<SuggestionType, React.ElementType> = {
  funcionalidade: Package,
  requisito: Flag,
  duvida: MessageSquare,
  risco: AlertTriangle,
  entregavel: ArrowUpRight,
}

const PRIORITY_CONFIG: Record<
  Suggestion['priority'],
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'warning' }
> = {
  baixa: { label: 'Baixa', variant: 'secondary' },
  media: { label: 'Média', variant: 'default' },
  alta: { label: 'Alta', variant: 'warning' },
  critica: { label: 'Crítica', variant: 'destructive' },
}

interface SuggestionCardProps {
  suggestion: Suggestion
  selected: boolean
  onSelect: (id: string) => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onEdit: (id: string) => void
  onPriorityChange: (id: string, priority: Suggestion['priority']) => void
}

const PRIORITY_ORDER: Record<Suggestion['priority'], number> = {
  critica: 0,
  alta: 1,
  media: 2,
  baixa: 3,
}

export function SuggestionCard({
  suggestion,
  selected,
  onSelect,
  onApprove,
  onReject,
  onEdit,
  onPriorityChange,
}: SuggestionCardProps) {
  const Icon = TYPE_ICON[suggestion.type]
  const priority = PRIORITY_CONFIG[suggestion.priority]
  const isDuvida = suggestion.type === 'duvida'
  const isRisco = suggestion.type === 'risco'

  return (
    <Card
      className={cn(
        'border overflow-hidden transition-all hover:shadow-sm',
        selected ? 'border-primary bg-primary/5' : 'border-border'
      )}
      onClick={() => onSelect(suggestion.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(suggestion.id)
        }
      }}
    >
      <CardHeader className="p-3 flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted" />
          <Badge
            variant={
              selected ? 'primary' : (suggestion.type === 'duvida' ? 'secondary' : 'outline') as any
            }
            className="text-xs uppercase tracking-tighter"
          >
            {TYPE_LABEL[suggestion.type]}
          </Badge>
        </div>
        <Badge variant={priority.variant as any} className="text-xs">
          {priority.label}
        </Badge>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">{suggestion.title}</h4>
          <p className="text-xs text-muted leading-relaxed">
            {suggestion.description}
          </p>
          {suggestion.sourceQuote && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <span className="text-[10px] text-muted uppercase tracking-tighter">
                Origem
              </span>
              <p className="text-[11px] italic text-muted">
                "{suggestion.sourceQuote}"
              </p>
            </div>
          )}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1 text-[10px] text-muted uppercase tracking-tighter">
              <span className="w-3 h-3 rounded-full" />
              <span>Sugestão da IA</span>
            </div>
            <div className="flex items-center gap-1">
              <label
                className="text-[10px] text-muted uppercase tracking-tighter mr-2"
              >
                Prioridade
              </label>
              <select
                value={suggestion.priority}
                onChange={(e) =>
                  onPriorityChange(
                    suggestion.id,
                    e.target.value as Suggestion['priority']
                  )
                }
                className="text-[10px] bg-transparent border-none focus:ring-0 p-0 cursor-pointer"
              >
                {(['baixa', 'media', 'alta', 'critica'] as const).map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_CONFIG[p].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-2 border-t border-border/50 bg-accent/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDuvida ? (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  navigator.clipboard.writeText(
                    `Dúvida: ${suggestion.title}\n${suggestion.description}`
                  )
                }}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Copiar dúvida
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(suggestion.id)
                }}
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Editar
              </Button>
            )}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onReject(suggestion.id)
                }}
                className="text-xs text-danger"
              >
                <XIcon className="h-3 w-3 mr-1" />
                Rejeitar
              </Button>
              <Button
                variant={isRisco ? 'outline' : 'default'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onApprove(suggestion.id)
                }}
                disabled={isRisco}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {isRisco ? 'Não vira tarefa' : 'Aprovar'}
              </Button>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

interface ReviewLayoutProps {
  suggestions: Suggestion[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onEdit: (id: string) => void
  onPriorityChange: (id: string, priority: Suggestion['priority']) => void
  onSelect: (id: string) => void
  selectedId: string | null
  approvedCount: number
  pendingCount: number
  rejectedCount: number
  totalToCreate: number
  onCreateTasks: () => void
  briefingText?: string | null
  onOpenBriefing: () => void
}

export function ReviewLayout({
  suggestions,
  onApprove,
  onReject,
  onEdit,
  onPriorityChange,
  onSelect,
  selectedId,
  approvedCount,
  pendingCount,
  rejectedCount,
  totalToCreate,
  onCreateTasks,
  briefingText,
  onOpenBriefing,
}: ReviewLayoutProps) {
  const sorted = [...suggestions].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  )

  const byType: Record<SuggestionType, Suggestion[]> = {
    funcionalidade: [],
    requisito: [],
    duvida: [],
    risco: [],
    entregavel: [],
  }

  sorted.forEach((s) => byType[s.type].push(s))

  const selectedSuggestion = suggestions.find((s) => s.id === selectedId)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden flex">
        {/* Coluna esquerda: briefing original (desktop) */}
        <div className="hidden lg:flex lg:w-1/2 border-r border-border flex-col">
          <div className="p-4 border-b border-border bg-surface">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-muted" />
              <h2 className="text-sm font-semibold">Briefing original</h2>
            </div>
            <p className="text-xs text-muted mb-2">
              Selecione uma sugestão para ver o trecho de origem destacado.
            </p>
            {selectedSuggestion?.sourceQuote ? (
              <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/50 text-sm text-amber-900 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-100">
                {selectedSuggestion.sourceQuote}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted text-sm">
                Nenhuma sugestão selecionada
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="whitespace-pre-wrap text-sm text-muted leading-relaxed">
              {briefingText || 'Não há briefing salvo para este projeto.'}
            </div>
          </div>
        </div>

        {/* Coluna direita: sugestões */}
        <div className="flex-1 lg:w-1/2 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
            <h2 className="text-sm font-semibold">Sugestões da IA</h2>
            <div className="flex items-center gap-1 text-xs text-muted">
              <span>{approvedCount} aprovadas</span>
              <span className="text-primary">·</span>
              <span>{pendingCount} pendentes</span>
              <span className="text-danger">·</span>
              <span>{rejectedCount} rejeitadas</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {Object.entries(byType).map(([type, items]) => {
              if (items.length === 0) return null
              return (
                <div key={type} className="space-y-2">
                  <h3 className="text-[10px] font-semibold uppercase tracking-tighter text-muted px-2">
                    {TYPE_LABEL[type as SuggestionType]}
                    <span className="ml-2 text-xs normal-case font-normal opacity-60">
                      ({items.length})
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {items.map((s) => (
                      <SuggestionCard
                        key={s.id}
                        suggestion={s}
                        selected={selectedId === s.id}
                        onSelect={onSelect}
                        onApprove={onApprove}
                        onReject={onReject}
                        onEdit={onEdit}
                        onPriorityChange={onPriorityChange}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Barra fixa inferior */}
      <div className="border-t border-border bg-surface p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="text-primary">{approvedCount}</span>
          <span className="text-muted">aprovadas ·</span>
          <span className="text-primary">{pendingCount}</span>
          <span className="text-muted">pendentes ·</span>
          <span className="text-danger">{rejectedCount}</span>
          <span className="text-muted">rejeitadas</span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted">
            {totalToCreate} tarefa(s) serão criadas
          </p>
          <Button
            onClick={onCreateTasks}
            disabled={totalToCreate === 0}
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            Criar tarefas das aprovadas
          </Button>
        </div>
      </div>

      {/* Mobile: briefing em aba separada */}
      {selectedSuggestion && typeof window !== 'undefined' && window.innerWidth < 1024 && (
        <div className="lg:hidden p-4 border-t border-border bg-surface">
          <Button variant="outline" onClick={onOpenBriefing} className="w-full">
            <Package className="h-4 w-4 mr-2" />
            Ver briefing original
          </Button>
        </div>
      )}
    </div>
  )
}
