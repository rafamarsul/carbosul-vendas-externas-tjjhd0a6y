import { useState, useEffect } from 'react'
import { Plus, Trash2, Search, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { getZones, createZone, deleteZone } from '@/services/zones'
import { getUsers } from '@/services/users'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import { useRealtime } from '@/hooks/use-realtime'

export default function Zones() {
  const [zones, setZones] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isSearchingCep, setIsSearchingCep] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    cep: '',
    radius: '',
    user_id: '',
    lat: 0,
    lng: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const [zonesData, usersData] = await Promise.all([getZones(), getUsers()])
      setZones(zonesData)
      setUsers(usersData.filter((u: any) => u.role === 'sales'))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('zones', loadData)
  useRealtime('users', loadData)

  const searchCep = async () => {
    const cleanCep = formData.cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) {
      toast({
        title: 'CEP inválido',
        description: 'O CEP deve conter 8 dígitos.',
        variant: 'destructive',
      })
      return
    }

    setIsSearchingCep(true)
    try {
      const viaCepRes = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      if (!viaCepRes.ok) throw new Error('Falha na comunicação com o serviço de CEP.')
      const viaCepData = await viaCepRes.json()

      if (viaCepData.erro) throw new Error('CEP não encontrado.')

      const q = `${viaCepData.logradouro}, ${viaCepData.localidade}, ${viaCepData.uf}, Brazil`
      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`,
      )
      const nomData = await nomRes.json()

      if (nomData && nomData.length > 0) {
        setFormData((prev) => ({
          ...prev,
          lat: parseFloat(nomData[0].lat),
          lng: parseFloat(nomData[0].lon),
        }))
        toast({ title: 'Localização encontrada com sucesso!' })
      } else {
        const fallbackQ = `${viaCepData.localidade}, ${viaCepData.uf}, Brazil`
        const fbRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackQ)}`,
        )
        const fbData = await fbRes.json()
        if (fbData && fbData.length > 0) {
          setFormData((prev) => ({
            ...prev,
            lat: parseFloat(fbData[0].lat),
            lng: parseFloat(fbData[0].lon),
          }))
          toast({ title: 'Localização aproximada (cidade) encontrada!' })
        } else {
          throw new Error('Não foi possível obter as coordenadas para este CEP.')
        }
      }
    } catch (err: any) {
      toast({ title: 'Erro ao buscar CEP', description: err.message, variant: 'destructive' })
    } finally {
      setIsSearchingCep(false)
    }
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 5) val = val.replace(/^(\d{5})(\d)/, '$1-$2')
    setFormData({ ...formData, cep: val })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    try {
      await createZone({
        ...formData,
        radius: Number(formData.radius),
      })
      toast({ title: 'Zona cadastrada com sucesso!' })
      setIsOpen(false)
      setFormData({ name: '', cep: '', radius: '', user_id: '', lat: 0, lng: 0 })
    } catch (err) {
      setErrors(extractFieldErrors(err))
      toast({
        title: 'Erro ao cadastrar',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta zona?')) return
    try {
      await deleteZone(id)
      toast({ title: 'Zona excluída com sucesso.' })
    } catch (err) {
      toast({ title: 'Erro ao excluir', description: getErrorMessage(err), variant: 'destructive' })
    }
  }

  const getUserName = (id: string) => users.find((u) => u.id === id)?.name || 'Desconhecido'

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Zonas de Atuação</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Nova Zona
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Zona de Atuação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Zona</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label>CEP (Centro da Zona)</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.cep}
                    onChange={handleCepChange}
                    onBlur={() => {
                      if (formData.cep.replace(/\D/g, '').length === 8) searchCep()
                    }}
                    placeholder="00000-000"
                    maxLength={9}
                    required
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={searchCep}
                    disabled={isSearchingCep}
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
                {errors.cep && <p className="text-sm text-red-500">{errors.cep}</p>}
              </div>

              {formData.lat !== 0 && (
                <div className="text-sm text-muted-foreground flex items-center gap-1 bg-muted p-2 rounded">
                  <MapPin className="w-4 h-4 text-primary" />
                  Latitude: {formData.lat.toFixed(5)} | Longitude: {formData.lng.toFixed(5)}
                </div>
              )}

              <div className="space-y-2">
                <Label>Raio de Atuação (metros)</Label>
                <Input
                  type="number"
                  value={formData.radius}
                  onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                  required
                  min={1}
                />
                {errors.radius && <p className="text-sm text-red-500">{errors.radius}</p>}
              </div>

              <div className="space-y-2">
                <Label>Vendedor Responsável</Label>
                <Select
                  value={formData.user_id || undefined}
                  onValueChange={(val) => setFormData({ ...formData, user_id: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.user_id && <p className="text-sm text-red-500">{errors.user_id}</p>}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!formData.lat || !formData.lng || !formData.user_id}
              >
                Salvar Zona
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CEP</TableHead>
              <TableHead>Raio (m)</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones.map((zone) => (
              <TableRow key={zone.id}>
                <TableCell className="font-medium">{zone.name}</TableCell>
                <TableCell>{zone.cep || '-'}</TableCell>
                <TableCell>{zone.radius}</TableCell>
                <TableCell>{getUserName(zone.user_id)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(zone.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {zones.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                  Nenhuma zona cadastrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
