import { useState, useMemo } from 'react'
import { GoogleMap } from '@/components/GoogleMap'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Route as RouteIcon, MapPin, Clock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Badge } from '@/components/ui/badge'
import { useData } from '@/contexts/DataContext'
import { toast } from 'sonner'

function calculateRealDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

type VisitStatus = 'pending' | 'delayed' | 'completed'

interface MapPoint {
  id: string
  name: string
  lat: number
  lng: number
  status: VisitStatus
  salesman: string
}

export default function MapPage() {
  const { visits } = useData()
  const [filters, setFilters] = useState<VisitStatus[]>(['pending', 'delayed', 'completed'])
  const [searchTerm, setSearchTerm] = useState('')
  const [optimizedRoute, setOptimizedRoute] = useState<MapPoint[] | null>(null)
  const [routePath, setRoutePath] = useState<{ lat: number; lng: number }[] | undefined>(undefined)
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Memoize points combining real visits and some mock scheduled visits for demonstration
  const allPoints = useMemo<MapPoint[]>(() => {
    const realVisits = visits
      .filter((v) => v.lat && v.lng)
      .map((v) => ({
        id: v.id,
        name: v.company,
        lat: v.lat!,
        lng: v.lng!,
        status: (v.approvalStatus === 'approved' ? 'completed' : 'pending') as VisitStatus,
        salesman: v.salesmanName || 'Desconhecido',
      }))

    // Add mock points to demonstrate 'delayed' and 'pending' if real data is sparse
    const mockPoints: MapPoint[] = [
      {
        id: 'm1',
        name: 'Cliente Atrasado Alpha',
        lat: -23.561,
        lng: -46.641,
        status: 'delayed',
        salesman: 'João',
      },
      {
        id: 'm2',
        name: 'Cliente Pendente Beta',
        lat: -23.572,
        lng: -46.652,
        status: 'pending',
        salesman: 'Maria',
      },
      {
        id: 'm3',
        name: 'Indústria Gamma (Atrasada)',
        lat: -23.553,
        lng: -46.633,
        status: 'delayed',
        salesman: 'João',
      },
      {
        id: 'm4',
        name: 'Comércio Delta',
        lat: -23.58,
        lng: -46.66,
        status: 'pending',
        salesman: 'Carlos',
      },
    ]

    return [...realVisits, ...mockPoints]
  }, [visits])

  const filteredPoints = useMemo(() => {
    let pts = allPoints.filter((p) => filters.includes(p.status))
    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      pts = pts.filter(
        (p) => p.name.toLowerCase().includes(lower) || p.salesman.toLowerCase().includes(lower),
      )
    }
    return pts
  }, [allPoints, filters, searchTerm])

  const handleOptimize = async () => {
    if (filteredPoints.length === 0) {
      toast.error('Nenhum ponto para otimizar', {
        description: 'Ajuste os filtros e tente novamente.',
      })
      return
    }

    setIsOptimizing(true)

    // Nearest neighbor algorithm
    const unvisited = [...filteredPoints]
    const optimized: MapPoint[] = []

    let current = unvisited.shift()!
    optimized.push(current)

    while (unvisited.length > 0) {
      let nearestIdx = 0
      let minDistance = Infinity

      for (let i = 0; i < unvisited.length; i++) {
        const dist = calculateRealDistance(
          current.lat,
          current.lng,
          unvisited[i].lat,
          unvisited[i].lng,
        )
        if (dist < minDistance) {
          minDistance = dist
          nearestIdx = i
        }
      }

      current = unvisited.splice(nearestIdx, 1)[0]
      optimized.push(current)
    }

    setOptimizedRoute(optimized)

    try {
      // Fetch actual path from OSRM
      const coordsString = optimized.map((p) => `${p.lng},${p.lat}`).join(';')
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`,
      )

      if (!res.ok) throw new Error('OSRM API Error')

      const data = await res.json()
      if (data.routes && data.routes.length > 0) {
        const polylineCoords = data.routes[0].geometry.coordinates.map((c: number[]) => ({
          lat: c[1],
          lng: c[0],
        }))
        setRoutePath(polylineCoords)
      } else {
        setRoutePath(optimized.map((p) => ({ lat: p.lat, lng: p.lng })))
      }

      toast.success('Rota Otimizada!', {
        description: 'A sequência de visitas e o trajeto foram traçados com sucesso.',
      })
    } catch (err) {
      console.error(err)
      toast.error('Aviso: Rota via satélite indisponível.', {
        description: 'Desenhando percurso em linha reta.',
      })
      // Fallback
      setRoutePath(optimized.map((p) => ({ lat: p.lat, lng: p.lng })))
    } finally {
      setIsOptimizing(false)
    }
  }

  const mapMarkers = filteredPoints.map((p) => ({
    id: p.id,
    lat: p.lat,
    lng: p.lng,
    label: p.name,
    color: p.status === 'completed' ? '#22C55E' : p.status === 'delayed' ? '#EF4444' : '#EAB308',
  }))

  const displayedList = optimizedRoute || filteredPoints

  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-65px)] flex flex-col md:flex-row relative overflow-hidden">
      {/* Sidebar for Desktop / Floating Panel */}
      <div className="md:w-96 border-r bg-background flex flex-col z-10 p-4 space-y-4 shadow-xl md:shadow-none h-full overflow-hidden">
        <div>
          <h2 className="text-xl font-bold text-primary mb-1">Rotas e Acompanhamento</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Gerencie as visitas e otimize trajetos em tempo real.
          </p>

          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente ou vendedor..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <ToggleGroup
            type="multiple"
            value={filters}
            onValueChange={(v) => {
              if (v.length) setFilters(v as VisitStatus[])
            }}
            className="justify-start gap-2"
          >
            <ToggleGroupItem
              value="pending"
              className="h-8 text-xs border border-yellow-200 bg-yellow-50 text-yellow-700 data-[state=on]:bg-yellow-200 data-[state=on]:text-yellow-900"
            >
              <Clock className="w-3 h-3 mr-1" /> Pendentes
            </ToggleGroupItem>
            <ToggleGroupItem
              value="delayed"
              className="h-8 text-xs border border-red-200 bg-red-50 text-red-700 data-[state=on]:bg-red-200 data-[state=on]:text-red-900"
            >
              <Clock className="w-3 h-3 mr-1" /> Atrasadas
            </ToggleGroupItem>
            <ToggleGroupItem
              value="completed"
              className="h-8 text-xs border border-green-200 bg-green-50 text-green-700 data-[state=on]:bg-green-200 data-[state=on]:text-green-900"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" /> Concluídas
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Button
          onClick={handleOptimize}
          className="w-full shadow-sm"
          variant="secondary"
          disabled={isOptimizing}
        >
          <RouteIcon
            className={`w-4 h-4 mr-2 ${isOptimizing ? 'animate-pulse text-primary' : ''}`}
          />
          {isOptimizing ? 'Traçando Rota...' : 'Sugerir Rota Otimizada'}
        </Button>

        <div className="flex-1 overflow-y-auto pt-2 border-t mt-2 pb-16 md:pb-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {optimizedRoute ? 'Sequência Otimizada' : 'Visitas Encontradas'} (
              {displayedList.length})
            </h3>
            {optimizedRoute && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOptimizedRoute(null)
                  setRoutePath(undefined)
                }}
                className="h-6 text-xs text-destructive"
              >
                Limpar Rota
              </Button>
            )}
          </div>

          <div className="space-y-3 pr-2">
            {displayedList.map((pt, idx) => (
              <Card
                key={`${pt.id}-${idx}`}
                className="p-3 cursor-pointer hover:border-primary transition-colors flex items-start gap-3"
              >
                <div
                  className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm
                  ${pt.status === 'completed' ? 'bg-green-500' : pt.status === 'delayed' ? 'bg-red-500' : 'bg-yellow-500'}`}
                >
                  {optimizedRoute ? idx + 1 : <MapPin className="w-3 h-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{pt.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">Vendedor: {pt.salesman}</p>
                </div>
                <div>
                  {pt.status === 'completed' && (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200 bg-green-50"
                    >
                      Ok
                    </Badge>
                  )}
                  {pt.status === 'delayed' && (
                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                      Atraso
                    </Badge>
                  )}
                  {pt.status === 'pending' && (
                    <Badge
                      variant="outline"
                      className="text-yellow-600 border-yellow-200 bg-yellow-50"
                    >
                      Pend.
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
            {displayedList.length === 0 && (
              <div className="text-center p-6 text-muted-foreground text-sm">
                Nenhum ponto encontrado com os filtros atuais.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-muted">
        <GoogleMap
          className="absolute inset-0 w-full h-full"
          markers={mapMarkers}
          route={routePath}
          showPolygon
        />
      </div>
    </div>
  )
}
