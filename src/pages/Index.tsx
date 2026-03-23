import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapMock } from '@/components/MapMock'
import {
  Activity,
  Target,
  Users,
  DollarSign,
  MapPin,
  Download,
  FilterX,
  AlertTriangle,
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
import { Badge } from '@/components/ui/badge'

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

export default function Index() {
  const { visits, zones } = useData()

  const [regionFilter, setRegionFilter] = useState('all')
  const [productFilter, setProductFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>()

  const handleExport = () => {
    toast.success('Relatório gerado com sucesso!', {
      description: 'O download começará em instantes.',
    })
  }

  const clearFilters = () => {
    setRegionFilter('all')
    setProductFilter('all')
    setDateFilter(undefined)
  }

  // Apply Filters
  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      let keep = true
      if (regionFilter !== 'all' && v.region !== regionFilter) keep = false
      if (productFilter !== 'all' && !v.products[productFilter]) keep = false
      if (dateFilter?.from) {
        const vDate = new Date(v.timestamp)
        if (vDate < dateFilter.from) keep = false
        if (dateFilter.to && vDate > new Date(dateFilter.to.getTime() + 86400000)) keep = false // include end day
      }
      return keep
    })
  }, [visits, regionFilter, productFilter, dateFilter])

  // KPIs calculations
  const totalVisits = filteredVisits.length
  const successVisits = filteredVisits.filter(
    (v) => v.interest === 'alto' || v.reason === 'fechamento',
  ).length
  const successRate = totalVisits > 0 ? Math.round((successVisits / totalVisits) * 100) : 0

  // Calculate volume based on filtered product or total if 'all'
  const estVolume = filteredVisits.reduce((acc, v) => {
    if (productFilter !== 'all') {
      return acc + (v.products[productFilter] || 0)
    }
    return acc + Object.values(v.products).reduce((sum, val) => sum + val, 0)
  }, 0)

  const mapMarkers = filteredVisits.map((v, i) => ({
    id: v.id,
    lat: v.lat || 30 + i * 10,
    lng: v.lng || 40 + i * 10,
    color: v.priority ? '#EF4444' : '#004A99',
    label: v.company,
  }))

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Dashboard Gerencial</h1>
          <p className="text-muted-foreground text-sm">Visão geral e filtros avançados.</p>
        </div>
        <Button onClick={handleExport} className="w-full md:w-auto shadow-md">
          <Download className="mr-2 h-4 w-4" /> Exportar Dados
        </Button>
      </div>

      {/* Persistent Filters Bar */}
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
            onClick={clearFilters}
            className="w-full md:w-auto whitespace-nowrap text-muted-foreground hover:text-foreground"
          >
            <FilterX className="w-4 h-4 mr-2" /> Limpar
          </Button>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Visitas (Filtro)</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">{totalVisits}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MapPin className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Taxa Sucesso</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">{successRate}%</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
              <Target className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Volume (Ton)</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">{estVolume}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <Card className="lg:col-span-2 flex flex-col h-[500px]">
          <CardHeader className="px-6 py-4 border-b">
            <CardTitle className="text-lg">Mapa de Operações (Filtrado)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative">
            <MapMock className="w-full h-full rounded-b-xl" markers={mapMarkers} zones={zones} />
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="h-[500px] flex flex-col">
          <CardHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Feed Filtrado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto">
            <div className="divide-y">
              {filteredVisits.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhuma atividade neste filtro.
                </div>
              )}
              {filteredVisits.map((v) => (
                <div key={v.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm">{v.salesmanName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(v.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 mb-2">
                    registrou visita em{' '}
                    <span className="font-medium text-foreground">{v.company}</span>
                  </p>
                  <div className="flex gap-2">
                    {v.priority && (
                      <Badge variant="destructive" className="text-[10px]">
                        Alta Prioridade
                      </Badge>
                    )}
                    {v.approvalStatus === 'pending' && (
                      <Badge variant="outline" className="text-[10px]">
                        Aguardando Revisão
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
