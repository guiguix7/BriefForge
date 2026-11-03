import type { Task } from '@/store'

const STATUS_LABEL: Record<Task['status'], string> = {
  pendente: 'Pendente',
  andamento: 'Em andamento',
  revisao: 'Em revisão',
  concluido: 'Concluído',
}

const PRIORITY_LABEL: Record<Task['priority'], string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
}

export function TaskStatusGlyph({ status }: { status: Task['status'] }) {
  return (
    <span className="inline-flex shrink-0 items-center" aria-label={`Status: ${STATUS_LABEL[status]}`}>
      <svg aria-hidden="true" viewBox="0 0 18 18" className="h-4 w-4" fill="none">
        {status === 'pendente' && (
          <circle cx="9" cy="9" r="6.25" stroke="currentColor" strokeWidth="1.6" />
        )}
        {status === 'andamento' && (
          <>
            <circle cx="9" cy="9" r="6.25" stroke="currentColor" strokeWidth="1.6" />
            <path d="M9 2.75a6.25 6.25 0 0 1 0 12.5V2.75Z" fill="currentColor" opacity=".25" />
          </>
        )}
        {status === 'revisao' && (
          <circle cx="9" cy="9" r="6.25" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2.1 2.1" />
        )}
        {status === 'concluido' && (
          <>
            <circle cx="9" cy="9" r="6.25" stroke="currentColor" strokeWidth="1.6" />
            <path d="m5.8 9.1 2.1 2.1 4.4-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </svg>
      <span className="sr-only">{STATUS_LABEL[status]}</span>
    </span>
  )
}

export function TaskPriorityGlyph({ priority }: { priority: Task['priority'] }) {
  const activeBars = { baixa: 1, media: 2, alta: 3, critica: 4 }[priority]
  return (
    <span
      className={`inline-flex shrink-0 items-center ${priority === 'critica' ? 'text-[var(--alert)]' : 'text-ink-muted'}`}
      aria-label={`Prioridade: ${PRIORITY_LABEL[priority]}`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 18" className="h-4 w-[1.35rem]" fill="none">
        {[4, 7, 10, 13].map((height, index) => (
          <rect
            key={height}
            x={1 + index * 3.6}
            y={15 - height}
            width="2.5"
            height={height}
            rx=".6"
            fill="currentColor"
            opacity={index < activeBars ? 1 : 0.2}
          />
        ))}
        {priority === 'critica' && (
          <>
            <path d="M20 3.2v5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="20" cy="11.3" r=".9" fill="currentColor" />
          </>
        )}
      </svg>
      <span className="sr-only">{PRIORITY_LABEL[priority]}</span>
    </span>
  )
}
