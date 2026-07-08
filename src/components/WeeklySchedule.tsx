import { useState, useEffect } from 'react'
import { Calendar, MapPin, FileText, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getWeekSchedules } from '@/services/schedules'
import { getWeekOfMonth, getDayLabel } from '@/lib/cycle'
import { useRealtime } from '@/hooks/use-realtime'

const WORKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

interface ScheduleRecord {
  id: string
  day_of_week: string
  notes?: string
  expand?: {
    zone_id?: {
      name: string
      state?: string
      cep?: string
    }
  }
}

export function WeeklySchedule({ userId }: { userId: string }) {
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([])
  const [loading, setLoading] = useState(true)

  const weekOfMonth = getWeekOfMonth()

  const fetchSchedules = async () => {
    if (!userId) return
    try {
      const data = await getWeekSchedules(userId, weekOfMonth)
      setSchedules(data as ScheduleRecord[])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchSchedules()
  }, [userId])

  useRealtime('schedules', () => fetchSchedules())

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" /> Agenda da Semana {weekOfMonth}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="space-y-3">
            {WORKDAYS.map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 flex-1" />
              </div>
            ))}
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-base font-medium text-foreground mb-1">
              Nenhuma agenda para esta semana
            </h3>
            <p className="text-muted-foreground text-sm">
              Acesse a página de <span className="font-medium">Agenda &amp; Rotas</span> para
              configurar suas zonas e escalas semanais.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {WORKDAYS.map((day) => {
              const sched = schedules.find((s) => s.day_of_week === day)
              const isToday = todayStr === day
              const zoneName = sched?.expand?.zone_id?.name
              const notes = sched?.notes

              return (
                <div
                  key={day}
                  className={`rounded-lg border p-4 transition-colors ${
                    isToday
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border bg-card hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{getDayLabel(day)}</span>
                    {isToday && (
                      <Badge className="text-[10px] px-1.5 py-0 h-5 bg-primary text-primary-foreground">
                        Hoje
                      </Badge>
                    )}
                  </div>
                  {zoneName ? (
                    <>
                      <div className="flex items-start gap-1.5 text-sm">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="font-medium text-foreground">{zoneName}</span>
                      </div>
                      {sched?.expand?.zone_id?.state && (
                        <Badge variant="outline" className="text-[10px] mt-1.5">
                          {sched.expand.zone_id.state}
                        </Badge>
                      )}
                      {notes && (
                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                          <FileText className="w-3 h-3 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{notes}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground italic">
                      <MapPin className="w-3.5 h-3.5 opacity-40" />
                      <span>Sem zona atribuída</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
