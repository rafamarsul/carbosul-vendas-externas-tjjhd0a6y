import { useState, useEffect, useMemo } from 'react'
import { MapPin, Plus, Trash2, Calendar, AlertCircle, ClipboardList, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GoogleMap } from '@/components/GoogleMap'
import { useRealtime } from '@/hooks/use-realtime'
import { getZones, createZone, deleteZone, type Zone } from '@/services/zones'
import { getSchedules, createSchedule, deleteSchedule } from '@/services/schedules'
import { getUsers } from '@/services/users'
import {
  getActiveCoverageAreasByUser,
  STATE_OPTIONS,
  REGION_OPTIONS,
} from '@/services/coverage-areas'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { getDayLabel } from '@/lib/cycle'
import { QuickVisitForm } from '@/components/QuickVisitForm'
import { PerformanceSummary } from '@/components/PerformanceSummary'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function Agenda() {
  const { user } = useAuth()
  const isManager = user?.role === 'manager'

  const [zones, setZones] = useState<Zone[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [coverageAreas, setCoverageAreas] = useState<any[]>([])
  const [zoneForm, setZoneForm] = useState({
    name: '',
    cep: '',
    lat: 0,
    lng: 0,
    radius: 500,
    state: 'SC' as string,
    region: 'Grande Florianópolis' as string,
  })
  const [schedForm, setSchedForm] = useState({
    user_id: '',
    week_number: 1,
    day_of_week: 'Monday',
    zone_id: '',
  })

  const fetchAll = async () => {
    try {
      const [z, s, u] = await Promise.all([getZones(), getSchedules(), getUsers()])
      setZones(z)
      setSchedules(s)
      setUsers(u)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchCoverage = async (userId: string) => {
    if (!userId) {
      setCoverageAreas([])
      return
    }
    try {
      setCoverageAreas(await getActiveCoverageAreasByUser(userId))
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchAll()
    if (!isManager && user?.id) {
      setSchedForm((p) => ({ ...p, user_id: user.id }))
      fetchCoverage(user.id)
    }
  }, [user?.id])

  useEffect(() => {
    if (isManager && schedForm.user_id) fetchCoverage(schedForm.user_id)
  }, [schedForm.user_id])

  useRealtime('zones', () => fetchAll())
  useRealtime('schedules', () => fetchAll())

  const salesZones = useMemo(() => {
    if (!user?.id) return []
    return zones.filter((z) => z.user_id === user.id)
  }, [zones, user?.id])

  const zoneOptions = isManager ? zones : salesZones

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!zoneForm.name || !zoneForm.lat || !zoneForm.lng) {
      toast.error('Preencha nome e localize no mapa')
      return
    }
    try {
      await createZone({
        name: zoneForm.name,
        cep: zoneForm.cep,
        lat: zoneForm.lat,
        lng: zoneForm.lng,
        radius: Number(zoneForm.radius),
        state: zoneForm.state,
        region: zoneForm.region,
      })
      toast.success('Zona criada!')
      setZoneForm({
        name: '',
        cep: '',
        lat: 0,
        lng: 0,
        radius: 500,
        state: 'SC',
        region: 'Grande Florianópolis',
      })
    } catch {
      toast.error('Erro ao criar zona')
    }
  }

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!schedForm.user_id || !schedForm.zone_id) {
      toast.error('Selecione vendedor e zona')
      return
    }
    const selectedZone = zones.find((z) => z.id === schedForm.zone_id)
    if (selectedZone) {
      const inCoverage = coverageAreas.some(
        (a) => a.state === selectedZone.state && a.region === selectedZone.region,
      )
      if (!inCoverage && !isManager) {
        toast.error('Esta zona não pertence à sua área de cobertura atribuída.')
        return
      }
    }
    try {
      await createSchedule({ ...schedForm, week_number: Number(schedForm.week_number) })
      toast.success('Agendamento criado!')
      setSchedForm({
        user_id: isManager ? '' : user?.id || '',
        week_number: 1,
        day_of_week: 'Monday',
        zone_id: '',
      })
    } catch {
      toast.error('Erro ao criar agendamento')
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Agenda & Rotas</h1>
        <p className="text-muted-foreground text-sm">Gerencie zonas e escalas da equipe.</p>
      </div>
      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance">
            <BarChart3 className="w-4 h-4 mr-1" /> Performance
          </TabsTrigger>
          {isManager && (
            <TabsTrigger value="zones">
              <MapPin className="w-4 h-4 mr-1" /> Zonas
            </TabsTrigger>
          )}
          <TabsTrigger value="schedules">
            <Calendar className="w-4 h-4 mr-1" /> Escalas
          </TabsTrigger>
          <TabsTrigger value="visits">
            <ClipboardList className="w-4 h-4 mr-1" /> Visitas
          </TabsTrigger>
        </TabsList>
        <TabsContent value="performance" className="space-y-4">
          <PerformanceSummary />
        </TabsContent>
        {isManager && (
          <TabsContent value="zones" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Nova Zona</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateZone} className="space-y-3">
                    <div className="space-y-1">
                      <Label>Nome</Label>
                      <Input
                        value={zoneForm.name}
                        onChange={(e) => setZoneForm((p) => ({ ...p, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>CEP</Label>
                        <Input
                          value={zoneForm.cep}
                          onChange={(e) => setZoneForm((p) => ({ ...p, cep: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Raio (m)</Label>
                        <Input
                          type="number"
                          value={zoneForm.radius}
                          onChange={(e) =>
                            setZoneForm((p) => ({ ...p, radius: Number(e.target.value) }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Estado</Label>
                        <Select
                          value={zoneForm.state}
                          onValueChange={(v) => setZoneForm((p) => ({ ...p, state: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATE_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Região</Label>
                        <Select
                          value={zoneForm.region}
                          onValueChange={(v) => setZoneForm((p) => ({ ...p, region: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {REGION_OPTIONS.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Lat</Label>
                        <Input
                          type="number"
                          step="any"
                          value={zoneForm.lat}
                          onChange={(e) =>
                            setZoneForm((p) => ({ ...p, lat: Number(e.target.value) }))
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Lng</Label>
                        <Input
                          type="number"
                          step="any"
                          value={zoneForm.lng}
                          onChange={(e) =>
                            setZoneForm((p) => ({ ...p, lng: Number(e.target.value) }))
                          }
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Clique no mapa para definir a localização.
                    </p>
                    <div className="h-48 rounded-lg overflow-hidden border">
                      <GoogleMap
                        className="w-full h-full"
                        onClick={(lat: number, lng: number) =>
                          setZoneForm((p) => ({ ...p, lat, lng }))
                        }
                        markers={
                          zoneForm.lat ? [{ id: 'new', lat: zoneForm.lat, lng: zoneForm.lng }] : []
                        }
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Plus className="w-4 h-4 mr-2" /> Criar Zona
                    </Button>
                  </form>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Zonas ({zones.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {zones.map((z) => (
                    <div
                      key={z.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <span className="font-medium">
                          {z.name} - {z.state || '—'}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {z.region || '—'} • CEP: {z.cep || '—'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={async () => {
                          await deleteZone(z.id)
                          toast.success('Zona excluída')
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {zones.length === 0 && (
                    <p className="text-center text-muted-foreground py-4 text-sm">
                      Nenhuma zona cadastrada.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
        <TabsContent value="schedules" className="space-y-4">
          {!isManager && salesZones.length === 0 && (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Você não possui territórios atribuídos. Solicite ao seu gerente que atribua zonas ao
                seu usuário para que possa criar agendamentos.
              </AlertDescription>
            </Alert>
          )}
          {!isManager && salesZones.length > 0 && coverageAreas.length === 0 && (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Você possui zonas atribuídas, mas nenhuma área de cobertura ativa. Solicite ao seu
                gerente que configure suas áreas de cobertura.
              </AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Novo Agendamento</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSchedule} className="space-y-3">
                  {isManager && (
                    <div className="space-y-1">
                      <Label>Vendedor</Label>
                      <Select
                        value={schedForm.user_id}
                        onValueChange={(v) =>
                          setSchedForm((p) => ({ ...p, user_id: v, zone_id: '' }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {users
                            .filter((u) => u.role === 'sales')
                            .map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.name || u.email}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Semana</Label>
                      <Select
                        value={String(schedForm.week_number)}
                        onValueChange={(v) =>
                          setSchedForm((p) => ({ ...p, week_number: Number(v) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4].map((w) => (
                            <SelectItem key={w} value={String(w)}>{`Semana ${w}`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Dia</Label>
                      <Select
                        value={schedForm.day_of_week}
                        onValueChange={(v) => setSchedForm((p) => ({ ...p, day_of_week: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS.map((d) => (
                            <SelectItem key={d} value={d}>
                              {getDayLabel(d)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>
                      Zona
                      {isManager && schedForm.user_id ? ` (${zones.length} disponíveis)` : ''}
                    </Label>
                    <Select
                      value={schedForm.zone_id}
                      onValueChange={(v) => setSchedForm((p) => ({ ...p, zone_id: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {zoneOptions.map((z) => (
                          <SelectItem key={z.id} value={z.id}>
                            {z.name} - {z.state || '—'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {!isManager && zoneOptions.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Nenhum território atribuído a você. Solicite ao seu gerente que atribua zonas
                      ao seu usuário.
                    </p>
                  )}
                  {isManager && schedForm.user_id && zoneOptions.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Nenhuma zona cadastrada no sistema.
                    </p>
                  )}
                  <Button type="submit" className="w-full">
                    <Plus className="w-4 h-4 mr-2" /> Criar Agendamento
                  </Button>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos ({schedules.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                {schedules.map((s) => {
                  const u = users.find((x) => x.id === s.user_id)
                  const z = s.expand?.zone_id
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <span className="font-medium">{u?.name || '—'}</span>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {getDayLabel(s.day_of_week)} • Semana {s.week_number} • {z?.name || '—'}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={async () => {
                          await deleteSchedule(s.id)
                          toast.success('Excluído')
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                })}
                {schedules.length === 0 && (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    Nenhum agendamento.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="visits" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Nova Visita</CardTitle>
              </CardHeader>
              <CardContent>
                <QuickVisitForm />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Validação de Território</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Ao registrar uma visita, o sistema valida automaticamente se a região informada
                  está dentro da sua área de cobertura.
                </p>
                <p>
                  Se a região não corresponder às suas zonas atribuídas, a visita será bloqueada com
                  uma mensagem indicando as regiões permitidas.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
