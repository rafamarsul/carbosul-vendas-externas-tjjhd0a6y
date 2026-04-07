import { useData } from '@/contexts/DataContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, TrendingUp, Users } from 'lucide-react'

export default function Reports() {
  const { visits, loading } = useData()

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando relatórios...</div>
  }

  // Calculate mock duration for each visit based on ID (for demonstration purposes)
  const getDuration = (id: string) => {
    const charCode = id.charCodeAt(0) || 0
    return 15 + (charCode % 45) // 15 to 60 minutes
  }

  const totalVisits = visits.length
  const totalDuration = visits.reduce((acc, v) => acc + getDuration(v.id), 0)
  const avgDuration = totalVisits > 0 ? Math.round(totalDuration / totalVisits) : 0

  const bySalesman = visits.reduce(
    (acc, v) => {
      if (!acc[v.salesmanName]) {
        acc[v.salesmanName] = { visits: 0, time: 0 }
      }
      acc[v.salesmanName].visits += 1
      acc[v.salesmanName].time += getDuration(v.id)
      return acc
    },
    {} as Record<string, { visits: number; time: number }>,
  )

  const topSalesman = Object.entries(bySalesman).sort((a, b) => b[1].time - a[1].time)[0]

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Relatórios de Performance
        </h1>
        <p className="text-muted-foreground text-sm">
          Análise de tempo em rota e eficiência da equipe de vendas externas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Tempo Médio p/ Visita</p>
              <p className="text-2xl font-bold">{avgDuration} min</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-full text-success">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total de Visitas</p>
              <p className="text-2xl font-bold">{totalVisits}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Vendedor Destaque (Tempo)</p>
              <p className="text-2xl font-bold truncate max-w-[150px]">
                {topSalesman ? topSalesman[0] : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Detalhamento por Localização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead>Cliente / Local</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tempo Gasto (Est.)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visits.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell className="font-medium">{visit.salesmanName}</TableCell>
                  <TableCell>
                    {visit.company}
                    <div className="text-xs text-muted-foreground">
                      {visit.address} ({visit.region})
                    </div>
                  </TableCell>
                  <TableCell>{new Date(visit.timestamp).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">
                      {getDuration(visit.id)} min
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {visit.approvalStatus === 'approved' ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Concluída
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-yellow-700 bg-yellow-50 border-yellow-200"
                      >
                        Em Revisão
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {visits.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    Nenhum dado de visita encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
