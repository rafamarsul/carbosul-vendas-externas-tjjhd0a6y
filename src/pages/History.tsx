import { useEffect, useState } from 'react'
import { MapPin, Clock, CalendarPlus, Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { generateGoogleCalendarUrl, generateAndDownloadICS } from '@/lib/calendar'
import { toast } from 'sonner'

interface Visit {
  id: string
  company: string
  contact: string
  address: string
  reason: string
  status: string
  created_at: string
}

export default function History() {
  const { user } = useAuth()
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVisits = async () => {
      let query = supabase.from('visits').select('*').order('created_at', { ascending: false })

      if (user?.role === 'sales') {
        query = query.eq('user_id', user.id)
      }

      const { data, error } = await query
      if (error) {
        toast.error('Erro ao buscar histórico')
      } else if (data) {
        setVisits(data as Visit[])
      }
      setLoading(false)
    }

    if (user) fetchVisits()
  }, [user])

  const handleSyncGoogleCalendar = (visit: Visit) => {
    const startDate = new Date(visit.created_at)
    // Estimativa de 1 hora de duração para a visita
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)

    const url = generateGoogleCalendarUrl({
      title: `Visita: ${visit.company}`,
      description: `Contato: ${visit.contact}\nMotivo: ${visit.reason}`,
      location: visit.address,
      startDate,
      endDate,
    })

    window.open(url, '_blank')
  }

  const handleBulkICS = () => {
    if (visits.length === 0) {
      toast.warning('Nenhuma visita para exportar.')
      return
    }

    const events = visits.map((visit) => {
      const startDate = new Date(visit.created_at)
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)

      return {
        title: `Visita: ${visit.company}`,
        description: `Contato: ${visit.contact}\nMotivo: ${visit.reason}`,
        location: visit.address,
        startDate,
        endDate,
      }
    })

    generateAndDownloadICS(events, 'minhas_visitas_carbosul.ics')
    toast.success('Agenda exportada com sucesso!')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Histórico de Visitas</h1>
          <p className="text-muted-foreground">Acompanhe e exporte suas visitas registradas.</p>
        </div>

        <Button
          onClick={handleBulkICS}
          variant="secondary"
          className="w-full md:w-auto flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar Rotas (ICS)
        </Button>
      </div>

      <div className="grid gap-4">
        {visits.map((visit) => (
          <Card key={visit.id} className="transition-all hover:shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-card-foreground leading-none">
                      {visit.company}
                    </h3>
                    <Badge
                      variant={visit.status === 'synced' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {visit.status === 'synced' ? 'Concluída' : visit.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary/70" />
                      {new Date(visit.created_at).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary/70" />
                      <span className="truncate" title={visit.address}>
                        {visit.address}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 justify-end items-end sm:items-center">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto flex items-center gap-2"
                    onClick={() => handleSyncGoogleCalendar(visit)}
                    title="Adicionar visita individual ao Google Agenda"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Google Agenda</span>
                    <span className="sm:hidden">Agenda</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {visits.length === 0 && (
          <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
            <CalendarPlus className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Nenhuma visita registrada</p>
            <p className="text-sm">Suas visitas aparecerão aqui para sincronização.</p>
          </div>
        )}
      </div>
    </div>
  )
}
