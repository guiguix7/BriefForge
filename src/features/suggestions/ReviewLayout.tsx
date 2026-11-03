import * as React from 'react'
import { Link } from 'react-router-dom'
import { FileText, ListChecks, Quote } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { pluralize } from '@/lib/domain'
import { cn } from '@/lib/utils'
import type { Suggestion } from '@/store'

export interface ReviewSummary {
  pending: number
  approved: number
  rejected: number
  converted: number
  convertible: number
  total: number
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Destaca a passagem citada dentro do briefing. A busca é tolerante a
 * diferenças de caixa e a pontuação final, mas nunca reescreve o texto
 * original.
 */
export function highlightBriefing(
  text: string,
  quote?: string | null
): React.ReactNode {
  const needle = quote?.trim().replace(/[.,;:!?]+$/, '')
  if (!needle) return text

  const match = new RegExp(escapeRegExp(needle), 'i').exec(text)
  if (!match) return text

  const start = match.index
  const end = start + match[0].length

  return (
    <>
      {text.slice(0, start)}
      <mark className="rounded-sm bg-warning-soft px-0.5 text-ink ring-1 ring-inset ring-warning/30">
        {text.slice(start, end)}
      </mark>
      {text.slice(end)}
    </>
  )
}

function SourcePane({
  projectId,
  briefingText,
  selected,
  showHeader = true,
  className,
}: {
  projectId: string
  briefingText?: string
  selected: Suggestion | null
  showHeader?: boolean
  className?: string
}) {
  const words = briefingText?.trim()
    ? briefingText.trim().split(/\s+/).filter(Boolean).length
    : 0

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      {showHeader && (
        <div className="shrink-0 border-b border-line bg-surface px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
              <FileText className="h-4 w-4 text-ink-muted" aria-hidden="true" />
              Briefing original
            </h2>
            {briefingText && (
              <Badge tone="neutral">
                {pluralize(words, 'palavra', 'palavras')}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            {selected
              ? 'O trecho que originou a proposta selecionada está destacado.'
              : 'Selecione uma proposta para destacar o trecho de origem.'}
          </p>

          {selected?.sourceQuote && (
            <blockquote className="mt-3 rounded-md border border-warning/25 bg-warning-soft/70 px-3 py-2">
              <p className="flex gap-2 text-xs leading-relaxed text-ink">
                <Quote
                  className="mt-0.5 h-3 w-3 shrink-0 text-warning"
                  aria-hidden="true"
                />
                <span className="italic">“{selected.sourceQuote.trim()}”</span>
              </p>
            </blockquote>
          )}
        </div>
      )}

      {briefingText?.trim() ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
            {highlightBriefing(briefingText, selected?.sourceQuote)}
          </p>
        </div>
      ) : (
        <div className="px-4 py-8 text-center">
          <p className="text-sm font-medium text-ink">Nenhum briefing salvo</p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-ink-muted">
            Sem o texto do cliente, a origem das propostas não pode ser
            consultada.
          </p>
          <Button asChild size="sm" variant="secondary" className="mt-3">
            <Link to={`/projetos/${projectId}/briefing`}>Abrir briefing</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

interface ReviewLayoutProps {
  projectId: string
  briefingText?: string
  selected: Suggestion | null
  sourceOpen: boolean
  onSourceOpenChange: (open: boolean) => void
  summary: ReviewSummary
  onConvertAll: () => void
  children: React.ReactNode
}

export function ReviewLayout({
  projectId,
  briefingText,
  selected,
  sourceOpen,
  onSourceOpenChange,
  summary,
  onConvertAll,
  children,
}: ReviewLayoutProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--topbar-height)+1.25rem)] h-[calc(100dvh-12rem)] max-h-[48rem] overflow-hidden rounded-lg border border-line bg-surface">
            <SourcePane
              projectId={projectId}
              briefingText={briefingText}
              selected={selected}
              className="h-full"
            />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3 lg:hidden">
            <p className="min-w-0 text-xs leading-relaxed text-ink-muted">
              {selected
                ? `Origem: “${selected.sourceQuote ?? 'sem trecho registrado'}”`
                : 'Selecione uma proposta para ver a origem.'}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0"
              onClick={() => onSourceOpenChange(true)}
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              Ver origem
            </Button>
          </div>

          {children}
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur-sm sm:mx-0 sm:rounded-lg sm:border">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
            <span>
              <span className="font-mono font-medium tabular text-ink">
                {summary.pending}
              </span>{' '}
              pendentes
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <span className="font-mono font-medium tabular text-ink">
                {summary.approved}
              </span>{' '}
              aprovadas
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <span className="font-mono font-medium tabular text-ink">
                {summary.rejected}
              </span>{' '}
              rejeitadas
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <span className="font-mono font-medium tabular text-ink">
                {summary.converted}
              </span>{' '}
              convertidas
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <p className="text-xs text-ink-muted">
              {summary.convertible === 0
                ? 'Nenhum item pronto para virar tarefa'
                : `${pluralize(
                    summary.convertible,
                    'item aprovado pronto',
                    'itens aprovados prontos'
                  )} para virar tarefa`}
            </p>
            <Button
              type="button"
              size="sm"
              onClick={onConvertAll}
              disabled={summary.convertible === 0}
            >
              <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
              Criar {summary.convertible}{' '}
              {summary.convertible === 1 ? 'tarefa' : 'tarefas'}
            </Button>
          </div>
        </div>
      </div>

      <Drawer open={sourceOpen} onOpenChange={onSourceOpenChange}>
        <DrawerContent className="max-w-[34rem]">
          <DrawerHeader>
            <DrawerTitle>Briefing e trecho de origem</DrawerTitle>
            <DrawerDescription>
              {selected
                ? `Proposta selecionada: ${selected.title}.`
                : 'Selecione uma proposta na lista para destacar o trecho.'}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="min-h-0 p-0">
            <SourcePane
              projectId={projectId}
              briefingText={briefingText}
              selected={selected}
              showHeader={false}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
