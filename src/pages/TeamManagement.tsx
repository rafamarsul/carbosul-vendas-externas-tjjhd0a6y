import { useState, useEffect } from 'react'
import { Users, Plus, Pencil, Trash2, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRealtime } from '@/hooks/use-realtime'
import { getUsers, createUser, updateUser, deleteUser } from '@/services/users'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { extractFieldErrors, getErrorMessage, type FieldErrors } from '@/lib/pocketbase/errors'

export default function TeamManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'sales' })

  const fetchUsers = async () => {
    try {
      setUsers(await getUsers())
    } catch (e) {
      console.error(e)
    }
  }
  useEffect(() => {
    fetchUsers()
  }, [])
  useRealtime('users', () => {
    fetchUsers()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFieldErrors({})
    try {
      if (editingId) {
        const updateData: any = { name: formData.name, role: formData.role }
        if (formData.password) {
          updateData.password = formData.password
          updateData.passwordConfirm = formData.password
        }
        await updateUser(editingId, updateData)
        toast.success('Usuário atualizado com sucesso!')
      } else {
        await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          passwordConfirm: formData.password,
          role: formData.role,
        })
        toast.success('Usuário criado com sucesso!')
      }
      setDialogOpen(false)
      resetForm()
      fetchUsers()
    } catch (error) {
      const errors = extractFieldErrors(error)
      if (Object.keys(errors).length > 0) setFieldErrors(errors)
      else toast.error('Erro', { description: getErrorMessage(error) })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (u: any) => {
    setEditingId(u.id)
    setFormData({ name: u.name || '', email: u.email || '', password: '', role: u.role || 'sales' })
    setDialogOpen(true)
  }
  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) {
      toast.error('Você não pode excluir seu próprio perfil.')
      return
    }
    try {
      await deleteUser(id)
      toast.success('Usuário excluído!')
      fetchUsers()
    } catch {
      toast.error('Erro ao excluir')
    }
  }
  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'sales' })
    setEditingId(null)
    setFieldErrors({})
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Gestão de Equipe</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie vendedores e gerentes do sistema.
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(o) => {
            setDialogOpen(o)
            if (!o) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  required
                />
                {fieldErrors.name && <p className="text-sm text-destructive">{fieldErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  required
                  disabled={!!editingId}
                />
                {fieldErrors.email && (
                  <p className="text-sm text-destructive">{fieldErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{editingId ? 'Nova Senha (opcional)' : 'Senha'}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  required={!editingId}
                />
                {fieldErrors.password && (
                  <p className="text-sm text-destructive">{fieldErrors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Função</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v) => setFormData((p) => ({ ...p, role: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Vendedor</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" /> Usuários ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Função</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name || '—'}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'manager' ? 'default' : 'secondary'}>
                      {u.role === 'manager' ? (
                        <>
                          <ShieldCheck className="w-3 h-3 mr-1" /> Gerente
                        </>
                      ) : (
                        'Vendedor'
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(u)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(u.id)}
                    >
                      <Trash2 className="w-4 h-4" />
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
