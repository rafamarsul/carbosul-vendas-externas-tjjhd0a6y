import { useEffect, useState } from 'react'
import { Shield, Clock, User as UserIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface AuditLog {
  id: string
  action: string
  created_at: string
  profiles: {
    name: string
    email: string
    role: string
  } | null
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, profiles(name, email, role)')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        toast.error('Erro ao buscar logs de auditoria')
        console.error(error)
      } else {
        setLogs(data as unknown as AuditLog[])
      }
      setLoading(false)
    }

    fetchLogs()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Logs de Auditoria
          </h1>
          <p className="text-muted-foreground">
            Monitore os acessos e atividades recentes no sistema.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos Acessos</CardTitle>
          <CardDescription>Lista dos últimos 100 logins realizados na plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhum log registrado</p>
              <p className="text-sm">Os acessos da equipe aparecerão aqui.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead className="text-right">Data/Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {log.profiles?.name?.substring(0, 2).toUpperCase() || (
                              <UserIcon className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {log.profiles?.name || 'Usuário Desconhecido'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {log.profiles?.email || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={log.profiles?.role === 'manager' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {log.profiles?.role === 'manager' ? 'Gestor' : 'Vendedor'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-600 border-green-500/20"
                        >
                          {log.action === 'login' ? 'Login bem-sucedido' : log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
