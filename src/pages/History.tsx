import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface Visit {
  id: string
  client_name: string
  address: string
  status: 'completed' | 'cancelled' | 'pending'
  notes: string
  created: string
}

export default function History() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true)
        // Using a mock filter for now, in a real app we'd filter by date and search term
        const records = await pb.collection('visits').getList<Visit>(1, 50, {
          sort: '-created',
        })
        setVisits(records.items)
      } catch (error) {
        console.error('Error fetching history:', error)
        // Fallback to mock data if collection doesn't exist yet
        setVisits([
          {
            id: '1',
            client_name: 'Supermercado Central',
            address: 'Rua das Flores, 123 - Centro',
            status: 'completed',
            notes: 'Pedido tirado com sucesso. Cliente solicitou novo mostruário.',
            created: new Date().toISOString(),
          },
          {
            id: '2',
            client_name: 'Padaria Pão Quente',
            address: 'Av. Brasil, 456 - Bairro Novo',
            status: 'cancelled',
            notes: 'Comprador não estava presente.',
            created: new Date(Date.now() - 86400000).toISOString(),
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [date])

  const filteredVisits = visits.filter(
    (visit) =>
      visit.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Visitas</h1>
          <p className="text-muted-foreground">Acompanhe seus check-ins e atividades anteriores.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente ou endereço..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[240px] justify-start text-left font-normal',
                  !date && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : filteredVisits.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">Nenhuma visita encontrada</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Não encontramos nenhum registro de visita para os filtros selecionados.
            </p>
          </div>
        ) : (
          filteredVisits.map((visit) => (
            <Card key={visit.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{visit.client_name}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-3 w-3" />
                    {visit.address}
                  </div>
                </div>
                <Badge
                  variant={
                    visit.status === 'completed'
                      ? 'default'
                      : visit.status === 'cancelled'
                        ? 'destructive'
                        : 'secondary'
                  }
                  className="capitalize"
                >
                  {visit.status === 'completed'
                    ? 'Concluída'
                    : visit.status === 'cancelled'
                      ? 'Cancelada'
                      : 'Pendente'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {visit.notes && (
                    <div className="text-sm bg-muted/50 p-3 rounded-md border">
                      <span className="font-semibold block mb-1">Anotações:</span>
                      {visit.notes}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(visit.created), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                    {visit.status === 'completed' && (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Check-in realizado
                      </div>
                    )}
                    {visit.status === 'cancelled' && (
                      <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                        <XCircle className="h-3 w-3" />
                        Visita não realizada
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
