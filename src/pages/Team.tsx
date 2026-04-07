import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, UserPlus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { getUsers, createUser, deleteUser } from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export default function Team() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales',
  })

  const loadUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(data.filter((u: any) => u.role === 'sales'))
    } catch (err) {
      toast.error('Erro ao carregar equipe')
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useRealtime('users', () => {
    loadUsers()
  })

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Preencha todos os campos.')
      return
    }
    try {
      setLoading(true)
      await createUser({
        ...newUser,
        passwordConfirm: newUser.password,
      })
      toast.success('Vendedor cadastrado com sucesso!')
      setNewUser({ name: '', email: '', password: '', role: 'sales' })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id)
      await deleteUser(id)
      toast.success('Vendedor removido!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-primary">Equipe de Vendas</h2>
          <p className="text-muted-foreground text-sm">Gerencie os vendedores da sua equipe.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Novo Vendedor
            </CardTitle>
            <CardDescription>Cadastre um novo membro na equipe de vendas.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  placeholder="Ex: João Silva"
                  value={newUser.name}
                  onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  placeholder="joao@empresa.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={newUser.password}
                  onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Cadastrar Vendedor
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Vendedores Cadastrados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {users.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  Nenhum vendedor cadastrado.
                </p>
              )}
              {users.map((u) => (
                <div
                  key={u.id}
                  className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{u.name || 'Sem Nome'}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isDeleting === u.id}
                    onClick={() => handleDelete(u.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {isDeleting === u.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
