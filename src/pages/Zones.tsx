import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { GoogleMap } from '@/components/GoogleMap'
import { Trash2, MapPin, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getZones, createZone, deleteZone } from '@/services/zones'
import { getUsers } from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Zones() {
  const [zones, setZones] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const [newZone, setNewZone] = useState({
    name: '',
    lat: -23.55052,
    lng: -46.633309,
    radius: 1000,
    user_id: '',
  })

  const loadData = async () => {
    try {
      const [zonesData, usersData] = await Promise.all([getZones(), getUsers()])
      setZones(zonesData)
      setUsers(usersData.filter((u: any) => u.role === 'sales'))
    } catch (err) {
      toast.error('Erro ao carregar dados')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('zones', () => {
    loadData()
  })

  const handleMapClick = (lat: number, lng: number) => {
    setNewZone((prev) => ({ ...prev, lat, lng }))
  }

  const handleAdd = async () => {
    if (!newZone.name) {
      toast.error('Informe um nome para a zona.')
      return
    }
    if (!newZone.user_id) {
      toast.error('Selecione um vendedor responsável.')
      return
    }
    if (newZone.radius <= 0) {
      toast.error('O raio deve ser um valor positivo.')
      return
    }
    try {
      setLoading(true)
      await createZone(newZone)
      toast.success('Zona crítica criada com sucesso!')
      setNewZone({ ...newZone, name: '' })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id)
      await deleteZone(id)
      toast.success('Zona removida!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsDeleting(null)
    }
  }

  const getSellerName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user ? user.name || user.email : 'Desconhecido'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-primary">Zonas de Prioridade</h2>
          <p className="text-muted-foreground text-sm">
            Defina áreas geográficas críticas no mapa (Geofencing).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col h-[500px] md:h-[600px]">
          <CardHeader className="px-6 py-4 border-b bg-muted/20">
            <CardTitle className="text-lg flex justify-between items-center">
              Mapa de Zonas
              <span className="text-xs font-normal text-muted-foreground hidden md:inline">
                Clique no mapa para posicionar o centro da nova zona
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative z-0">
            <GoogleMap
              className="w-full h-full rounded-b-xl"
              zones={[
                ...zones,
                { id: 'preview', ...newZone, name: newZone.name || 'Nova Zona (Preview)' },
              ]}
              onClick={handleMapClick}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nova Zona Crítica</CardTitle>
              <CardDescription>Configure o perímetro da área.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Região</Label>
                <Input
                  placeholder="Ex: Polo Petroquímico"
                  value={newZone.name}
                  onChange={(e) => setNewZone((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Vendedor Responsável</Label>
                <Select
                  value={newZone.user_id}
                  onValueChange={(v) => setNewZone((p) => ({ ...p, user_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name || u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Raio de Abrangência (metros)</Label>
                <div className="flex gap-4 items-center">
                  <Slider
                    value={[newZone.radius]}
                    min={100}
                    max={10000}
                    step={100}
                    onValueChange={(v) => setNewZone((p) => ({ ...p, radius: v[0] }))}
                    className="flex-1"
                  />
                  <span className="w-16 text-right font-mono text-sm">{newZone.radius}m</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Posição: Lat {newZone.lat.toFixed(4)}, Lng {newZone.lng.toFixed(4)}
                  <br />
                  (Ajuste clicando no mapa)
                </span>
              </div>
              <Button className="w-full" onClick={handleAdd} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Salvar Zona
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Zonas Ativas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[300px] overflow-y-auto">
                {zones.length === 0 && (
                  <p className="p-4 text-sm text-muted-foreground text-center">
                    Nenhuma zona cadastrada.
                  </p>
                )}
                {zones.map((z) => (
                  <div
                    key={z.id}
                    className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{z.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Raio: {z.radius}m • Vendedor: {getSellerName(z.user_id)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isDeleting === z.id}
                      onClick={() => handleDelete(z.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      {isDeleting === z.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
