import { useState } from 'react'
import {
  MapPin,
  Navigation,
  CheckCircle2,
  ChevronRight,
  Save,
  MessageCircle,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { GoogleMap } from '@/components/GoogleMap'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { getWhatsAppUrl } from '@/lib/utils'

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

const CORE_PRODUCTS = [
  'Carvão Ativado Granulado',
  'Carvão Ativado Pulverizado',
  'Resina Aniônica Forte',
  'Resina Catiônica Forte',
  'Elemento Filtrante Bobinado',
  'Elemento Filtrante Plissado',
  'Areia Filtrante',
  'Seixo Rolado',
]

export default function Visits() {
  const { user } = useAuth()
  const { addVisit, zones } = useData()

  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    company: 'Indústria Nova',
    contact: '',
    phone: '',
    address: 'Av. Principal, 100',
    region: 'Sul',
    reason: 'prospeccao',
    interest: 'medio',
    notes: '',
    lat: 0,
    lng: 0,
    isPriority: false,
  })

  const [productStates, setProductStates] = useState<
    Record<string, { active: boolean; qty: number }>
  >(CORE_PRODUCTS.reduce((acc, p) => ({ ...acc, [p]: { active: false, qty: 0 } }), {}))

  const handleCheckIn = () => {
    setIsCheckingIn(true)

    if (!navigator.geolocation) {
      toast.error('Geolocalização não suportada', {
        description: 'Seu navegador não suporta captura de localização.',
      })
      setIsCheckingIn(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const realLat = position.coords.latitude
        const realLng = position.coords.longitude

        // Simulação de endereço esperado do cliente para o Alerta de Desvio
        const expectedLat = realLat + (Math.random() > 0.7 ? 0.015 : 0.002) // Pode estar até ~1.5km de distância
        const expectedLng = realLng + (Math.random() > 0.7 ? 0.015 : 0.002)
        const distanceToClient = calculateRealDistance(realLat, realLng, expectedLat, expectedLng)

        if (distanceToClient > 0.5) {
          toast('🚨 Alerta de Desvio Geográfico', {
            description: `Você está a ${distanceToClient.toFixed(1)}km do endereço esperado para este cliente.`,
            duration: 8000,
          })
        }

        let priorityHit = false
        let matchedZoneName = ''

        for (const zone of zones) {
          if (calculateRealDistance(realLat, realLng, zone.lat, zone.lng) <= zone.radius) {
            priorityHit = true
            matchedZoneName = zone.name
            break
          }
        }

        setFormData((prev) => ({ ...prev, lat: realLat, lng: realLng, isPriority: priorityHit }))
        setHasCheckedIn(true)
        setIsCheckingIn(false)

        toast.success('Check-in realizado com sucesso!')

        if (priorityHit) {
          setTimeout(() => {
            toast.error(`🚨 Zona Crítica Detectada: ${matchedZoneName}`, {
              description: `Sua visita foi automaticamente marcada como prioritária para a gerência.`,
              duration: 6000,
            })
          }, 1000)
        }
      },
      (error) => {
        console.error(error)
        toast.error('Erro de Localização', {
          description: 'Não foi possível obter sua localização. Verifique as permissões.',
        })
        setIsCheckingIn(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  const handleProductToggle = (product: string, checked: boolean) => {
    setProductStates((prev) => ({
      ...prev,
      [product]: { ...prev[product], active: checked, qty: checked ? 1 : 0 },
    }))
  }

  const updateProductQty = (product: string, delta: number) => {
    setProductStates((prev) => {
      const newQty = Math.max(1, prev[product].qty + delta)
      return { ...prev, [product]: { ...prev[product], qty: newQty } }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const productsObj = Object.fromEntries(
      Object.entries(productStates)
        .filter(([_, state]) => state.active)
        .map(([k, state]) => [k, state.qty]),
    )

    const isSpecialVisit =
      formData.isPriority || formData.reason === 'fechamento' || formData.interest === 'alto'
    const initialApprovalStatus = isSpecialVisit ? 'pending' : 'approved'

    await addVisit({
      id: Math.random().toString(36).substring(2, 9),
      salesmanId: user?.id || 'unknown',
      salesmanName: user?.name || 'Vendedor',
      ...formData,
      products: productsObj,
      timestamp: new Date().toISOString(),
      status: 'synced',
      priority: formData.isPriority,
      approvalStatus: initialApprovalStatus,
    })

    if (isSpecialVisit) {
      toast.success('Visita registrada!', {
        description: 'Enviada para revisão da gerência devido ao perfil da visita.',
      })
    } else {
      toast.success('Visita concluída com sucesso!')
    }

    setTimeout(() => {
      setHasCheckedIn(false)
      setStep(1)
      setFormData((p) => ({ ...p, contact: '', phone: '', notes: '', isPriority: false }))
      setProductStates(
        CORE_PRODUCTS.reduce((acc, p) => ({ ...acc, [p]: { active: false, qty: 0 } }), {}),
      )
    }, 1000)
  }

  if (!hasCheckedIn) {
    return (
      <div className="p-4 md:p-6 max-w-lg mx-auto flex flex-col h-[calc(100vh-100px)] justify-center space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Nova Visita</h1>
          <p className="text-muted-foreground">Registre sua localização para iniciar.</p>
        </div>

        <Card className="border-secondary/50 shadow-md overflow-hidden">
          <div className="h-48 w-full relative border-b">
            <GoogleMap
              markers={[
                {
                  id: 'me',
                  lat: formData.lat || -23.55,
                  lng: formData.lng || -46.63,
                  color: '#004A99',
                  label: 'Local Atual',
                },
              ]}
              zones={zones}
            />
          </div>
          <CardContent className="pt-6">
            <Button
              className="w-full h-14 text-lg font-bold shadow-lg"
              onClick={handleCheckIn}
              disabled={isCheckingIn}
            >
              {isCheckingIn ? (
                <span className="animate-pulse">Capturando Localização...</span>
              ) : (
                <>
                  <Navigation className="w-5 h-5 mr-2" /> Realizar Check-in
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto animate-slide-in-right pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-success" />
          Relatório de Visita
        </h1>
        <div className="text-sm font-medium text-muted-foreground">Passo {step} de 4</div>
      </div>

      <div className="w-full bg-muted h-2 rounded-full mb-8 overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-300 ease-out"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <form
        onSubmit={
          step === 4
            ? handleSubmit
            : (e) => {
                e.preventDefault()
                setStep((s) => s + 1)
              }
        }
      >
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-semibold border-b pb-2">Identificação</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Empresa / Razão Social</Label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                  className="h-12"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                    className="h-12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Região</Label>
                  <Select
                    value={formData.region}
                    onValueChange={(v) => setFormData((p) => ({ ...p, region: v }))}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sul">Sul</SelectItem>
                      <SelectItem value="Norte">Norte</SelectItem>
                      <SelectItem value="Leste">Leste</SelectItem>
                      <SelectItem value="Oeste">Oeste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nome do Contato</Label>
                <Input
                  placeholder="Com quem você falou?"
                  className="h-12"
                  value={formData.contact}
                  onChange={(e) => setFormData((p) => ({ ...p, contact: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone (WhatsApp)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: 11999999999"
                    type="tel"
                    className="h-12 flex-1"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-12 shrink-0 border-green-200 bg-green-50 hover:bg-green-100"
                    onClick={() => window.open(getWhatsAppUrl(formData.phone), '_blank')}
                    disabled={!formData.phone || formData.phone.length < 10}
                  >
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-semibold border-b pb-2">Detalhes da Visita</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Motivo da Visita</Label>
                <Select
                  value={formData.reason}
                  onValueChange={(v) => setFormData((p) => ({ ...p, reason: v }))}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospeccao">Prospecção</SelectItem>
                    <SelectItem value="apresentacao">Apresentação</SelectItem>
                    <SelectItem value="fechamento">Fechamento</SelectItem>
                    <SelectItem value="pos-venda">Pós-venda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nível de Interesse</Label>
                <Select
                  value={formData.interest}
                  onValueChange={(v) => setFormData((p) => ({ ...p, interest: v }))}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alto">Alto (Quente)</SelectItem>
                    <SelectItem value="medio">Médio (Morno)</SelectItem>
                    <SelectItem value="baixo">Baixo (Frio)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-semibold">Produtos de Interesse</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pb-4 pr-1">
              {CORE_PRODUCTS.map((prod) => {
                const state = productStates[prod]
                return (
                  <Card
                    key={prod}
                    className={`border transition-colors ${state.active ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-medium text-sm leading-tight">{prod}</span>
                        <Switch
                          checked={state.active}
                          onCheckedChange={(c) => handleProductToggle(prod, c)}
                        />
                      </div>
                      {state.active && (
                        <div className="flex items-center gap-3 pt-2 mt-auto border-t border-primary/10">
                          <span className="text-xs text-muted-foreground mr-auto">Vol. (Ton)</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateProductQty(prod, -1)}
                          >
                            -
                          </Button>
                          <span className="font-mono font-bold w-6 text-center">{state.qty}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateProductQty(prod, 1)}
                          >
                            +
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-semibold border-b pb-2">Observações Finais</h2>
            <div className="space-y-2">
              <Label>Anotações (Opcional)</Label>
              <Textarea
                placeholder="Descreva pontos importantes, acordos, pendências..."
                className="min-h-[150px] resize-none"
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
              />
            </div>
            {(formData.isPriority ||
              formData.reason === 'fechamento' ||
              formData.interest === 'alto') && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800 font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Visita Especial: O relatório será enviado para aprovação da gerência.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex gap-3 pt-4 border-t">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              className="h-12 px-6"
              onClick={() => setStep((s) => s - 1)}
            >
              Voltar
            </Button>
          )}
          <Button
            type="submit"
            className="h-12 flex-1 font-bold text-base"
            variant={step === 4 ? 'default' : 'secondary'}
          >
            {step === 4 ? (
              <>
                <Save className="w-5 h-5 mr-2" /> Finalizar
              </>
            ) : (
              <>
                Próximo <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
