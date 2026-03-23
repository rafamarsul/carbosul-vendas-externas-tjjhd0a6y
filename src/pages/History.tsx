import { useData } from '@/contexts/DataContext'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageCircle, CheckCircle, Clock, MapPin, AlertCircle } from 'lucide-react'
import { getWhatsAppUrl } from '@/lib/utils'

export default function History() {
  const { visits, loading } = useData()

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando histórico...</div>
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Histórico de Visitas</h1>
        <p className="text-muted-foreground text-sm">
          Registro completo de todas as visitas realizadas.
        </p>
      </div>

      <div className="grid gap-4">
        {visits.map((visit) => (
          <Card
            key={visit.id}
            className={`overflow-hidden transition-all hover:shadow-md ${visit.priority ? 'border-l-4 border-l-destructive' : ''}`}
          >
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="p-5 flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        {visit.company}
                        {visit.priority && <Badge variant="destructive">Prioridade</Badge>}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {visit.address} ({visit.region})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{visit.salesmanName}</p>
                      <p className="text-xs text-muted-foreground flex items-center justify-end gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(visit.timestamp).toLocaleDateString()} às{' '}
                        {new Date(visit.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-muted/30 p-3 rounded-lg">
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">Contato</span>
                      <p className="font-medium">{visit.contact}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">Motivo</span>
                      <p className="font-medium capitalize">{visit.reason}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">Interesse</span>
                      <p className="font-medium capitalize">{visit.interest}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">
                        Produtos Identificados
                      </span>
                      <p className="font-medium">{Object.keys(visit.products).length} item(s)</p>
                    </div>
                  </div>

                  {visit.managerComment && (
                    <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg text-sm mt-3">
                      <p className="text-orange-800 font-semibold flex items-center gap-1 mb-1">
                        <AlertCircle className="w-4 h-4" /> Feedback do Gestor
                      </p>
                      <p className="text-orange-700 italic">{visit.managerComment}</p>
                    </div>
                  )}
                </div>

                <div className="bg-muted/20 p-5 md:w-64 border-t md:border-t-0 md:border-l flex flex-col justify-center gap-3">
                  <div className="text-center mb-2">
                    <span className="text-xs text-muted-foreground block mb-2">
                      Status da Visita
                    </span>
                    {visit.approvalStatus === 'pending' && (
                      <Badge
                        variant="outline"
                        className="w-full py-1.5 justify-center text-yellow-700 border-yellow-300 bg-yellow-50"
                      >
                        Aguardando Gestor
                      </Badge>
                    )}
                    {visit.approvalStatus === 'needs_review' && (
                      <Badge
                        variant="outline"
                        className="w-full py-1.5 justify-center text-orange-700 border-orange-300 bg-orange-50"
                      >
                        Revisão Necessária
                      </Badge>
                    )}
                    {visit.approvalStatus === 'approved' && (
                      <Badge
                        variant="outline"
                        className="w-full py-1.5 justify-center text-green-700 border-green-300 bg-green-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Concluída e Aprovada
                      </Badge>
                    )}
                  </div>

                  {visit.phone && (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => window.open(getWhatsAppUrl(visit.phone), '_blank')}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Contato
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {visits.length === 0 && (
          <div className="text-center p-12 text-muted-foreground">
            Nenhuma visita registrada no sistema.
          </div>
        )}
      </div>
    </div>
  )
}
