import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapMock } from '@/components/MapMock'
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
import { toast } from 'sonner'
import { useData } from '@/contexts/DataContext'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'
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

function ManagerDashboard({ visits, zones }: { visits: any[]; zones: any[] }) {
  const [regionFilter, setRegionFilter] = useState('all')
  const [productFilter, setProductFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>()

  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      let keep = true
      if (regionFilter !== 'all' && v.region !== regionFilter) keep = false
      if (productFilter !== 'all' && !v.products[productFilter]) keep = false
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

  const mapMarkers = filteredVisits.map((v, i) => ({
    id: v.id,
    lat: v.lat || -23.55 + i * 0.01,
    lng: v.lng || -46.63 + i * 0.01,
    color: v.priority ? '#EF4444' : '#004A99',
    label: v.company,
  }))

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
              <TrendingUp className="w-5 h-5 text-primary" /> Status de Aprovação
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <ChartContainer config={{ value: { label: 'Qtd' } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={approvalData}
                    layout="vertical"
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      className="stroke-muted"
                    />
                    <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                      {approvalData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="flex flex-col h-[550px] shadow-sm mt-6">
        <CardHeader className="px-6 py-4 border-b">
          <CardTitle className="text-lg">Mapa de Operações Globais</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 relative">
          <MapMock className="w-full h-full rounded-b-xl" markers={mapMarkers} zones={zones} />
        </CardContent>
      </Card>
    </div>
  )
}

export default function Index() {
  const { user } = useAuth()
  const { visits, zones, loading } = useData()

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return user?.role === 'sales' ? (
    <SalesDashboard visits={visits} />
  ) : (
    <ManagerDashboard visits={visits} zones={zones} />
  )
}
