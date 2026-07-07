import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapMock } from '@/components/MapMock'
import pb from '@/lib/pocketbase/client'
import {
  Activity,
  Target,
  DollarSign,
  MapPin,
  Download,
  FilterX,
  AlertTriangle,
  Clock,
  CheckCircle,
  BarChart3,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateRangePicker } from '@/components/DateRangePicker'
import { DateRange } from 'react-day-picker'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useData } from '@/contexts/DataContext'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'
import { getMySchedules, getSchedules } from '@/services/schedules'
import { getUsers } from '@/services/users'
import { getCycleInfo } from '@/lib/cycle'
import { Progress } from '@/components/ui/progress'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts'

const PRODUCTS_LIST = [
  'Carvão Ativado Granulado',
  'Carvão Ativado Pulverizado',
  'Resina Aniônica Forte',
  'Resina Catiônica Forte',
  'Elemento Filtrante Bobinado',
  'Elemento Filtrante Plissado',
  'Areia Filtrante',
  'Seixo Rolado',
]

function SalesDashboard({ visits }: { visits: any[] }) {
  const { user } = useAuth()
  const [todaySchedule, setTodaySchedule] = useState<any>(null)

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!user?.id) return
      try {
        const schedules = await getMySchedules(user.id)
        const { cycleWeek, dayStr } = getCycleInfo()
        const todaySch = schedules.find(
          (s) => s.week_number === cycleWeek && s.day_of_week === dayStr,
        )
        setTodaySchedule(todaySch || null)
      } catch (e) {
        console.error(e)
      }
    }
    fetchSchedule()
  }, [user?.id])

  const { cycleWeek, dayLabel } = getCycleInfo()
  const today = new Date().toISOString().split('T')[0]
  const todayVisits = visits.filter(
    (v) =>
      (v.timestamp && v.timestamp.startsWith(today)) || (v.created && v.created.startsWith(today)),
  ).length
  const pendingApprovals = visits.filter(
    (v) => v.approvalStatus === 'pending' || v.approvalStatus === 'needs_review',
  ).length
  const goal = 50
  const progress = Math.min(100, Math.round((visits.length / goal) * 100))

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Meu Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Resumo da sua performance individual e metas.
          </p>
        </div>
        <Button onClick={() => (window.location.href = '/visitas')} className="shadow-md">
          <MapPin className="mr-2 h-4 w-4" /> Iniciar Visita
        </Button>
      </div>

      {todaySchedule && todaySchedule.expand?.zone_id && (
        <Card className="bg-primary/5 border-primary/20 shadow-sm animate-fade-in-up">
          <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Rota de Hoje{' '}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (Semana {cycleWeek} • {dayLabel})
                  </span>
                </h3>
                <p className="text-muted-foreground font-medium">
                  Zona Designada:{' '}
                  <span className="text-primary">{todaySchedule.expand.zone_id.name}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  CEP Alvo: {todaySchedule.expand.zone_id.cep || 'Não definido'}
                </p>
              </div>
            </div>
            <Button
              className="w-full md:w-auto shadow-sm"
              variant="outline"
              onClick={() => {
                const zone = todaySchedule.expand.zone_id
                // using OpenStreetMap directions
                window.open(
                  `https://www.openstreetmap.org/directions?engine=osrm_car&route=%3B${zone.lat}%2C${zone.lng}`,
                  '_blank',
                )
              }}
            >
              <MapPin className="mr-2 h-4 w-4" /> Ver no Mapa
            </Button>
          </CardContent>
        </Card>
      )}

      {!todaySchedule && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-8 text-center flex flex-col items-center">
            <Clock className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-1">Nenhuma Rota Hoje</h3>
            <p className="text-muted-foreground text-sm">
              Você não possui uma zona de prioridade agendada para hoje. Aproveite para prospectar
              livremente ou revise pendências.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Visitas Hoje</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">{todayVisits}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MapPin className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Aprovações Pendentes</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">{pendingApprovals}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Meta Mensal (Visitas)</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {visits.length}{' '}
                  <span className="text-sm font-normal text-muted-foreground">/ {goal}</span>
                </h3>
              </div>
              <Target className="w-6 h-6 text-muted-foreground mb-1" />
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <Card className="h-[450px] flex flex-col shadow-sm">
        <CardHeader className="px-6 py-4 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Minhas Últimas Visitas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto">
          <div className="divide-y">
            {visits.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Nenhuma visita registrada. Comece a prospectar!
              </div>
            )}
            {visits.slice(0, 15).map((v) => (
              <div
                key={v.id}
                className="p-5 hover:bg-muted/30 transition-colors group flex flex-col sm:flex-row justify-between sm:items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-base">{v.company}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />{' '}
                      {new Date(v.timestamp || v.created).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {v.address || 'Sem endereço'} - {v.region}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                  {v.approvalStatus === 'pending' && (
                    <Badge
                      variant="outline"
                      className="text-xs text-yellow-600 border-yellow-300 bg-yellow-50 px-2 py-1"
                    >
                      Pendente
                    </Badge>
                  )}
                  {v.approvalStatus === 'needs_review' && (
                    <Badge
                      variant="outline"
                      className="text-xs text-orange-600 border-orange-300 bg-orange-50 px-2 py-1"
                    >
                      Revisão
                    </Badge>
                  )}
                  {v.approvalStatus === 'approved' && (
                    <Badge
                      variant="outline"
                      className="text-xs text-green-600 border-green-300 bg-green-50 px-2 py-1 flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" /> Aprovada
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ManagerMapSection({ visits, zones }: { visits: any[]; zones: any[] }) {
  const [timeframe, setTimeframe] = useState<'daily' | 'fortnightly' | 'monthly'>('daily')

  const mapVisits = useMemo(() => {
    const now = new Date()
    return visits.filter((v) => {
      const vDate = new Date(v.timestamp || v.created)
      const diffTime = Math.abs(now.getTime() - vDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (timeframe === 'daily') return diffDays <= 1
      if (timeframe === 'fortnightly') return diffDays <= 15
      if (timeframe === 'monthly') return diffDays <= 30
      return true
    })
  }, [visits, timeframe])

  const mapMarkers = mapVisits.map((v, i) => ({
    id: v.id,
    lat: v.lat || -23.55 + i * 0.01,
    lng: v.lng || -46.63 + i * 0.01,
    color: v.priority ? '#EF4444' : '#004A99',
    label: v.company,
    salesmanName: v.salesmanName,
  }))

  return (
    <Card className="flex flex-col shadow-sm mt-6">
      <CardHeader className="px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" /> Cobertura Geográfica
        </CardTitle>
        <Tabs
          value={timeframe}
          onValueChange={(v) => setTimeframe(v as any)}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Diário</TabsTrigger>
            <TabsTrigger value="fortnightly">Quinzenal</TabsTrigger>
            <TabsTrigger value="monthly">Mensal</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
          <div className="lg:col-span-2 relative border-r">
            <MapMock
              className="w-full h-full rounded-bl-xl lg:rounded-bl-none"
              markers={mapMarkers}
              zones={zones}
            />
          </div>
          <div className="h-full overflow-y-auto bg-muted/10 p-4">
            <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">
              Visitas ({mapVisits.length})
            </h3>
            <div className="space-y-3">
              {mapVisits.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">
                  Nenhuma visita encontrada para este período.
                </p>
              ) : (
                mapVisits.map((v) => (
                  <div
                    key={v.id}
                    className="bg-background p-3 rounded-lg border shadow-sm text-sm flex flex-col gap-1"
                  >
                    <div className="font-semibold">{v.company}</div>
                    <div className="text-muted-foreground text-xs flex items-start gap-1 mt-1">
                      <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{v.address || 'Sem endereço'}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-muted/50">
                      <span className="text-xs font-medium text-primary">
                        {v.salesmanName || 'Vendedor'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(v.timestamp || v.created).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ManagerDashboard({ visits, zones }: { visits: any[]; zones: any[] }) {
  const [regionFilter, setRegionFilter] = useState('all')
  const [productFilter, setProductFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>()
  const [salesmanFilter, setSalesmanFilter] = useState('all')
  const [teamUsers, setTeamUsers] = useState<any[]>([])
  const [allSchedules, setAllSchedules] = useState<any[]>([])

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const [usersData, schedulesData] = await Promise.all([getUsers(), getSchedules()])
        setTeamUsers(usersData)
        setAllSchedules(schedulesData)
      } catch (e) {
        console.error(e)
      }
    }
    fetchTeamData()
  }, [])

  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      let keep = true
      if (salesmanFilter !== 'all' && v.salesmanId !== salesmanFilter) keep = false
      if (regionFilter !== 'all' && v.region !== regionFilter) keep = false
      if (productFilter !== 'all' && !(v.products && v.products[productFilter])) keep = false
      if (dateFilter?.from) {
        const vDate = new Date(v.timestamp || v.created)
        if (vDate < dateFilter.from) keep = false
        if (dateFilter.to && vDate > new Date(dateFilter.to.getTime() + 86400000)) keep = false
      }
      return keep
    })
  }, [visits, regionFilter, productFilter, dateFilter])

  const totalVisits = filteredVisits.length
  const estVolume = filteredVisits.reduce((acc, v) => {
    if (!v.products) return acc
    if (productFilter !== 'all') return acc + (v.products[productFilter] || 0)
    return acc + Object.values(v.products).reduce((sum, val) => sum + (Number(val) || 0), 0)
  }, 0)

  const salesmanData = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredVisits.forEach((v) => {
      const name = v.salesmanName || 'Desconhecido'
      counts[name] = (counts[name] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [filteredVisits])

  const visitsForMap = useMemo(() => {
    return visits.filter((v) => {
      let keep = true
      if (salesmanFilter !== 'all' && v.salesmanId !== salesmanFilter) keep = false
      if (regionFilter !== 'all' && v.region !== regionFilter) keep = false
      if (productFilter !== 'all' && !(v.products && v.products[productFilter])) keep = false
      return keep
    })
  }, [visits, salesmanFilter, regionFilter, productFilter])

  const approvalData = useMemo(() => {
    const counts = { approved: 0, pending: 0, needs_review: 0 }
    filteredVisits.forEach((v) => {
      if (v.approvalStatus === 'approved') counts.approved++
      else if (v.approvalStatus === 'needs_review') counts.needs_review++
      else counts.pending++
    })
    return [
      { name: 'Aprovadas', value: counts.approved, fill: '#16a34a' },
      { name: 'Pendentes', value: counts.pending, fill: '#eab308' },
      { name: 'Revisão', value: counts.needs_review, fill: '#dc2626' },
    ]
  }, [filteredVisits])

  const zonePerformanceData = useMemo(() => {
    const performance: Record<
      string,
      { total: number; approved: number; pending: number; review: number }
    > = {}
    filteredVisits.forEach((v) => {
      // For mock, try to use zone name or region if zone not populated
      const zoneName = v.expand?.zone_id?.name || v.region || 'Desconhecida'
      if (!performance[zoneName]) {
        performance[zoneName] = { total: 0, approved: 0, pending: 0, review: 0 }
      }
      performance[zoneName].total++
      if (v.approvalStatus === 'approved') performance[zoneName].approved++
      else if (v.approvalStatus === 'needs_review') performance[zoneName].review++
      else performance[zoneName].pending++
    })
    return Object.entries(performance)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [filteredVisits])

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Dashboard Global</h1>
          <p className="text-muted-foreground text-sm">
            Visão geral da equipe, aprovações e performance de campo.
          </p>
        </div>
        <Button
          onClick={() => toast.success('Relatório gerado com sucesso!')}
          className="w-full md:w-auto shadow-md"
        >
          <Download className="mr-2 h-4 w-4" /> Exportar Dados
        </Button>
      </div>

      <Card className="bg-muted/30 border-primary/10 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end md:items-center">
          <div className="w-full md:w-48">
            <Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Vendedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Vendedores</SelectItem>
                {teamUsers
                  .filter((u) => u.role === 'sales')
                  .map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name || u.email}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Região" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Regiões</SelectItem>
                <SelectItem value="Sul">Sul</SelectItem>
                <SelectItem value="Norte">Norte</SelectItem>
                <SelectItem value="Leste">Leste</SelectItem>
                <SelectItem value="Oeste">Oeste</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-64">
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Produtos</SelectItem>
                {PRODUCTS_LIST.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-auto flex-1">
            <DateRangePicker date={dateFilter} setDate={setDateFilter} />
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setSalesmanFilter('all')
              setRegionFilter('all')
              setProductFilter('all')
              setDateFilter(undefined)
            }}
            className="w-full md:w-auto text-muted-foreground"
          >
            <FilterX className="w-4 h-4 mr-2" /> Limpar
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Visitas</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">{totalVisits}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MapPin className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pendente Avaliação</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">
                {approvalData.find((d) => d.name === 'Pendentes')?.value || 0}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center text-warning">
              <CheckCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Volume Estimado (Ton)</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">{estVolume}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Zonas Críticas</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">{zones.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {visits.length === 0 && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-12 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma visita registrada</h3>
            <p className="text-muted-foreground">
              Os dados de visitas e performance aparecerão aqui assim que a equipe começar a
              registrar as atividades em campo.
            </p>
          </CardContent>
        </Card>
      )}

      {allSchedules.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Rotas Planejadas vs. Executadas (Hoje)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {allSchedules.map((s) => {
                const salesUser = teamUsers.find((u) => u.id === s.user_id)
                const zoneName = s.expand?.zone_id?.name || '—'
                const todayCount = visits.filter(
                  (v) =>
                    v.salesmanId === s.user_id &&
                    new Date(v.timestamp || v.created).toDateString() === new Date().toDateString(),
                ).length
                return (
                  <div key={s.id} className="p-4 flex items-center justify-between">
                    <div>
                      <span className="font-medium">{salesUser?.name || '—'}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        Semana {s.week_number} • {s.day_of_week}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        Zona: {zoneName}
                      </Badge>
                      <Badge variant={todayCount > 0 ? 'default' : 'secondary'} className="text-xs">
                        {todayCount} visitas hoje
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Visitas por Vendedor
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <ChartContainer
                config={{ count: { label: 'Visitas', color: 'hsl(var(--primary))' } }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesmanData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      className="stroke-muted"
                    />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="count"
                      fill="var(--color-count)"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Performance por Zona
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  total: { label: 'Total Visitas', color: 'hsl(var(--primary))' },
                  approved: { label: 'Aprovadas', color: '#16a34a' },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={zonePerformanceData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      className="stroke-muted"
                    />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="total"
                      fill="var(--color-total)"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                    <Bar
                      dataKey="approved"
                      fill="var(--color-approved)"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <ManagerMapSection visits={visitsForMap} zones={zones} />
    </div>
  )
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

export default function Index() {
  const { user } = useAuth()
  const { visits, zones, loading } = useData()

  useEffect(() => {
    if (user?.id) {
      pb.collection('audit_logs')
        .create({
          user: user.id,
          action: 'Dashboard Viewed',
        })
        .catch(() => {})
    }
  }, [user?.id])

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const fallback = (
    <div className="p-8 text-center max-w-md mx-auto mt-10">
      <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Erro ao carregar o dashboard</h2>
      <p className="text-muted-foreground mb-4">
        Ocorreu um erro inesperado ao tentar exibir as informações. Por favor, recarregue a página
        ou contate o suporte se o problema persistir.
      </p>
      <Button onClick={() => window.location.reload()}>Recarregar</Button>
    </div>
  )

  return (
    <ErrorBoundary fallback={fallback}>
      {user?.role === 'sales' ? (
        <SalesDashboard visits={visits || []} />
      ) : (
        <ManagerDashboard visits={visits || []} zones={zones || []} />
      )}
    </ErrorBoundary>
  )
}
