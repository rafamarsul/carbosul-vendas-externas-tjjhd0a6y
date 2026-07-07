import { useState, useEffect } from 'react'
import { MapPin, Building2, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useRealtime } from '@/hooks/use-realtime'
import { getMyCoverageAreas, type CoverageArea } from '@/services/coverage-areas'

export function MyTerritories() {
  const { user } = useAuth()
  const [areas, setAreas] = useState<CoverageArea[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAreas = async () => {
    if (!user?.id) return
    try {
      setAreas(await getMyCoverageAreas(user.id))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchAreas()
  }, [user?.id])
  useRealtime('coverage_areas', () => {
    fetchAreas()
  })

  const activeAreas = areas.filter((a) => a.active)
  const inactiveAreas = areas.filter((a) => !a.active)

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" /> Meus Territórios
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : areas.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground text-sm">
              Você ainda não possui territórios atribuídos.
            </p>
          </div>
        ) : (
          <>
            {activeAreas.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600" /> Ativos ({activeAreas.length})
                </p>
                {activeAreas.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-green-50/50 dark:bg-green-950/10"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <span className="font-medium text-sm">{a.city}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {a.state}
                          </Badge>
                          {a.region && (
                            <span className="text-xs text-muted-foreground">{a.region}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-600 hover:bg-green-600 text-xs">Ativa</Badge>
                  </div>
                ))}
              </div>
            )}
            {inactiveAreas.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-muted-foreground" /> Inativos (
                  {inactiveAreas.length})
                </p>
                {inactiveAreas.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 border rounded-lg opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <span className="font-medium text-sm">{a.city}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {a.state}
                          </Badge>
                          {a.region && (
                            <span className="text-xs text-muted-foreground">{a.region}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Inativa
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
