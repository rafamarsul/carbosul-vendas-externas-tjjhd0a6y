import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GoogleMap } from '@/components/GoogleMap'
import { createVisit } from '@/services/visits'
import { useAuth } from '@/contexts/AuthContext'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { STATE_OPTIONS } from '@/services/coverage-areas'
import { toast } from 'sonner'

const LEAD_STATUS_OPTIONS = ['Qualificado', 'Não Qualificado', 'Em Análise']
const VISIT_STATUS_OPTIONS = ['Pendente', 'Em Andamento', 'Concluída']

export function QuickVisitForm() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    company: '',
    contact: '',
    phone: '',
    address: '',
    region: '',
    reason: '',
    state: 'SC',
    status: 'Pendente',
    lead_status: 'Em Análise',
    lat: 0,
    lng: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.company || !form.region) {
      toast.error('Preencha empresa e região')
      return
    }
    try {
      await createVisit({
        user_id: user?.id || '',
        salesman_name: user?.name || '',
        company: form.company,
        contact: form.contact,
        phone: form.phone,
        address: form.address,
        region: form.region,
        reason: form.reason,
        state: form.state,
        status: form.status,
        lead_status: form.lead_status,
        lat: form.lat,
        lng: form.lng,
      })
      toast.success('Visita registrada!')
      setForm({
        company: '',
        contact: '',
        phone: '',
        address: '',
        region: '',
        reason: '',
        state: 'SC',
        status: 'Pendente',
        lead_status: 'Em Análise',
        lat: 0,
        lng: 0,
      })
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Empresa</Label>
          <Input
            value={form.company}
            onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Contato</Label>
          <Input
            value={form.contact}
            onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Telefone</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label>Estado</Label>
          <Select value={form.state} onValueChange={(v) => setForm((p) => ({ ...p, state: v }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATE_OPTIONS.map((s: string) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Status da Visita</Label>
          <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VISIT_STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Status do Lead</Label>
          <Select
            value={form.lead_status}
            onValueChange={(v) => setForm((p) => ({ ...p, lead_status: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <Label>Endereço</Label>
        <Input
          value={form.address}
          onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
        />
      </div>
      <div className="space-y-1">
        <Label>Região / Cidade</Label>
        <Input
          value={form.region}
          onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))}
          required
          placeholder="Ex: São José"
        />
      </div>
      <div className="space-y-1">
        <Label>Motivo da Visita</Label>
        <Textarea
          value={form.reason}
          onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
          rows={2}
        />
      </div>
      <p className="text-xs text-muted-foreground">Clique no mapa para definir a localização.</p>
      <div className="h-48 rounded-lg overflow-hidden border">
        <GoogleMap
          className="w-full h-full"
          onClick={(lat: number, lng: number) => setForm((p) => ({ ...p, lat, lng }))}
          markers={form.lat ? [{ id: 'new', lat: form.lat, lng: form.lng }] : []}
        />
      </div>
      <Button type="submit" className="w-full">
        <Plus className="w-4 h-4 mr-2" /> Registrar Visita
      </Button>
    </form>
  )
}
