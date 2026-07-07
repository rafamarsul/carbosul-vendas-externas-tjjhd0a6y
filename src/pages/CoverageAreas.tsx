import { useState, useEffect, useMemo } from 'react'
import { MapPin, Plus, Pencil, Trash2, FilterX } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/contexts/AuthContext'
import {
  getCoverageAreas,
  createCoverageArea,
  updateCoverageArea,
  deleteCoverageArea,
  STATE_OPTIONS,
  REGION_OPTIONS,
  type CoverageArea,
} from '@/services/coverage-areas'
import { getUsers } from '@/services/users'
import { toast } from 'sonner'
import { extractFieldErrors, getErrorMessage, type FieldErrors } from '@/lib/pocketbase/errors'

const emptyForm = {
  user_id: '',
  city: '',
  state: 'SC',
  region: 'Grande Florianópolis',
  active: true,
}

export default function CoverageAreas() {
  const [areas, setAreas] = useState<CoverageArea[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formData, setFormData] = useState(emptyForm)
  const [filterUser, setFilterUser] = useState('all')
  const [filterState, setFilterState] = useState('all')
  const [filterCity, setFilterCity] = useState('')

  const fetchData = async () => {
    try {
      const [a, u] = await Promise.all([getCoverageAreas(), getUsers()])
      setAreas(a)
      setUsers(u)
    } catch (e) {
      console.error(e)
    }
  }
  useEffect(() => {
    fetchData()
  }, [])
  useRealtime('coverage_areas', () => {
    fetchData()
  })

  const filteredAreas = useMemo(() => {
    return areas.filter((a) => {
      if (filterUser !== 'all' && a.user_id !== filterUser) return false
      if (filterState !== 'all' && a.state !== filterState) return false
      if (filterCity && !a.city.toLowerCase().includes(filterCity.toLowerCase())) return false
      return true
    })
  }, [areas, filterUser, filterState, filterCity])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFieldErrors({})
    try {
      if (editingId) {
        await updateCoverageArea(editingId, formData)
        toast.success('Área de cobertura atualizada!')
      } else {
        await createCoverageArea(formData)
        toast.success('Área de cobertura criada!')
      }
      setDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      const errors = extractFieldErrors(error)
      if (Object.keys(errors).length > 0) setFieldErrors(errors)
      else toast.error('Erro', { description: getErrorMessage(error) })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (a: CoverageArea) => {
    setEditingId(a.id)
    setFormData({
      user_id: a.user_id,
      city: a.city,
      state: a.state,
      region: a.region || 'Grande Florianópolis',
      active: a.active,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCoverageArea(id)
      toast.success('Área de cobertura excluída!')
      fetchData()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  const handleToggleActive = async (a: CoverageArea) => {
    try {
      await updateCoverageArea(a.id, { active: !a.active })
      toast.success(a.active ? 'Área desativada!' : 'Área ativada!')
      fetchData()
    } catch {
      toast.error('Erro ao alterar status')
    }
  }

  const resetForm = () => {
    setFormData(emptyForm)
    setEditingId(null)
    setFieldErrors({})
  }

  const userName = (id: string) => {
    const u = users.find((x) => x.id === id)
    return u?.name || u?.email || '—'
  }

  const clearFilters = () => {
    setFilterUser('all')
    setFilterState('all')
    setFilterCity('')
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Áreas de Cobertura</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie cidades e regiões atribuídas aos vendedores.
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(o) => {
            setDialogOpen(o)
            if (!o) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Nova Área
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Editar Área de Cobertura' : 'Nova Área de Cobertura'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Vendedor</Label>
                <Select
                  value={formData.user_id}
                  onValueChange={(v) => setFormData((p) => ({ ...p, user_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um vendedor" />
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
                {fieldErrors.user_id && (
                  <p className="text-sm text-destructive">{fieldErrors.user_id}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                  required
                  placeholder="Ex: Florianópolis"
                />
                {fieldErrors.city && <p className="text-sm text-destructive">{fieldErrors.city}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(v) => setFormData((p) => ({ ...p, state: v }))}
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
                  {fieldErrors.state && (
                    <p className="text-sm text-destructive">{fieldErrors.state}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Região</Label>
                  <Select
                    value={formData.region}
                    onValueChange={(v) => setFormData((p) => ({ ...p, region: v }))}
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
                  {fieldErrors.region && (
                    <p className="text-sm text-destructive">{fieldErrors.region}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(v) => setFormData((p) => ({ ...p, active: v }))}
                />
                <Label>Ativa</Label>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Áreas de Cobertura ({filteredAreas.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="Vendedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Vendedores</SelectItem>
                {users
                  .filter((u) => u.role === 'sales')
                  .map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name || u.email}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select value={filterState} onValueChange={setFilterState}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {STATE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Buscar cidade..."
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full md:w-48"
            />
            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
              <FilterX className="w-4 h-4 mr-2" /> Limpar
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Região</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAreas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhuma área de cobertura encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAreas.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{userName(a.user_id)}</TableCell>
                      <TableCell>{a.city}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{a.state}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{a.region || '—'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={a.active}
                            onCheckedChange={() => handleToggleActive(a)}
                          />
                          <span
                            className={
                              a.active ? 'text-green-600 text-sm' : 'text-muted-foreground text-sm'
                            }
                          >
                            {a.active ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(a)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(a.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
