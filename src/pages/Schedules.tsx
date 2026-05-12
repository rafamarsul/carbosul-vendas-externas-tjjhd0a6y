import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from '@/services/schedules'
import { getUsers } from '@/services/users'
import { getZones } from '@/services/zones'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_LABELS: Record<string, string> = {
  Monday: 'Segunda',
  Tuesday: 'Terça',
  Wednesday: 'Quarta',
  Thursday: 'Quinta',
  Friday: 'Sexta',
  Saturday: 'Sábado',
  Sunday: 'Domingo',
}

export default function Schedules() {
  const [users, setUsers] = useState<any[]>([])
  const [zones, setZones] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [u, z, s] = await Promise.all([getUsers(), getZones(), getSchedules()])
        setUsers(u.filter((user) => user.role === 'sales'))
        setZones(z)
        setSchedules(s)
      } catch (err) {
        toast.error('Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleZoneChange = async (week: number, day: string, zoneId: string | 'none') => {
    const existing = schedules.find(
      (s) => s.user_id === selectedUser && s.week_number === week && s.day_of_week === day,
    )

    try {
      if (zoneId === 'none') {
        if (existing) {
          await deleteSchedule(existing.id)
          setSchedules((prev) => prev.filter((s) => s.id !== existing.id))
        }
      } else {
        if (existing) {
          const updated = await updateSchedule(existing.id, { zone_id: zoneId })
          setSchedules((prev) =>
            prev.map((s) =>
              s.id === existing.id
                ? { ...updated, expand: { zone_id: zones.find((z) => z.id === zoneId) } }
                : s,
            ),
          )
        } else {
          const created = await createSchedule({
            user_id: selectedUser,
            week_number: week,
            day_of_week: day,
            zone_id: zoneId,
          })
          setSchedules((prev) => [
            ...prev,
            { ...created, expand: { zone_id: zones.find((z) => z.id === zoneId) } },
          ])
        }
      }
      toast.success('Roteiro atualizado com sucesso!')
    } catch (err) {
      toast.error('Erro ao atualizar roteiro')
    }
  }

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Carregando roteiros...</div>

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <CalendarDays className="w-6 h-6" /> Roteiros (4 Semanas)
          </h1>
          <p className="text-muted-foreground text-sm">
            Gerencie o ciclo de 4 semanas de roteiros da equipe de vendas.
          </p>
        </div>
        <div className="w-full md:w-72">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um vendedor" />
            </SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedUser ? (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-12 text-center text-muted-foreground">
            Selecione um vendedor para visualizar ou editar seu roteiro.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((week) => (
            <Card key={week} className="shadow-sm border-primary/10">
              <CardHeader className="py-4 border-b bg-muted/30">
                <CardTitle className="text-lg">Semana {week}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {DAYS.map((day) => {
                  const schedule = schedules.find(
                    (s) =>
                      s.user_id === selectedUser && s.week_number === week && s.day_of_week === day,
                  )
                  return (
                    <div key={day} className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        {DAY_LABELS[day]}
                      </label>
                      <Select
                        value={schedule?.zone_id || 'none'}
                        onValueChange={(val) => handleZoneChange(week, day, val)}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Livre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Livre (Sem zona)</SelectItem>
                          {zones
                            .filter((z) => z.user_id === selectedUser || !z.user_id)
                            .map((z) => (
                              <SelectItem key={z.id} value={z.id}>
                                {z.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
