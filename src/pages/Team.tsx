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
import { Button } from '@/components/ui/button'
import { MapPin, MoreVertical } from 'lucide-react'

const teamData = [
  {
    id: 1,
    name: 'João Silva',
    area: 'Zona Sul / Litoral',
    status: 'Ativo',
    visits: 12,
    efficiency: '85%',
  },
  {
    id: 2,
    name: 'Maria Oliveira',
    area: 'Vale do Rio Doce',
    status: 'Ativo',
    visits: 15,
    efficiency: '92%',
  },
  {
    id: 3,
    name: 'Pedro Costa',
    area: 'Metropolitana Norte',
    status: 'Pausa',
    visits: 5,
    efficiency: '60%',
  },
  {
    id: 4,
    name: 'Ana Lima',
    area: 'Interior Oeste',
    status: 'Ativo',
    visits: 8,
    efficiency: '78%',
  },
  {
    id: 5,
    name: 'Carlos Santos',
    area: 'Zona Sul / Litoral',
    status: 'Offline',
    visits: 0,
    efficiency: '-',
  },
]

export default function Team() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Equipe de Vendas</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie representantes e áreas de atuação.
          </p>
        </div>
        <Button className="w-full md:w-auto">Adicionar Vendedor</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membros da Equipe</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Área Designada</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Visitas Hoje</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Eficiência</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamData.map((member) => (
                <TableRow key={member.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      {member.name}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {member.area}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.status === 'Ativo'
                          ? 'default'
                          : member.status === 'Pausa'
                            ? 'secondary'
                            : 'outline'
                      }
                      className={
                        member.status === 'Ativo' ? 'bg-success hover:bg-success/80 text-white' : ''
                      }
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{member.visits}</TableCell>
                  <TableCell className="hidden sm:table-cell text-right">
                    {member.efficiency}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
