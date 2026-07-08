import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { GoogleMap } from '@/components/GoogleMap'
import { Loader2, MapPin, Search } from 'lucide-react'
import { getVisitsByDateAndUser } from '@/services/visits'
import { getZonesByUserId } from '@/services/zones'
import { getSalesUsers } from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'

const STATUS_BADGES: Record<string, string> = {
  Concluída: 'bg-green-100 text-green-700',
  'Em Andamento': 'bg-amber-100 text-amber-700',
  Agendada: 'bg-blue-100 text-blue-700',
  Cancelada: 'bg-red-100 text-red-700',
}

function getTodayDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDateLabel(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function VisitMap() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate())
  const [selectedUser, setSelectedUser] = useState('all')
  const [salesUsers, setSalesUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [visits, setVisits] = useState<any[]>([])
  const [zones, setZones] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  useEffect(() => {
    getSalesUsers()
      .then(setSalesUsers)
      .catch(() => {})
      .finally(() => setUsersLoading(false))
  }, [])

  const loadData = async () => {
    setDataLoading(true)
    try {
      const [visitData, zoneData] = await Promise.all([
        getVisitsByDateAndUser(selectedDate, selectedUser),
        selectedUser !== 'all' ? getZonesByUserId(selectedUser) : Promise.resolve([]),
      ])
      setVisits(visitData)
      setZones(zoneData)
    } catch {
      toast.error('Erro ao carregar dados')
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('visits', () => {
    loadData()
  })

  const validVisits = useMemo(
    () =>
      visits.filter(
        (v) => typeof v.lat === 'number' && typeof v.lng === 'number' && v.lat !== 0 && v.lng !== 0,
      ),
    [visits],
  )

  const markers = useMemo(
    () =>
      validVisits.map((v) => ({
        id: v.id,
        lat: v.lat,
        lng: v.lng,
        label: v.company || 'Sem empresa',
        contact: v.contact,
        status: v.status,
        scheduledTime: formatTime(v.created),
      })),
    [validVisits],
  )

  const mapZones = useMemo(
    () => zones.map((z) => ({ id: z.id, lat: z.lat, lng: z.lng, radius: z.radius, name: z.name })),
    [zones],
  )

  const route = useMemo(() => validVisits.map((v) => ({ lat: v.lat, lng: v.lng })), [validVisits])

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Mapa de Visitas</h1>
        <p className="text-muted-foreground text-sm">
          Visualize as visitas e rotas dos vendedores no mapa.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="date-filter">Data</Label>
              <Input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label>Vendedor</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser} disabled={usersLoading}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={usersLoading ? 'Carregando...' : 'Selecione um vendedor'}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {salesUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name || u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={loadData} disabled={dataLoading}>
              {dataLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Carregar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="relative h-[500px]">
            <GoogleMap
              className="h-[500px] rounded-lg overflow-hidden"
              markers={markers}
              zones={mapZones}
              route={route}
              title="Mapa de Visitas"
              dateLabel={formatDateLabel(selectedDate)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Visitas ({visits.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Região</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : visits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhuma visita encontrada para os filtros selecionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  visits.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.company || '—'}</TableCell>
                      <TableCell>{v.contact || '—'}</TableCell>
                      <TableCell>{formatTime(v.created)}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_BADGES[v.status] || 'bg-gray-100 text-gray-700'}>
                          {v.status || 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm font-mono">
                        {v.lat && v.lng
                          ? `${Number(v.lat).toFixed(4)}, ${Number(v.lng).toFixed(4)}`
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
