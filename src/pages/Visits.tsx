import { useState } from 'react'
import { MapPin, Navigation, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'

export default function Visits() {
  const { user } = useAuth()
  const { addVisit } = useData()
  const navigate = useNavigate()

  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    company: '',
    contact: '',
    interest: '',
    lat: 0,
    lng: 0,
  })

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

        setFormData((prev) => ({ ...prev, lat: realLat, lng: realLng }))
        setHasCheckedIn(true)
        setIsCheckingIn(false)

        toast.success('Localização capturada com sucesso!')
      },
      (error) => {
        console.error(error)
        toast.error('Erro de Localização', {
          description:
            'A permissão de localização é obrigatória para prosseguir. Por favor, autorize no seu navegador.',
        })
        setIsCheckingIn(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const visitData = {
        id: Math.random().toString(36).substring(2, 9),
        salesmanId: user?.id || 'unknown',
        salesmanName: user?.name || 'Vendedor',
        company: formData.company,
        contact: formData.contact,
        interest: formData.interest,
        lat: formData.lat,
        lng: formData.lng,
        // Fill remaining required fields from Visit type with empty/default values
        phone: '',
        address: '',
        region: '',
        reason: '',
        products: {},
        notes: '',
        timestamp: new Date().toISOString(),
        status: 'synced' as const,
        approvalStatus: 'approved' as const,
      }

      await addVisit(visitData)

      toast.success('Visita salva com sucesso!')
      navigate('/')
    } catch (error) {
      toast.error('Erro ao salvar visita')
    } finally {
      setIsSubmitting(false)
    }
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
                  <Navigation className="w-5 h-5 mr-2" /> Marcar Nova Visita
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
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Visita</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Nome do cliente</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Pessoa de Contato</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData((p) => ({ ...p, contact: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest">Produto de Interesse</Label>
                <Input
                  id="interest"
                  value={formData.interest}
                  onChange={(e) => setFormData((p) => ({ ...p, interest: e.target.value }))}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 font-bold text-base"
              disabled={isSubmitting}
            >
              <Save className="w-5 h-5 mr-2" /> {isSubmitting ? 'Salvando...' : 'Salvar Visita'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
