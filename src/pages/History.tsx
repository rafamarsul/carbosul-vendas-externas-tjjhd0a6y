import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useData } from '@/contexts/DataContext'
import { useAuth } from '@/contexts/AuthContext'
import { MessageCircle, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { getWhatsAppUrl } from '@/lib/utils'

export default function History() {
  const { visits } = useData()
  const { user } = useAuth()

  // Filter for the current user (if sales), or show all if we want, but usually History is per user.
  // We'll show all where salesmanId matches, if user is sales.
  const myVisits = user?.role === 'sales' ? visits.filter((v) => v.salesmanId === user.id) : visits

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-success text-white">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Aprovado
          </Badge>
        )
      case 'needs_review':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" /> Revisar
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" /> Pendente
          </Badge>
        )
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Histórico de Visitas</h1>
        <p className="text-muted-foreground text-sm">
          Acompanhe o status das suas visitas registradas.
        </p>
      </div>

      <div className="space-y-4">
        {myVisits.length === 0 ? (
          <p className="text-center text-muted-foreground p-8">Nenhuma visita registrada ainda.</p>
        ) : (
          myVisits.map((visit) => (
            <Card key={visit.id} className="overflow-hidden">
              <CardHeader className="pb-3 bg-muted/20">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{visit.company}</CardTitle>
                    <CardDescription>{new Date(visit.timestamp).toLocaleString()}</CardDescription>
                  </div>
                  {getStatusBadge(visit.approvalStatus)}
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {visit.approvalStatus === 'needs_review' && visit.managerComment && (
                  <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                    <p className="text-sm font-semibold text-destructive mb-1">
                      Comentário do Gerente:
                    </p>
                    <p className="text-sm text-destructive/90 italic">{visit.managerComment}</p>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Contato: <strong className="text-foreground">{visit.contact}</strong>
                  </span>
                  {visit.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(getWhatsAppUrl(visit.phone), '_blank')}
                    >
                      <MessageCircle className="w-4 h-4 mr-2 text-green-500" /> Falar
                    </Button>
                  )}
                </div>

                <div className="pt-3 border-t text-sm text-muted-foreground line-clamp-2">
                  <span className="font-medium text-foreground">Anotações:</span>{' '}
                  {visit.notes || 'Sem anotações.'}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
