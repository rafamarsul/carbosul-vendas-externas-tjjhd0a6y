import { GoogleMap } from '@/components/GoogleMap'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

const mapMarkers = [
  { id: '1', lat: 40, lng: 30, color: '#10B981', label: 'Cliente A' },
  { id: '2', lat: 45, lng: 35, color: '#10B981', label: 'Cliente B' },
  { id: '3', lat: 35, lng: 50, color: '#004A99', label: 'Rep: João' },
  { id: '4', lat: 60, lng: 70, color: '#FFB800', label: 'Ponto de Parada' },
]

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-4rem)] md:h-screen flex flex-col md:flex-row relative">
      {/* Floating Panel for Mobile / Sidebar for Desktop */}
      <div className="md:w-80 border-r bg-card flex flex-col z-10 p-4 space-y-4 shadow-md md:shadow-none">
        <h2 className="text-xl font-bold text-primary">Mapa de Rotas</h2>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input placeholder="Buscar região ou cliente..." className="pl-9" />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 text-xs" size="sm">
            <Filter className="w-3 h-3 mr-1" /> Vendedores
          </Button>
          <Button variant="outline" className="flex-1 text-xs" size="sm">
            <Filter className="w-3 h-3 mr-1" /> Clientes
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pt-4 border-t mt-2">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Rotas Ativas</h3>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Card key={i} className="p-3 cursor-pointer hover:border-primary transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-semibold text-sm">Rota Sul - {i}</span>
                </div>
                <p className="text-xs text-muted-foreground">Responsável: João Silva</p>
                <p className="text-xs text-muted-foreground">Progresso: 4/12 clientes</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <GoogleMap className="absolute inset-0 w-full h-full" markers={mapMarkers} showPolygon />

        {/* Playback controls mock */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-card p-2 rounded-full shadow-lg border flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <span className="text-xs">⏪</span>
          </Button>
          <Button variant="default" size="icon" className="h-10 w-10 rounded-full">
            <span className="text-xs">▶️</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <span className="text-xs">⏩</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
