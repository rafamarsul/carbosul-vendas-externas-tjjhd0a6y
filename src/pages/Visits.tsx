import { useState } from 'react'
import { MapPin, Navigation, CheckCircle2, ChevronRight, Save, Map as MapIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { MapMock } from '@/components/MapMock'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'

const MOCK_ADDRESSES = [
  'Av. das Indústrias, 1000 - Distrito Industrial',
  'Rodovia BR-116, Km 45 - Zona Rural',
  'Av. Paulista, 1578 - Bela Vista, São Paulo',
  'Rua Funchal, 200 - Vila Olímpia, São Paulo',
]

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
  const { addVisit } = useData()

  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    company: 'Indústria Química ABC',
    contact: '',
    phone: '',
    address: 'Av. das Indústrias, 1000 - Distrito Industrial',
    reason: 'prospeccao',
    interest: 'medio',
    notes: '',
  })

  const [showSuggestions, setShowSuggestions] = useState(false)
  const [productStates, setProductStates] = useState<
    Record<string, { active: boolean; qty: number }>
  >(CORE_PRODUCTS.reduce((acc, p) => ({ ...acc, [p]: { active: false, qty: 0 } }), {}))

  const handleAddressChange = (val: string) => {
    setFormData((p) => ({ ...p, address: val }))
    setShowSuggestions(val.length > 2)
  }

  const selectAddress = (addr: string) => {
    setFormData((p) => ({ ...p, address: addr }))
    setShowSuggestions(false)
  }

  const handleCheckIn = () => {
    setIsCheckingIn(true)
    setTimeout(() => {
      setHasCheckedIn(true)
      setIsCheckingIn(false)
      toast.success('Check-in realizado com sucesso!', {
        description: 'Localização capturada: Lat -23.55, Lng -46.63',
      })

      const isPriority =
        formData.address.toLowerCase().includes('indústria') ||
        formData.company.toLowerCase().includes('abc')
      if (isPriority) {
        setTimeout(() => {
          toast('🚨 Alerta para Gerente', {
            description: `${user?.name || 'Vendedor'} fez check-in em cliente prioritário.`,
            duration: 6000,
          })
        }, 2000)
      }
    }, 1500)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const isOnline = navigator.onLine
    const productsObj = Object.fromEntries(
      Object.entries(productStates)
        .filter(([_, state]) => state.active)
        .map(([k, state]) => [k, state.qty]),
    )

    addVisit({
      id: Math.random().toString(36).substring(2, 9),
      salesmanId: user?.id || 'unknown',
      salesmanName: user?.name || 'Vendedor Desconhecido',
      ...formData,
      products: productsObj,
      timestamp: new Date().toISOString(),
      status: isOnline ? 'synced' : 'pending',
      priority: formData.address.toLowerCase().includes('indústria'),
    })

    if (!isOnline) {
      toast.warning('Salvo em Modo Offline', {
        description: 'Visita salva no dispositivo. Sincronização automática quando reconectar.',
        duration: 5000,
      })
    } else {
      toast.success('Visita registrada com sucesso!', {
        description: 'Dados salvos e sincronizados com a central.',
      })
    }

    setTimeout(() => {
      setHasCheckedIn(false)
      setStep(1)
      setFormData((prev) => ({ ...prev, contact: '', phone: '', notes: '' }))
      setProductStates(
        CORE_PRODUCTS.reduce((acc, p) => ({ ...acc, [p]: { active: false, qty: 0 } }), {}),
      )
    }, 1000)
  }

  if (!hasCheckedIn) {
    return (
      <div className="p-4 md:p-6 max-w-lg mx-auto flex flex-col h-full justify-center space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Nova Visita</h1>
          <p className="text-muted-foreground">Você está próximo de um cliente da sua rota.</p>
        </div>

        <Card className="border-secondary/50 shadow-md overflow-hidden">
          <div className="h-48 w-full relative border-b">
            <MapMock
              markers={[
                { id: 'me', lat: 70, lng: 30, color: '#004A99', label: 'Você' },
                { id: 'target', lat: 40, lng: 60, color: '#10B981', label: 'Destino' },
              ]}
              route={{ start: { lat: 70, lng: 30 }, end: { lat: 40, lng: 60 } }}
            />
            <div className="absolute top-2 right-2 bg-background/90 backdrop-blur text-xs font-semibold px-2 py-1 rounded shadow-sm border flex items-center gap-1">
              <MapIcon className="w-3 h-3" />
              Rota Calculada
            </div>
          </div>
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-lg">Cliente Mais Próximo</CardTitle>
            <CardDescription>A 150m de distância</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-lg">{formData.company}</p>
            <p className="text-sm text-muted-foreground mb-4">{formData.address}</p>
            <Button
              className="w-full h-14 text-lg font-bold shadow-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-transform active:scale-95"
              onClick={handleCheckIn}
              disabled={isCheckingIn}
            >
              {isCheckingIn ? (
                <span className="animate-pulse">Capturando Localização...</span>
              ) : (
                <>
                  <Navigation className="w-5 h-5 mr-2" />
                  Realizar Check-in
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto animate-slide-in-right">
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
                <Label htmlFor="company">Empresa / Razão Social</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                  className="h-12"
                />
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="address">Endereço (Integração Google Maps)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="Digite o endereço para autocompletar..."
                    className="h-12 pl-10"
                    value={formData.address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    onFocus={() => formData.address.length > 2 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    required
                  />
                </div>
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 overflow-hidden">
                    {MOCK_ADDRESSES.filter((a) =>
                      a.toLowerCase().includes(formData.address.toLowerCase()),
                    ).map((addr, i) => (
                      <div
                        key={i}
                        className="px-4 py-3 hover:bg-muted cursor-pointer text-sm flex items-center gap-2"
                        onClick={() => selectAddress(addr)}
                      >
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {addr}
                      </div>
                    ))}
                    {MOCK_ADDRESSES.filter((a) =>
                      a.toLowerCase().includes(formData.address.toLowerCase()),
                    ).length === 0 && (
                      <div className="px-4 py-3 text-sm text-muted-foreground">
                        Nenhum endereço encontrado
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Nome do Contato</Label>
                <Input
                  id="contact"
                  placeholder="Com quem você falou?"
                  className="h-12"
                  value={formData.contact}
                  onChange={(e) => setFormData((p) => ({ ...p, contact: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  type="tel"
                  className="h-12"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                />
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
                    <SelectItem value="apresentacao">Apresentação de Produto</SelectItem>
                    <SelectItem value="fechamento">Fechamento de Negócio</SelectItem>
                    <SelectItem value="pos-venda">Pós-venda / Suporte</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
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
              <h2 className="text-lg font-semibold">Produtos Apresentados</h2>
              <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground font-medium">
                8 Itens Core
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pb-4 pr-1">
              {CORE_PRODUCTS.map((prod) => {
                const state = productStates[prod]
                return (
                  <Card
                    key={prod}
                    className={`border-2 transition-colors ${state.active ? 'border-primary bg-primary/5' : 'border-transparent'}`}
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
                          <span className="text-xs text-muted-foreground mr-auto">
                            Vol. Estimado (T)
                          </span>
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
                placeholder="Descreva pontos importantes da conversa, objeções, próximos passos..."
                className="min-h-[150px] resize-none"
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
              />
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-900">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                Sincronização Local-First: Os dados serão salvos no seu dispositivo imediatamente e
                enviados ao servidor assim que houver conexão.
              </p>
            </div>
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
                <Save className="w-5 h-5 mr-2" />
                Finalizar e Salvar
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
