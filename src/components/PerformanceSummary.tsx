import { useState, useEffect, useMemo } from 'react'
import { Users, CheckCircle2, Award, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getVisits } from '@/services/visits'
import { getUsers } from '@/services/users'
import { useAuth } from '@/contexts/AuthContext'
import { useRealtime } from '@/hooks/use-realtime'

interface UserMetrics {
  userId: string
  userName: string
  total: number
  completed: number
  qualified: number
}

interface VisitRecord {
  id: string
  user_id: string
  status: string
  lead_status: string
  state: string
  expand?: { user_id?: { name?: string; email?: string } }
}

export function PerformanceSummary() {
  const { user } = useAuth()
  const isManager = user?.role === 'manager'
  const [visits, setVisits] = useState<VisitRecord[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [stateFilter, setStateFilter] = useState<string>('all')

  const fetchData = async () => {
    try {
      const [v, u] = await Promise.all([getVisits() as Promise<VisitRecord[]>, getUsers()])
      setVisits(v)
      setUsers(u)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useRealtime('visits', () => fetchData())

  const filteredVisits = useMemo(() => {
    if (stateFilter === 'all') return visits
    return visits.filter((v) => v.state === stateFilter)
  }, [visits, stateFilter])

  const overallMetrics = useMemo(() => {
    const scoped = isManager ? filteredVisits : filteredVisits.filter((v) => v.user_id === user?.id)
    return {
      total: scoped.length,
      completed: scoped.filter((v) => v.status === 'Concluída').length,
      qualified: scoped.filter((v) => v.lead_status === 'Qualificado').length,
    }
  }, [filteredVisits, isManager, user?.id])

  const userMetrics: UserMetrics[] = useMemo(() => {
    if (!isManager) {
      return [
        {
          userId: user?.id || '',
          userName: user?.name || 'Eu',
          ...overallMetrics,
        },
      ]
    }
    const grouped = new Map<string, UserMetrics>()
    for (const v of filteredVisits) {
      if (!v.user_id) continue
      const existing = grouped.get(v.user_id) || {
        userId: v.user_id,
        userName: v.expand?.user_id?.name || v.expand?.user_id?.email || '—',
        total: 0,
        completed: 0,
        qualified: 0,
      }
      existing.total++
      if (v.status === 'Concluída') existing.completed++
      if (v.lead_status === 'Qualificado') existing.qualified++
      grouped.set(v.user_id, existing)
    }
    return Array.from(grouped.values()).sort((a, b) => b.total - a.total)
  }, [filteredVisits, isManager, user?.id, overallMetrics])

  const completionRate =
    overallMetrics.total > 0
      ? ((overallMetrics.completed / overallMetrics.total) * 100).toFixed(1)
      : '0.0'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-primary">Resumo de Performance</h3>
        <div className="w-40">
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="SC">Santa Catarina</SelectItem>
              <SelectItem value="RS">Rio Grande do Sul</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-primary/20">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total de Visitas</p>
                <p className="text-2xl font-bold text-primary mt-1">{overallMetrics.total}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Visitas Concluídas</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{overallMetrics.completed}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Leads Qualificados</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{overallMetrics.qualified}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{completionRate}%</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isManager ? 'Performance por Vendedor' : 'Minha Performance'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Concluídas</TableHead>
                <TableHead className="text-center">Qualificados</TableHead>
                <TableHead className="text-center">Taxa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userMetrics.map((m) => {
                const rate = m.total > 0 ? ((m.completed / m.total) * 100).toFixed(0) : '0'
                return (
                  <TableRow key={m.userId}>
                    <TableCell className="font-medium">{m.userName}</TableCell>
                    <TableCell className="text-center">{m.total}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{m.completed}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20">
                        {m.qualified}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">{rate}%</TableCell>
                  </TableRow>
                )
              })}
              {userMetrics.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                    Nenhuma visita encontrada para o filtro selecionado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
