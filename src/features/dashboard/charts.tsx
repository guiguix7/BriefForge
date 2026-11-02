import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Task } from '@/store'

const STATUS_COLORS: Record<string, string> = {
  pendente: '#475569',
  andamento: '#1D4ED8',
  revisao: '#92400E',
  concluido: '#166534',
}

const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  andamento: 'Em andamento',
  revisao: 'Revisão',
  concluido: 'Concluído',
}

const PRIORITY_COLORS: Record<string, string> = {
  baixa: '#475569',
  media: '#1D4ED8',
  alta: '#9A3412',
  critica: '#991B1B',
}

const PRIORITY_LABELS: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
}

interface PieChartProps {
  title: string
  data: { name: string; value: number; color: string }[]
  emptyMessage?: string
}

function PieChartCard({ title, data, emptyMessage }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-muted">
            <p>{emptyMessage || 'Sem dados disponíveis.'}</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  labelLine={false}
                  label={{ fill: '#fff', fontSize: 10, position: 'inside' }}
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                  <Tooltip />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {data.map((entry) => {
                const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0
                return (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" />
                    <span className="text-sm text-muted">{entry.name}</span>
                    <span className="ml-auto text-sm font-medium">
                      {entry.value} ({pct}%)
                    </span>
                  </div>
                )
              })}
              <div className="mt-2 pt-2 border-t border-border flex items-center gap-2">
                <span className="text-sm font-medium text-text">Total:</span>
                <span className="ml-auto text-sm font-bold">{total}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface TasksByStatusChartProps {
  tasks: Task[]
}

export function TasksByStatusChart({ tasks }: TasksByStatusChartProps) {
  const counts: Record<string, number> = {}
  tasks.forEach((t) => {
    counts[t.status] = (counts[t.status] || 0) + 1
  })

  const data = Object.entries(counts).map(([status, value]) => ({
    name: STATUS_LABELS[status] || status,
    value,
    color: STATUS_COLORS[status] || '#6B7280',
  }))

  return (
    <PieChartCard
      title="Tarefas por status"
      data={data}
      emptyMessage="Sem tarefas para exibir."
    />
  )
}

interface TasksByPriorityChartProps {
  tasks: Task[]
}

export function TasksByPriorityChart({ tasks }: TasksByPriorityChartProps) {
  const counts: Record<string, number> = {}
  tasks.forEach((t) => {
    counts[t.priority] = (counts[t.priority] || 0) + 1
  })

  const data = Object.entries(counts).map(([priority, value]) => ({
    name: PRIORITY_LABELS[priority] || priority,
    value,
    color: PRIORITY_COLORS[priority] || '#6B7280',
  }))

  return (
    <PieChartCard
      title="Tarefas por prioridade"
      data={data}
      emptyMessage="Sem tarefas para exibir."
    />
  )
}

interface CriticalTasksProps {
  tasks: Task[]
}

export function CriticalTasks({ tasks }: CriticalTasksProps) {
  const openCritical = tasks.filter(
    (t) => t.priority === 'critica' && t.status !== 'concluido'
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">Críticas abertas</CardTitle>
        <Badge variant="destructive" className="ml-auto">
          {openCritical.length}
        </Badge>
      </CardHeader>
      <CardContent>
        {openCritical.length === 0 ? (
          <p className="text-sm text-success">Nenhuma tarefa crítica em aberto.</p>
        ) : (
          <div className="space-y-2">
            {openCritical.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2">
                <span className="text-sm">{t.title}</span>
                <Badge variant="destructive" className="text-xs">
                  Crítica
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface CompletionByWeekProps {
  tasks: Task[]
}

export function CompletionByWeek({ tasks }: CompletionByWeekProps) {
  const completed = tasks.filter((t) => t.status === 'concluido' && t.completedAt)

  // Últimas 6 semanas
  const data = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i * 7)
    d.setDate(d.getDate() - d.getDay())
    const count = completed.filter((t) => {
      const cd = new Date(t.completedAt!)
      cd.setDate(cd.getDate() - cd.getDay())
      return cd.getTime() === d.getTime()
    }).length
    data.push({
      name: `S${d.getDate()}/${d.getMonth() + 1}`,
      value: count,
    })
  }

  const hasData = completed.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Concluídas por semana</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#4F46E5" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted">Nenhuma tarefa concluída ainda.</p>
        )}
      </CardContent>
    </Card>
  )
}

interface AvgCompletionTimeProps {
  tasks: Task[]
}

export function AvgCompletionTime({ tasks }: AvgCompletionTimeProps) {
  const completed = tasks.filter((t) => t.status === 'concluido' && t.completedAt)

  let avgDays = 0
  if (completed.length > 0) {
    const totalDays = completed.reduce((sum, t) => {
      const start = new Date(t.createdAt).getTime()
      const end = new Date(t.completedAt!).getTime()
      return sum + (end - start) / (1000 * 60 * 60 * 24)
    }, 0)
    avgDays = Math.round(totalDays / completed.length)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Tempo médio de conclusão</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-primary">{avgDays} dias</p>
            <p className="text-xs text-muted">
              Média entre tarefas concluídas
            </p>
          </div>
          <Badge
            variant="secondary"
            className="text-xs"
          >
            {completed.length} concluída(s)
          </Badge>
        </div>
        {completed.length === 0 && (
          <p className="text-sm text-muted mt-3">Sem tarefas concluídas para calcular média.</p>
        )}
      </CardContent>
    </Card>
  )
}
