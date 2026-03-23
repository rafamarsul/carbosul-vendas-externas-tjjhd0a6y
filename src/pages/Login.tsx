import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Building2, UserRound, MapPin } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()

  const handleLogin = (role: 'manager' | 'sales') => {
    if (role === 'manager') {
      login({ id: 'm1', name: 'João Diretor', role: 'manager' })
    } else {
      login({ id: 's1', name: 'Pedro Vendedor', role: 'sales' })
    }
    nav('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-success/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md relative z-10 border-primary/20 shadow-2xl">
        <CardHeader className="text-center pb-8 pt-10">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-primary rounded-2xl rotate-6 opacity-20 transition-transform hover:rotate-12" />
            <MapPin className="w-10 h-10 text-primary relative z-10" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">
            Carbosul CRM
          </CardTitle>
          <CardDescription className="text-base mt-2">Gestão de Vendas Externas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-10">
          <Button
            className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            onClick={() => handleLogin('manager')}
          >
            <Building2 className="mr-2 h-5 w-5" /> Entrar como Gerente
          </Button>
          <Button
            variant="outline"
            className="w-full h-14 text-lg font-semibold border-2 hover:bg-muted/50 transition-all"
            onClick={() => handleLogin('sales')}
          >
            <UserRound className="mr-2 h-5 w-5" /> Entrar como Vendedor
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
