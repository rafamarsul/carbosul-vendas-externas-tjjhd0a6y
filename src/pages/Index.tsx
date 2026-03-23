import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapMock } from '@/components/MapMock'
import { Activity, Target, Users, DollarSign, MapPin } from 'lucide-react'

const mockMarkers = [
  { id: '1', lat: 35, lng: 40, color: '#004A99', label: 'João - Ativo' },
  { id: '2', lat: 60, lng: 65, color: '#10B981', label: 'Maria - Check-in' },
  { id: '3', lat: 25, lng: 70, color: '#FFB800', label: 'Pedro - Deslocamento' },
  { id: '4', lat: 75, lng: 30, color: '#004A99', label: 'Ana - Ativa' },
]

const recentActivity = [
  {
    id: 1,
    user: 'João Silva',
    action: 'fez check-in em',
    target: 'Agropecuária Sul',
    time: 'Há 5 min',
  },
  {
    id: 2,
    user: 'Maria Oliveira',
    action: 'finalizou visita em',
    target: 'Fazenda Boa Vista',
    time: 'Há 12 min',
  },
  { id: 3, user: 'Pedro Costa', action: 'iniciou rota', target: 'Região Norte', time: 'Há 45 min' },
  {
    id: 4,
    user: 'Ana Lima',
    action: 'registrou pedido',
    target: 'Distribuidora Central',
    time: 'Há 1 hora',
  },
]

export default function Index() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Dashboard Gerencial</h1>
          <p className="text-muted-foreground text-sm">Visão geral das operações externas hoje.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Visitas Hoje</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">124</h3>
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
              {recentActivity.map((act) => (
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
