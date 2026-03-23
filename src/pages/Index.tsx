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
  MessageCircle,
  Clock,
  CheckCircle,
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
import { getWhatsAppUrl } from '@/lib/utils'

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
  const { visits, zones, loading } = useData()

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

  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      let keep = true
      if (regionFilter !== 'all' && v.region !== regionFilter) keep = false
      if (productFilter !== 'all' && !v.products[productFilter]) keep = false
      if (dateFilter?.from) {
        const vDate = new Date(v.timestamp)
        if (vDate < dateFilter.from) keep = false
        if (dateFilter.to && vDate > new Date(dateFilter.to.getTime() + 86400000)) keep = false
      }
      return keep
    })
  }, [visits, regionFilter, productFilter, dateFilter])

  const totalVisits = filteredVisits.length
  const successVisits = filteredVisits.filter(
    (v) => v.interest === 'alto' || v.reason === 'fechamento',
  ).length
  const successRate = totalVisits > 0 ? Math.round((successVisits / totalVisits) * 100) : 0

  const estVolume = filteredVisits.reduce((acc, v) => {
    if (productFilter !== 'all') return acc + (v.products[productFilter] || 0)
    return acc + Object.values(v.products).reduce((sum, val) => sum + val, 0)
  }, 0)

  const mapMarkers = filteredVisits.map((v, i) => ({
    id: v.id,
    lat: v.lat || 30 + i * 10,
    lng: v.lng || 40 + i * 10,
    color: v.priority ? '#EF4444' : '#004A99',
    label: v.company,
  }))

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando dashboard...</div>
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Dashboard Gerencial</h1>
          <p className="text-muted-foreground text-sm">
            Visão geral da operação e performance de campo.
          </p>
        </div>
        <Button onClick={handleExport} className="w-full md:w-auto shadow-md">
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
            onClick={clearFilters}
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
              <p className="text-sm font-medium text-muted-foreground">Visitas Realizadas</p>
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
              <p className="text-sm font-medium text-muted-foreground">Taxa Conversão</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">{successRate}%</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
              <Target className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col h-[550px] shadow-sm">
          <CardHeader className="px-6 py-4 border-b">
            <CardTitle className="text-lg">Mapa de Operações</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative">
            <MapMock className="w-full h-full rounded-b-xl" markers={mapMarkers} zones={zones} />
          </CardContent>
        </Card>

        <Card className="h-[550px] flex flex-col shadow-sm">
          <CardHeader className="px-6 py-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Últimas Visitas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto">
            <div className="divide-y">
              {filteredVisits.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhuma visita neste período.
                </div>
              )}
              {filteredVisits.map((v) => (
                <div key={v.id} className="p-5 hover:bg-muted/30 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm">{v.salesmanName}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(v.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm text-foreground/90">
                      Cliente: <span className="font-medium text-foreground">{v.company}</span>
                    </p>
                    {v.phone && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                        onClick={() => window.open(getWhatsAppUrl(v.phone), '_blank')}
                        title="Falar no WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" /> Falar
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {v.priority && (
                      <Badge variant="destructive" className="text-[10px]">
                        Alta Prioridade
                      </Badge>
                    )}
                    {v.approvalStatus === 'pending' && (
                      <Badge
                        variant="outline"
                        className="text-[10px] text-yellow-600 border-yellow-300 bg-yellow-50"
                      >
                        Pendente Avaliação
                      </Badge>
                    )}
                    {v.approvalStatus === 'needs_review' && (
                      <Badge
                        variant="outline"
                        className="text-[10px] text-orange-600 border-orange-300 bg-orange-50"
                      >
                        Revisão Solicitada
                      </Badge>
                    )}
                    {v.approvalStatus === 'approved' && (
                      <Badge
                        variant="outline"
                        className="text-[10px] text-green-600 border-green-300 bg-green-50 flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> Concluída
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
