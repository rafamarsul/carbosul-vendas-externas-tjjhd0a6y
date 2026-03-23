import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useData, Visit } from '@/contexts/DataContext'
import { MessageCircle, CheckCircle, MessageSquareWarning, MapPin, Target } from 'lucide-react'
import { getWhatsAppUrl } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function Reviews() {
  const { visits, updateApproval, loading } = useData()
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [comment, setComment] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const pendingVisits = visits.filter((v) => v.approvalStatus === 'pending')

  const handleApprove = async (id: string) => {
    await updateApproval(id, 'approved')
    toast.success('Visita aprovada com sucesso!', {
      description: 'O workflow desta visita foi concluído.',
    })
  }

  const handleOpenReview = (visit: Visit) => {
    setSelectedVisit(visit)
    setComment('')
    setIsDialogOpen(true)
  }

  const handleRequestReview = async () => {
    if (selectedVisit && comment.trim()) {
      await updateApproval(selectedVisit.id, 'needs_review', comment)
      toast.warning('Visita enviada para revisão.', {
        description: 'O vendedor receberá sua notificação.',
      })
      setIsDialogOpen(false)
    }
  }

  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground">Carregando fila de revisão...</div>
    )

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Aprovação de Visitas</h1>
        <p className="text-muted-foreground text-sm">
          Workflow de validação para check-ins em zonas críticas, fechamentos ou clientes de alto
          interesse.
        </p>
      </div>

      {pendingVisits.length === 0 ? (
        <Card className="p-16 text-center border-dashed bg-muted/10 shadow-none">
          <CheckCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h3 className="text-xl font-medium text-foreground">Sua fila está vazia</h3>
          <p className="text-muted-foreground mt-2">
            Todas as visitas especiais já foram revisadas ou aprovadas.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingVisits.map((visit) => (
            <Card
              key={visit.id}
              className={`overflow-hidden shadow-md transition-shadow hover:shadow-lg ${visit.priority ? 'border-l-4 border-l-destructive' : 'border-l-4 border-l-yellow-500'}`}
            >
              <CardHeader className="pb-3 flex flex-col sm:flex-row items-start justify-between gap-4 bg-muted/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-xl">{visit.company}</CardTitle>
                    {visit.priority && (
                      <Badge variant="destructive" className="animate-pulse">
                        Zona Crítica
                      </Badge>
                    )}
                    {visit.interest === 'alto' && (
                      <Badge variant="default" className="bg-orange-500">
                        Alto Interesse
                      </Badge>
                    )}
                    {visit.reason === 'fechamento' && (
                      <Badge variant="default" className="bg-success text-success-foreground">
                        Fechamento
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      Vendedor: {visit.salesmanName}
                    </span>
                    <span>•</span>
                    {new Date(visit.timestamp).toLocaleDateString()} às{' '}
                    {new Date(visit.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </CardDescription>
                </div>
                {visit.phone && (
                  <Button
                    variant="outline"
                    className="shrink-0 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
                    onClick={() => window.open(getWhatsAppUrl(visit.phone), '_blank')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" /> Contatar Cliente
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-5 pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-background border p-4 rounded-lg shadow-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Local/Contato
                    </span>
                    <p className="font-medium">{visit.contact}</p>
                    <p className="text-xs text-muted-foreground truncate">{visit.region}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                      <Target className="w-3 h-3" /> Objetivo
                    </span>
                    <p className="font-medium capitalize">{visit.reason}</p>
                    <p className="text-xs text-muted-foreground">Interesse: {visit.interest}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-1">
                      Produtos Cotados
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(visit.products).map(([p, q]) => (
                        <Badge key={p} variant="secondary" className="font-mono text-xs">
                          {q} Ton - {p}
                        </Badge>
                      ))}
                      {Object.keys(visit.products).length === 0 && (
                        <span className="text-xs italic text-muted-foreground">Nenhum produto</span>
                      )}
                    </div>
                  </div>
                </div>

                {visit.notes && (
                  <div className="text-sm bg-muted/30 p-4 rounded-lg border border-border">
                    <span className="font-semibold block mb-2 text-foreground/80">
                      Anotações do Vendedor:
                    </span>
                    <p className="text-muted-foreground italic">&ldquo;{visit.notes}&rdquo;</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1 h-12 text-base font-semibold bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApprove(visit.id)}
                  >
                    <CheckCircle className="w-5 h-5 mr-2" /> Validar e Aprovar
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-12 text-base font-semibold text-orange-600 border-orange-200 hover:bg-orange-50"
                    onClick={() => handleOpenReview(visit)}
                  >
                    <MessageSquareWarning className="w-5 h-5 mr-2" /> Solicitar Correção
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquareWarning className="w-5 h-5 text-orange-500" />
              Solicitar Revisão
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Informe ao vendedor o que precisa ser ajustado ou esclarecido sobre a visita na
              empresa <strong className="text-foreground">{selectedVisit?.company}</strong>.
            </p>
            <Textarea
              placeholder="Ex: Por favor, detalhe melhor o acordo de fechamento..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleRequestReview}
              disabled={!comment.trim()}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Enviar Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
