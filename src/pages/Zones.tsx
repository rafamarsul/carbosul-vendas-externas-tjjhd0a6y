import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { MapMock } from '@/components/MapMock'
import { useData } from '@/contexts/DataContext'
import { Trash2, MapPin } from 'lucide-react'
import { toast } from 'sonner'

export default function Zones() {
  const { zones, addZone, deleteZone } = useData()

  const [newZone, setNewZone] = useState({
    name: '',
    lat: 50,
    lng: 50,
    radius: 10,
  })

  const handleMapClick = (lat: number, lng: number) => {
    setNewZone((prev) => ({ ...prev, lat, lng }))
  }

  const handleAdd = () => {
    if (!newZone.name) {
      toast.error('Informe um nome para a zona.')
      return
    }
    addZone({
      id: Math.random().toString(36).substring(7),
      ...newZone,
    })
    toast.success('Zona crítica criada com sucesso!')
    setNewZone({ ...newZone, name: '' })
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Zonas de Prioridade (Geofencing)
        </h1>
        <p className="text-muted-foreground text-sm">
          Defina áreas críticas para alertas automáticos de check-in.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col h-[600px]">
          <CardHeader className="px-6 py-4 border-b bg-muted/20">
            <CardTitle className="text-lg flex justify-between items-center">
              Mapa de Zonas
              <span className="text-xs font-normal text-muted-foreground">
                Clique no mapa para posicionar nova zona
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative">
            <MapMock
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
              <CardDescription>Configure o perímetro do alerta.</CardDescription>
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
                <Label>Raio de Abrangência (mock)</Label>
                <div className="flex gap-4 items-center">
                  <Slider
                    value={[newZone.radius]}
                    min={2}
                    max={30}
                    step={1}
                    onValueChange={(v) => setNewZone((p) => ({ ...p, radius: v[0] }))}
                    className="flex-1"
                  />
                  <span className="w-12 text-right font-mono text-sm">{newZone.radius}%</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                Posição: Lat {newZone.lat.toFixed(1)}, Lng {newZone.lng.toFixed(1)} (Ajuste clicando
                no mapa)
              </div>
              <Button className="w-full" onClick={handleAdd}>
                Salvar Zona
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Zonas Ativas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
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
                      <p className="text-xs text-muted-foreground">Raio: {z.radius}%</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteZone(z.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
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
