import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapMock } from '@/components/MapMock'
import {
  Activity,
  Target,
  Users,
  DollarSign,
  MapPin,
  Download,
  FileText,
  Table as TableIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useData } from '@/contexts/DataContext'

const mockMarkers = [
  { id: '1', lat: 35, lng: 40, color: '#004A99', label: 'João - Ativo' },
  { id: '2', lat: 60, lng: 65, color: '#10B981', label: 'Maria - Check-in' },
  { id: '3', lat: 25, lng: 70, color: '#FFB800', label: 'Pedro - Deslocamento' },
  { id: '4', lat: 75, lng: 30, color: '#004A99', label: 'Ana - Ativa' },
]

const recentActivityMock = [
  {
    id: 'm1',
    user: 'Maria Oliveira',
    action: 'finalizou visita em',
    target: 'Fazenda Boa Vista',
    time: '14:20',
  },
  { id: 'm2', user: 'Pedro Costa', action: 'iniciou rota', target: 'Região Norte', time: '13:45' },
]

export default function Index() {
  const { visits } = useData()

  const handleExport = (type: 'pdf' | 'excel') => {
    toast.success(`Relatório ${type.toUpperCase()} gerado com sucesso!`, {
      description: 'O download começará em instantes.',
    })
  }

  // Merge real visits with mock activities
  const displayActivities = [
    ...visits.map((v, i) => ({
      id: v.id || `v-${i}`,
      user: v.salesmanName,
      action: v.status === 'pending' ? 'salvou offline visita em' : 'registrou visita em',
      target: v.company,
      time: new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })),
    ...recentActivityMock,
  ].slice(0, 6)

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Dashboard Gerencial</h1>
          <p className="text-muted-foreground text-sm">Visão geral das operações externas hoje.</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full md:w-auto shadow-md hover:shadow-lg transition-shadow">
              <Download className="mr-2 h-4 w-4" />
              Exportar Relatório
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer">
              <FileText className="mr-2 h-4 w-4 text-destructive" /> PDF Documento
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel')} className="cursor-pointer">
              <TableIcon className="mr-2 h-4 w-4 text-success" /> Excel (CSV)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Visitas Hoje</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">{124 + visits.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MapPin className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cobertura de Área</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">68%</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
              <Target className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vendedores Ativos</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">12/15</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vol. Estimado</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">R$ 45k</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <Card className="lg:col-span-2 flex flex-col h-[500px]">
          <CardHeader className="px-6 py-4 border-b">
            <CardTitle className="text-lg">Mapa de Operações Ao Vivo</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative">
            <MapMock className="w-full h-full rounded-b-xl" markers={mockMarkers} showPolygon />
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="h-[500px] flex flex-col">
          <CardHeader className="px-6 py-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Feed de Atividades
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto">
            <div className="divide-y">
              {displayActivities.map((act) => (
                <div key={act.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm">{act.user}</span>
                    <span className="text-xs text-muted-foreground">{act.time}</span>
                  </div>
                  <p className="text-sm text-foreground/80">
                    {act.action} <span className="font-medium text-foreground">{act.target}</span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
