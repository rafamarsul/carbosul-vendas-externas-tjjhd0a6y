import { useData } from '@/contexts/DataContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Target, AlertTriangle, CheckCircle2, TrendingUp, Hash } from 'lucide-react'
import { useMemo } from 'react'

export default function AdminReports() {
  const { visits, zones, loading } = useData()

  const { totalVisits, inRadius, outRadius, byZoneName, byZoneCep } = useMemo(() => {
    let inRadiusCount = 0
    let outRadiusCount = 0
    const nameMap: Record<string, { total: number; out: number }> = {}
    const cepMap: Record<string, { total: number; out: number }> = {}

    visits.forEach((visit) => {
      const isOut = visit.managerComment?.includes('Out of Range')
      if (isOut) outRadiusCount++
      else inRadiusCount++

      const userZones = zones.filter((z) => z.userId === visit.salesmanId)

      let closestZone = userZones[0]
      if (visit.lat && visit.lng && userZones.length > 1) {
        let minD = Infinity
        for (const z of userZones) {
          const d = Math.pow(visit.lat - z.lat, 2) + Math.pow(visit.lng - z.lng, 2)
          if (d < minD) {
            minD = d
            closestZone = z
          }
        }
      }

      const zName = closestZone?.name || 'Zona Desconhecida'
      const zCep = closestZone?.cep || 'Sem CEP'

      if (!nameMap[zName]) nameMap[zName] = { total: 0, out: 0 }
      nameMap[zName].total++
      if (isOut) nameMap[zName].out++

      if (!cepMap[zCep]) cepMap[zCep] = { total: 0, out: 0 }
      cepMap[zCep].total++
      if (isOut) cepMap[zCep].out++
    })

    return {
      totalVisits: visits.length,
      inRadius: inRadiusCount,
      outRadius: outRadiusCount,
      byZoneName: Object.entries(nameMap).sort((a, b) => b[1].total - a[1].total),
      byZoneCep: Object.entries(cepMap).sort((a, b) => b[1].total - a[1].total),
    }
  }, [visits, zones])

  const compliancePct = totalVisits > 0 ? Math.round((inRadius / totalVisits) * 100) : 0

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Carregando dados geográficos...
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
          <Target className="w-6 h-6" />
          Relatórios Regionais & Geofencing
        </h1>
        <p className="text-muted-foreground text-sm">
          Análise de desempenho geográfico e validação de raio de atuação das equipes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total de Visitas</p>
              <p className="text-2xl font-bold">{totalVisits}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-full text-success">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Taxa de Conformidade</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{compliancePct}%</p>
                <span className="text-xs text-muted-foreground">({inRadius} válidas)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-destructive/10 rounded-full text-destructive">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Fora do Raio (Alerta)</p>
              <p className="text-2xl font-bold">{outRadius}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              Visitas por Zona
            </CardTitle>
            <CardDescription>Consolidado pelo nome da zona geográfica.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {byZoneName.map(([name, data]) => {
                const pct = Math.round(((data.total - data.out) / data.total) * 100)
                return (
                  <div key={name} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold">{name}</span>
                      <span className="text-muted-foreground">{data.total} visitas</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden flex">
                      <div className="bg-success h-full" style={{ width: `${pct}%` }} />
                      <div className="bg-destructive h-full" style={{ width: `${100 - pct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{pct}% conformidade</span>
                      {data.out > 0 && (
                        <span className="text-destructive font-medium">{data.out} alertas</span>
                      )}
                    </div>
                  </div>
                )
              })}
              {byZoneName.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Hash className="w-5 h-5 text-muted-foreground" />
              Visitas por CEP
            </CardTitle>
            <CardDescription>Agrupamento por código postal da zona.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {byZoneCep.map(([cep, data]) => (
                <div
                  key={cep}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      {cep}
                    </Badge>
                    <div className="text-sm font-medium">{data.total} visitas registradas</div>
                  </div>
                  {data.out > 0 ? (
                    <Badge
                      variant="destructive"
                      className="bg-destructive/10 text-destructive border-none shadow-none hover:bg-destructive/20"
                    >
                      {data.out} Fora do Raio
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-success/10 text-success border-none shadow-none"
                    >
                      100% OK
                    </Badge>
                  )}
                </div>
              ))}
              {byZoneCep.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
