import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useData, Visit } from '@/contexts/DataContext'
import { MessageCircle, CheckCircle, AlertCircle, MessageSquareWarning } from 'lucide-react'
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
  const { visits, updateApproval } = useData()
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [comment, setComment] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const pendingVisits = visits.filter((v) => v.approvalStatus === 'pending')

  const handleApprove = (id: string) => {
    updateApproval(id, 'approved')
    toast.success('Visita aprovada com sucesso!')
  }

  const handleOpenReview = (visit: Visit) => {
    setSelectedVisit(visit)
    setComment('')
    setIsDialogOpen(true)
  }

  const handleRequestReview = () => {
    if (selectedVisit && comment.trim()) {
      updateApproval(selectedVisit.id, 'needs_review', comment)
      toast.warning('Visita enviada para revisão pelo vendedor.')
      setIsDialogOpen(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Fila de Revisão</h1>
        <p className="text-muted-foreground text-sm">
          Analise as visitas pendentes da equipe externa.
        </p>
      </div>

      {pendingVisits.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">Nenhuma visita pendente</h3>
          <p className="text-muted-foreground">Sua fila de revisão está vazia no momento.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingVisits.map((visit) => (
            <Card key={visit.id} className={visit.priority ? 'border-destructive' : ''}>
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{visit.company}</CardTitle>
                    {visit.priority && <Badge variant="destructive">Zona Crítica</Badge>}
                  </div>
                  <CardDescription>
                    Vendedor: <strong>{visit.salesmanName}</strong> •{' '}
                    {new Date(visit.timestamp).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(getWhatsAppUrl(visit.phone), '_blank')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2 text-green-600" /> Contatar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-muted/30 p-3 rounded-md border">
                  <div>
                    <span className="text-muted-foreground block text-xs">Motivo</span>{' '}
                    {visit.reason}
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Interesse</span>{' '}
                    {visit.interest}
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-xs">Produtos</span>
                    {Object.entries(visit.products)
                      .map(([p, q]) => `${p} (${q}T)`)
                      .join(', ')}
                  </div>
                </div>
                {visit.notes && (
                  <div className="text-sm">
                    <span className="font-semibold block mb-1">Anotações:</span>
                    <p className="text-muted-foreground italic border-l-2 pl-3">{visit.notes}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button className="flex-1" onClick={() => handleApprove(visit.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Aprovar Visita
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => handleOpenReview(visit)}
                  >
                    <MessageSquareWarning className="w-4 h-4 mr-2" /> Pedir Correção
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Revisão de Visita</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Informe ao vendedor o que precisa ser ajustado no registro da visita à{' '}
              <strong>{selectedVisit?.company}</strong>.
            </p>
            <Textarea
              placeholder="Digite seu comentário..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRequestReview} disabled={!comment.trim()}>
              Enviar para Vendedor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
